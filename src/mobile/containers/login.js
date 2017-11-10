import React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    ImageBackground,
    ScrollView,
    StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import { getMarketData, getChartData, getPrice } from '../../shared/actions/marketData';
import { setPassword } from '../../shared/actions/tempAccount';
import { getAccountInfo, getAccountInfoNewSeed } from '../../shared/actions/account';
import { setFirstUse } from '../../shared/actions/account';
import { changeHomeScreenRoute } from '../../shared/actions/home';
import { getFromKeychain, getSeed } from '../../shared/libs/cryptography';
import { TextField } from 'react-native-material-textfield';
import OnboardingButtons from '../components/onboardingButtons.js';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import { Keyboard } from 'react-native';
const StatusBarDefaultBarStyle = 'light-content';

const { height, width } = Dimensions.get('window');

var HockeyApp = require('react-native-hockeyapp');

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
        };
        this.onLoginPress = this.onLoginPress.bind(this);
    }
    getWalletData() {
        this.props.getChartData('USD', '24h');
        this.props.getPrice('USD');
        this.props.getMarketData();
    }

    componentWillMount() {
        HockeyApp.configure(
            '61847e74428144ceb0c3baee06c24c33', //HockeyApp App ID
            true, //Auto send crash reports
            1, //Authentication type
            'ac0d91c9d7f5efdd86fa836f1ef6ffbb', //HockeyApp App Secret
        );
    }

    componentDidMount() {
        HockeyApp.start();
        HockeyApp.checkForUpdate(); // optional
    }

    onLoginPress() {
        if (!this.state.password) {
            this.dropdown.alertWithType(
                'error',
                'Empty password',
                'You must enter a password to log in. Please try again.',
            );
        } else {
            this.props.setPassword(this.state.password);
            getFromKeychain(this.state.password, value => {
                if (value) {
                    var seed = getSeed(value, 0);
                    login(seed);
                } else {
                    error();
                }
            });
        }

        const _this = this;
        const seedIndex = _this.props.tempAccount.seedIndex;
        const seedName = _this.props.account.seedNames[seedIndex];
        function login(value) {
            if (_this.props.account.firstUse) {
                Promise.resolve(_this.getWalletData()).then(_this.props.getAccountInfoNewSeed(value, seedName));
                _this.props.setFirstUse(false);
            } else {
                const accountInfo = _this.props.account.accountInfo;
                Promise.resolve(_this.getWalletData()).then(
                    _this.props.getAccountInfo(seedName, seedIndex, accountInfo),
                );
            }
            _this.props.changeHomeScreenRoute('balance');
            _this.props.navigator.push({
                screen: 'loading',
                navigatorStyle: {
                    navBarHidden: true,
                },
                animated: false,
            });
        }

        function error() {
            _this.dropdown.alertWithType(
                'error',
                'Unrecognised password',
                'The password was not recognised. Please try again.',
            );
        }
    }

    onUseSeedPress() {
        this.dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
        {
            /*this.props.navigator.push({
            screen: 'useSeed',
            navigatorStyle: {
                navBarHidden: true,
            },
            animated: false,
        });*/
        }
    }

    render() {
        let { password } = this.state;
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topContainer}>
                            <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>Please enter your password.</Text>
                            </View>
                        </View>
                        <View style={styles.midContainer}>
                            <TextField
                                style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={width / 31.8}
                                fontSize={width / 20.7}
                                labelPadding={3}
                                baseColor="white"
                                label="Password"
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
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={() => this.onUseSeedPress()}
                                onRightButtonPress={() => this.onLoginPress()}
                                leftText={'USE SEED'}
                                rightText={'LOG IN'}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
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
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#102e36',
    },
    topContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4.8,
        alignItems: 'center',
        paddingTop: height / 4.2,
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 15,
    },
    title: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    greetingText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        paddingHorizontal: width / 7,
        paddingBottom: height / 10,
        backgroundColor: 'transparent',
    },
    questionText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.25,
        textAlign: 'center',
        paddingLeft: width / 7,
        paddingRight: width / 7,
        paddingTop: height / 25,
        backgroundColor: 'transparent',
    },
    newSeedButton: {
        borderColor: '#F7D002',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 1.65,
        height: height / 17,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginRight: width / 10,
    },
    newSeedText: {
        color: '#F7D002',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
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
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    setPassword: password => {
        dispatch(setPassword(password));
    },
    setFirstUse: boolean => {
        dispatch(setFirstUse(boolean));
    },
    getAccountInfo: (seedName, seedIndex, accountInfo) => {
        dispatch(getAccountInfo(seedName, seedIndex, accountInfo));
    },
    getAccountInfoNewSeed: (seed, seedName) => {
        dispatch(getAccountInfoNewSeed(seed, seedName));
    },
    changeHomeScreenRoute: tab => {
        dispatch(changeHomeScreenRoute(tab));
    },
    getMarketData: () => {
        dispatch(getMarketData());
    },
    getPrice: currency => {
        dispatch(getPrice(currency));
    },
    getChartData: (currency, timeFrame) => {
        dispatch(getChartData(currency, timeFrame));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
