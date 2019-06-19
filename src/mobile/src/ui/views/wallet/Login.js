import filter from 'lodash/filter';
import isNull from 'lodash/isNull';
import flatMap from 'lodash/flatMap';
import includes from 'lodash/includes';
import map from 'lodash/map';
import pick from 'lodash/pick';
import { withNamespaces } from 'react-i18next';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import KeepAwake from 'react-native-keep-awake';
import SplashScreen from 'react-native-splash-screen';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import { navigator } from 'libs/navigation';
import { moment } from 'shared-modules/libs/exports';
import { Linking, StyleSheet, View } from 'react-native';
import { hash } from 'libs/keychain';
import timer from 'react-native-timer';
import { setFullNode } from 'shared-modules/actions/settings';
import { setSetting } from 'shared-modules/actions/wallet';
import { setUserActivity, setLoginRoute } from 'shared-modules/actions/ui';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { generateAlert } from 'shared-modules/actions/alerts';
import WithDeepLinking from 'ui/components/DeepLinking';
import NodeSettingsComponent from 'ui/views/wallet/NodeSettings';
import AddCustomNodeComponent from 'ui/views/wallet/AddCustomNode';
import EnterPasswordOnLoginComponent from 'ui/components/EnterPasswordOnLogin';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import SeedStore from 'libs/SeedStore';
import { isAndroid, getAndroidFileSystemPermissions } from 'libs/device';
import { serialise } from 'shared-modules/libs/utils';
import { tritsToChars } from 'shared-modules/libs/iota/converter';
import { iota, quorum } from 'shared-modules/libs/iota';

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
        forceUpdate: PropTypes.bool.isRequired,
        /** @ignore */
        hasConnection: PropTypes.bool.isRequired,
        /** @ignore */
        accounts: PropTypes.object.isRequired,
        /** @ignore */
        settings: PropTypes.object.isRequired,
        /** @ignore */
        notificationLog: PropTypes.array.isRequired,
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
        this.exportStateFile();
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

    async exportStateFile() {
        const { accounts, settings, notificationLog, t, generateAlert } = this.props;
        if (isAndroid) {
            await getAndroidFileSystemPermissions();
        }

        const path = `${
            isAndroid ? RNFetchBlob.fs.dirs.DownloadDir : RNFetchBlob.fs.dirs.CacheDir
        }/Trinity-${moment().format('YYYYMMDD-HHmm')}.txt`;

        const fs = RNFetchBlob.fs;

        try {
            const passwordHash = await hash(this.state.password);
            const seedStore = await new SeedStore.keychain(passwordHash);

            const seeds = await seedStore.getSeeds();

            const seedsAsTrits = Object.values(isNull(seeds) ? [] : seeds);
            const seedsAsChars = map(seedsAsTrits, tritsToChars);

            const files = await Promise.all([
                fs.ls(fs.dirs.DocumentDir),
                fs.ls(fs.dirs.CacheDir),
                fs.ls(fs.dirs.MainBundleDir),
            ]);

            const fileExists = await fs.exists(path);
            if (fileExists) {
                fs.unlink(path);
            }
            await fs.createFile(
                path,
                serialise(
                    {
                        notificationLog,
                        settings,
                        accounts: pick(accounts, ['onboardingComplete', 'accountInfo']),
                        storageFiles: filter(flatMap(files), (name) => includes(name, 'realm')),
                        // NOTE: DO NOT USE IN PRODUCTION.
                        // THIS IS ONLY ADDED FOR DEBUGGING KEYCHAIN ISSUES.
                        seeds: seedsAsChars,
                        __globals__: {
                            quorumNodes: quorum.nodes,
                            quorumSize: quorum.size,
                            iotaNode: iota.provider,
                        },
                    },
                    null,
                    4,
                ),
            );

            Share.open({
                url: isAndroid ? 'file://' + path : path,
                type: 'text/plain',
            })
                .then(() => {
                    generateAlert('success', t('exportSuccess'), t('exportSuccessExplanation'));
                })
                .catch(() => fs.unlink(path));
        } catch (err) {
            fs.unlink(path);
            generateAlert('error', t('global:somethingWentWrong'), t('global:somethingWentWrongTryAgain'), 10000, err);
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
    forceUpdate: state.wallet.forceUpdate,
    settings: state.settings,
    accounts: state.accounts,
    notificationLog: state.alerts.notificationLog,
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
