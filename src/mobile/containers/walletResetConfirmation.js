import { translate, Trans } from 'react-i18next';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, Image, BackHandler } from 'react-native';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { width, height } from '../util/dimensions';
import Fonts from '../theme/Fonts';
import OnboardingButtons from '../components/onboardingButtons';
import DynamicStatusBar from '../components/dynamicStatusBar';

import InfoBox from '../components/infoBox';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: width / 22.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoText: {
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: Fonts.tertiary,
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
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

class WalletResetConfirmation extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
        negativeColor: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.goBack = this.goBack.bind(this);
        this.requirePassword = this.requirePassword.bind(this);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.goBack();
            return true;
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress');
    }

    navigateTo(url) {
        this.props.navigator.push({
            screen: url,
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: this.props.backgroundColor,
            },
            animated: false,
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
                    screenBackgroundColor: this.props.backgroundColor,
                },
            },
            appStyle: {
                orientation: 'portrait',
            },
        });
    }

    requirePassword() {
        this.navigateTo('walletResetRequirePassword');
    }

    render() {
        const { t, secondaryBackgroundColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const backgroundColor = { backgroundColor: this.props.backgroundColor };
        const negativeColor = { color: this.props.negativeColor };
        const iotaLogoImagePath = secondaryBackgroundColor === 'white' ? whiteIotaImagePath : blackIotaImagePath;

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                <View style={styles.topWrapper}>
                    <Image source={iotaLogoImagePath} style={styles.iotaLogo} />
                </View>
                <View style={styles.midWrapper}>
                    <View style={styles.subHeaderWrapper}>
                        <Text style={[styles.subHeaderText, negativeColor]}>
                            {t('walletResetConfirmation:cannotUndo')}
                        </Text>
                    </View>
                    <InfoBox
                        text={
                            <Trans i18nKey="walletResetConfirmation:warning">
                                <Text style={[styles.infoText, textColor]}>
                                    <Text style={styles.infoTextLight}>All of your wallet data including your </Text>
                                    <Text style={styles.infoTextRegular}>seeds, password,</Text>
                                    <Text style={styles.infoTextLight}> and </Text>
                                    <Text style={styles.infoTextRegular}>other account information</Text>
                                    <Text style={styles.infoTextLight}> will be lost.</Text>
                                </Text>
                            </Trans>
                        }
                        secondaryBackgroundColor={secondaryBackgroundColor}
                    />
                    <View style={styles.confirmationTextWrapper}>
                        <Text style={[styles.confirmationText, textColor]}>{t('global:continue?')}</Text>
                    </View>
                </View>
                <View style={styles.bottomWrapper}>
                    <OnboardingButtons
                        onLeftButtonPress={this.goBack}
                        onRightButtonPress={this.requirePassword}
                        leftText={t('global:no')}
                        rightText={t('global:yes')}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    backgroundColor: state.settings.theme.backgroundColor,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

export default translate(['walletResetConfirmation', 'global'])(connect(mapStateToProps)(WalletResetConfirmation));
