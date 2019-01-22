import { withNamespaces } from 'react-i18next';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import authenticator from 'authenticator';
import PropTypes from 'prop-types';
import KeepAwake from 'react-native-keep-awake';
import SplashScreen from 'react-native-splash-screen';
import { navigator } from 'libs/navigation';
import { Linking, StyleSheet } from 'react-native';
import timer from 'react-native-timer';
import { parseAddress } from 'shared-modules/libs/iota/utils';
import { setFullNode } from 'shared-modules/actions/settings';
import { setSetting, setDeepLink } from 'shared-modules/actions/wallet';
import { setUserActivity, setLoginPasswordField, setLoginRoute } from 'shared-modules/actions/ui';
import { generateAlert } from 'shared-modules/actions/alerts';
import NodeOptionsOnLogin from 'ui/views/wallet/NodeOptionsOnLogin';
import EnterPasswordOnLoginComponent from 'ui/components/EnterPasswordOnLogin';
import AnimatedComponent from 'ui/components/AnimatedComponent';
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
        password: PropTypes.any.isRequired,
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
        /** @ignore */
        forceUpdate: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            nextLoginRoute: props.loginRoute,
        };
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

    componentWillReceiveProps(newProps) {
        if (this.props.loginRoute !== newProps.loginRoute) {
            this.animationOutType = this.getAnimation(this.props.loginRoute, newProps.loginRoute, false);
            this.animationInType = this.getAnimation(this.props.loginRoute, newProps.loginRoute);
            timer.setTimeout(
                'delayRouteChange' + newProps.loginRoute,
                () => {
                    this.setState({ nextLoginRoute: newProps.loginRoute });
                },
                150,
            );
        }
    }

    componentWillUnmount() {
        Linking.removeEventListener('url');
        timer.clearTimeout('delayRouteChange' + this.props.loginRoute);
        timer.clearTimeout('delayNavigation');
        this.props.setLoginPasswordField(null);
        // gc
    }

    /**
     * Validates password and logs in user if accepted
     * Navigates to 2FA validation if activated
     * @method onLoginPress
     * @returns {Promise<void>}
     */
    async onLoginPress() {
        const { t, is2FAEnabled, hasConnection, password, forceUpdate } = this.props;
        if (!hasConnection || forceUpdate) {
            return;
        }
        this.animationOutType = ['fadeOut'];
        if (!password) {
            this.props.generateAlert('error', t('emptyPassword'), t('emptyPasswordExplanation'));
        } else {
            let pwdHash = await hash(password);
            try {
                await authorize(pwdHash);
                global.passwordHash = pwdHash;
                pwdHash = null;
                // gc
                this.props.setLoginPasswordField(null);
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
        const { t, hasConnection } = this.props;
        if (!hasConnection) {
            return;
        }
        if (token) {
            let key = await getTwoFactorAuthKeyFromKeychain(global.passwordHash);
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
                key = null;
                // gc
            } else {
                this.props.generateAlert('error', t('twoFA:wrongCode'), t('twoFA:wrongCodeExplanation'));
            }
        } else {
            this.props.generateAlert('error', t('twoFA:emptyCode'), t('twoFA:emptyCodeExplanation'));
        }
    }

    /**
     * Gets animation according to current and next login route
     *
     * @param {string} currentLoginRoute
     * @param {string} nextLoginRoute
     * @param {bool} animationIn
     * @returns {object}
     */
    getAnimation(currentLoginRoute, nextLoginRoute, animationIn = true) {
        const routes = ['login', 'nodeOptions', 'customNode', 'nodeSelection', 'complete2FA'];
        if (routes.indexOf(currentLoginRoute) < routes.indexOf(nextLoginRoute)) {
            if (animationIn) {
                return ['slideInRightSmall', 'fadeIn'];
            }
            return ['slideOutLeftSmall', 'fadeOut'];
        } else if (routes.indexOf(currentLoginRoute) > routes.indexOf(nextLoginRoute)) {
            if (animationIn) {
                return ['slideInLeftSmall', 'fadeIn'];
            }
            return ['slideOutRightSmall', 'fadeOut'];
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
        timer.setTimeout(
            'delayNavigation',
            () => {
                navigator.setStackRoot('loading', {
                    animations: {
                        setStackRoot: {
                            enable: false,
                        },
                    },
                    layout: {
                        backgroundColor: body.bg,
                        orientation: ['portrait'],
                    },
                    statusBar: {
                        backgroundColor: body.bg,
                    },
                });
            },
            150,
        );
    }

    render() {
        const { theme, password, isFingerprintEnabled } = this.props;
        const { nextLoginRoute } = this.state;
        const body = theme.body;
        return (
            <AnimatedComponent
                animateOnMount={false}
                animationInType={this.animationInType}
                animationOutType={this.animationOutType}
                animateInTrigger={this.state.nextLoginRoute}
                animateOutTrigger={this.props.loginRoute}
                duration={150}
                style={[styles.container, { backgroundColor: body.bg }]}
            >
                {nextLoginRoute === 'login' && (
                    <EnterPasswordOnLoginComponent
                        theme={theme}
                        onLoginPress={this.onLoginPress}
                        navigateToNodeOptions={() => this.props.setLoginRoute('nodeOptions')}
                        setLoginPasswordField={(pword) => this.props.setLoginPasswordField(pword)}
                        password={password}
                        isFingerprintEnabled={isFingerprintEnabled}
                    />
                )}
                {nextLoginRoute === 'complete2FA' && (
                    <Enter2FAComponent
                        verify={this.onComplete2FA}
                        cancel={() => this.props.setLoginRoute('login')}
                        theme={theme}
                    />
                )}
                {nextLoginRoute !== 'complete2FA' &&
                    nextLoginRoute !== 'login' && <NodeOptionsOnLogin loginRoute={nextLoginRoute} />}
            </AnimatedComponent>
        );
    }
}

const mapStateToProps = (state) => ({
    node: state.settings.node,
    nodes: state.settings.nodes,
    theme: state.settings.theme,
    is2FAEnabled: state.settings.is2FAEnabled,
    password: state.ui.loginPasswordFieldText,
    loginRoute: state.ui.loginRoute,
    hasConnection: state.wallet.hasConnection,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
    forceUpdate: state.wallet.forceUpdate,
});

const mapDispatchToProps = {
    generateAlert,
    setFullNode,
    setSetting,
    setUserActivity,
    setLoginPasswordField,
    setDeepLink,
    setLoginRoute,
};

export default withNamespaces(['login', 'global', 'twoFA'])(connect(mapStateToProps, mapDispatchToProps)(Login));
