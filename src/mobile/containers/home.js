import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import UserInactivity from 'react-native-user-inactivity';
import KeepAwake from 'react-native-keep-awake';
import DropdownAlert from 'react-native-dropdownalert';

import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { clearTempData, setPassword } from 'iota-wallet-shared-modules/actions/tempAccount';
import { setBalance, setFirstUse } from 'iota-wallet-shared-modules/actions/account';
import { setUserActivity } from 'iota-wallet-shared-modules/actions/app';
import { disposeOffAlert } from 'iota-wallet-shared-modules/actions/alerts';
import balanceImagePath from 'iota-wallet-shared-modules/images/balance.png';
import sendImagePath from 'iota-wallet-shared-modules/images/send.png';
import receiveImagePath from 'iota-wallet-shared-modules/images/receive.png';
import historyImagePath from 'iota-wallet-shared-modules/images/history.png';
import settingsImagePath from 'iota-wallet-shared-modules/images/settings.png';

import TopBar from './topBar';
import DropdownHolder from '../components/dropdownHolder';
import Promoter from './promoter';
import COLORS from '../theme/Colors';
import Tabs from '../components/Tabs';
import Tab from '../components/Tab';
import TabContent from '../components/TabContent';
import EnterPassword from '../components/EnterPassword';
import { width, height } from '../util/dimensions';

const StatusBarDefaultBarStyle = 'light-content';

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
        const { setFirstUse, account, tempAccount, setBalance } = this.props;
        setFirstUse(false);
        const accountInfo = account.accountInfo;
        const seedIndex = tempAccount.seedIndex;
        const addressesWithBalance = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
        if (typeof accountInfo !== 'undefined') {
            setBalance(addressesWithBalance);
        }
    }

    componentWillReceiveProps(newProps) {
        const { alerts } = this.props;
        const didNotHaveAlertPreviously = !alerts.category && !alerts.title && !alerts.message;
        const hasANewAlert = newProps.alerts.category && newProps.alerts.title && newProps.alerts.message;
        const shouldGenerateAlert = hasANewAlert && didNotHaveAlertPreviously;

        if (shouldGenerateAlert) {
            const dropdown = DropdownHolder.getDropdown();
            dropdown.alertWithType(newProps.alerts.category, newProps.alerts.title, newProps.alerts.message);
        }
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

    handleInactivity() {
        const { setUserActivity } = this.props;
        setUserActivity({ inactive: true });
    }

    render() {
        const { t, navigator, inactive, minimised } = this.props;

        return (
            <UserInactivity timeForInactivity={300000} checkInterval={2000} onInactivity={this.handleInactivity}>
                <View style={{ flex: 1, backgroundColor: COLORS.backgroundGreen }}>
                    <StatusBar barStyle="light-content" />
                    {!inactive &&
                        !minimised && (
                            <View style={{ flex: 1 }}>
                                <View style={styles.topContainer} />
                                <View style={styles.midContainer}>
                                    <TabContent navigator={navigator} />
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
                    {inactive && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <EnterPassword
                                onLoginPress={this.onLoginPress}
                                ref={c => {
                                    this.enterPassword = c;
                                }}
                            />
                        </View>
                    )}
                    {minimised && <View />}
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

const mapStateToProps = state => ({
    alerts: state.alerts,
    tempAccount: state.tempAccount,
    settings: state.settings,
    account: state.account,
    inactive: state.app.inactive,
    minimised: state.app.minimised,
});

const mapDispatchToProps = {
    setBalance,
    changeHomeScreenRoute,
    disposeOffAlert,
    setFirstUse,
    clearTempData,
    setPassword,
    setUserActivity,
};

Home.propTypes = {
    setFirstUse: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    alerts: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    changeHomeScreenRoute: PropTypes.func.isRequired,
    disposeOffAlert: PropTypes.func.isRequired,
    setUserActivity: PropTypes.func.isRequired,
    inactive: PropTypes.bool.isRequired,
    minimised: PropTypes.bool.isRequired,
};

export default translate(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home));
