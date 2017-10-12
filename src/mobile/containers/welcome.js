import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Image, ImageBackground, StatusBar } from 'react-native';

const { height, width } = Dimensions.get('window');

class Welcome extends React.Component {
    constructor(props) {
        super(props);
    }

    onNextPress() {
        this.props.navigator.push({
            screen: 'walletSetup',
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
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>WELCOME</Text>
                    </View>
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTextLight}>Thank you for downloading the IOTA wallet.</Text>
                        <Text style={styles.infoTextLight}>
                            We will spend the next few minutes setting up your wallet.
                        </Text>
                        <Text style={styles.infoTextRegular}>
                            You may be tempted to skip some steps, but we urge you to follow the complete process.
                        </Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={event => this.onNextPress()}>
                        <View style={styles.nextButton}>
                            <Text style={styles.nextText}>NEXT</Text>
                        </View>
                    </TouchableOpacity>
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
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22
    },
    midContainer: {
        flex: 2.5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: height / 10
    },
    bottomContainer: {
        flex: 1,
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
    nextButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 16,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    nextText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        backgroundColor: 'transparent'
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5
    },
    infoTextContainer: {
        paddingHorizontal: width / 9,
        alignItems: 'center'
    },
    infoTextLight: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 25,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center'
    },
    infoTextRegular: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 25,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center'
    }
});

export default Welcome;
