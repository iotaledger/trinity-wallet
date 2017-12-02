import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import map from 'lodash/map';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    AppState,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    Image,
    Dimensions,
    View,
    ImageBackground,
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
import { generateAlert, disposeOffAlert } from 'iota-wallet-shared-modules/actions/alerts';
import DropdownHolder from '../components/dropdownHolder';
import DropdownAlert from 'react-native-dropdownalert';
import Reattacher from './reAttacher';
import { Navigation } from 'react-native-navigation';
import UserInactivity from 'react-native-user-inactivity';
import KeepAwake from 'react-native-keep-awake';

const StatusBarDefaultBarStyle = 'light-content';
const width = Dimensions.get('window').width;
const height = global.height;
const timer = require('react-native-timer');

class Home extends Component {
    constructor() {
        super();
        this.state = {
            mode: 'STANDARD',
            appState: AppState.currentState,
            timeWentInactive: null,
        };
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
        this.props.setFirstUse(false);

        const accountInfo = this.props.account.accountInfo;
        const seedIndex = this.props.tempAccount.seedIndex;
        const addressesWithBalance = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
        if (typeof accountInfo !== 'undefined') {
            this.props.setBalance(addressesWithBalance);
        }
        timer.setInterval('polling', () => this.startPolling(), 47000);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
        timer.clearInterval('polling');
        timer.clearInterval('chartPolling');
    }

    logout() {
        this.props.clearTempData();
        this.props.setPassword('');
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundImageName: 'bg-blue.png',
                    screenBackgroundColor: '#102e36',
                },
                overrideBackPress: true,
            },
        });
    }

    _handleAppStateChange = nextAppState => {
        if (this.state.appState.match(/inactive|background/)) {
            timer.setTimeout(
                'background',
                () => {
                    this.logout();
                },
                30000,
            );
        }
        if (nextAppState === 'active') {
            timer.clearTimeout('background');
        }
        this.setState({ appState: nextAppState });
    };

    startPolling() {
        if (!this.props.tempAccount.isGettingTransfers && !this.props.tempAccount.isSendingTransfer) {
            //console.log('POLLING TX HISTORY')
            const seedIndex = this.props.tempAccount.seedIndex;
            const seedName = this.props.account.seedNames[seedIndex];
            const accountInfo = this.props.account.accountInfo;
            this.props.getAccountInfo(seedName, seedIndex, accountInfo, (error, success) => {
                if (error) this.onNodeErrorPolling();
            });
        }
    }

    onNodeErrorPolling() {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'Invalid response', `The node returned an invalid response while polling.`);
    }

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
                return <Settings {...childrenProps} />;
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

        return (
            <UserInactivity timeForInactivity={120000} checkInterval={2000} onInactivity={() => this.logout()}>
                <ImageBackground source={require('iota-wallet-shared-modules/images/bg-blue.png')} style={{ flex: 1 }}>
                    <StatusBar barStyle="light-content" />
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
                                                : StyleSheet.flatten([styles.iconTitle, styles.partiallyOpaque])
                                        }
                                    >
                                        BALANCE
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
                                                : StyleSheet.flatten([styles.iconTitle, styles.partiallyOpaque])
                                        }
                                    >
                                        SEND
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
                                                : StyleSheet.flatten([styles.iconTitle, styles.partiallyOpaque])
                                        }
                                    >
                                        RECEIVE
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
                                                : StyleSheet.flatten([styles.iconTitle, styles.partiallyOpaque])
                                        }
                                    >
                                        HISTORY
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
                                                : StyleSheet.flatten([styles.iconTitle, styles.partiallyOpaque])
                                        }
                                    >
                                        SETTINGS
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                    <Reattacher
                        attachments={tailTransactionHashesForPendingTransactions}
                        attach={this.props.replayBundle}
                    />
                    <TopBar />
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
                </ImageBackground>
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
        backgroundColor: '#071f28',
        opacity: 0.98,
        paddingBottom: height / 65,
        shadowColor: '#071f28',
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 1.0,
    },
    button: {
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
        opacity: 0.6,
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

const mapStateToProps = state => ({
    alerts: state.alerts,
    tempAccount: state.tempAccount,
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

export default translate('home')(connect(mapStateToProps, mapDispatchToProps)(Home));
