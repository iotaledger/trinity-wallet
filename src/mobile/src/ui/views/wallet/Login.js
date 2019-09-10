import { withTranslation } from 'react-i18next';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import KeepAwake from 'react-native-keep-awake';
import SplashScreen from 'react-native-splash-screen';
import navigator from 'libs/navigation';
import { Linking, StyleSheet, View } from 'react-native';
import timer from 'react-native-timer';
import { setFullNode } from 'shared-modules/actions/settings';
import { setSetting } from 'shared-modules/actions/wallet';
import { setUserActivity, setLoginRoute } from 'shared-modules/actions/ui';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { generateAlert } from 'shared-modules/actions/alerts';
import WithDeepLinking from 'ui/components/DeepLinking';
import NodeSettingsComponent from 'ui/views/wallet/NodeSettings';
import AddCustomNodeComponent from 'ui/views/wallet/AddCustomNode';
import LoginContent from 'ui/components/LoginContent';
import AnimatedComponent from 'ui/components/AnimatedComponent';
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
        theme: PropTypes.object.isRequired,
        /** @ignore */
        setUserActivity: PropTypes.func.isRequired,
        /** @ignore */
        loginRoute: PropTypes.string.isRequired,
        /** @ignore */
        setLoginRoute: PropTypes.func.isRequired,
        /** @ignore */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        forceUpdate: PropTypes.bool.isRequired,
        /** @ignore */
        hasConnection: PropTypes.bool.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
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
        const { hasConnection, forceUpdate } = this.props;
        if (!hasConnection || forceUpdate) {
            return;
        }
        this.animationOutType = ['fadeOut'];
        this.navigateTo('loading');
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
        const { theme, isFingerprintEnabled, themeName } = this.props;
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
                    <LoginContent
                        theme={theme}
                        onLoginPress={this.onLoginPress}
                        navigateToNodeOptions={() => this.props.setLoginRoute('nodeSettings')}
                        setLoginPasswordField={(password) => this.setState({ password })}
                        password={this.state.password}
                        isFingerprintEnabled={isFingerprintEnabled}
                        themeName={themeName}
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
    themeName: state.settings.themeName,
    loginRoute: state.ui.loginRoute,
    hasConnection: state.wallet.hasConnection,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
    completedMigration: state.settings.completedMigration,
    forceUpdate: state.wallet.forceUpdate,
});

const mapDispatchToProps = {
    generateAlert,
    setFullNode,
    setSetting,
    setUserActivity,
    setLoginRoute,
};

export default WithDeepLinking()(
    withTranslation(['login', 'global'])(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(Login),
    ),
);
