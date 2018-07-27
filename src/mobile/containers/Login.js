import { translate } from 'react-i18next';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import authenticator from 'authenticator';
import PropTypes from 'prop-types';
import KeepAwake from 'react-native-keep-awake';
import { Navigation } from 'react-native-navigation';
import SplashScreen from 'react-native-splash-screen';
import { Linking, StyleSheet, View } from 'react-native';
import { parseAddress } from 'iota-wallet-shared-modules/libs/iota/utils';
import { setFullNode } from 'iota-wallet-shared-modules/actions/settings';
import { setPassword, setSetting, setDeepLink } from 'iota-wallet-shared-modules/actions/wallet';
import { setUserActivity, setLoginPasswordField, setLoginRoute } from 'iota-wallet-shared-modules/actions/ui';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import WithBackPressCloseApp from '../components/BackPressCloseApp';
import DynamicStatusBar from '../components/DynamicStatusBar';
import NodeOptionsOnLogin from './NodeOptionsOnLogin';
import EnterPasswordOnLoginComponent from '../components/EnterPasswordOnLogin';
import Enter2FAComponent from '../components/Enter2FA';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import { getAllSeedsFromKeychain, getTwoFactorAuthKeyFromKeychain, getPasswordHash } from '../utils/keychain';
import { isAndroid } from '../utils/device';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

/** Login component */
class Login extends Component {
    static propTypes = {
        /** Set new password hash
         * @param {string} passwordHash
         */
        setPassword: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Determines whether two factor authentication is enabled */
        is2FAEnabled: PropTypes.bool.isRequired,
        /** Set application activity state
         * @param {object} options - minimised, active, inactive
         */
        setUserActivity: PropTypes.func.isRequired,
        /** Set password
         * @param {string} password
         */
        setLoginPasswordField: PropTypes.func.isRequired,
        /** Password value */
        password: PropTypes.string.isRequired,
        /** Hash for wallet's password */
        pwdHash: PropTypes.object.isRequired,
        /** Set new IRI node
         * @param {string} node
         */
        t: PropTypes.func.isRequired,
        /** Set send amount params
         * @param {string} - amount
         * @param {string} - address
         * @param {string} - message
         */
        setDeepLink: PropTypes.func.isRequired,
        /** Determines which page should be displayed at login */
        loginRoute: PropTypes.string.isRequired,
        /** Sets which login page should be displayed
         * @param {string} route - current route
         */
        setLoginRoute: PropTypes.func.isRequired,
        /** Determines whether fingerprint auth is enabled */
        isFingerprintEnabled: PropTypes.bool.isRequired,
    };

    constructor() {
        super();

        this.onComplete2FA = this.onComplete2FA.bind(this);
        this.onLoginPress = this.onLoginPress.bind(this);
        this.setDeepUrl = this.setDeepUrl.bind(this);
    }

    componentWillMount() {
        Linking.addEventListener('url', this.setDeepUrl);
    }

    componentDidMount() {
        if (!isAndroid) {
            SplashScreen.hide();
        }
        KeepAwake.deactivate();
        this.props.setUserActivity({ inactive: false });
    }

    componentWillUnmount() {
        Linking.removeEventListener('url');
    }

    async onLoginPress() {
        const { t, is2FAEnabled, hasConnection, password } = this.props;
        if (!hasConnection) {
            return;
        }
        if (!password) {
            this.props.generateAlert('error', t('emptyPassword'), t('emptyPasswordExplanation'));
        } else {
            const pwdHash = await getPasswordHash(password);
            getAllSeedsFromKeychain(pwdHash).then((seedInfo) => {
                if (seedInfo !== null) {
                    this.props.setPassword(pwdHash);
                    this.props.setLoginPasswordField('');
                    if (!is2FAEnabled) {
                        this.navigateToLoading();
                    } else {
                        this.props.setLoginRoute('complete2FA');
                    }
                } else {
                    this.props.generateAlert(
                        'error',
                        t('global:unrecognisedPassword'),
                        t('global:unrecognisedPasswordExplanation'),
                    );
                }
            });
        }
    }

    async onComplete2FA(token) {
        const { t, pwdHash, hasConnection } = this.props;
        if (!hasConnection) {
            return;
        }
        if (token) {
            const key = await getTwoFactorAuthKeyFromKeychain(pwdHash);
            if (key === null) {
                this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongTryAgain'),
                );
            }
            const verified = authenticator.verifyToken(key, token);
            if (verified) {
                this.navigateToLoading();
                this.props.setLoginRoute('login');
            } else {
                this.props.generateAlert('error', t('twoFA:wrongCode'), t('twoFA:wrongCodeExplanation'));
            }
        } else {
            this.props.generateAlert('error', t('twoFA:emptyCode'), t('twoFA:emptyCodeExplanation'));
        }
    }

    setDeepUrl(data) {
        const { generateAlert, t } = this.props;
        const parsedData = parseAddress(data.url);
        if (parsedData) {
            this.props.setDeepLink(parsedData.amount.toString() || '0', parsedData.address, parsedData.message || null);
        } else {
            generateAlert('error', t('send:invalidAddress'), t('send:invalidAddressExplanation1'));
        }
    }

    navigateToLoading() {
        const { theme: { body } } = this.props;
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'loading',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
                    screenBackgroundColor: body.bg,
                    statusBarColor: body.bg,
                    drawUnderStatusBar: true,
                },
                overrideBackPress: true,
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
        });
    }

    render() {
        const { theme, password, loginRoute, isFingerprintEnabled } = this.props;
        const body = theme.body;
        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                {loginRoute === 'login' && (
                    <EnterPasswordOnLoginComponent
                        theme={theme}
                        onLoginPress={this.onLoginPress}
                        navigateToNodeOptions={() => this.props.setLoginRoute('nodeOptions')}
                        setLoginPasswordField={(pword) => this.props.setLoginPasswordField(pword)}
                        password={password}
                        isFingerprintEnabled={isFingerprintEnabled}
                    />
                )}
                {loginRoute === 'complete2FA' && (
                    <Enter2FAComponent
                        verify={this.onComplete2FA}
                        cancel={() => this.props.setLoginRoute('login')}
                        theme={theme}
                    />
                )}
                {loginRoute !== 'complete2FA' && loginRoute !== 'login' && <NodeOptionsOnLogin />}
                <StatefulDropdownAlert backgroundColor={body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    node: state.settings.node,
    nodes: state.settings.nodes,
    theme: state.settings.theme,
    is2FAEnabled: state.settings.is2FAEnabled,
    accountInfo: state.accounts.accountInfo,
    password: state.ui.loginPasswordFieldText,
    pwdHash: state.wallet.password,
    loginRoute: state.ui.loginRoute,
    hasConnection: state.wallet.hasConnection,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
});

const mapDispatchToProps = {
    generateAlert,
    setPassword,
    setFullNode,
    setSetting,
    setUserActivity,
    setLoginPasswordField,
    setDeepLink,
    setLoginRoute,
};

export default WithBackPressCloseApp()(
    translate(['login', 'global', 'twoFA'])(connect(mapStateToProps, mapDispatchToProps)(Login)),
);
