import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, KeyboardAvoidingView, Animated } from 'react-native';
import {
    shouldTransitionForSnapshot,
    hasDisplayedSnapshotTransitionGuide,
    getSelectedAccountName,
} from 'shared-modules/selectors/accounts';
import { connect } from 'react-redux';
import { changeHomeScreenRoute, toggleTopBarDisplay } from 'shared-modules/actions/home';
import { markTaskAsDone } from 'shared-modules/actions/accounts';
import { setSetting } from 'shared-modules/actions/wallet';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getThemeFromState } from 'shared-modules/selectors/global';
import timer from 'react-native-timer';
import WithUserActivity from 'ui/components/UserActivity';
import WithLogout from 'ui/components/Logout';
import WithDeepLinking from 'ui/components/DeepLinking';
import TopBar from 'ui/components/TopBar';
import PollComponent from 'ui/components/Poll';
import Tabs from 'ui/components/Tabs';
import Tab from 'ui/components/Tab';
import TabContent from 'ui/components/TabContent';
import { isAndroid } from 'libs/device';

const styles = StyleSheet.create({
    midContainer: {
        flex: 5.42,
        zIndex: 0,
    },
    bottomContainer: {
        flex: 0.68,
    },
});

class Home extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        changeHomeScreenRoute: PropTypes.func.isRequired,
        /** @ignore */
        minimised: PropTypes.bool.isRequired,
        /** @ignore */
        isTransitioning: PropTypes.bool.isRequired,
        /** @ignore */
        isSyncing: PropTypes.bool.isRequired,
        /** @ignore */
        isCheckingCustomNode: PropTypes.bool.isRequired,
        /** @ignore */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        currentSetting: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isTopBarActive: PropTypes.bool.isRequired,
        /** @ignore */
        toggleTopBarDisplay: PropTypes.func.isRequired,
        /** @ignore */
        isModalActive: PropTypes.bool.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
        /** Determines whether to display the snapshot transition guide modal */
        shouldTransitionForSnapshot: PropTypes.bool.isRequired,
        /** Determines whether snapshot transition guide is already displayed for selected account */
        hasDisplayedSnapshotTransitionGuide: PropTypes.bool.isRequired,
        /** @ignore */
        markTaskAsDone: PropTypes.func.isRequired,
        /** Currently selected account name */
        selectedAccountName: PropTypes.string.isRequired,
        /** @ignore */
        currentRoute: PropTypes.string.isRequired,
        /** @ignore */
        isKeyboardActive: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.viewFlex = new Animated.Value(0.7);
    }

    componentDidMount() {
        this.displayUpdates();
    }

    componentWillReceiveProps(newProps) {
        if (!this.props.isKeyboardActive && newProps.isKeyboardActive && !this.props.isModalActive) {
            this.handleCloseTopBar();
            Animated.timing(this.viewFlex, {
                duration: isAndroid ? 100 : 250,
                toValue: 0.2,
            }).start();
        }
        if (this.props.isKeyboardActive && !newProps.isKeyboardActive) {
            Animated.timing(this.viewFlex, {
                duration: isAndroid ? 100 : 250,
                toValue: 0.7,
            }).start();
        }
    }

    shouldComponentUpdate(newProps) {
        const { isSyncing, isSendingTransfer, isTransitioning } = this.props;
        if (isSyncing !== newProps.isSyncing) {
            return false;
        }
        if (isSendingTransfer !== newProps.isSendingTransfer) {
            return false;
        }
        if (isTransitioning !== newProps.isTransitioning) {
            return false;
        }
        return true;
    }

    componentWillUnmount() {
        const { isModalActive } = this.props;
        if (isModalActive) {
            this.props.toggleModalActivity();
        }
        timer.clearTimeout('iOSKeyboardTimeout');
    }

    /**
     * Changes home screen child route
     * @param {string} name
     */
    onTabSwitch(nextRoute) {
        const { isSyncing, isTransitioning, isCheckingCustomNode } = this.props;

        if (isTransitioning) {
            return;
        }
        // Set tab animation in type according to relative position of next active tab
        const routes = ['balance', 'send', 'receive', 'history', 'settings'];
        this.tabAnimationInType =
            routes.indexOf(nextRoute) < routes.indexOf(this.props.currentRoute)
                ? ['slideInLeftSmall', 'fadeIn']
                : ['slideInRightSmall', 'fadeIn'];
        this.props.changeHomeScreenRoute(nextRoute);

        if (!isSyncing && !isCheckingCustomNode) {
            this.resetSettings();
        }
    }

    handleCloseTopBar = () => {
        const { isTopBarActive } = this.props;
        if (isTopBarActive) {
            this.props.toggleTopBarDisplay();
        }
    };

    /**
     * Resets child routes on settings screen
     */
    resetSettings() {
        const { currentSetting } = this.props;
        if (currentSetting !== 'mainSettings') {
            this.props.setSetting('mainSettings');
        }
    }

    /**
     * Mark the task of displaying snapshot transition modal as done
     */
    completeTransitionTask() {
        this.props.markTaskAsDone({
            accountName: this.props.selectedAccountName,
            task: 'displayedSnapshotTransitionGuide',
        });
        if (this.props.isModalActive) {
            this.props.toggleModalActivity();
        }
    }

    /**
     * Displays snapshot transition guide modal
     */
    displayUpdates() {
        const { hasDisplayedSnapshotTransitionGuide, shouldTransitionForSnapshot } = this.props;
        if (!hasDisplayedSnapshotTransitionGuide) {
            if (shouldTransitionForSnapshot) {
                this.props.toggleModalActivity('snapshotTransitionInfo', {
                    theme: this.props.theme,
                    t: this.props.t,
                    completeTransitionTask: () => this.completeTransitionTask(),
                });
            } else {
                this.completeTransitionTask();
            }
        }
    }

    render() {
        const {
            t,
            minimised,
            theme: { body },
            theme,
            isKeyboardActive,
        } = this.props;

        return (
            <View style={{ flex: 1, backgroundColor: body.bg }}>
                <View style={{ flex: 1 }}>
                    {(!minimised && (
                        <KeyboardAvoidingView enabled={isKeyboardActive} style={styles.midContainer} behavior="padding">
                            <Animated.View useNativeDriver style={{ flex: this.viewFlex }} />
                            <View style={{ flex: 4.72 }}>
                                <TabContent
                                    onTabSwitch={(name) => this.onTabSwitch(name)}
                                    handleCloseTopBar={() => this.handleCloseTopBar()}
                                />
                            </View>
                        </KeyboardAvoidingView>
                    )) || <View style={styles.midContainer} />}
                    <View style={styles.bottomContainer}>
                        <Tabs onPress={(name) => this.onTabSwitch(name)} theme={theme}>
                            <Tab name="balance" icon="wallet" theme={theme} text={t('home:balance').toUpperCase()} />
                            <Tab name="send" icon="send" theme={theme} text={t('home:send').toUpperCase()} />
                            <Tab name="receive" icon="receive" theme={theme} text={t('home:receive').toUpperCase()} />
                            <Tab name="history" icon="history" theme={theme} text={t('home:history').toUpperCase()} />
                            <Tab
                                name="settings"
                                icon="settings"
                                theme={theme}
                                text={t('home:settings').toUpperCase()}
                            />
                        </Tabs>
                    </View>
                    <TopBar minimised={minimised} />
                </View>
                <PollComponent />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    minimised: state.ui.minimised,
    theme: getThemeFromState(state),
    isSyncing: state.ui.isSyncing,
    isCheckingCustomNode: state.ui.isCheckingCustomNode,
    isSendingTransfer: state.ui.isSendingTransfer,
    isTransitioning: state.ui.isTransitioning,
    currentSetting: state.wallet.currentSetting,
    isTopBarActive: state.home.isTopBarActive,
    currentRoute: state.home.childRoute,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
    isModalActive: state.ui.isModalActive,
    shouldTransitionForSnapshot: shouldTransitionForSnapshot(state),
    hasDisplayedSnapshotTransitionGuide: hasDisplayedSnapshotTransitionGuide(state),
    selectedAccountName: getSelectedAccountName(state),
    isKeyboardActive: state.ui.isKeyboardActive,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    generateAlert,
    setSetting,
    toggleTopBarDisplay,
    toggleModalActivity,
    markTaskAsDone,
};

export default WithUserActivity()(
    WithDeepLinking()(
        WithLogout()(
            withTranslation(['home', 'global', 'login'])(
                connect(
                    mapStateToProps,
                    mapDispatchToProps,
                )(Home),
            ),
        ),
    ),
);
