import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Image, ImageBackground, StatusBar } from 'react-native';

const { height, width } = Dimensions.get('window');

class OnboardingComplete extends React.Component {
    onNextPress() {
        this.props.navigator.push({
            screen: 'login',
            navigatorStyle: {
                navBarHidden: true,
                screenBackgroundImageName: 'bg-green.png',
                screenBackgroundColor: '#102e36',
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
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoText}>
                            The wallet is now set up and ready to use. If you need to make any changes in the future,
                            look in the Tools menu.
                        </Text>
                    </View>
                    <Image source={require('../../shared/images/party.png')} style={styles.party} />
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
        backgroundColor: '#102e36',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    nextButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    nextText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    infoTextContainer: {
        paddingHorizontal: width / 8,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: height / 6,
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        textAlign: 'center',
        lineHeight: height / 30,
    },
    party: {
        justifyContent: 'center',
        width: width,
        height: width,
        opacity: 0.03,
        position: 'absolute',
        top: -height / 40,
    },
});

export default OnboardingComplete;
