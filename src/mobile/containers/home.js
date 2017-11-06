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
import { changeHomeScreenRoute } from '../../shared/actions/home';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import { incrementSeedIndex, decrementSeedIndex } from '../../shared/actions/iotaActions';
import { getTailTransactionHashesForPendingTransactions } from '../../shared/store';
import DropdownHolder from '../components/dropdownHolder';
import ReAttacher from './reAttacher';
const StatusBarDefaultBarStyle = 'light-content';
const { height, width } = Dimensions.get('window');

class Home extends Component {
    constructor() {
        super();

        this.state = {
            mode: 'STANDARD',
        };
    }

    onLeftArrowPress() {
        if (this.props.iota.seedIndex > 0) {
            var seedIndex = this.props.iota.seedIndex - 1;
            this.props.decrementSeedIndex();
        }
    }

    onRightArrowPress() {
        if (this.props.iota.seedIndex + 1 < this.props.account.seedCount) {
            var seedIndex = this.props.iota.seedIndex + 1;
            this.props.incrementSeedIndex();
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

    _renderTitlebar() {
        if (this.props.iota.usedSeedToLogin == false) {
            return (
                <View style={styles.titlebarContainer}>
                    <TouchableOpacity
                        onPress={() => this.onLeftArrowPress()}
                        style={{ position: 'absolute', left: width / 6, top: height / 13.1 }}
                    >
                        <Image
                            style={{
                                width: width / 20,
                                height: width / 20,
                                opacity: this.props.iota.seedIndex == 0 ? 0.3 : 1,
                            }}
                            source={require('../../shared/images/arrow-left.png')}
                        />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{this.props.account.seedNames[this.props.iota.seedIndex]}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => this.onRightArrowPress()}
                        style={{ position: 'absolute', right: width / 6, top: height / 13.1 }}
                    >
                        <Image
                            style={{
                                width: width / 20,
                                height: width / 20,
                                opacity: this.props.iota.seedIndex + 1 == this.props.account.seedCount ? 0.3 : 1,
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

        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>{this._renderTitlebar()}</View>
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
                <ReAttacher attachments={tailTransactionHashesForPendingTransactions} />
                <DropdownAlert
                    ref={ref => DropdownHolder.setDropdown(ref)}
                    successColor="#009f3f"
                    errorColor="#A10702"
                    titleStyle={styles.dropdownTitle}
                    defaultTextContainer={styles.dropdownTextContainer}
                    messageStyle={styles.dropdownMessage}
                    imageStyle={styles.dropdownImage}
                    inactiveStatusBarStyle={StatusBarDefaultBarStyle}
                />
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    topContainer: {
        flex: 0.8,
        justifyContent: 'center',
    },
    titlebarContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 20,
        flex: 1,
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
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
    },
    bottomContainer: {
        flex: 0.9,
    },
    tabBar: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    button: {
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    icon: {
        height: width / 10,
        width: width / 10,
    },
    iconTitle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: height / 60,
        fontFamily: 'Lato-Regular',
        fontSize: width / 40.5,
    },
    fullyOpaque: {
        opacity: 1,
    },
    partiallyOpaque: {
        opacity: 0.6,
    },
});

const mapStateToProps = state => ({
    iota: state.iota,
    tailTransactionHashesForPendingTransactions: getTailTransactionHashesForPendingTransactions(state),
    account: state.account,
    childRoute: state.home.childRoute,
});

const mapDispatchToProps = dispatch => ({
    incrementSeedIndex: () => {
        dispatch(incrementSeedIndex());
    },
    decrementSeedIndex: () => {
        dispatch(decrementSeedIndex());
    },
    changeHomeScreenRoute: route => dispatch(changeHomeScreenRoute(route)),
});

Home.propTypes = {
    navigator: PropTypes.object.isRequired,
    childRoute: PropTypes.string.isRequired,
    changeHomeScreenRoute: PropTypes.func.isRequired,
    tailTransactionHashesForPendingTransactions: PropTypes.array.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
