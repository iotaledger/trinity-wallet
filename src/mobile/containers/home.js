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
import keychain, { getSeed } from '../util/keychain';
import { changeHomeScreenRoute, toggleTopBarDisplay } from 'iota-wallet-shared-modules/actions/home';
import { getTailTransactionHashesForPendingTransactions } from 'iota-wallet-shared-modules/store';
import {
    setReceiveAddress,
    setReady,
    clearTempData,
    setPassword,
} from 'iota-wallet-shared-modules/actions/tempAccount';
import { getAccountInfo, setBalance, setFirstUse, getNewAddressData } from 'iota-wallet-shared-modules/actions/account';
import { calculateBalance } from 'iota-wallet-shared-modules/libs/accountUtils';
import { iota } from '../../shared/libs/iota';
import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { generateAlert, disposeOffAlert } from 'iota-wallet-shared-modules/actions/alerts';
import DropdownHolder from '../components/dropdownHolder';
import DropdownAlert from 'react-native-dropdownalert';
import Promoter from './promoter';
import { Navigation } from 'react-native-navigation';
import UserInactivity from 'react-native-user-inactivity';
import KeepAwake from 'react-native-keep-awake';
import { TextField } from 'react-native-material-textfield';
import COLORS from '../theme/Colors';
import Tabs from '../components/Tabs';
import Tab from '../components/Tab';
import get from 'lodash/get';

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
        this.props.setFirstUse(false);
        this.startBackgroundProcesses();
        const accountInfo = this.props.account.accountInfo;
        const seedIndex = this.props.tempAccount.seedIndex;
        const addressData = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
        if (typeof accountInfo !== 'undefined') {
            const balance = calculateBalance(addressData);
            this.props.setBalance(balance);
        }
    }

    componentWillUnmount() {
        this.endBackgroundProcesses();
    }

    startBackgroundProcesses() {
        AppState.addEventListener('change', this._handleAppStateChange);
        timer.setInterval('polling', () => this.pollForNewAddressesAndTransfers(), 59000);
        timer.setInterval('chartPolling', () => this.pollForMarketData(), 101000);
    }

    endBackgroundProcesses() {
        AppState.removeEventListener('change', this._handleAppStateChange);
        timer.clearInterval('polling');
        timer.clearInterval('chartPolling');
    }

    pollForNewAddressesAndTransfers() {
        if (
            !this.props.tempAccount.isGettingTransfers &&
            !this.props.tempAccount.isSendingTransfer &&
            !this.props.tempAccount.isSyncing
        ) {
            console.log('POLLING');
            const accountInfo = this.props.account.accountInfo;
            const seedIndex = this.props.tempAccount.seedIndex;
            const addressData = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
            const accountName = this.props.account.seedNames[seedIndex];
            keychain
                .get()
                .then(credentials => {
                    if (get(credentials, 'data')) {
                        const seed = getSeed(credentials.data, seedIndex);
                        getNewAddressData(seed);
                    } else {
                        console.log('error');
                    }
                })
                .catch(err => console.log(err));

            const getNewAddressData = seed => {
                this.props.getNewAddressData(seed, accountName, addressData, (error, success) => {
                    if (error) {
                        this.onNodeErrorPolling();
                    } else {
                        getNewTransfers();
                    }
                });
            };
            const getNewTransfers = () => {
                const newAccountInfo = this.props.account.accountInfo;
                this.props.getAccountInfo(accountName, seedIndex, newAccountInfo, (error, success) => {
                    if (error) this.onNodeErrorPolling();
                });
            };
        }
    }

    pollForMarketData() {
        // 'console.log('POLLING CHART DATA')'
        if (
            !this.props.settings.isSyncing &&
            !this.props.settings.isGeneratingReceiveAddress &&
            !this.props.settings.isSendingTransfer
        ) {
            console.log('POLLING MARKET DATA');
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

    render() {
        const { t } = this.props;
        const { childRoute } = this.props;
        const children = this.renderChildren(childRoute);
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
                                    <Tabs
                                        currentRoute={childRoute}
                                        onPress={name => this.props.changeHomeScreenRoute(name)}
                                    >
                                        <Tab name="balance" icon={balanceImagePath} text={t('home:balance')} />
                                        <Tab name="send" icon={sendImagePath} text={t('home:send')} />
                                        <Tab name="receive" icon={receiveImagePath} text={t('home:receive')} />
                                        <Tab name="history" icon={historyImagePath} text={t('home:history')} />
                                        <Tab name="settings" icon={settingsImagePath} text={t('home:settings')} />
                                    </Tabs>
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
                                            onSubmitEditing={() => this.onLoginPress()}
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
                    <Promoter />
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
});

const mapStateToProps = state => ({
    alerts: state.alerts,
    tempAccount: state.tempAccount,
    settings: state.settings,
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
    setBalance: addressData => {
        dispatch(setBalance(addressData));
    },
    changeHomeScreenRoute: route => dispatch(changeHomeScreenRoute(route)),
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
    getNewAddressData: (seed, accountName, addressData, callback) =>
        dispatch(getNewAddressData(seed, accountName, addressData, callback)),
});

Home.propTypes = {
    alerts: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    childRoute: PropTypes.string.isRequired,
    changeHomeScreenRoute: PropTypes.func.isRequired,
    generateAlert: PropTypes.func.isRequired,
    disposeOffAlert: PropTypes.func.isRequired,
    isTopBarActive: PropTypes.bool.isRequired,
};

export default translate(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home));
