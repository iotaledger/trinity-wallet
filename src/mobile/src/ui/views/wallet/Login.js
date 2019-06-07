import size from 'lodash/size';
import { withNamespaces } from 'react-i18next';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import KeepAwake from 'react-native-keep-awake';
import SplashScreen from 'react-native-splash-screen';
import { navigator } from 'libs/navigation';
import { Linking, StyleSheet, View } from 'react-native';
import timer from 'react-native-timer';
import { setFullNode } from 'shared-modules/actions/settings';
import { setSetting } from 'shared-modules/actions/wallet';
import { setUserActivity, setLoginRoute } from 'shared-modules/actions/ui';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getSelectedAccountName, getSelectedAccountMeta } from 'shared-modules/selectors/accounts';
import WithDeepLinking from 'ui/components/DeepLinking';
import NodeSettingsComponent from 'ui/views/wallet/NodeSettings';
import AddCustomNodeComponent from 'ui/views/wallet/AddCustomNode';
import EnterPasswordOnLoginComponent from 'ui/components/EnterPasswordOnLogin';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import SeedStore from 'libs/SeedStore';
import { authorize, hash } from 'libs/keychain';
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
        /** @ignore */
        hasConnection: PropTypes.bool.isRequired,
        /** Currently selected account name */
        selectedAccountName: PropTypes.string.isRequired,
        /** Currently selected account meta */
        selectedAccountMeta: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            nextLoginRoute: props.loginRoute,
            password: null,
        };
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
     * @method onLoginPress
     * @returns {Promise<void>}
     */
    async onLoginPress() {
        const {
            t,
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
                this.navigateTo(completedMigration && completedSeedMigration ? 'loading' : 'migration');
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
     * Gets animation according to current and next login route
     *
     * @param {string} currentLoginRoute
     * @param {string} nextLoginRoute
     * @param {bool} animationIn
     * @returns {object}
     */
    getAnimation(currentLoginRoute, nextLoginRoute, animationIn = true) {
        const routes = ['login', 'nodeSettings', 'addCustomNode'];
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
                animateOnNavigation={false}
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
                        navigateToNodeOptions={() => this.props.setLoginRoute('nodeSettings')}
                        setLoginPasswordField={(password) => this.setState({ password })}
                        password={this.state.password}
                        isFingerprintEnabled={isFingerprintEnabled}
                    />
                )}
                {nextLoginRoute !== 'login' && (
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 0.15 }} />
                        {nextLoginRoute === 'nodeSettings' && <NodeSettingsComponent login />}
                        {nextLoginRoute === 'addCustomNode' && <AddCustomNodeComponent login />}
                        <View style={{ flex: 0.05 }} />
                    </View>
                )}
            </AnimatedComponent>
        );
    }
}

const mapStateToProps = (state) => ({
    node: state.settings.node,
    nodes: state.settings.nodes,
    theme: getThemeFromState(state),
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
    withNamespaces(['login', 'global'])(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(Login),
    ),
);
