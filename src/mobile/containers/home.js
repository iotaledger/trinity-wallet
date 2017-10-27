import React from 'react';
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
import Balance from './balance';
import Send from './send';
import Receive from './receive';
import History from './history';
import Settings from './settings';
import DropdownAlert from 'react-native-dropdownalert';
import { round, formatValue, formatUnit } from '../../shared/libs/util';
import { incrementSeedIndex, decrementSeedIndex } from '../../shared/actions/iotaActions';
import { connect } from 'react-redux';
import { getSeedName, getFromKeychain } from '../../shared/libs/cryptography';

const StatusBarDefaultBarStyle = 'light-content';
const { height, width } = Dimensions.get('window');

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabChoice: 'Balance',
            tabContent: <Balance />,
            balanceOpacity: 1,
            sendOpacity: 0.6,
            receiveOpacity: 0.6,
            historyOpacity: 0.6,
            settingsOpacity: 0.6,
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

    setTab(tabChoice) {
        let tabContent;
        switch (tabChoice) {
            case 'balance':
                tabContent = <Balance style={{ flex: 1 }} type={tabChoice} />;
                break;
            case 'send':
                tabContent = <Send type={tabChoice} />;
                break;
            case 'receive':
                tabContent = <Receive type={tabChoice} />;
                break;
            case 'history':
                tabContent = <History type={tabChoice} />;
                break;
            case 'settings':
                tabContent = <Settings type={tabChoice} />;
                break;
            default:
                break;
        }
        this.setState({
            tabChoice,
            tabContent,
        });
    }

    clickBalance() {
        this.setTab('balance');
        this.setState({
            balanceOpacity: 1,
            sendOpacity: 0.6,
            receiveOpacity: 0.6,
            historyOpacity: 0.6,
            settingsOpacity: 0.6,
        });
    }
    clickSend() {
        this.setTab('send');
        this.setState({
            balanceOpacity: 0.6,
            sendOpacity: 1,
            receiveOpacity: 0.6,
            historyOpacity: 0.6,
            settingsOpacity: 0.6,
        });
    }
    clickReceive() {
        this.setTab('receive');
        this.setState({
            balanceOpacity: 0.6,
            sendOpacity: 0.6,
            receiveOpacity: 1,
            historyOpacity: 0.6,
            settingsOpacity: 0.6,
        });
    }
    clickHistory() {
        this.setTab('history');
        this.setState({
            balanceOpacity: 0.6,
            sendOpacity: 0.6,
            receiveOpacity: 0.6,
            historyOpacity: 1,
            settingsOpacity: 0.6,
        });
    }
    clickSettings() {
        this.setTab('settings');
        this.setState({
            balanceOpacity: 0.6,
            sendOpacity: 0.6,
            receiveOpacity: 0.6,
            historyOpacity: 0.6,
            settingsOpacity: 1,
        });
    }

    render() {
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
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
                <View style={styles.midContainer}>
                    <View style={{ flex: 1 }}>{this.state.tabContent}</View>
                </View>
                <View style={styles.bottomContainer}>
                    <View style={styles.tabBar}>
                        <TouchableWithoutFeedback onPress={event => this.clickBalance()}>
                            <View style={styles.button}>
                                <Image
                                    style={[styles.icon, { opacity: this.state.balanceOpacity }]}
                                    source={require('../../shared/images/balance.png')}
                                />
                                <Text style={[styles.iconTitle, { opacity: this.state.balanceOpacity }]}>BALANCE</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={event => this.clickSend()}>
                            <View style={styles.button}>
                                <Image
                                    style={[styles.icon, { opacity: this.state.sendOpacity }]}
                                    source={require('../../shared/images/send.png')}
                                />
                                <Text style={[styles.iconTitle, { opacity: this.state.sendOpacity }]}>SEND</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={event => this.clickReceive()}>
                            <View style={styles.button}>
                                <Image
                                    style={[styles.icon, { opacity: this.state.receiveOpacity }]}
                                    source={require('../../shared/images/receive.png')}
                                />
                                <Text style={[styles.iconTitle, { opacity: this.state.receiveOpacity }]}>RECEIVE</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={event => this.clickHistory()}>
                            <View style={styles.button}>
                                <Image
                                    style={[styles.icon, { opacity: this.state.historyOpacity }]}
                                    source={require('../../shared/images/history.png')}
                                />
                                <Text style={[styles.iconTitle, { opacity: this.state.historyOpacity }]}>HISTORY</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={event => this.clickSettings()}>
                            <View style={styles.button}>
                                <Image
                                    style={[styles.icon, { opacity: this.state.settingsOpacity }]}
                                    source={require('../../shared/images/settings.png')}
                                />
                                <Text style={[styles.iconTitle, { opacity: this.state.settingsOpacity }]}>
                                    SETTINGS
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                <DropdownAlert
                    ref={ref => (this.dropdown = ref)}
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
        flex: 0.5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 20,
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
});

const mapStateToProps = state => ({
    iota: state.iota,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    incrementSeedIndex: () => {
        dispatch(incrementSeedIndex());
    },
    decrementSeedIndex: () => {
        dispatch(decrementSeedIndex());
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
