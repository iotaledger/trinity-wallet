import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, KeyboardAvoidingView, Animated, Keyboard, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { changeHomeScreenRoute, toggleTopBarDisplay } from 'iota-wallet-shared-modules/actions/home';
import {
    clearTempData,
    setPassword,
    setUserActivity,
    setSetting,
} from 'iota-wallet-shared-modules/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { getPasswordHash } from '../util/crypto';
import DynamicStatusBar from '../components/dynamicStatusBar';
import UserInactivity from '../components/userInactivity';
import StatefulDropdownAlert from './statefulDropdownAlert';
import TopBar from './topBar';
import WithUserActivity from '../components/withUserActivity';
import WithBackPress from '../components/withBackPress';
import PollComponent from './poll';
import Tabs from '../components/tabs';
import Tab from '../components/tab';
import TabContent from '../components/tabContent';
import EnterPassword from '../components/enterPassword';
import { isAndroid } from '../util/device';

const { height } = Dimensions.get('window');

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
    constructor(props) {
        super(props);
        this.onLoginPress = this.onLoginPress.bind(this);
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
        this.props.changeHomeScreenRoute(name);
        this.resetSettings();
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
        const {
            t,
            navigator,
            inactive,
            minimised,
            bar,
            body,
            negative,
            positive,
            isFingerprintEnabled,
            primary,
        } = this.props;
        const { isIOSKeyboardActive } = this.state;
        const barTextColor = { color: bar.color };
        const textColor = { color: body.color };

        return (
            <UserInactivity
                ref={(c) => {
                    this.userInactivity = c;
                }}
                timeForInactivity={180000}
                checkInterval={3000}
                onInactivity={this.handleInactivity}
            >
                <View style={{ flex: 1 }}>
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
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <EnterPassword
                                onLoginPress={this.onLoginPress}
                                backgroundColor={body.bg}
                                negativeColor={negative.color}
                                positiveColor={positive.color}
                                bodyColor={body.color}
                                textColor={textColor}
                                isFingerprintEnabled={isFingerprintEnabled}
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
    storedPassword: state.tempAccount.password,
    inactive: state.tempAccount.inactive,
    minimised: state.tempAccount.minimised,
    body: state.settings.theme.body,
    negative: state.settings.theme.negative,
    positive: state.settings.theme.positive,
    primary: state.settings.theme.primary,
    bar: state.settings.theme.bar,
    currentRoute: state.home.childRoute,
    isSyncing: state.tempAccount.isSyncing,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    isTransitioning: state.tempAccount.isTransitioning,
    isTopBarActive: state.home.isTopBarActive,
    currentSetting: state.tempAccount.currentSetting,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    generateAlert,
    clearTempData,
    setPassword,
    setUserActivity,
    setSetting,
    toggleTopBarDisplay,
};

Home.propTypes = {
    t: PropTypes.func.isRequired,
    navigator: PropTypes.object.isRequired,
    changeHomeScreenRoute: PropTypes.func.isRequired,
    generateAlert: PropTypes.func.isRequired,
    setUserActivity: PropTypes.func.isRequired,
    inactive: PropTypes.bool.isRequired,
    minimised: PropTypes.bool.isRequired,
    body: PropTypes.object.isRequired,
    negative: PropTypes.object.isRequired,
    positive: PropTypes.object.isRequired,
    storedPassword: PropTypes.string.isRequired,
    bar: PropTypes.object.isRequired,
    primary: PropTypes.object.isRequired,
    isTransitioning: PropTypes.bool.isRequired,
    isSyncing: PropTypes.bool.isRequired,
    isSendingTransfer: PropTypes.bool.isRequired,
    setSetting: PropTypes.func.isRequired,
    isFingerprintEnabled: PropTypes.bool,
    currentSetting: PropTypes.string.isRequired,
    isTopBarActive: PropTypes.bool.isRequired,
    toggleTopBarDisplay: PropTypes.func.isRequired,
};

Home.defaultProps = {
    isFingerprintEnabled: false,
};

export default WithUserActivity()(
    WithBackPress()(translate(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home))),
);
