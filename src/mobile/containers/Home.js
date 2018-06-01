import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import Modal from 'react-native-modal';
import { Linking, StyleSheet, View, KeyboardAvoidingView, Animated, Keyboard } from 'react-native';
import {
    shouldTransitionForSnapshot,
    hasDisplayedSnapshotTransitionGuide,
    getSelectedAccountName,
} from 'iota-wallet-shared-modules/selectors/accounts';
import { connect } from 'react-redux';
import { changeHomeScreenRoute, toggleTopBarDisplay } from 'iota-wallet-shared-modules/actions/home';
import { markTaskAsDone } from 'iota-wallet-shared-modules/actions/accounts';
import { setPassword, setSetting, setDeepLink } from 'iota-wallet-shared-modules/actions/wallet';
import { setUserActivity, toggleModalActivity } from 'iota-wallet-shared-modules/actions/ui';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { parseAddress } from 'iota-wallet-shared-modules/libs/iota/utils';
import timer from 'react-native-timer';
import { getPasswordHash } from '../utils/crypto';
import DynamicStatusBar from '../components/DynamicStatusBar';
import UserInactivity from '../components/UserInactivity';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import TopBar from './TopBar';
import WithUserActivity from '../components/UserActivity';
import WithBackPress from '../components/BackPress';
import SnapshotTransitionModalContent from '../components/SnapshotTransitionModalContent';
import PollComponent from './Poll';
import Tabs from '../components/Tabs';
import Tab from '../components/Tab';
import TabContent from '../components/TabContent';
import EnterPassword from '../containers/EnterPassword';
import { height } from '../utils/dimensions';
import { isAndroid, isIPhoneX } from '../utils/device';

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
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Updates home screen children route name
         * @param {string} name - route name
         */
        changeHomeScreenRoute: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification titleinactivityLogoutContainer
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Set application activity state
         * @param {object} options - minimzed, active, inactive
         */
        setUserActivity: PropTypes.func.isRequired,
        /** Determines if the application is inactive */
        inactive: PropTypes.bool.isRequired,
        /** Determines if the application is minimised */
        minimised: PropTypes.bool.isRequired,
        /** Hash for wallet's password */
        storedPassword: PropTypes.string.isRequired,
        /** Determines if wallet is doing snapshot transition */
        isTransitioning: PropTypes.bool.isRequired,
        /** Determines if wallet is doing a manual sync */
        isSyncing: PropTypes.bool.isRequired,
        /** Determines if the newly added custom node is being checked */
        isCheckingCustomNode: PropTypes.bool.isRequired,
        /** Determines if wallet is making a transaction */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Determines if user has activated fingerprint auth */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** Currently selected setting */
        currentSetting: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Determines whether the top bar is currently open */
        isTopBarActive: PropTypes.bool.isRequired,
        /** Opens/closes the top bar */
        toggleTopBarDisplay: PropTypes.func.isRequired,
        /** Set send amount params
         * @param {string} - amount
         * @param {string} - address
         * @param {string} - message
         */
        setDeepLink: PropTypes.func.isRequired,
        /** Determines whether modal is open */
        isModalActive: PropTypes.bool.isRequired,
        /** Sets whether modal is active or inactive */
        toggleModalActivity: PropTypes.func.isRequired,
        /** Determines whether to display the snapshot transition guide modal */
        shouldTransitionForSnapshot: PropTypes.bool.isRequired,
        /** Determines whether snapshot transition guide is already displayed for selected account */
        hasDisplayedSnapshotTransitionGuide: PropTypes.bool.isRequired,
        /** Mark task for account as done
         * @param {object} { accountName, task }
         */
        markTaskAsDone: PropTypes.func.isRequired,
        /** Currently selected account name */
        selectedAccountName: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.onLoginPress = this.onLoginPress.bind(this);
        this.setDeepUrl = this.setDeepUrl.bind(this);
        this.viewFlex = new Animated.Value(0.7);
        this.topBarHeight = isAndroid ? height / 8 : new Animated.Value(height / 8.8);

        this.state = {
            isIOSKeyboardActive: false,
            showModal: false,
        };
    }

    componentWillMount() {
        if (!isAndroid) {
            this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
            this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
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
        if (!isAndroid) {
            this.keyboardWillShowSub.remove();
            this.keyboardWillHideSub.remove();
        }
        Linking.removeEventListener('url');
        if (isModalActive) {
            this.props.toggleModalActivity();
        }
        timer.clearTimeout('iOSKeyboardTimeout');
    }

    onLoginPress = (password) => {
        const { t, storedPassword } = this.props;
        const pwdHash = getPasswordHash(password);

        if (!password) {
            this.props.generateAlert('error', t('login:emptyPassword'), t('login:emptyPasswordExplanation'));
        } else if (storedPassword !== pwdHash) {
            this.props.generateAlert(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        } else {
            this.props.setUserActivity({ inactive: false });
            this.userInactivity.setActiveFromComponent();
        }
    };

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
        const { inactive } = this.props;
        if (inactive) {
            return;
        }
        this.handleCloseTopBar();
        this.setState({ isIOSKeyboardActive: true });
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
        timer.setTimeout('iOSKeyboardTimeout', () => this.setState({ isIOSKeyboardActive: false }), event.duration);
        Animated.timing(this.viewFlex, {
            duration: event.duration,
            toValue: 0.7,
        }).start();
        Animated.timing(this.topBarHeight, {
            duration: event.duration,
            toValue: height / 8.8,
        }).start();
    };

    completeTransitionTask() {
        // Just mark this task as done
        // Since most likely the account needs
        // no transition
        this.props.markTaskAsDone({
            accountName: this.props.selectedAccountName,
            task: 'hasDisplayedTransitionGuide',
        });
    }

    displayUpdates() {
        const { hasDisplayedSnapshotTransitionGuide, shouldTransitionForSnapshot } = this.props;

        if (!hasDisplayedSnapshotTransitionGuide) {
            if (shouldTransitionForSnapshot) {
                this.setState({ showModal: true });
            } else {
                this.completeTransitionTask();
            }
        }
    }

    render() {
        const {
            t,
            navigator,
            inactive,
            minimised,
            isFingerprintEnabled,
            isModalActive,
            theme: { bar, body, negative, positive, primary },
        } = this.props;
        const { isIOSKeyboardActive } = this.state;
        const barTextColor = { color: bar.color };
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
                    <DynamicStatusBar backgroundColor={inactive ? body.bg : bar.bg} isModalActive={isModalActive} />
                    {(!inactive && (
                        <View style={{ flex: 1 }}>
                            <KeyboardAvoidingView style={styles.midContainer} behavior={isAndroid ? null : 'padding'}>
                                <Animated.View useNativeDriver style={{ flex: this.viewFlex }} />
                                <View style={{ flex: 4.72 }}>
                                    {!minimised &&
                                        ((
                                            <TabContent
                                                navigator={navigator}
                                                onTabSwitch={(name) => this.onTabSwitch(name)}
                                                handleCloseTopBar={() => this.handleCloseTopBar()}
                                                isIOSKeyboardActive={isIOSKeyboardActive}
                                            />
                                        ) || <View />)}
                                </View>
                            </KeyboardAvoidingView>
                            <View style={styles.bottomContainer}>
                                <Tabs onPress={(name) => this.onTabSwitch(name)} barBg={bar.bg}>
                                    <Tab
                                        name="balance"
                                        icon="wallet"
                                        iconColor={bar.color}
                                        activeBorderColor={primary.color}
                                        activeColor={bar.alt}
                                        textColor={barTextColor}
                                        text={t('home:balance').toUpperCase()}
                                    />
                                    <Tab
                                        name="send"
                                        icon="send"
                                        iconColor={bar.color}
                                        activeBorderColor={primary.color}
                                        activeColor={bar.alt}
                                        textColor={barTextColor}
                                        text={t('home:send').toUpperCase()}
                                    />
                                    <Tab
                                        name="receive"
                                        icon="receive"
                                        iconColor={bar.color}
                                        activeBorderColor={primary.color}
                                        activeColor={bar.alt}
                                        textColor={barTextColor}
                                        text={t('home:receive').toUpperCase()}
                                    />
                                    <Tab
                                        name="history"
                                        icon="history"
                                        iconColor={bar.color}
                                        activeBorderColor={primary.color}
                                        activeColor={bar.alt}
                                        textColor={barTextColor}
                                        text={t('home:history').toUpperCase()}
                                    />
                                    <Tab
                                        name="settings"
                                        icon="settings"
                                        iconColor={bar.color}
                                        activeBorderColor={primary.color}
                                        activeColor={bar.alt}
                                        textColor={barTextColor}
                                        text={t('home:settings').toUpperCase()}
                                    />
                                </Tabs>
                            </View>
                            <TopBar
                                minimised={minimised}
                                isIOSKeyboardActive={isIOSKeyboardActive}
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
                    {!isModalActive && <StatefulDropdownAlert backgroundColor={bar.bg} />}
                </View>
                <Modal
                    backdropTransitionInTiming={isAndroid ? 500 : 300}
                    backdropTransitionOutTiming={200}
                    backdropColor={body.bg}
                    backdropOpacity={0.8}
                    style={{ alignItems: 'center', margin: 0 }}
                    isVisible={this.state.showModal}
                    onBackButtonPress={() => {
                        this.completeTransitionTask();
                        this.setState({ showModal: false });
                    }}
                    useNativeDriver={isAndroid}
                    hideModalContentWhileAnimating
                >
                    <SnapshotTransitionModalContent
                        theme={this.props.theme}
                        t={this.props.t}
                        onPress={() => {
                            this.completeTransitionTask();
                            this.setState({ showModal: false });
                        }}
                    />
                </Modal>
            </UserInactivity>
        );
    }
}

const mapStateToProps = (state) => ({
    storedPassword: state.wallet.password,
    inactive: state.ui.inactive,
    minimised: state.ui.minimised,
    theme: state.settings.theme,
    currentRoute: state.home.childRoute,
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
    WithBackPress()(translate(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home))),
);
