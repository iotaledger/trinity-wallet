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
} from 'react-native';
import { connect } from 'react-redux';
import Balance from './balance';
import Send from './send';
import Receive from './receive';
import History from './history';
import Settings from './settings';
import { changeHomeScreenRoute } from '../../shared/actions/home';
import DropdownAlert from 'react-native-dropdownalert';
const StatusBarDefaultBarStyle = 'light-content';
const { height, width } = Dimensions.get('window');

class Home extends Component {
    constructor() {
        super();

        this.state = {
            balanceOpacity: 1,
            sendOpacity: 0.6,
            receiveOpacity: 0.6,
            historyOpacity: 0.6,
            settingsOpacity: 0.6,
            mode: 'STANDARD',
        };
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
        this.setState({
            balanceOpacity: 1,
            sendOpacity: 0.6,
            receiveOpacity: 0.6,
            historyOpacity: 0.6,
            settingsOpacity: 0.6,
        });
    }
    clickSend() {
        this.props.changeHomeScreenRoute('send');
        this.setState({
            balanceOpacity: 0.6,
            sendOpacity: 1,
            receiveOpacity: 0.6,
            historyOpacity: 0.6,
            settingsOpacity: 0.6,
        });
    }
    clickReceive() {
        this.props.changeHomeScreenRoute('receive');
        this.setState({
            balanceOpacity: 0.6,
            sendOpacity: 0.6,
            receiveOpacity: 1,
            historyOpacity: 0.6,
            settingsOpacity: 0.6,
        });
    }
    clickHistory() {
        this.props.changeHomeScreenRoute('history');
        this.setState({
            balanceOpacity: 0.6,
            sendOpacity: 0.6,
            receiveOpacity: 0.6,
            historyOpacity: 1,
            settingsOpacity: 0.6,
        });
    }
    clickSettings() {
        this.props.changeHomeScreenRoute('settings');
        this.setState({
            balanceOpacity: 0.6,
            sendOpacity: 0.6,
            receiveOpacity: 0.6,
            historyOpacity: 0.6,
            settingsOpacity: 1,
        });
    }

    render() {
        const { childRoute } = this.props;
        const children = this.renderChildren(childRoute);

        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />
                <View style={styles.titleContainer}>
                    <View style={{ flex: 6 }}>{children}</View>
                </View>
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
                            <Text style={[styles.iconTitle, { opacity: this.state.settingsOpacity }]}>SETTINGS</Text>
                        </View>
                    </TouchableWithoutFeedback>
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
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    banner: {
        alignItems: 'center',
        paddingTop: 20,
        flex: 1,
    },
    logo: {
        height: width / 10,
        width: width / 10,
    },
    tabBar: {
        flex: 0.12,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 5,
    },
    button: {
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    icon: {
        height: width / 12,
        width: width / 12,
    },
    iconTitle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: height / 60,
        fontFamily: 'Lato-Regular',
        fontSize: width / 40.5,
    },
    title: {
        color: 'white',
        textAlign: 'center',
        paddingTop: 8,
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 14.5,
    },
    mode: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 50.6,
        paddingTop: 5,
    },
    dropdownTitle: {
        fontSize: 16,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        padding: 15,
    },
    dropdownMessage: {
        fontSize: 14,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownImage: {
        padding: 8,
        width: 36,
        height: 36,
        alignSelf: 'center',
    },
});

Home.propTypes = {
    navigator: PropTypes.object.isRequired,
    childRoute: PropTypes.string.isRequired,
    changeHomeScreenRoute: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    childRoute: state.home.childRoute,
});

const mapDispatchToProps = dispatch => ({
    changeHomeScreenRoute: route => dispatch(changeHomeScreenRoute(route)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
