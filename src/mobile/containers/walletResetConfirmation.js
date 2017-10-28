import toUpper from 'lodash/toUpper';
import React, { Component } from 'react';
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
import OnboardingButtons from '../components/onboardingButtons.js';
import DropdownAlert from 'react-native-dropdownalert';
import { Keyboard } from 'react-native';

const { height, width } = Dimensions.get('window');

export default class WalletResetConfirmation extends Component {
    constructor() {
        super();

        this.goBack = this.goBack.bind(this);
        this.requirePassword = this.requirePassword.bind(this);
    }

    navigateTo(url) {
        this.props.navigator.push({
            screen: url,
            navigatorStyle: {
                navBarHidden: true,
                screenBackgroundImageName: 'bg-green.png',
                screenBackgroundColor: Colors.brand.primary,
            },
            animated: false,
        });
    }

    goBack() {
        this.props.changeHomeScreenRoute('settings');
        this.navigateTo('home');
    }

    requirePassword() {
        this.navigateTo('wallet-reset-require-password');
    }

    render() {
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                    <View
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: height / 8,
                            paddingTop: height / 45,
                        }}
                    >
                        <Text
                            style={{
                                color: Colors.white,
                                fontFamily: Fonts.primary,
                                fontSize: width / 23,
                                textAlign: 'center',
                                backgroundColor: 'transparent',
                            }}
                        >
                            {toUpper('wallet reset')}
                        </Text>
                    </View>
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingHorizontal: width / 8,
                            paddingTop: height / 30,
                        }}
                    >
                        <Text style={styles.greetingText}>This action cannot be undone.</Text>
                    </View>
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.infoTextContainer}>
                        <Image source={require('../../shared/images/info.png')} style={styles.infoIcon} />
                        <Text style={styles.infoText}>
                            <Text style={styles.infoTextLight}>All your data including your</Text>
                            <Text style={styles.infoTextRegular}> seeds</Text>
                            <Text style={styles.infoTextRegular}>, passwords</Text>
                            <Text style={styles.infoTextLight}> and</Text>
                            <Text style={styles.infoTextRegular}> other account information</Text>
                            <Text style={styles.infoTextLight}> will be lost.</Text>
                        </Text>
                    </View>
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingHorizontal: width / 8,
                            paddingTop: height / 25,
                        }}
                    >
                        <Text style={styles.questionText}>Are you sure you want to continue?</Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={this.goBack}
                        onRightButtonPress={this.requirePassword}
                        leftText={'NO'}
                        rightText={'YES'}
                    />
                </View>
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
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 2.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 8,
    },
    bottomContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 15,
    },
    infoTextContainer: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 15,
        width: width / 1.6,
        height: height / 5.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 30,
        borderStyle: 'dotted',
        paddingTop: height / 60,
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    infoIcon: {
        width: width / 20,
        height: width / 20,
    },
    greetingTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width / 8,
        paddingTop: height / 35,
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
        paddingTop: height / 40,
        backgroundColor: 'transparent',
    },
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    yesButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    yesText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    noButton: {
        borderColor: '#F7D002',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginRight: width / 10,
    },
    noText: {
        color: '#F7D002',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
});
