import get from 'lodash/get';
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
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { setPassword, setSetting, setDeepLink } from 'iota-wallet-shared-modules/actions/wallet';
import { setUserActivity, setLoginPasswordField } from 'iota-wallet-shared-modules/actions/ui';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import WithBackPressCloseApp from '../components/BackPressCloseApp';
import DynamicStatusBar from '../components/DynamicStatusBar';
import NodeSelectionOnLogin from './NodeSelectionOnLogin';
import EnterPasswordOnLoginComponent from '../components/EnterPasswordOnLogin';
import Enter2FA from '../components/Enter2FA';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import { getAllSeedsFromKeychain, getTwoFactorAuthKeyFromKeychain, logTwoFa } from '../utils/keychain';
import { getPasswordHash } from '../utils/crypto';
import { migrate } from '../../shared/actions/app';
import { persistor, persistConfig } from '../store';
import { width, height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: width / 27.6,
        paddingBottom: height / 40,
    },
    infoText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: width / 27.6,
        paddingBottom: height / 16,
    },
});

/** Login component */
class Login extends Component {
    static propTypes = {
        /** Application version number and version name */
        versions: PropTypes.object.isRequired,
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
         * @param {object} options - minimzed, active, inactive
         */
        setUserActivity: PropTypes.func.isRequired,
        /** Migrate application state
         * @param {object} versions - app version number and version name
         * @param {object} persistConfig - redux persist configuration object
         * @param {object} persistor - refux persist persistor instance
         */
        migrate: PropTypes.func.isRequired,
        /** Set password
         * @param {string} password
         */
        setLoginPasswordField: PropTypes.func.isRequired,
        /** Password value */
        password: PropTypes.string.isRequired,
        /** Hash for wallet's password */
        pwdHash: PropTypes.string.isRequired,
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
    };

    constructor() {
        super();

        this.state = {
            changingNode: false,
            completing2FA: false,
        };

        this.onComplete2FA = this.onComplete2FA.bind(this);
        this.onLoginPress = this.onLoginPress.bind(this);
        this.onBackPress = this.onBackPress.bind(this);
        this.navigateToNodeSelection = this.navigateToNodeSelection.bind(this);
        this.setDeepUrl = this.setDeepUrl.bind(this);
    }

    componentWillMount() {
        Linking.addEventListener('url', this.setDeepUrl);
    }

    componentDidMount() {
        if (!isAndroid) {
            SplashScreen.hide();
        }
        this.checkForUpdates();
        KeepAwake.deactivate();
        this.props.setUserActivity({ inactive: false });
    }

    componentWillUnmount() {
        Linking.removeEventListener('url');
    }

    async onLoginPress(password) {
        const { t, is2FAEnabled } = this.props;
        if (!password) {
            this.props.generateAlert('error', t('emptyPassword'), t('emptyPasswordExplanation'));
        } else {
            const pwdHash = getPasswordHash(password);
            getAllSeedsFromKeychain(pwdHash).then((seedInfo) => {
                if (seedInfo !== null) {
                    this.props.setPassword(pwdHash);
                    this.props.setLoginPasswordField('');
                    if (!is2FAEnabled) {
                        this.navigateToLoading();
                    } else {
                        this.setState({ completing2FA: true });
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
        const { t, pwdHash } = this.props;
        if (token) {
            logTwoFa(pwdHash);
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
                this.setState({ completing2FA: false });
            } else {
                this.props.generateAlert('error', t('twoFA:wrongCode'), t('twoFA:wrongCodeExplanation'));
            }
        } else {
            this.props.generateAlert('error', t('twoFA:emptyCode'), t('twoFA:emptyCodeExplanation'));
        }
    }

    onBackPress() {
        this.setState({ completing2FA: false });
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

    checkForUpdates() {
        const latestVersion = getVersion();
        const latestBuildNumber = getBuildNumber();
        const { versions } = this.props;
        const currentVersion = get(versions, 'version');
        const currentBuildNumber = get(versions, 'buildNumber');

        if (latestVersion !== currentVersion || latestBuildNumber !== currentBuildNumber) {
            this.props.migrate({ version: latestVersion, buildNumber: latestBuildNumber }, persistConfig, persistor);
        }
    }

    navigateToNodeSelection() {
        this.setState({ changingNode: true });
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
        const { theme, password } = this.props;

        const body = theme.body;
        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                {!this.state.changingNode &&
                    !this.state.completing2FA && (
                        <EnterPasswordOnLoginComponent
                            theme={theme}
                            onLoginPress={this.onLoginPress}
                            navigateToNodeSelection={this.navigateToNodeSelection}
                            setLoginPasswordField={(pword) => this.props.setLoginPasswordField(pword)}
                            password={password}
                        />
                    )}
                {!this.state.changingNode &&
                    this.state.completing2FA && (
                        <Enter2FA verify={this.onComplete2FA} cancel={this.onBackPress} theme={theme} />
                    )}
                {this.state.changingNode && (
                    <NodeSelectionOnLogin backPress={() => this.setState({ changingNode: false })} />
                )}
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
    versions: state.settings.versions,
    accountInfo: state.accounts.accountInfo,
    password: state.ui.loginPasswordFieldText,
    pwdHash: state.wallet.password,
});

const mapDispatchToProps = {
    generateAlert,
    setPassword,
    setFullNode,
    setSetting,
    setUserActivity,
    migrate,
    setLoginPasswordField,
    setDeepLink,
};

export default WithBackPressCloseApp()(
    translate(['login', 'global', 'twoFA'])(connect(mapStateToProps, mapDispatchToProps)(Login)),
);
