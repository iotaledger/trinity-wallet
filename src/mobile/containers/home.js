import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import TopBar from './topBar';
import keychain from '../util/keychain';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { getTailTransactionHashesForPendingTransactions } from 'iota-wallet-shared-modules/store';
import {
    setReceiveAddress,
    setReady,
    clearTempData,
    setPassword,
} from 'iota-wallet-shared-modules/actions/tempAccount';
import { iota } from '../../shared/libs/iota';
import { getAccountInfo, setBalance, setFirstUse } from 'iota-wallet-shared-modules/actions/account';
import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { disposeOffAlert } from 'iota-wallet-shared-modules/actions/alerts';
import DropdownHolder from '../components/dropdownHolder';
import DropdownAlert from 'react-native-dropdownalert';
import Promoter from './promoter';
import UserInactivity from 'react-native-user-inactivity';
import KeepAwake from 'react-native-keep-awake';
import COLORS from '../theme/Colors';
import Tabs from '../components/Tabs';
import Tab from '../components/Tab';
import TabContent from '../components/TabContent';
import EnterPassword from '../components/EnterPassword.js';

import balanceImagePath from 'iota-wallet-shared-modules/images/balance.png';
import sendImagePath from 'iota-wallet-shared-modules/images/send.png';
import receiveImagePath from 'iota-wallet-shared-modules/images/receive.png';
import historyImagePath from 'iota-wallet-shared-modules/images/history.png';
import settingsImagePath from 'iota-wallet-shared-modules/images/settings.png';

import { width, height } from '../util/dimensions';

const StatusBarDefaultBarStyle = 'light-content';

class Home extends Component {
    constructor() {
        super();
        this.state = {
            mode: 'STANDARD',
            // TODO Move this state to some redux state
            inactive: false,
            minimised: false,
        };
    }

    componentDidMount() {
        this.props.setFirstUse(false);
        const accountInfo = this.props.account.accountInfo;
        const seedIndex = this.props.tempAccount.seedIndex;
        const addressesWithBalance = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
        if (typeof accountInfo !== 'undefined') {
            this.props.setBalance(addressesWithBalance);
        }
    }

    startAccountPolling() {
        if (
            !this.props.tempAccount.isGettingTransfers &&
            !this.props.tempAccount.isSendingTransfer &&
            !this.props.tempAccount.isSyncing
        ) {
            // console.log('POLLING TX HISTORY')
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

    /* logout(){
        this.props.clearTempData();
        this.props.setPassword('');
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundImageName: 'bg-blue.png',
                    screenBackgroundColor: COLORS.backgroundGreen
,
                },
                overrideBackPress: true,
            },
        });
    } */

    // TODO Move all these state changing methods to some redux actions
    onInactive() {
        this.setState({ inactive: true });
    }

    onActive() {
        this.setState({ inactive: false });
    }

    onMinimise() {
        this.setState({ minimised: true });
    }

    onMaximise() {
        this.setState({ minimised: false });
    }

    onLoginPress(password) {
        const dropdown = DropdownHolder.getDropdown();
        const { t, tempAccount } = this.props;
        if (!password) {
            dropdown.alertWithType('error', t('login:emptyPassword'), t('login:emptyPasswordExplanation'));
        } else if (password !== tempAccount.password) {
            dropdown.alertWithType(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        } else {
            this.enterPassword.clearPassword();
            this.onActive();
        }
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

    render() {
        const { t, navigator } = this.props;

        return (
            <UserInactivity timeForInactivity={300000} checkInterval={2000} onInactivity={() => this.onInActive()}>
                <View style={{ flex: 1, backgroundColor: COLORS.backgroundGreen }}>
                    <StatusBar barStyle="light-content" />
                    {!this.state.inactive &&
                        !this.state.minimised && (
                            <View style={{ flex: 1 }}>
                                <View style={styles.topContainer} />
                                <View style={styles.midContainer}>
                                    <TabContent
                                        navigator={navigator}
                                        onMinimise={this.onMinimise}
                                        onMaximise={this.onMaximise}
                                        onInactive={this.onInactive}
                                    />
                                </View>
                                <View style={styles.bottomContainer}>
                                    <Tabs onPress={name => this.props.changeHomeScreenRoute(name)}>
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
                            <EnterPassword
                                onLoginPress={this.onLoginPress}
                                ref={c => {
                                    this.enterPassword = c;
                                }}
                            />
                        </View>
                    )}
                    {this.state.minimised && <View />}
                    <Promoter />
                    <DropdownAlert
                        ref={DropdownHolder.setDropdown}
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

const mapStateToProps = state => ({
    alerts: state.alerts,
    tempAccount: state.tempAccount,
    settings: state.settings,
    account: state.account,
});

const mapDispatchToProps = {
    getAccountInfo,
    setReceiveAddress,
    setBalance,
    changeHomeScreenRoute,
    disposeOffAlert,
    setFirstUse,
    setReady,
    clearTempData,
    setPassword,
    getMarketData,
    getPrice,
    getChartData,
};

Home.propTypes = {
    alerts: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    changeHomeScreenRoute: PropTypes.func.isRequired,
    disposeOffAlert: PropTypes.func.isRequired,
};

export default translate(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home));
