import toUpper from 'lodash/toUpper'
import { translate } from 'react-i18next'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text, Image, StatusBar, BackHandler } from 'react-native'
import { Navigation } from 'react-native-navigation'
import Fonts from '../theme/Fonts'
import OnboardingButtons from '../components/onboardingButtons.js'
import COLORS from '../theme/Colors'
import GENERAL from '../theme/general'

import infoImagePath from 'iota-wallet-shared-modules/images/info.png'
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png'
import { width, height } from '../util/dimensions'
import THEMES from '../theme/themes'
import { connect } from 'react-redux'

class WalletResetConfirmation extends Component {
    constructor() {
        super()

        this.goBack = this.goBack.bind(this)
        this.requirePassword = this.requirePassword.bind(this)
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.goBack()
            return true
        })
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress')
    }

    navigateTo(url) {
        this.props.navigator.push({
            screen: url,
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
            },
            animated: false,
        })
    }

    goBack() {
        // FIXME: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
            },
        })
    }

    requirePassword() {
        this.navigateTo('walletResetRequirePassword')
    }

    render() {
        const { t } = this.props
        const backgroundColor = { backgroundColor: THEMES.getHSL(this.props.backgroundColor) }
        const negativeColor = { color: THEMES.getHSL(this.props.negativeColor) }

        return (
            <View style={[styles.container, backgroundColor]}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topWrapper}>
                    <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                </View>
                <View style={styles.midWrapper}>
                    <View style={styles.subHeaderWrapper}>
                        <Text style={[styles.subHeaderText, negativeColor]}>
                            {t('walletResetConfirmation:cannotUndo')}
                        </Text>
                    </View>
                    <View style={styles.infoTextWrapper}>
                        <Image source={infoImagePath} style={styles.infoIcon} />
                        <Text style={styles.infoText}>
                            <Text style={styles.infoTextLight}>{t('walletResetConfirmation:infoTextOne')}</Text>
                            <Text style={styles.infoTextRegular}>{` ${t('walletResetConfirmation:infoTextTwo')}`}</Text>
                            <Text style={styles.infoTextLight}>{` ${t('walletResetConfirmation:infoTextThree')}`}</Text>
                            <Text style={styles.infoTextRegular}>{` ${t(
                                'walletResetConfirmation:infoTextFour',
                            )}`}</Text>
                            <Text style={styles.infoTextLight}>{` ${t('walletResetConfirmation:infoTextFive')}`}</Text>
                        </Text>
                    </View>
                    <View style={styles.confirmationTextWrapper}>
                        <Text style={styles.confirmationText}>{t('global:continue?')}</Text>
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
        )
    }
}

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
        fontFamily: Fonts.secondary,
        fontSize: width / 22.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextWrapper: {
        borderColor: COLORS.white,
        borderWidth: 1,
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 1.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 30,
        paddingVertical: height / 35,
        borderStyle: 'dotted',
    },
    infoText: {
        color: COLORS.white,
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
        fontFamily: COLORS.secondary,
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
        color: COLORS.white,
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
})

WalletResetConfirmation.propTypes = {
    navigator: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    backgroundColor: state.settings.theme.backgroundColor,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
})

export default translate(['global'])(connect(mapStateToProps)(WalletResetConfirmation))
