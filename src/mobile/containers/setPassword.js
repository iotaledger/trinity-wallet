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
import { increaseSeedCount, addSeedName, setOnboardingComplete } from '../../shared/actions/account';
import { setSeed } from '../../shared/actions/tempAccount';
import { storeInKeychain } from '../../shared/libs/cryptography';
import { TextField } from 'react-native-material-textfield';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import { Keyboard } from 'react-native';
import OnboardingButtons from '../components/onboardingButtons.js';
import RNShakeEvent from 'react-native-shake-event'; // For HockeyApp bug reporting

const { height, width } = Dimensions.get('window');
const MIN_PASSWORD_LENGTH = 12;
const StatusBarDefaultBarStyle = 'light-content';

class SetPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            reentry: '',
        };
    }

    componentWillMount() {
        RNShakeEvent.addEventListener('shake', () => {
            HockeyApp.feedback();
        });
    }

    componentWillUnmount() {
        RNShakeEvent.removeEventListener('shake');
    }

    onDonePress() {
        if (this.state.password.length >= MIN_PASSWORD_LENGTH && this.state.password == this.state.reentry) {
            Promise.resolve(
                storeInKeychain(this.state.password, this.props.tempAccount.seed, this.props.tempAccount.seedName),
            ).then(setSeed(''));
            this.props.setOnboardingComplete(true);
            this.props.addSeedName(this.props.tempAccount.seedName);
            this.props.navigator.push({
                screen: 'onboardingComplete',
                navigatorStyle: {
                    navBarHidden: true,
                },
                animated: false,
            });
        } else {
            if (this.state.password.length < MIN_PASSWORD_LENGTH || this.state.reentry.length < MIN_PASSWORD_LENGTH) {
                this.dropdown.alertWithType(
                    'error',
                    'Password is too short',
                    `Your password must be at least ${MIN_PASSWORD_LENGTH} characters. It is currently ${this.state
                        .password.length} characters long. Please try again.`,
                );
            } else if (!(this.state.password === this.state.reentry)) {
                this.dropdown.alertWithType(
                    'error',
                    'Passwords do not match',
                    'The passwords you have entered do not match. Please try again.',
                );
            }
        }
    }
    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    render() {
        let { password, reentry } = this.state;
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topContainer}>
                            <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                            <View style={styles.titleContainer}>
                                <Text style={styles.greetingText}>Now we need to set up a password.</Text>
                            </View>
                        </View>
                        <View style={styles.midContainer}>
                            <View style={styles.infoTextContainer}>
                                <Image source={require('../../shared/images/info.png')} style={styles.infoIcon} />
                                <Text style={styles.infoText}>
                                    An encrypted copy of your seed will be stored on your device. You will use this
                                    password to access your wallet in future.
                                </Text>
                                <Text style={styles.warningText}>
                                    Ensure you use a strong password of at least 12 characters.
                                </Text>
                            </View>
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
                                returnKeyType="next"
                                value={password}
                                onChangeText={password => this.setState({ password })}
                                onSubmitEditing={event => {
                                    this.refs.reentry.focus();
                                }}
                                containerStyle={{
                                    width: width / 1.36,
                                }}
                                secureTextEntry={true}
                            />
                            <TextField
                                ref="reentry"
                                style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={width / 31.8}
                                fontSize={width / 20.7}
                                labelPadding={3}
                                baseColor="white"
                                label="Retype Password"
                                tintColor="#F7D002"
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically={true}
                                returnKeyType="done"
                                value={reentry}
                                onChangeText={reentry => this.setState({ reentry })}
                                containerStyle={{ width: width / 1.36 }}
                                secureTextEntry={true}
                            />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={() => this.onBackPress()}
                                onRightButtonPress={() => this.onDonePress()}
                                leftText={'BACK'}
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
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4.8,
        justifyContent: 'flex-start',
        paddingTop: height / 10,
        alignItems: 'center',
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
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextContainer: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 15,
        width: width / 1.6,
        height: height / 4.1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 30,
        borderStyle: 'dotted',
        paddingTop: height / 60,
        marginTop: height / 25,
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    warningText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 70,
        backgroundColor: 'transparent',
    },
    greetingText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    questionText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        paddingHorizontal: width / 7,
        paddingTop: height / 25,
        backgroundColor: 'transparent',
    },
    infoIcon: {
        width: width / 20,
        height: width / 20,
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
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
});

const mapDispatchToProps = dispatch => ({
    setOnboardingComplete: boolean => {
        dispatch(setOnboardingComplete(boolean));
    },
    storeInKeychain: password => {
        dispatch(storeInKeychain(password));
    },
    setSeed: seed => {
        dispatch(setSeed(seed));
    },
    increaseSeedCount: () => {
        dispatch(increaseSeedCount());
    },
    addSeedName: newSeed => {
        dispatch(addSeedName(newSeed));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(SetPassword);
