import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import {
    clearTempData,
    setPassword,
    setUserActivity,
    setSetting,
} from 'iota-wallet-shared-modules/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import whiteBalanceImagePath from 'iota-wallet-shared-modules/images/balance-white.png';
import whiteSendImagePath from 'iota-wallet-shared-modules/images/send-white.png';
import whiteReceiveImagePath from 'iota-wallet-shared-modules/images/receive-white.png';
import whiteHistoryImagePath from 'iota-wallet-shared-modules/images/history-white.png';
import whiteSettingsImagePath from 'iota-wallet-shared-modules/images/settings-white.png';
import blackBalanceImagePath from 'iota-wallet-shared-modules/images/balance-black.png';
import blackSendImagePath from 'iota-wallet-shared-modules/images/send-black.png';
import blackReceiveImagePath from 'iota-wallet-shared-modules/images/receive-black.png';
import blackHistoryImagePath from 'iota-wallet-shared-modules/images/history-black.png';
import blackSettingsImagePath from 'iota-wallet-shared-modules/images/settings-black.png';
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
import { height } from '../util/dimensions';

const styles = StyleSheet.create({
    topContainer: {
        flex: 0.8,
        marginBottom: height / 100,
    },
    midContainer: {
        flex: 4.62,
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

    onLoginPress = (password) => {
        const { t, storedPassword } = this.props;

        if (!password) {
            this.props.generateAlert('error', t('login:emptyPassword'), t('login:emptyPasswordExplanation'));
        } else if (password !== storedPassword) {
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

    render() {
        const {
            t,
            navigator,
            inactive,
            minimised,
            barColor,
            backgroundColor,
            negativeColor,
            positiveColor,
            secondaryBarColor,
            secondaryBackgroundColor,
            isFingerprintEnabled,
        } = this.props;

        const balanceImagePath = secondaryBarColor === 'white' ? whiteBalanceImagePath : blackBalanceImagePath;
        const sendImagePath = secondaryBarColor === 'white' ? whiteSendImagePath : blackSendImagePath;
        const receiveImagePath = secondaryBarColor === 'white' ? whiteReceiveImagePath : blackReceiveImagePath;
        const historyImagePath = secondaryBarColor === 'white' ? whiteHistoryImagePath : blackHistoryImagePath;
        const settingsImagePath = secondaryBarColor === 'white' ? whiteSettingsImagePath : blackSettingsImagePath;

        const barTextColor = { color: secondaryBarColor };
        const textColor = { color: secondaryBackgroundColor };

        return (
            <UserInactivity
                ref={(c) => {
                    this.userInactivity = c;
                }}
                timeForInactivity={180000}
                checkInterval={3000}
                onInactivity={this.handleInactivity}
            >
                <KeyboardAvoidingView style={{ flex: 1, backgroundColor }}>
                    <DynamicStatusBar textColor={secondaryBarColor} backgroundColor={barColor} />
                    {!inactive &&
                        !minimised && (
                            <View style={{ flex: 1 }}>
                                <View style={styles.topContainer} />
                                <View style={styles.midContainer}>
                                    <TabContent navigator={navigator} onTabSwitch={(name) => this.onTabSwitch(name)} />
                                </View>
                                <View style={styles.bottomContainer}>
                                    <Tabs onPress={(name) => this.onTabSwitch(name)} barColor={barColor}>
                                        <Tab
                                            name="balance"
                                            icon={balanceImagePath}
                                            textColor={barTextColor}
                                            text={t('home:balance').toUpperCase()}
                                        />
                                        <Tab
                                            name="send"
                                            icon={sendImagePath}
                                            textColor={barTextColor}
                                            text={t('home:send').toUpperCase()}
                                        />
                                        <Tab
                                            name="receive"
                                            icon={receiveImagePath}
                                            textColor={barTextColor}
                                            text={t('home:receive').toUpperCase()}
                                        />
                                        <Tab
                                            name="history"
                                            icon={historyImagePath}
                                            textColor={barTextColor}
                                            text={t('home:history').toUpperCase()}
                                        />
                                        <Tab
                                            name="settings"
                                            icon={settingsImagePath}
                                            textColor={barTextColor}
                                            text={t('home:settings').toUpperCase()}
                                        />
                                    </Tabs>
                                </View>
                                <TopBar />
                            </View>
                        )}
                    {inactive && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <EnterPassword
                                onLoginPress={this.onLoginPress}
                                backgroundColor={backgroundColor}
                                negativeColor={negativeColor}
                                positiveColor={positiveColor}
                                secondaryBackgroundColor={secondaryBackgroundColor}
                                textColor={textColor}
                                isFingerprintEnabled={isFingerprintEnabled}
                            />
                        </View>
                    )}
                    {minimised && <View />}
                    <PollComponent />
                    <StatefulDropdownAlert textColor={secondaryBarColor} backgroundColor={barColor} />
                </KeyboardAvoidingView>
            </UserInactivity>
        );
    }
}

const mapStateToProps = (state) => ({
    storedPassword: state.tempAccount.password,
    inactive: state.tempAccount.inactive,
    minimised: state.tempAccount.minimised,
    barColor: state.settings.theme.barColor,
    backgroundColor: state.settings.theme.backgroundColor,
    negativeColor: state.settings.theme.negativeColor,
    positiveColor: state.settings.theme.positiveColor,
    secondaryBarColor: state.settings.theme.secondaryBarColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
    currentRoute: state.home.childRoute,
    isSyncing: state.tempAccount.isSyncing,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    isTransitioning: state.tempAccount.isTransitioning,
    currentSetting: state.tempAccount.currentSetting,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    generateAlert,
    clearTempData,
    setPassword,
    setUserActivity,
    setSetting,
};

Home.propTypes = {
    t: PropTypes.func.isRequired,
    navigator: PropTypes.object.isRequired,
    changeHomeScreenRoute: PropTypes.func.isRequired,
    generateAlert: PropTypes.func.isRequired,
    setUserActivity: PropTypes.func.isRequired,
    inactive: PropTypes.bool.isRequired,
    minimised: PropTypes.bool.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    barColor: PropTypes.string.isRequired,
    negativeColor: PropTypes.string.isRequired,
    positiveColor: PropTypes.string.isRequired,
    storedPassword: PropTypes.string.isRequired,
    secondaryBarColor: PropTypes.string.isRequired,
    secondaryBackgroundColor: PropTypes.string.isRequired,
    isTransitioning: PropTypes.bool.isRequired,
    isSyncing: PropTypes.bool.isRequired,
    isSendingTransfer: PropTypes.bool.isRequired,
    setSetting: PropTypes.func.isRequired,
    isFingerprintEnabled: PropTypes.bool,
    currentSetting: PropTypes.string.isRequired,
};

Home.defaultProps = {
    isFingerprintEnabled: false,
};

export default WithUserActivity()(
    WithBackPress()(translate(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home))),
);
