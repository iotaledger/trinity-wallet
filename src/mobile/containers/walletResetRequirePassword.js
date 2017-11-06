import toUpper from 'lodash/toUpper';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { deleteFromKeyChain } from '../../shared/libs/cryptography';
import { resetWallet } from '../../shared/actions/app';
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
        this.props.navigator.push({
            screen: 'languageSetup',
            navigatorStyle: {
                navBarHidden: true,
                screenBackgroundImageName: 'bg-green.png',
                screenBackgroundColor: Colors.brand.primary,
            },
            animated: false,
        });
    }

    resetWallet() {
        const isAuthenticated = this.isAuthenticated();
        const { password, resetWallet } = this.props;
        const dropdown = DropdownHolder.getDropdown();

        if (isAuthenticated) {
            deleteFromKeyChain(password);
            resetWallet();

            this.redirectToInitialScreen();
        } else {
            dropdown.alertWithType(
                'error',
                'Unrecognised password',
                'The password was not recognised. Please try again.',
            );
        }
    }

    render() {
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                            <View style={styles.headerWrapper}>
                                <Text style={styles.header}>{toUpper('authenticate')}</Text>
                            </View>
                        </View>
                        <View style={styles.midWrapper}>
                            <Text style={styles.generalText}>
                                Please enter your password to continue resetting your wallet.
                            </Text>
                            <TextField
                                style={styles.textField}
                                labelTextStyle={styles.textFieldLabel}
                                labelFontSize={height / 55}
                                fontSize={height / 40}
                                baseColor={Colors.white}
                                label="Password"
                                tintColor={Colors.orangeDark}
                                autoCapitalize="none"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically={true}
                                returnKeyType="done"
                                value={this.state.password}
                                onChangeText={password => this.setState({ password })}
                                containerStyle={styles.textFieldContainer}
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
            </ImageBackground>
        );
    }
}

const onboardingButtonsOverride = StyleSheet.create({
    rightButton: {
        borderColor: Colors.redLight,
    },
    rightText: {
        color: Colors.redLight,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#102e36',
    },
    topWrapper: {
        flex: 1.6,
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
    headerWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: height / 8,
        paddingTop: height / 35,
    },
    header: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    generalText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        paddingHorizontal: width / 5,
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
});

const mapStateToProps = state => ({
    password: state.iota.password,
});

const mapDispatchToProps = dispatch => ({
    resetWallet: () => dispatch(resetWallet()),
});

WalletResetRequirePassword.propTypes = {
    password: PropTypes.string.isRequired,
    navigator: PropTypes.object.isRequired,
    resetWallet: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletResetRequirePassword);
