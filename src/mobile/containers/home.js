import get from 'lodash/get';
import filter from 'lodash/filter';
import map from 'lodash/map';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    Image,
    Dimensions,
    View,
    ImageBackground,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import Balance from './balance';
import Send from './send';
import Receive from './receive';
import History from './history';
import Settings from './settings';
import TopBar from '../components/topBar';
import { changeHomeScreenRoute, toggleTopBarDisplay } from '../../shared/actions/home';
import { getTailTransactionHashesForPendingTransactions } from '../../shared/store';
import {
    incrementSeedIndex,
    decrementSeedIndex,
    setSeedIndex,
    setReceiveAddress,
    replayBundle,
    setReady,
    clearTempData,
} from '../../shared/actions/tempAccount';
import { getAccountInfo, setBalance, setFirstUse } from '../../shared/actions/account';
import { generateAlert, disposeOffAlert } from '../../shared/actions/alerts';
import DropdownHolder from '../components/dropdownHolder';
import DropdownAlert from 'react-native-dropdownalert';
import Reattacher from './reAttacher';
import RNShakeEvent from 'react-native-shake-event'; // For HockeyApp bug reporting
import { roundDown, formatValue, formatUnit } from '../../shared/libs/util';

const StatusBarDefaultBarStyle = 'light-content';
const { height, width } = Dimensions.get('window');
const timer = require('react-native-timer');

class Home extends Component {
    constructor() {
        super();
        this.state = {
            mode: 'STANDARD',
        };
        var polling;
    }

    componentDidMount() {
        this.props.setFirstUse(false);
        this.startPolling();
        const accountInfo = this.props.account.accountInfo;
        const seedIndex = this.props.tempAccount.seedIndex;
        const addressesWithBalance = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
        if (typeof accountInfo !== 'undefined') {
            this.props.setBalance(addressesWithBalance);
        }
        timer.setInterval('polling', () => this.startPolling(), 10000);
    }

    componentWillMount() {
        RNShakeEvent.addEventListener('shake', () => {
            HockeyApp.feedback();
        });
    }

    componentWillUnmount() {
        RNShakeEvent.removeEventListener('shake');
        timer.clearInterval('polling');
    }

    startPolling() {
        if (!this.props.tempAccount.isGettingTransfers && !this.props.tempAccount.isSendingTransfer) {
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

    onNodeError() {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'Invalid response', `The node returned an invalid response.`);
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

    onLeftArrowPress() {
        if (this.props.tempAccount.seedIndex > 0 && !this.props.tempAccount.isGeneratingReceiveAddress) {
            const seedIndex = this.props.tempAccount.seedIndex - 1;
            const seedName = this.props.account.seedNames[seedIndex];
            const accountInfo = this.props.account.accountInfo;

            this.props.decrementSeedIndex();
            this.props.setBalance(accountInfo[Object.keys(accountInfo)[seedIndex]].addresses);
            this.props.setReceiveAddress(' ');
            // Get new account info if not sending or getting transfers
            if (!this.props.tempAccount.isSendingTransfer && !this.props.tempAccount.isGettingTransfers) {
                this.props.getAccountInfo(seedName, seedIndex, accountInfo, (error, success) => {
                    if (error) this.onNodeError();
                });
            }
        }
    }

    onRightArrowPress() {
        if (
            this.props.tempAccount.seedIndex + 1 < this.props.account.seedCount &&
            !this.props.tempAccount.isGeneratingReceiveAddress
        ) {
            const seedIndex = this.props.tempAccount.seedIndex + 1;
            const seedName = this.props.account.seedNames[seedIndex];
            const accountInfo = this.props.account.accountInfo;

            this.props.incrementSeedIndex();
            this.props.setBalance(accountInfo[Object.keys(accountInfo)[seedIndex]].addresses);
            this.props.setReceiveAddress(' ');

            // Get new account info if not sending or getting transfers
            if (!this.props.tempAccount.isSendingTransfer && !this.props.tempAccount.isGettingTransfers) {
                this.props.getAccountInfo(seedName, seedIndex, accountInfo, (error, success) => {
                    if (error) this.onNodeError();
                });
            }
        }
    }

    renderChildren(route) {
        const childrenProps = {
            type: route, // TODO: type prop might be unneeded in all the children components;
            navigator: this.props.navigator,
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

    humanizeBalance(balance) {
        const decimalPlaces = n => {
            const s = '' + +n;
            const match = /(?:\.(\d+))?(?:[eE]([+\-]?\d+))?$/.exec(s);
            if (!match) {
                return 0;
            }

            return Math.max(0, (match[1] === '0' ? 0 : (match[1] || '').length) - (match[2] || 0));
        };

        const formatted = formatValue(balance);
        const former = roundDown(formatted, 1);
        const latter = balance < 1000 || decimalPlaces(formatted) <= 1 ? '' : '+';

        return `${former + latter} ${formatUnit(balance)}`;
    }

    getTopBarProps() {
        const {
            account: { seedNames, balance, seedCount, accountInfo },
            tempAccount: { seedIndex, isGeneratingReceiveAddress, isSendingTransfer, isGettingTransfers },
            isTopBarActive,
        } = this.props;
        const selectedTitle = get(seedNames, `[${seedIndex}]`) || ''; // fallback
        const selectedSubtitle = this.humanizeBalance(balance);

        const withSubtitles = (title, index) => ({ title, subtitle: '0 i', index });
        const titles = map(seedNames, withSubtitles);

        return {
            active: isTopBarActive,
            selectedTitle,
            selectedSubtitle,
            currentSeedIndex: seedIndex,
            titles,
            toggle: this.props.toggleTopBarDisplay,
            onChange: newSeedIdx => {
                console.log(newSeedIdx);
                if (!isGeneratingReceiveAddress) {
                    const seedName = seedNames[newSeedIdx];

                    this.props.setSeedIndex(newSeedIdx);
                    const seedStrings = Object.keys(accountInfo);
                    this.props.setBalance(accountInfo[seedStrings[newSeedIdx]].addresses); // Dangerous
                    this.props.setReceiveAddress(' ');

                    // Get new account info if not sending or getting transfers
                    if (!isSendingTransfer && !isGettingTransfers) {
                        this.props.getAccountInfo(seedName, newSeedIdx, accountInfo, error => {
                            if (error) {
                                this.onNodeError();
                            }
                        });
                    }
                }
            },
        };
    }

    _renderTitlebar() {
        if (this.props.tempAccount.usedSeedToLogin == false) {
            return (
                <View style={styles.titlebarContainer}>
                    <TouchableOpacity
                        onPress={() => this.onLeftArrowPress()}
                        hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                    >
                        <Image
                            style={{
                                width: width / 20,
                                height: width / 20,
                                opacity: this.props.tempAccount.isGeneratingReceiveAddress
                                    ? 0.3
                                    : this.props.tempAccount.seedIndex == 0 ? 0.3 : 1,
                            }}
                            source={require('../../shared/images/arrow-left.png')}
                        />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>
                            {this.props.account.seedNames[this.props.tempAccount.seedIndex]}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => this.onRightArrowPress()}
                        hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                    >
                        <Image
                            style={{
                                width: width / 20,
                                height: width / 20,
                                opacity: this.props.tempAccount.isGeneratingReceiveAddress
                                    ? 0.3
                                    : this.props.tempAccount.seedIndex + 1 == this.props.account.seedCount ? 0.3 : 1,
                            }}
                            source={require('../../shared/images/arrow-right.png')}
                        />
                    </TouchableOpacity>
                </View>
            );
        } else {
            return <View style={styles.titlebarContainer} />;
        }
    }

    render() {
        const { childRoute, tailTransactionHashesForPendingTransactions } = this.props;
        const children = this.renderChildren(childRoute);
        const isCurrentRoute = route => route === childRoute;
        const topBarProps = this.getTopBarProps();

        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={{ flex: 1 }}>
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
                                    source={require('../../shared/images/balance.png')}
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
                                    source={require('../../shared/images/send.png')}
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
                                    source={require('../../shared/images/receive.png')}
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
                                    source={require('../../shared/images/history.png')}
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
                                    source={require('../../shared/images/settings.png')}
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
                <TopBar {...topBarProps} />
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
                />
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    topContainer: {
        flex: 0.4,
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
        flex: 4.7,
        zIndex: 0,
    },
    bottomContainer: {
        flex: 0.7,
    },
    tabBar: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.5);',
        justifyContent: 'space-around',
        alignItems: 'center',
        opacity: 0.8,
    },
    button: {
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    icon: {
        paddingTop: height / 60,
        height: width / 19,
        width: width / 19,
    },
    iconTitle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: height / 80,
        fontFamily: 'Lato-Regular',
        fontSize: width / 40.5,
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
    incrementSeedIndex: () => {
        dispatch(incrementSeedIndex());
    },
    decrementSeedIndex: () => {
        dispatch(decrementSeedIndex());
    },
    getAccountInfo: (seedName, seedIndex, accountInfo, cb) => {
        dispatch(getAccountInfo(seedName, seedIndex, accountInfo, cb));
    },
    setReceiveAddress: string => {
        dispatch(setReceiveAddress(string));
    },
    setBalance: addressesWithBalance => {
        dispatch(setBalance(addressesWithBalance));
    },
    setSeedIndex: index => dispatch(setSeedIndex(index)),
    changeHomeScreenRoute: route => dispatch(changeHomeScreenRoute(route)),
    toggleTopBarDisplay: () => dispatch(toggleTopBarDisplay()),
    replayBundle: (transaction, depth, weight) => dispatch(replayBundle(transaction, depth, weight)),
    generateAlert: (type, title, message) => dispatch(generateAlert(type, title, message)),
    disposeOffAlert: () => dispatch(disposeOffAlert()),
    setFirstUse: boolean => dispatch(setFirstUse(boolean)),
    setReady: boolean => dispatch(setReady(boolean)),
    clearTempData: () => dispatch(clearTempData()),
});

Home.propTypes = {
    alerts: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    childRoute: PropTypes.string.isRequired,
    isTopBarActive: PropTypes.bool.isRequired,
    changeHomeScreenRoute: PropTypes.func.isRequired,
    tailTransactionHashesForPendingTransactions: PropTypes.array.isRequired,
    generateAlert: PropTypes.func.isRequired,
    disposeOffAlert: PropTypes.func.isRequired,
    toggleTopBarDisplay: PropTypes.func.isRequired,
    setSeedIndex: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
