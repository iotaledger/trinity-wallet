import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { Linking, StyleSheet, View, KeyboardAvoidingView, Animated, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { changeHomeScreenRoute, toggleTopBarDisplay } from 'iota-wallet-shared-modules/actions/home';
import { setPassword, setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { setUserActivity } from 'iota-wallet-shared-modules/actions/ui';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { parseAddress } from 'iota-wallet-shared-modules/libs/iota/utils';
import { setDeepLink } from 'iota-wallet-shared-modules/actions/deepLink';
import { getPasswordHash } from '../utils/crypto';
import DynamicStatusBar from '../components/DynamicStatusBar';
import UserInactivity from '../components/UserInactivity';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import TopBar from './TopBar';
import WithUserActivity from '../components/UserActivity';
import WithBackPress from '../components/BackPress';
import PollComponent from './Poll';
import Tabs from '../components/Tabs';
import Tab from '../components/Tab';
import TabContent from '../components/TabContent';
import EnterPassword from '../containers/EnterPassword';
import { height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';

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
        /** Determines if wallet is making a transaction */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Currently selected setting */
        currentSetting: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        isTopBarActive: PropTypes.bool.isRequired,
        toggleTopBarDisplay: PropTypes.func.isRequired,
        /** Set send amount params
         * @param {string} - amount
         * @param {string} - address
         * @param {string} - message
         */
        setDeepLink: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.onLoginPress = this.onLoginPress.bind(this);
        this.setDeepUrl = this.setDeepUrl.bind(this);
        this.viewFlex = new Animated.Value(0.7);
        this.topBarHeight = new Animated.Value(height / 8.8);
        this.state = {
            isIOSKeyboardActive: false,
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
        if (!isAndroid) {
            this.keyboardWillShowSub.remove();
            this.keyboardWillHideSub.remove();
        }
        Linking.removeEventListener('url');
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
        }
    };

    onTabSwitch(name) {
        const { isSyncing, isTransitioning } = this.props;
        this.props.changeHomeScreenRoute(name);
        if (!isSyncing && !isTransitioning) {
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
        if (isTopBarActive) {
            this.props.toggleTopBarDisplay();
        }
    };

    handleInactivity = () => {
        const { isTransitioning, isSyncing, isSendingTransfer } = this.props;
        const doingSomething = isTransitioning || isSyncing || isSendingTransfer;
        if (doingSomething) {
            this.userInactivity.setActiveFromComponent();
        } else {
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
            toValue: 0,
        }).start();
    };

    keyboardWillHide = (event) => {
        this.setState({ isIOSKeyboardActive: false });
        Animated.timing(this.viewFlex, {
            duration: event.duration,
            toValue: 0.7,
        }).start();
        Animated.timing(this.topBarHeight, {
            duration: event.duration,
            toValue: height / 8.8,
        }).start();
    };

    render() {
        const { t, navigator, inactive, minimised, theme: { bar, body, negative, positive, primary } } = this.props;
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
                    <DynamicStatusBar backgroundColor={bar.bg} />
                    {!inactive &&
                        !minimised && (
                            <View style={{ flex: 1 }}>
                                <KeyboardAvoidingView
                                    style={styles.midContainer}
                                    behavior={isAndroid ? null : 'padding'}
                                >
                                    <Animated.View useNativeDriver style={{ flex: this.viewFlex }} />
                                    <View style={{ flex: 4.72 }}>
                                        <TabContent
                                            navigator={navigator}
                                            onTabSwitch={(name) => this.onTabSwitch(name)}
                                            handleCloseTopBar={() => this.handleCloseTopBar()}
                                        />
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
                                <TopBar isIOSKeyboardActive={isIOSKeyboardActive} topBarHeight={this.topBarHeight} />
                            </View>
                        )}
                    {inactive && (
                        <View style={[styles.inactivityLogoutContainer, { backgroundColor: body.bg }]}>
                            <EnterPassword
                                onLoginPress={this.onLoginPress}
                                backgroundColor={body.bg}
                                negativeColor={negative.color}
                                positiveColor={positive.color}
                                bodyColor={body.color}
                                textColor={textColor}
                            />
                        </View>
                    )}
                    {minimised && <View />}
                    <PollComponent />
                    <StatefulDropdownAlert backgroundColor={bar.bg} />
                </View>
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
    isSendingTransfer: state.ui.isSendingTransfer,
    isTransitioning: state.ui.isTransitioning,
    currentSetting: state.wallet.currentSetting,
    isTopBarActive: state.home.isTopBarActive,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    generateAlert,
    setPassword,
    setUserActivity,
    setSetting,
    toggleTopBarDisplay,
    setDeepLink,
};

export default WithUserActivity()(
    WithBackPress()(translate(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home))),
);
