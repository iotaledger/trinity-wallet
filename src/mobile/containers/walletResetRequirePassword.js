import toUpper from 'lodash/toUpper';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { deleteFromKeyChain } from '../../shared/libs/cryptography';
import { resetWallet } from '../../shared/actions/app';
import { setFirstUse, setOnboardingComplete } from '../../shared/actions/account';
import { Navigation } from 'react-native-navigation';
import { clearTempData, setPassword } from '../../shared/actions/tempAccount';
import PropTypes from 'prop-types';
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
import Colors from '../theme/Colors';
import Fonts from '../theme/Fonts';
import { TextField } from 'react-native-material-textfield';
import OnboardingButtons from '../components/onboardingButtons.js';
import { Keyboard } from 'react-native';
import DropdownHolder from '../components/dropdownHolder';
import RNShakeEvent from 'react-native-shake-event'; // For HockeyApp bug reporting
import DropdownAlert from 'react-native-dropdownalert';

const { height, width } = Dimensions.get('window');

class WalletResetRequirePassword extends Component {
    constructor() {
        super();
        this.state = {
            password: '',
        };

        this.goBack = this.goBack.bind(this);
        this.resetWallet = this.resetWallet.bind(this);
    }

    componentWillMount() {
        RNShakeEvent.addEventListener('shake', () => {
            HockeyApp.feedback();
        });
    }

    componentWillUnmount() {
        RNShakeEvent.removeEventListener('shake');
    }

    goBack() {
        this.props.navigator.push({
            screen: 'home',
            navigatorStyle: {
                navBarHidden: true,
                screenBackgroundImageName: 'bg-green.png',
                screenBackgroundColor: Colors.brand.primary,
            },
            animated: false,
        });
    }

    isAuthenticated() {
        return this.props.password === this.state.password;
    }

    redirectToInitialScreen() {
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'languageSetup',
                navigatorStyle: {
                    navBarHidden: true,
                    screenBackgroundImageName: 'bg-green.png',
                    screenBackgroundColor: '#102e36',
                },
            },
        });
    }

    resetWallet() {
        const isAuthenticated = this.isAuthenticated();
        const { password, resetWallet } = this.props;

        if (isAuthenticated) {
            deleteFromKeyChain(password);
            resetWallet();
            this.props.setOnboardingComplete(false);
            this.props.setFirstUse(true);
            this.props.clearTempData();
            this.props.setPassword('');
            this.redirectToInitialScreen();
        } else {
            this.dropdown.alertWithType(
                'error',
                'Unrecognised password',
                'The password was not recognised. Please try again.',
            );
        }
    }

    render() {
        const { t } = this.props;

        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                        </View>
                        <View style={styles.midWrapper}>
                            <Text style={styles.generalText}>Enter password to reset your wallet.</Text>
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
                                value={this.state.password}
                                onChangeText={password => this.setState({ password })}
                                containerStyle={{
                                    width: width / 1.4,
                                }}
                                secureTextEntry={true}
                            />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                style={onboardingButtonsOverride}
                                onLeftButtonPress={this.goBack}
                                onRightButtonPress={this.resetWallet}
                                leftText={toUpper('cancel')}
                                rightText={toUpper('reset')}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <DropdownAlert
                    ref={ref => (this.dropdown = ref)}
                    successColor={Colors.dropdown.success}
                    errorColor={Colors.dropdown.error}
                    titleStyle={styles.dropdownTitle}
                    defaultTextContainer={styles.dropdownTextContainer}
                    messageStyle={styles.dropdownMessage}
                    imageStyle={styles.dropdownImage}
                    inactiveStatusBarStyle="light-content"
                />
            </ImageBackground>
        );
    }
}

const onboardingButtonsOverride = StyleSheet.create({
    rightButton: {
        borderColor: Colors.red,
    },
    rightText: {
        color: Colors.red,
        fontFamily: Fonts.secondary,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.brand.primary,
    },
    topWrapper: {
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midWrapper: {
        flex: 1.6,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    generalText: {
        color: 'white',
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
        textAlign: 'center',
        paddingBottom: height / 10,
        backgroundColor: 'transparent',
    },
    questionText: {
        color: Colors.white,
        fontFamily: Fonts.secondary,
        fontSize: width / 20.25,
        textAlign: 'center',
        paddingLeft: width / 7,
        paddingRight: width / 7,
        paddingTop: height / 25,
        backgroundColor: 'transparent',
    },
    newSeedButton: {
        borderColor: Colors.orangeDark,
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 1.65,
        height: height / 17,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginRight: width / 10,
    },
    newSeedText: {
        color: Colors.orangeDark,
        fontFamily: Fonts.tertiary,
        fontSize: width / 25.3,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    textFieldContainer: {
        width: width / 1.65,
    },
    textField: {
        color: Colors.white,
        fontFamily: Fonts.tertiary,
    },
    textFieldLabel: {
        fontFamily: Fonts.tertiary,
    },
    dropdownTitle: {
        fontSize: 16,
        textAlign: 'left',
        fontWeight: 'bold',
        color: Colors.white,
        backgroundColor: 'transparent',
        fontFamily: Fonts.secondary,
    },
    dropdownTextContainer: {
        flex: 1,
        padding: 15,
    },
    dropdownMessage: {
        fontSize: 14,
        textAlign: 'left',
        fontWeight: 'normal',
        color: Colors.white,
        backgroundColor: 'transparent',
        fontFamily: Fonts.secondary,
    },
    dropdownImage: {
        padding: 8,
        width: 36,
        height: 36,
        alignSelf: 'center',
    },
});

const mapStateToProps = state => ({
    password: state.tempAccount.password,
});

const mapDispatchToProps = dispatch => ({
    resetWallet: () => dispatch(resetWallet()),
    setFirstUse: boolean => dispatch(setFirstUse(boolean)),
    setOnboardingComplete: boolean => dispatch(setOnboardingComplete(boolean)),
    clearTempData: () => dispatch(clearTempData()),
    setPassword: password => dispatch(setPassword(password)),
});

WalletResetRequirePassword.propTypes = {
    password: PropTypes.string.isRequired,
    navigator: PropTypes.object.isRequired,
    resetWallet: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletResetRequirePassword);
