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
import { setPassword, getAccountInfo } from '../../shared/actions/iotaActions';
import { getFromKeychain } from '../../shared/libs/cryptography';
import { TextField } from 'react-native-material-textfield';
import OnboardingButtons from '../components/onboardingButtons.js';
import DropdownAlert from 'react-native-dropdownalert';
import { Keyboard } from 'react-native';
const StatusBarDefaultBarStyle = 'light-content';

const { height, width } = Dimensions.get('window');

class Login extends React.Component {
    constructor() {
        super();
        this.state = {
            password: '',
        };
        this.onDonePress = this.onDonePress.bind(this);
    }

    onDonePress() {
        if (!this.state.password) {
            this.dropdown.alertWithType(
                'error',
                'Empty password',
                'You must enter a password to log in. Please try again.',
            );
        } else {
            this.props.setPassword(this.state.password);
            getFromKeychain(this.state.password, value => {
                if (typeof value !== 'undefined') {
                    login(value);
                } else {
                    error();
                }
            });
        }

        const _this = this;
        function login(value) {
            _this.props.getAccountInfo(value);
            _this.props.navigator.push({
                screen: 'loading',
                navigatorStyle: {
                    navBarHidden: true,
                    screenBackgroundImageName: 'bg-green.png',
                    screenBackgroundColor: '#102e36',
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
        this.props.navigator.push({
            screen: 'useSeed',
            navigatorStyle: {
                navBarHidden: true,
                screenBackgroundImageName: 'bg-green.png',
                screenBackgroundColor: '#102e36',
            },
            animated: false,
        });
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
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>LOGIN</Text>
                            </View>
                        </View>
                        <View style={styles.midContainer}>
                            <Text style={styles.greetingText}>Please enter your password.</Text>
                            <TextField
                                style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={height / 55}
                                fontSize={height / 40}
                                baseColor="white"
                                label="Password"
                                tintColor="#F7D002"
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically={true}
                                value={password}
                                onChangeText={password => this.setState({ password })}
                                containerStyle={{
                                    width: width / 1.65,
                                    paddingTop: height / 40,
                                }}
                                secureTextEntry={true}
                            />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={this.onUseSeedPress}
                                onRightButtonPress={this.onDonePress}
                                leftText={'USE SEED'}
                                rightText={'DONE'}
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
        flex: 1.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 1.6,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: height / 8,
        paddingTop: height / 35,
    },
    title: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
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
    iota: state.iota,
});

const mapDispatchToProps = dispatch => ({
    setPassword: password => {
        dispatch(setPassword(password));
    },
    getAccountInfo: seed => {
        dispatch(getAccountInfo(seed));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
