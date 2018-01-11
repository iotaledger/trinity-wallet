import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, BackHandler, ToastAndroid } from 'react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { connect } from 'react-redux';
import UserInactivity from 'react-native-user-inactivity';
import { Navigation } from 'react-native-navigation';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { clearTempData, setPassword, setUserActivity } from 'iota-wallet-shared-modules/actions/tempAccount';
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
import StatefulDropdownAlert from './statefulDropdownAlert';
import TopBar from './topBar';
import withUserActivity from '../components/withUserActivity';
import Poll from './poll';
import THEMES from '../theme/themes';
import Tabs from '../components/tabs';
import Tab from '../components/tab';
import TabContent from '../components/tabContent';
import EnterPassword from '../components/enterPassword';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    topContainer: {
        flex: 0.8,
        marginBottom: height / 100,
    },
    balance: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.9,
        paddingTop: height / 150,
    },
    midContainer: {
        flex: 4.62,
        zIndex: 0,
    },
    bottomContainer: {
        flex: 0.68,
    },
    dropdownTitle: {
        fontSize: width / 25.9,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        paddingLeft: width / 20,
        paddingRight: width / 15,
        paddingVertical: height / 30,
    },
    dropdownMessage: {
        fontSize: width / 29.6,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        paddingTop: height / 60,
    },
    dropdownImage: {
        marginLeft: width / 25,
        width: width / 12,
        height: width / 12,
        alignSelf: 'center',
    },
});

class Home extends Component {
    componentDidMount() {
        BackHandler.addEventListener('homeBackPress', () => {
            if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
                Navigation.startSingleScreenApp({
                    screen: {
                        screen: 'login',
                        navigatorStyle: {
                            navBarHidden: true,
                            navBarTransparent: true,
                        },
                        overrideBackPress: true,
                    },
                    appStyle: {
                        orientation: 'portrait',
                    },
                });
            }
            this.lastBackPressed = Date.now();
            ToastAndroid.show('Press back again to log out', ToastAndroid.SHORT);
            return true;
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('homeBackPress');
    }

    onLoginPress = (password) => {
        const { t, tempAccount } = this.props;

        if (!password) {
            this.props.generateAlert('error', t('login:emptyPassword'), t('login:emptyPasswordExplanation'));
        } else if (password !== tempAccount.password) {
            this.props.generateAlert(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        } else {
            this.props.setUserActivity({ inactive: false });
        }
    };

    handleInactivity = () => {
        this.props.setUserActivity({ inactive: true });
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
        } = this.props;

        const balanceImagePath = secondaryBarColor === 'white' ? whiteBalanceImagePath : blackBalanceImagePath;
        const sendImagePath = secondaryBarColor === 'white' ? whiteSendImagePath : blackSendImagePath;
        const receiveImagePath = secondaryBarColor === 'white' ? whiteReceiveImagePath : blackReceiveImagePath;
        const historyImagePath = secondaryBarColor === 'white' ? whiteHistoryImagePath : blackHistoryImagePath;
        const settingsImagePath = secondaryBarColor === 'white' ? whiteSettingsImagePath : blackSettingsImagePath;

        const barTextColor = { color: secondaryBarColor };
        const textColor = { color: secondaryBackgroundColor };
        return (
            <UserInactivity timeForInactivity={300000} checkInterval={2000} onInactivity={this.handleInactivity}>
                <View style={{ flex: 1, backgroundColor: THEMES.getHSL(backgroundColor) }}>
                    <DynamicStatusBar textColor={secondaryBarColor} />
                    {!inactive &&
                        !minimised && (
                            <View style={{ flex: 1 }}>
                                <View style={styles.topContainer} />
                                <View style={styles.midContainer}>
                                    <TabContent navigator={navigator} />
                                </View>
                                <View style={styles.bottomContainer}>
                                    <Tabs
                                        onPress={(name) => this.props.changeHomeScreenRoute(name)}
                                        barColor={THEMES.getHSL(barColor)}
                                    >
                                        <Tab
                                            name="balance"
                                            icon={balanceImagePath}
                                            textColor={barTextColor}
                                            text={t('home:balance')}
                                        />
                                        <Tab
                                            name="send"
                                            icon={sendImagePath}
                                            textColor={barTextColor}
                                            text={t('home:send')}
                                        />
                                        <Tab
                                            name="receive"
                                            icon={receiveImagePath}
                                            textColor={barTextColor}
                                            text={t('home:receive')}
                                        />
                                        <Tab
                                            name="history"
                                            icon={historyImagePath}
                                            textColor={barTextColor}
                                            text={t('home:history')}
                                        />
                                        <Tab
                                            name="settings"
                                            icon={settingsImagePath}
                                            textColor={barTextColor}
                                            text={t('home:settings')}
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
                            />
                        </View>
                    )}
                    {minimised && <View />}
                    <Poll />
                    <StatefulDropdownAlert />
                </View>
            </UserInactivity>
        );
    }
}

const mapStateToProps = (state) => ({
    tempAccount: state.tempAccount,
    settings: state.settings,
    account: state.account,
    inactive: state.tempAccount.inactive,
    minimised: state.tempAccount.minimised,
    barColor: state.settings.theme.barColor,
    backgroundColor: state.settings.theme.backgroundColor,
    negativeColor: state.settings.theme.negativeColor,
    positiveColor: state.settings.theme.positiveColor,
    secondaryBarColor: state.settings.theme.secondaryBarColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    generateAlert,
    clearTempData,
    setPassword,
    setUserActivity,
};

Home.propTypes = {
    t: PropTypes.func.isRequired,
    navigator: PropTypes.object.isRequired,
    changeHomeScreenRoute: PropTypes.func.isRequired,
    generateAlert: PropTypes.func.isRequired,
    setUserActivity: PropTypes.func.isRequired,
    inactive: PropTypes.bool.isRequired,
    minimised: PropTypes.bool.isRequired,
    backgroundColor: PropTypes.object.isRequired,
    barColor: PropTypes.object.isRequired,
    negativeColor: PropTypes.object.isRequired,
    positiveColor: PropTypes.object.isRequired,
    tempAccount: PropTypes.object.isRequired,
    secondaryBarColor: PropTypes.string.isRequired,
    secondaryBackgroundColor: PropTypes.string.isRequired,
};

export default withUserActivity()(
    translate(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home)),
);
