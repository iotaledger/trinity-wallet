import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Image, ImageBackground, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import OnboardingButtons from '../components/onboardingButtons.js';

const { height, width } = Dimensions.get('window');

class WalletSetup extends React.Component {
    onYesPress() {
        this.props.navigator.push({
            screen: 'enterSeed',
            navigatorStyle: {
                navBarHidden: true,
            },
            animated: false,
        });
    }
    onNoPress() {
        this.props.navigator.push({
            screen: 'newSeedSetup',
            navigatorStyle: {
                navBarHidden: true,
            },
            animated: false,
        });
    }

    render() {
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                    <View style={styles.greetingTextContainer}>
                        <Text style={styles.greetingText}>Okay. Lets set up your wallet!</Text>
                        <Text style={styles.questionText}>Do you already have a seed that you would like to use?</Text>
                    </View>
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.infoTextContainer}>
                        <Image source={require('../../shared/images/info.png')} style={styles.infoIcon} />
                        <Text style={styles.infoText}>
                            The IOTA seed is like a username and password to your account, combined into one string of
                            81 characters.
                        </Text>
                        <Text style={styles.infoText}>
                            <Text style={styles.infoTextLight}>You can use it to access your funds from</Text>
                            <Text style={styles.infoTextRegular}> any wallet</Text>
                            <Text style={styles.infoTextLight}>, on</Text>
                            <Text style={styles.infoTextRegular}> any device</Text>
                            <Text style={styles.infoTextLight}>
                                . But if you lose your seed, you also lose your IOTA.{' '}
                            </Text>
                        </Text>
                        <Text style={styles.infoText}>Please keep your seed safe.</Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onNoPress()}
                        onRightButtonPress={() => this.onYesPress()}
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
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 2.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 8,
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    infoTextContainer: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 15,
        width: width / 1.6,
        height: height / 3,
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
        paddingTop: height / 15,
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

export default WalletSetup;
