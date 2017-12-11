import toUpper from 'lodash/toUpper';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import Colors from '../theme/Colors';
import Fonts from '../theme/Fonts';
import OnboardingButtons from '../components/onboardingButtons.js';
import COLORS from '../theme/Colors';

import { Keyboard } from 'react-native';

import infoImagePath from 'iota-wallet-shared-modules/images/info.png';
import blueBackgroundImagePath from 'iota-wallet-shared-modules/images/bg-blue.png';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import { width, height } from '../util/dimensions';

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
                navBarTransparent: true,
                screenBackgroundImageName: 'bg-blue.png',
                screenBackgroundColor: Colors.brand.primary,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    goBack() {
        // FIXME: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundImageName: 'bg-blue.png',
                    screenBackgroundColor: '#102e36',
                },
                overrideBackPress: true,
            },
        });
    }

    requirePassword() {
        this.navigateTo('walletResetRequirePassword');
    }

    render() {
        const { t } = this.props;

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topWrapper}>
                    <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                </View>
                <View style={styles.midWrapper}>
                    <View style={styles.subHeaderWrapper}>
                        <Text style={styles.subHeaderText}>{toUpper('this action cannot be undone.')}</Text>
                    </View>
                    <View style={styles.infoTextWrapper}>
                        <Image source={infoImagePath} style={styles.infoIcon} />
                        <Text style={styles.infoText}>
                            <Text style={styles.infoTextLight}>All your wallet data including your</Text>
                            <Text style={styles.infoTextRegular}> seeds, password</Text>
                            <Text style={styles.infoTextLight}> and</Text>
                            <Text style={styles.infoTextRegular}> other account information</Text>
                            <Text style={styles.infoTextLight}> will be lost.</Text>
                        </Text>
                    </View>
                    <View style={styles.confirmationTextWrapper}>
                        <Text style={styles.confirmationText}>Are you sure you want to continue?</Text>
                    </View>
                </View>
                <View style={styles.bottomWrapper}>
                    <OnboardingButtons
                        onLeftButtonPress={this.goBack}
                        onRightButtonPress={this.requirePassword}
                        leftText={'NO'}
                        rightText={'YES'}
                    />
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
    topWrapper: {
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midWrapper: {
        flex: 2.1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomWrapper: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    subHeaderWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width / 10,
    },
    subHeaderText: {
        color: Colors.orangeDark,
        fontFamily: Fonts.secondary,
        fontSize: width / 22.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextWrapper: {
        borderColor: Colors.white,
        borderWidth: 1,
        borderRadius: 15,
        width: width / 1.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 30,
        paddingVertical: height / 35,
        borderStyle: 'dotted',
    },
    infoText: {
        color: Colors.white,
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: Fonts.tertiary,
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: Colors.secondary,
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    infoIcon: {
        width: width / 20,
        height: width / 20,
    },
    confirmationTextWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmationText: {
        color: Colors.white,
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
});

WalletResetConfirmation.propTypes = {
    navigator: PropTypes.object.isRequired,
};
