import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { Linking, StyleSheet, View, KeyboardAvoidingView, Animated, Keyboard } from 'react-native';
import {
    shouldTransitionForSnapshot,
    hasDisplayedSnapshotTransitionGuide,
    getSelectedAccountName,
} from 'shared-modules/selectors/accounts';
import { connect } from 'react-redux';
import { changeHomeScreenRoute, toggleTopBarDisplay } from 'shared-modules/actions/home';
import { markTaskAsDone } from 'shared-modules/actions/accounts';
import { setPassword, setSetting, setDeepLink } from 'shared-modules/actions/wallet';
import { setUserActivity, toggleModalActivity } from 'shared-modules/actions/ui';
import { generateAlert } from 'shared-modules/actions/alerts';
import { parseAddress } from 'shared-modules/libs/iota/utils';
import timer from 'react-native-timer';
import { hash } from 'libs/keychain';
import UserInactivity from 'ui/components/UserInactivity';
import TopBar from 'ui/components/TopBar';
import WithUserActivity from 'ui/components/UserActivity';
import WithBackPress from 'ui/components/BackPress';
import PollComponent from 'ui/components/Poll';
import Tabs from 'ui/components/Tabs';
import Tab from 'ui/components/Tab';
import TabContent from 'ui/components/TabContent';
import EnterPassword from 'ui/components/EnterPassword';
import { height } from 'libs/dimensions';
import { isAndroid, isIPhoneX } from 'libs/device';

const styles = StyleSheet.create({
    midContainer: {
        flex: 5.42,
        zIndex: 0,
    },
    bottomContainer: {
        flex: 0.68,
    },
    inactivityLogoutContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

class Home extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        changeHomeScreenRoute: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        setUserActivity: PropTypes.func.isRequired,
        /** @ignore */
        inactive: PropTypes.bool.isRequired,
        /** @ignore */
        minimised: PropTypes.bool.isRequired,
        /** Hash for wallet's password */
        storedPasswordHash: PropTypes.object.isRequired,
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
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        currentSetting: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isTopBarActive: PropTypes.bool.isRequired,
        /** @ignore */
        toggleTopBarDisplay: PropTypes.func.isRequired,
        /** @ignore */
        setDeepLink: PropTypes.func.isRequired,
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
    };

    constructor(props) {
        super(props);
        this.onLoginPress = this.onLoginPress.bind(this);
        this.setDeepUrl = this.setDeepUrl.bind(this);
        this.viewFlex = new Animated.Value(0.7);
        this.topBarHeight = isAndroid ? null : new Animated.Value(height / 8.8);

        this.state = {
            isKeyboardActive: false,
        };
    }

    componentWillMount() {
        if (!isAndroid) {
            this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
            this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
        }
        if (isAndroid) {
            this.keyboardWillShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
            this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
        }
        this.deepLinkSub = Linking.addEventListener('url', this.setDeepUrl);
    }

    componentDidMount() {
        this.userInactivity.setActiveFromComponent();
        this.displayUpdates();
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
        this.keyboardWillShowSub.remove();
        this.keyboardWillHideSub.remove();
        Linking.removeEventListener('url');
        if (isModalActive) {
            this.props.toggleModalActivity();
        }
        timer.clearTimeout('iOSKeyboardTimeout');
    }

    /**
     * Validates user provided password and sets wallet state as active
     * @param {string} password
     * @returns {Promise<void>}
     */
    async onLoginPress(password) {
        const { t, storedPasswordHash } = this.props;
        if (!password) {
            return this.props.generateAlert('error', t('login:emptyPassword'), t('login:emptyPasswordExplanation'));
        }
        const passwordHash = await hash(password);
        if (!isEqual(passwordHash, storedPasswordHash)) {
            this.props.generateAlert(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        } else {
            this.props.setUserActivity({ inactive: false });
            this.userInactivity.setActiveFromComponent();
        }
    }

    /**
     * Changes home screen child route
     * @param {string} name
     */
    onTabSwitch(name) {
        const { isSyncing, isTransitioning, isCheckingCustomNode } = this.props;

        this.userInactivity.setActiveFromComponent();

        if (isTransitioning) {
            return;
        }

        this.props.changeHomeScreenRoute(name);

        if (!isSyncing && !isCheckingCustomNode) {
            this.resetSettings();
        }
    }

    setDeepUrl(data) {
        const { generateAlert, t } = this.props;
        const parsedData = parseAddress(data.url);
        if (parsedData) {
            this.props.setDeepLink(parsedData.amount.toString() || '0', parsedData.address, parsedData.message || null);
            this.props.changeHomeScreenRoute('send');
        } else {
            generateAlert('error', t('send:invalidAddress'), t('send:invalidAddressExplanation1'));
        }
    }

    /**
     * Resets child routes on settings screen
     */
    resetSettings() {
        const { currentSetting } = this.props;
        if (currentSetting !== 'mainSettings') {
            this.props.setSetting('mainSettings');
        }
    }

    handleCloseTopBar = () => {
        const { isTopBarActive } = this.props;
        this.userInactivity.setActiveFromComponent();
        if (isTopBarActive) {
            this.props.toggleTopBarDisplay();
        }
    };

    handleInactivity = () => {
        const { isTransitioning, isSyncing, isSendingTransfer, isModalActive } = this.props;
        const doingSomething = isTransitioning || isSyncing || isSendingTransfer;
        if (doingSomething) {
            this.userInactivity.setActiveFromComponent();
        } else {
            if (isModalActive) {
                this.props.toggleModalActivity();
            }
            this.resetSettings();
            this.props.setUserActivity({ inactive: true });
        }
    };

    keyboardWillShow = (event) => {
        const { inactive, minimised } = this.props;
        if (inactive || minimised) {
            return;
        }
        this.handleCloseTopBar();
        this.setState({ isKeyboardActive: true });
        Animated.timing(this.viewFlex, {
            duration: event.duration,
            toValue: 0.2,
        }).start();
        Animated.timing(this.topBarHeight, {
            duration: event.duration,
            toValue: isIPhoneX ? 0 : 20,
        }).start();
    };

    keyboardWillHide = (event) => {
        timer.setTimeout('iOSKeyboardTimeout', () => this.setState({ isKeyboardActive: false }), event.duration);
        Animated.timing(this.viewFlex, {
            duration: event.duration,
            toValue: 0.7,
        }).start();
        Animated.timing(this.topBarHeight, {
            duration: event.duration,
            toValue: height / 8.8,
        }).start();
    };

    keyboardDidShow = () => {
        const { inactive, minimised } = this.props;
        if (inactive || minimised) {
            return;
        }
        this.handleCloseTopBar();
        this.topBarHeight = 20;
        this.viewFlex = 0.2;
        this.setState({ isKeyboardActive: true });
    };

    keyboardDidHide = () => {
        this.topBarHeight = height / 8.8;
        this.viewFlex = 0.7;
        this.setState({ isKeyboardActive: false });
    };

    /**
     * Mark the task of displaying snapshot transition modal as done
     */
    completeTransitionTask() {
        this.props.markTaskAsDone({
            accountName: this.props.selectedAccountName,
            task: 'hasDisplayedTransitionGuide',
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
        const { t, inactive, minimised, isFingerprintEnabled, theme: { body, negative, positive }, theme } = this.props;
        const { isKeyboardActive } = this.state;
        const textColor = { color: body.color };

        return (
            <UserInactivity
                ref={(c) => {
                    this.userInactivity = c;
                }}
                timeForInactivity={300000}
                checkInterval={3000}
                onInactivity={this.handleInactivity}
            >
                <View style={{ flex: 1, backgroundColor: body.bg }}>
                    {(!inactive && (
                        <View style={{ flex: 1 }}>
                            {(!minimised && (
                                <KeyboardAvoidingView style={styles.midContainer} behavior="padding">
                                    <Animated.View useNativeDriver style={{ flex: this.viewFlex }} />
                                    <View style={{ flex: 4.72 }}>
                                        <TabContent
                                            onTabSwitch={(name) => this.onTabSwitch(name)}
                                            handleCloseTopBar={() => this.handleCloseTopBar()}
                                            isKeyboardActive={isKeyboardActive}
                                        />
                                    </View>
                                </KeyboardAvoidingView>
                            )) || <View style={styles.midContainer} />}
                            <View style={styles.bottomContainer}>
                                <Tabs onPress={(name) => this.onTabSwitch(name)} theme={theme}>
                                    <Tab
                                        name="balance"
                                        icon="wallet"
                                        theme={theme}
                                        text={t('home:balance').toUpperCase()}
                                    />
                                    <Tab name="send" icon="send" theme={theme} text={t('home:send').toUpperCase()} />
                                    <Tab
                                        name="receive"
                                        icon="receive"
                                        theme={theme}
                                        text={t('home:receive').toUpperCase()}
                                    />
                                    <Tab
                                        name="history"
                                        icon="history"
                                        theme={theme}
                                        text={t('home:history').toUpperCase()}
                                    />
                                    <Tab
                                        name="settings"
                                        icon="settings"
                                        theme={theme}
                                        text={t('home:settings').toUpperCase()}
                                    />
                                </Tabs>
                            </View>
                            <TopBar
                                minimised={minimised}
                                isKeyboardActive={isKeyboardActive}
                                topBarHeight={this.topBarHeight}
                            />
                        </View>
                    )) || (
                        <View style={[styles.inactivityLogoutContainer, { backgroundColor: body.bg }]}>
                            <EnterPassword
                                onLoginPress={this.onLoginPress}
                                backgroundColor={body.bg}
                                negativeColor={negative.color}
                                positiveColor={positive.color}
                                bodyColor={body.color}
                                textColor={textColor}
                                setUserActive={() => this.props.setUserActivity({ inactive: false })}
                                generateAlert={(error, title, explanation) =>
                                    this.props.generateAlert(error, title, explanation)
                                }
                                isFingerprintEnabled={isFingerprintEnabled}
                            />
                        </View>
                    )}
                    <PollComponent />
                </View>
            </UserInactivity>
        );
    }
}

const mapStateToProps = (state) => ({
    storedPasswordHash: state.wallet.password,
    inactive: state.ui.inactive,
    minimised: state.ui.minimised,
    theme: state.settings.theme,
    isSyncing: state.ui.isSyncing,
    isCheckingCustomNode: state.ui.isCheckingCustomNode,
    isSendingTransfer: state.ui.isSendingTransfer,
    isTransitioning: state.ui.isTransitioning,
    currentSetting: state.wallet.currentSetting,
    isTopBarActive: state.home.isTopBarActive,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
    isModalActive: state.ui.isModalActive,
    shouldTransitionForSnapshot: shouldTransitionForSnapshot(state),
    hasDisplayedSnapshotTransitionGuide: hasDisplayedSnapshotTransitionGuide(state),
    selectedAccountName: getSelectedAccountName(state),
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    generateAlert,
    setPassword,
    setUserActivity,
    setSetting,
    toggleTopBarDisplay,
    setDeepLink,
    toggleModalActivity,
    markTaskAsDone,
};

export default WithUserActivity()(
    WithBackPress()(withNamespaces(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home))),
);
