import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    AppState,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    Image,
    View,
    StatusBar,
    TouchableOpacity,
    Keyboard,
} from 'react-native';
import { connect } from 'react-redux';
import Balance from './balance';
import Send from './send';
import Receive from './receive';
import History from './history';
import Settings from './settings';
import TopBar from './topBar';
import keychain from '../util/keychain';
import { changeHomeScreenRoute, toggleTopBarDisplay } from 'iota-wallet-shared-modules/actions/home';
import { getTailTransactionHashesForPendingTransactions } from 'iota-wallet-shared-modules/store';
import {
    setReceiveAddress,
    replayBundle,
    setReady,
    clearTempData,
    setPassword,
} from 'iota-wallet-shared-modules/actions/tempAccount';
import { getAccountInfo, setBalance, setFirstUse } from 'iota-wallet-shared-modules/actions/account';
import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { generateAlert, disposeOffAlert } from 'iota-wallet-shared-modules/actions/alerts';
import DropdownHolder from '../components/dropdownHolder';
import DropdownAlert from 'react-native-dropdownalert';
import Reattacher from '../components/reAttacher';
import { Navigation } from 'react-native-navigation';
import UserInactivity from 'react-native-user-inactivity';
import KeepAwake from 'react-native-keep-awake';
import { TextField } from 'react-native-material-textfield';
import { isAndroid } from '../util/device';
import COLORS from '../theme/Colors';

import blueBackgroundImagePath from 'iota-wallet-shared-modules/images/bg-blue.png';
import balanceImagePath from 'iota-wallet-shared-modules/images/balance.png';
import sendImagePath from 'iota-wallet-shared-modules/images/send.png';
import receiveImagePath from 'iota-wallet-shared-modules/images/receive.png';
import historyImagePath from 'iota-wallet-shared-modules/images/history.png';
import settingsImagePath from 'iota-wallet-shared-modules/images/settings.png';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';

const StatusBarDefaultBarStyle = 'light-content';
import { width, height } from '../util/dimensions';
const timer = require('react-native-timer');

class Home extends Component {
    constructor() {
        super();
        this.state = {
            mode: 'STANDARD',
            appState: AppState.currentState,
            timeWentInactive: null,
            inactive: false,
            password: '',
            minimised: false,
        };
    }

    componentDidMount() {
        keychain.get().then(a => console.log(a));
        this.props.setFirstUse(false);
        this.startBackgroundProcesses();
        const accountInfo = this.props.account.accountInfo;
        const seedIndex = this.props.tempAccount.seedIndex;
        const addressesWithBalance = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
        if (typeof accountInfo !== 'undefined') {
            this.props.setBalance(addressesWithBalance);
        }
    }

    componentWillUnmount() {
        this.endBackgroundProcesses();
    }

    startBackgroundProcesses() {
        AppState.addEventListener('change', this._handleAppStateChange);
        timer.setInterval('polling', () => this.startAccountPolling(), 47000);
        timer.setInterval('chartPolling', () => this.startChartPolling(), 101000);
    }

    endBackgroundProcesses() {
        AppState.removeEventListener('change', this._handleAppStateChange);
        timer.clearInterval('polling');
        timer.clearInterval('chartPolling');
    }

    startAccountPolling() {
        if (
            !this.props.tempAccount.isGettingTransfers &&
            !this.props.tempAccount.isSendingTransfer &&
            !this.props.tempAccount.isSyncing
        ) {
            //console.log('POLLING TX HISTORY')
            const seedIndex = this.props.tempAccount.seedIndex;
            const seedName = this.props.account.seedNames[seedIndex];
            const accountInfo = this.props.account.accountInfo;
            this.props.getAccountInfo(seedName, seedIndex, accountInfo, (error, success) => {
                if (error) this.onNodeErrorPolling();
            });
        }
    }

    startChartPolling() {
        // 'console.log('POLLING CHART DATA')'
        if (
            !this.props.settings.isSyncing &&
            !this.props.settings.isGeneratingReceiveAddress &&
            !this.props.settings.isSendingTransfer
        ) {
            this.props.getMarketData();
            this.props.getChartData();
            this.props.getPrice();
        }
    }

    onNodeErrorPolling() {
        const dropdown = DropdownHolder.getDropdown();
        const { t } = this.props;
        dropdown.alertWithType('error', t('global:invalidResponse'), t('invalidResponsePollingExplanation'));
    }

    /*logout(){
        this.props.clearTempData();
        this.props.setPassword('');
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundImageName: 'bg-blue.png',
                    screenBackgroundColor: COLORS.backgroundDarkGreen
,
                },
                overrideBackPress: true,
            },
        });
    }*/

    onLoginPress() {
        const dropdown = DropdownHolder.getDropdown();
        const { t } = this.props;
        if (!this.state.password) {
            dropdown.alertWithType('error', t('login:emptyPassword'), t('login:emptyPasswordExplanation'));
        } else {
            if (this.state.password != this.props.tempAccount.password) {
                dropdown.alertWithType(
                    'error',
                    t('global:unrecognisedPassword'),
                    t('global:unrecognisedPasswordExplanation'),
                );
            } else {
                this.setState({ inactive: false, password: '' });
            }
        }
    }

    _handleAppStateChange = nextAppState => {
        if (nextAppState.match(/inactive|background/)) {
            this.setState({ minimised: true });
            timer.setTimeout(
                'background',
                () => {
                    this.setState({ inactive: true });
                },
                30000,
            );
        }

        if (nextAppState === 'active') {
            this.setState({ minimised: false });
            timer.clearTimeout('background');
        }
        this.setState({ appState: nextAppState });
    };

    componentWillReceiveProps(newProps) {
        const didNotHaveAlertPreviously =
            !this.props.alerts.category && !this.props.alerts.title && !this.props.alerts.message;
        const hasANewAlert = newProps.alerts.category && newProps.alerts.title && newProps.alerts.message;
        const shouldGenerateAlert = hasANewAlert && didNotHaveAlertPreviously;

        if (shouldGenerateAlert) {
            const dropdown = DropdownHolder.getDropdown();
            dropdown.alertWithType(newProps.alerts.category, newProps.alerts.title, newProps.alerts.message);
        }
    }

    renderChildren(route) {
        const childrenProps = {
            type: route, // TODO: type prop might be unneeded in all the children components;
            navigator: this.props.navigator,
            closeTopBar: () => {
                if (this.props.isTopBarActive) this.props.toggleTopBarDisplay();
            },
        };

        switch (route) {
            case 'send':
                return <Send {...childrenProps} />;
            case 'receive':
                return <Receive {...childrenProps} />;
            case 'history':
                return <History {...childrenProps} />;
            case 'settings':
                return (
                    <Settings
                        startBackgroundProcesses={() => this.startBackgroundProcesses()}
                        endBackgroundProcesses={() => this.endBackgroundProcesses()}
                        {...childrenProps}
                    />
                );
            default:
                return <Balance {...childrenProps} />;
        }
    }

    clickBalance() {
        this.props.changeHomeScreenRoute('balance');
    }
    clickSend() {
        this.props.changeHomeScreenRoute('send');
    }
    clickReceive() {
        this.props.changeHomeScreenRoute('receive');
    }
    clickHistory() {
        this.props.changeHomeScreenRoute('history');
    }
    clickSettings() {
        this.props.changeHomeScreenRoute('settings');
    }

    render() {
        const { t } = this.props;
        const { childRoute, tailTransactionHashesForPendingTransactions } = this.props;
        const children = this.renderChildren(childRoute);
        const isCurrentRoute = route => route === childRoute;
        let { password } = this.state;

        return (
            <UserInactivity
                timeForInactivity={300000}
                checkInterval={2000}
                onInactivity={() => this.setState({ inactive: true })}
            >
                <View style={{ flex: 1, backgroundColor: COLORS.backgroundGreen }}>
                    <StatusBar barStyle="light-content" />
                    {!this.state.inactive &&
                        !this.state.minimised && (
                            <View style={{ flex: 1 }}>
                                <View style={styles.topContainer} />
                                <View style={styles.midContainer}>
                                    <View style={{ flex: 1 }}>{children}</View>
                                </View>
                                <View style={styles.bottomContainer}>
                                    <View style={styles.tabBar}>
                                        <TouchableWithoutFeedback onPress={event => this.clickBalance()}>
                                            <View style={styles.button}>
                                                <Image
                                                    style={
                                                        isCurrentRoute('balance')
                                                            ? StyleSheet.flatten([styles.icon, styles.fullyOpaque])
                                                            : StyleSheet.flatten([styles.icon, styles.partiallyOpaque])
                                                    }
                                                    source={require('iota-wallet-shared-modules/images/balance.png')}
                                                />
                                                <Text
                                                    style={
                                                        isCurrentRoute('balance')
                                                            ? StyleSheet.flatten([styles.iconTitle, styles.fullyOpaque])
                                                            : StyleSheet.flatten([
                                                                  styles.iconTitle,
                                                                  styles.partiallyOpaque,
                                                              ])
                                                    }
                                                >
                                                    {t('home:balance')}
                                                </Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                        <TouchableWithoutFeedback onPress={event => this.clickSend()}>
                                            <View style={styles.button}>
                                                <Image
                                                    style={
                                                        isCurrentRoute('send')
                                                            ? StyleSheet.flatten([styles.icon, styles.fullyOpaque])
                                                            : StyleSheet.flatten([styles.icon, styles.partiallyOpaque])
                                                    }
                                                    source={require('iota-wallet-shared-modules/images/send.png')}
                                                />
                                                <Text
                                                    style={
                                                        isCurrentRoute('send')
                                                            ? StyleSheet.flatten([styles.iconTitle, styles.fullyOpaque])
                                                            : StyleSheet.flatten([
                                                                  styles.iconTitle,
                                                                  styles.partiallyOpaque,
                                                              ])
                                                    }
                                                >
                                                    {t('home:send')}
                                                </Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                        <TouchableWithoutFeedback onPress={event => this.clickReceive()}>
                                            <View style={styles.button}>
                                                <Image
                                                    style={
                                                        isCurrentRoute('receive')
                                                            ? StyleSheet.flatten([styles.icon, styles.fullyOpaque])
                                                            : StyleSheet.flatten([styles.icon, styles.partiallyOpaque])
                                                    }
                                                    source={require('iota-wallet-shared-modules/images/receive.png')}
                                                />
                                                <Text
                                                    style={
                                                        isCurrentRoute('receive')
                                                            ? StyleSheet.flatten([styles.iconTitle, styles.fullyOpaque])
                                                            : StyleSheet.flatten([
                                                                  styles.iconTitle,
                                                                  styles.partiallyOpaque,
                                                              ])
                                                    }
                                                >
                                                    {t('home:receive')}
                                                </Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                        <TouchableWithoutFeedback onPress={event => this.clickHistory()}>
                                            <View style={styles.button}>
                                                <Image
                                                    style={
                                                        isCurrentRoute('history')
                                                            ? StyleSheet.flatten([styles.icon, styles.fullyOpaque])
                                                            : StyleSheet.flatten([styles.icon, styles.partiallyOpaque])
                                                    }
                                                    source={require('iota-wallet-shared-modules/images/history.png')}
                                                />
                                                <Text
                                                    style={
                                                        isCurrentRoute('history')
                                                            ? StyleSheet.flatten([styles.iconTitle, styles.fullyOpaque])
                                                            : StyleSheet.flatten([
                                                                  styles.iconTitle,
                                                                  styles.partiallyOpaque,
                                                              ])
                                                    }
                                                >
                                                    {t('home:history')}
                                                </Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                        <TouchableWithoutFeedback onPress={event => this.clickSettings()}>
                                            <View style={styles.button}>
                                                <Image
                                                    style={
                                                        isCurrentRoute('settings')
                                                            ? StyleSheet.flatten([styles.icon, styles.fullyOpaque])
                                                            : StyleSheet.flatten([styles.icon, styles.partiallyOpaque])
                                                    }
                                                    source={require('iota-wallet-shared-modules/images/settings.png')}
                                                />
                                                <Text
                                                    style={
                                                        isCurrentRoute('settings')
                                                            ? StyleSheet.flatten([styles.iconTitle, styles.fullyOpaque])
                                                            : StyleSheet.flatten([
                                                                  styles.iconTitle,
                                                                  styles.partiallyOpaque,
                                                              ])
                                                    }
                                                >
                                                    {t('home:settings')}
                                                </Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                </View>
                                <TopBar />
                            </View>
                        )}
                    {this.state.inactive && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View>
                                    <View style={styles.loginTopContainer}>
                                        <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                                        <View style={styles.loginTitleContainer}>
                                            <Text style={styles.loginTitle}>Please enter your password.</Text>
                                        </View>
                                    </View>
                                    <View style={styles.loginMidContainer}>
                                        <TextField
                                            style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                            labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                            labelFontSize={width / 31.8}
                                            fontSize={width / 20.7}
                                            labelPadding={3}
                                            baseColor="white"
                                            label={t('global:password')}
                                            tintColor="#F7D002"
                                            autoCapitalize={'none'}
                                            autoCorrect={false}
                                            enablesReturnKeyAutomatically={true}
                                            returnKeyType="done"
                                            value={password}
                                            onChangeText={password => this.setState({ password })}
                                            containerStyle={{
                                                width: width / 1.4,
                                            }}
                                            secureTextEntry={true}
                                        />
                                    </View>
                                    <View style={styles.loginBottomContainer}>
                                        <TouchableOpacity onPress={event => this.onLoginPress()}>
                                            <View style={styles.loginButton}>
                                                <Text style={styles.loginText}>{t('login:login')}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    )}
                    {this.state.minimised && <View />}
                    <Reattacher
                        attachments={tailTransactionHashesForPendingTransactions}
                        attach={this.props.replayBundle}
                    />
                    <DropdownAlert
                        ref={ref => DropdownHolder.setDropdown(ref)}
                        elevation={120}
                        successColor="#009f3f"
                        errorColor="#A10702"
                        titleStyle={styles.dropdownTitle}
                        defaultTextContainer={styles.dropdownTextContainer}
                        messageStyle={styles.dropdownMessage}
                        imageStyle={styles.dropdownImage}
                        inactiveStatusBarStyle={StatusBarDefaultBarStyle}
                        onCancel={this.props.disposeOffAlert}
                        onClose={this.props.disposeOffAlert}
                        closeInterval={5500}
                    />
                    <KeepAwake />
                </View>
            </UserInactivity>
        );
    }
}

const styles = StyleSheet.create({
    topContainer: {
        flex: 0.8,
        marginBottom: height / 100,
    },
    titlebarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: height / 50,
        justifyContent: 'space-between',
        paddingHorizontal: width / 6.5,
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 8,
    },
    title: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 24.4,
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
    tabBar: {
        flex: 1,
        elevation: 7,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        backgroundColor: COLORS.backgroundDarkGreen,
        opacity: 0.98,
        paddingBottom: height / 65,
        shadowColor: COLORS.backgroundDarkGreen,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 1.0,
    },
    button: {
        width: width / 8,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    icon: {
        paddingTop: height / 40,
        height: width / 15,
        width: width / 15,
    },
    iconTitle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: height / 80,
        fontFamily: 'Lato-Regular',
        fontSize: width / 40.5,
        backgroundColor: 'transparent',
    },
    fullyOpaque: {
        opacity: 1,
    },
    partiallyOpaque: {
        opacity: 0.4,
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
    loginTopContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    loginMidContainer: {
        flex: 4.8,
        alignItems: 'center',
        paddingTop: height / 4.2,
    },
    loginBottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    loginTitleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 15,
    },
    loginTitle: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    loginButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    loginText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
});

const mapStateToProps = state => ({
    alerts: state.alerts,
    tempAccount: state.tempAccount,
    settings: state.settings,
    tailTransactionHashesForPendingTransactions: getTailTransactionHashesForPendingTransactions(state),
    account: state.account,
    childRoute: state.home.childRoute,
    isTopBarActive: state.home.isTopBarActive,
});

const mapDispatchToProps = dispatch => ({
    getAccountInfo: (seedName, seedIndex, accountInfo, cb) => {
        dispatch(getAccountInfo(seedName, seedIndex, accountInfo, cb));
    },
    setReceiveAddress: string => {
        dispatch(setReceiveAddress(string));
    },
    setBalance: addressesWithBalance => {
        dispatch(setBalance(addressesWithBalance));
    },
    changeHomeScreenRoute: route => dispatch(changeHomeScreenRoute(route)),
    replayBundle: (transaction, depth, weight) => dispatch(replayBundle(transaction, depth, weight)),
    generateAlert: (type, title, message) => dispatch(generateAlert(type, title, message)),
    disposeOffAlert: () => dispatch(disposeOffAlert()),
    setFirstUse: boolean => dispatch(setFirstUse(boolean)),
    setReady: boolean => dispatch(setReady(boolean)),
    clearTempData: () => dispatch(clearTempData()),
    toggleTopBarDisplay: () => dispatch(toggleTopBarDisplay()),
    setPassword: () => dispatch(setPassword()),
    getMarketData: () => dispatch(getMarketData()),
    getPrice: () => dispatch(getPrice()),
    getChartData: () => dispatch(getChartData()),
});

Home.propTypes = {
    alerts: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    childRoute: PropTypes.string.isRequired,
    changeHomeScreenRoute: PropTypes.func.isRequired,
    tailTransactionHashesForPendingTransactions: PropTypes.array.isRequired,
    generateAlert: PropTypes.func.isRequired,
    disposeOffAlert: PropTypes.func.isRequired,
    isTopBarActive: PropTypes.bool.isRequired,
};

export default translate(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home));
