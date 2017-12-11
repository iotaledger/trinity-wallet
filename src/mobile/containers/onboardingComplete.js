import React from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import COLORS from '../theme/Colors';

import { width, height } from '../util/dimensions';
import balloonsImagePath from 'iota-wallet-shared-modules/images/balloons.png';
import blueBackgroundImagePath from 'iota-wallet-shared-modules/images/bg-blue.png';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';

class OnboardingComplete extends React.Component {
    onNextPress() {
        this.props.navigator.push({
            screen: 'login',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    render() {
        const { t } = this.props;

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoText}>
                            The wallet is now set up and ready to use. If you need to make any changes in the future,
                            look in the Settings menu.
                        </Text>
                    </View>
                    <Image source={balloonsImagePath} style={styles.party} />
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={event => this.onNextPress()}>
                        <View style={styles.nextButton}>
                            <Text style={styles.nextText}>NEXT</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundGreen,
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
        position: 'absolute',
        top: -height / 10,
    },
});

export default OnboardingComplete;
