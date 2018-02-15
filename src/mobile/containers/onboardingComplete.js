import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import balloonsImagePath from 'iota-wallet-shared-modules/images/balloons.png';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import WithBackPressCloseApp from '../components/withBackPressCloseApp';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

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
        borderRadius: GENERAL.borderRadius,
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
        width,
        height: width,
        position: 'absolute',
        top: -height / 10,
    },
});

class OnboardingComplete extends Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    onNextPress() {
        this.props.navigator.push({
            screen: 'loading',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: COLORS.backgroundGreen,
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
                        <Text style={styles.infoText}>{t('walletReady')}</Text>
                    </View>
                    <Image source={balloonsImagePath} style={styles.party} />
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.onNextPress()}>
                        <View style={styles.nextButton}>
                            <Text style={styles.nextText}>{t('global:next')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

export default WithBackPressCloseApp()(translate(['onboardingComplete', 'global'])(OnboardingComplete));
