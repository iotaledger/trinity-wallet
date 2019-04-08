import size from 'lodash/size';
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
import { setFullNode } from 'shared-modules/actions/settings';
import { setSetting } from 'shared-modules/actions/wallet';
import { setUserActivity, setLoginRoute } from 'shared-modules/actions/ui';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getSelectedAccountName, getSelectedAccountMeta } from 'shared-modules/selectors/accounts';
import WithDeepLinking from 'ui/components/DeepLinking';
import NodeOptionsOnLogin from 'ui/views/wallet/NodeOptionsOnLogin';
import EnterPasswordOnLoginComponent from 'ui/components/EnterPasswordOnLogin';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import Enter2FAComponent from 'ui/components/Enter2FA';
import SeedStore from 'libs/SeedStore';
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
        t: PropTypes.func.isRequired,
        /** @ignore */
        loginRoute: PropTypes.string.isRequired,
        /** @ignore */
        setLoginRoute: PropTypes.func.isRequired,
        /** @ignore */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        completedMigration: PropTypes.bool.isRequired,
        /** @ignore */
        forceUpdate: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            nextLoginRoute: props.loginRoute,
            password: null,
        };
        this.onComplete2FA = this.onComplete2FA.bind(this);
        this.onLoginPress = this.onLoginPress.bind(this);
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
        delete this.state.password;
    }

    /**
     * Validates password and logs in user if accepted
     * Navigates to 2FA validation if activated
     * @method onLoginPress
     * @returns {Promise<void>}
     */
    async onLoginPress() {
        const {
            t,
            is2FAEnabled,
            hasConnection,
            forceUpdate,
            completedMigration,
            selectedAccountMeta,
            selectedAccountName,
        } = this.props;
        if (!hasConnection || forceUpdate) {
            return;
        }
        this.animationOutType = ['fadeOut'];
        if (size(this.state.password) === 0) {
            this.props.generateAlert('error', t('emptyPassword'), t('emptyPasswordExplanation'));
        } else {
            const pwdHash = await hash(this.state.password);
            try {
                await authorize(pwdHash);
                const seedStore = await new SeedStore[selectedAccountMeta.type](pwdHash, selectedAccountName);
                // FIXME: To be deprecated
                const completedSeedMigration = typeof (await seedStore.getSeeds())[selectedAccountName] !== 'string';
                global.passwordHash = pwdHash;
                delete this.state.password;
                if (!is2FAEnabled) {
                    this.navigateTo(completedMigration && completedSeedMigration ? 'loading' : 'migration');
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
        const { t, hasConnection, completedMigration } = this.props;
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
                this.navigateTo(completedMigration ? 'loading' : 'migration');
                key = null;
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
     * Navigates to provided screen
     * @method navigateTo
     *
     * @param {string} name
     */
    navigateTo(name) {
        timer.setTimeout(
            'delayNavigation',
            () => {
                navigator.setStackRoot(name);
            },
            150,
        );
    }

    render() {
        const { theme, isFingerprintEnabled } = this.props;
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
                        setLoginPasswordField={(password) => this.setState({ password })}
                        password={this.state.password}
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
    theme: getThemeFromState(state),
    is2FAEnabled: state.settings.is2FAEnabled,
    loginRoute: state.ui.loginRoute,
    hasConnection: state.wallet.hasConnection,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
    completedMigration: state.settings.completedMigration,
    forceUpdate: state.wallet.forceUpdate,
    selectedAccountName: getSelectedAccountName(state),
    selectedAccountMeta: getSelectedAccountMeta(state),
});

const mapDispatchToProps = {
    generateAlert,
    setFullNode,
    setSetting,
    setUserActivity,
    setLoginRoute,
};

export default WithDeepLinking()(
    withNamespaces(['login', 'global', 'twoFA'])(connect(mapStateToProps, mapDispatchToProps)(Login)),
);
