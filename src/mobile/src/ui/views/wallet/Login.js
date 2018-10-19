import { withNamespaces } from 'react-i18next';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import authenticator from 'authenticator';
import PropTypes from 'prop-types';
import KeepAwake from 'react-native-keep-awake';
import SplashScreen from 'react-native-splash-screen';
import { Navigation } from 'react-native-navigation';
import { Linking, StyleSheet, View } from 'react-native';
import { parseAddress } from 'shared-modules/libs/iota/utils';
import { setFullNode } from 'shared-modules/actions/settings';
import { setPassword, setSetting, setDeepLink } from 'shared-modules/actions/wallet';
import { setUserActivity, setLoginPasswordField, setLoginRoute } from 'shared-modules/actions/ui';
import { generateAlert } from 'shared-modules/actions/alerts';
import WithBackPressCloseApp from 'ui/components/BackPressCloseApp';
import NodeOptionsOnLogin from 'ui/views/wallet/NodeOptionsOnLogin';
import EnterPasswordOnLoginComponent from 'ui/components/EnterPasswordOnLogin';
import Enter2FAComponent from 'ui/components/Enter2FA';
import { authorize, getTwoFactorAuthKeyFromKeychain, hash } from 'libs/keychain';
import { isAndroid } from 'libs/device';

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
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        is2FAEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        setUserActivity: PropTypes.func.isRequired,
        /** @ignore */
        setLoginPasswordField: PropTypes.func.isRequired,
        /** @ignore */
        password: PropTypes.string.isRequired,
        /** Hash for wallet's password */
        pwdHash: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setDeepLink: PropTypes.func.isRequired,
        /** @ignore */
        loginRoute: PropTypes.string.isRequired,
        /** @ignore */
        setLoginRoute: PropTypes.func.isRequired,
        /** @ignore */
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

    /**
     * Validates password and logs in user if accepted
     * Navigates to 2FA validation if activated
     * @method onLoginPress
     * @returns {Promise<void>}
     */
    async onLoginPress() {
        const { t, is2FAEnabled, hasConnection, password } = this.props;
        if (!hasConnection) {
            return;
        }
        if (!password) {
            this.props.generateAlert('error', t('emptyPassword'), t('emptyPasswordExplanation'));
        } else {
            const pwdHash = await hash(password);

            try {
                await authorize(pwdHash);

                this.props.setPassword(pwdHash);
                this.props.setLoginPasswordField('');
                if (!is2FAEnabled) {
                    this.navigateToLoading();
                } else {
                    this.props.setLoginRoute('complete2FA');
                }
            } catch (error) {
                this.props.generateAlert(
                    'error',
                    t('global:unrecognisedPassword'),
                    t('global:unrecognisedPasswordExplanation'),
                );
            }
        }
    }

    /**
     * Validates 2FA token and logs in user if accepted
     * @method onComplete2FA
     */
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

    /**
     * Parses deep link data and sets send fields
     * FIXME: Temporarily disabled to improve security
     * @method setDeepUrl
     */
    setDeepUrl(data) {
        const { generateAlert, t } = this.props;
        const parsedData = parseAddress(data.url);
        if (parsedData) {
            this.props.setDeepLink(parsedData.amount.toString() || '0', parsedData.address, parsedData.message || null);
        } else {
            generateAlert('error', t('send:invalidAddress'), t('send:invalidAddressExplanation1'));
        }
    }

    /**
     * Navigates to loading screen
     * @method navigateToLoading
     */
    navigateToLoading() {
        const { theme: { body } } = this.props;
        Navigation.setStackRoot('appStack', {
            component: {
                name: 'loading',
                options: {
                    animations: {
                        setStackRoot: {
                            enable: false,
                        },
                    },
                    layout: {
                        backgroundColor: body.bg,
                        orientation: ['portrait'],
                    },
                    topBar: {
                        visible: false,
                        drawBehind: true,
                        elevation: 0,
                    },
                    statusBar: {
                        drawBehind: true,
                        backgroundColor: body.bg,
                    },
                },
            },
        });
    }

    render() {
        const { theme, password, loginRoute, isFingerprintEnabled } = this.props;
        const body = theme.body;
        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
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
    withNamespaces(['login', 'global', 'twoFA'])(connect(mapStateToProps, mapDispatchToProps)(Login)),
);
