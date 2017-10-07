import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { connect } from 'react-redux';

const { height, width } = Dimensions.get('window');

class WalletSetup extends React.Component {
    constructor(props) {
        super(props);
    }

    onYesClick() {
        this.props.navigator.push({
            screen: 'enterSeed',
            navigatorStyle: {
                navBarHidden: true,
                screenBackgroundImageName: 'bg-green.png',
                screenBackgroundColor: '#102e36'
            },
            animated: false
        });
    }
    onNoClick() {
        this.props.navigator.push({
            screen: 'newSeedSetup',
            navigatorStyle: {
                navBarHidden: true,
                screenBackgroundImageName: 'bg-green.png',
                screenBackgroundColor: '#102e36'
            },
            animated: false
        });
    }

    render() {
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <View style={styles.topContainer}>
                    <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>WALLET SETUP</Text>
                    </View>
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
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity onPress={event => this.onYesClick()}>
                            <View style={styles.yesButton}>
                                <Text style={styles.yesText}>YES - I have seed</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity onPress={event => this.onNoClick()}>
                            <View style={styles.noButton}>
                                <Text style={styles.noText}>NO - I need a new seed</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: '#102e36'
    },
    topContainer: {
        flex: 1.9,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22
    },
    midContainer: {
        flex: 1.1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 10
    },
    bottomContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 14
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 35
    },
    title: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent'
    },
    infoTextContainer: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 15,
        width: width / 1.9,
        height: height / 3.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 30,
        borderStyle: 'dotted',
        paddingTop: height / 60
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 33.75,
        textAlign: 'center',
        paddingTop: height / 70,
        backgroundColor: 'transparent'
    },
    infoTextLight: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 33.75,
        backgroundColor: 'transparent'
    },
    infoTextRegular: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 33.75,
        backgroundColor: 'transparent'
    },
    infoIcon: {
        width: width / 20,
        height: width / 20
    },
    greetingTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width / 4.5,
        paddingTop: height / 13
    },
    greetingText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23.5,
        textAlign: 'center',
        backgroundColor: 'transparent'
    },
    questionText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23.5,
        textAlign: 'center',
        paddingTop: height / 40,
        backgroundColor: 'transparent'
    },
    buttonsContainer: {
        alignItems: 'center',
        paddingBottom: height / 30
    },
    yesButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 1.65,
        height: height / 17,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    noButton: {
        borderColor: '#F7D002',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 1.65,
        height: height / 17,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    yesText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        backgroundColor: 'transparent'
    },
    noText: {
        color: '#F7D002',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        backgroundColor: 'transparent'
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5
    }
});

const mapStateToProps = state => ({
    account: state.account
});

export default WalletSetup;
