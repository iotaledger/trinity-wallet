import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, Image, StatusBar } from 'react-native';
import OnboardingButtons from '../components/onboardingButtons';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import infoImagePath from 'iota-wallet-shared-modules/images/info-white.png';

import { width, height } from '../util/dimensions';

class WalletSetup extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
    };

    onYesPress() {
        this.props.navigator.push({
            screen: 'enterSeed',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: COLORS.backgroundGreen,
            },
            animated: false,
        });
    }

    onNoPress() {
        this.props.navigator.push({
            screen: 'newSeedSetup',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: COLORS.backgroundGreen,
            },
            animated: false,
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
                    <View style={styles.topMidContainer}>
                        <View style={styles.greetingTextContainer}>
                            <Text style={styles.greetingText}>{t('okay')}</Text>
                            <Text style={styles.questionText}>{t('doYouAlreadyHaveASeed')}</Text>
                        </View>
                    </View>
                    <View style={styles.bottomMidContainer}>
                        <View style={styles.infoTextContainer}>
                            <Image source={infoImagePath} style={styles.infoIcon} />
                            <Text style={styles.infoText}>{t('seedExplanation')}</Text>
                            <Text style={styles.infoText}>
                                <Text style={styles.infoTextLight}>{t('explanation1')}</Text>
                                <Text style={styles.infoTextRegular}>{t('explanation2')}</Text>
                                <Text style={styles.infoTextLight}>{t('explanation3')}</Text>
                                <Text style={styles.infoTextRegular}>{t('explanation4')}</Text>
                                <Text style={styles.infoTextLight}>{t('explanation5')}</Text>
                            </Text>
                            <Text style={styles.infoText}>{t('keepSafe')}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onNoPress()}
                        onRightButtonPress={() => this.onYesPress()}
                        leftText={t('global:no')}
                        rightText={t('global:yes')}
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
    topContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 3.7,
        alignItems: 'center',
    },
    topMidContainer: {
        flex: 0.65,
        justifyContent: 'flex-end',
    },
    bottomMidContainer: {
        flex: 1.35,
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    infoTextContainer: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 1.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 30,
        borderStyle: 'dotted',
        paddingVertical: height / 35,
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
        borderRadius: GENERAL.borderRadius,
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
        borderRadius: GENERAL.borderRadius,
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

export default translate(['walletSetup', 'global'])(WalletSetup);
