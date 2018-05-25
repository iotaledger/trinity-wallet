import { translate, Trans } from 'react-i18next';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import WithBackPressGoToHome from '../components/BackPressGoToHome';
import { width, height } from '../utils/dimensions';
import Fonts from '../theme/fonts';
import OnboardingButtons from '../containers/OnboardingButtons';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { Icon } from '../theme/icons.js';
import InfoBox from '../components/InfoBox';
import GENERAL from '../theme/general';

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
        paddingTop: height / 16,
    },
    midWrapper: {
        flex: 2.1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomWrapper: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    subHeaderWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width / 10,
    },
    subHeaderText: {
        fontSize: GENERAL.fontSize4,
        fontFamily: 'SourceSansPro-Regular',
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoText: {
        fontSize: GENERAL.fontSize3,
        fontFamily: 'SourceSansPro-Light',
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: Fonts.tertiary,
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    confirmationText: {
        fontFamily: Fonts.secondary,
        fontSize: GENERAL.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/**
 * Wallet Reset Confirmation screen component
 */
class WalletResetConfirmation extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.goBack = this.goBack.bind(this);
        this.requirePassword = this.requirePassword.bind(this);
    }

    navigateTo(url) {
        const { theme } = this.props;

        this.props.navigator.push({
            screen: url,
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: theme.body.bg,
                drawUnderStatusBar: true,
                statusBarColor: theme.body.bg,
            },
            animated: false,
        });
    }

    goBack() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    requirePassword() {
        this.navigateTo('walletResetRequirePassword');
    }

    render() {
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };
        const backgroundColor = { backgroundColor: theme.body.bg };
        const primaryColor = { color: theme.negative.color };

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar backgroundColor={theme.body.bg} />
                <View style={styles.topWrapper}>
                    <Icon name="iota" size={width / 8} color={theme.body.color} />
                </View>
                <View style={styles.midWrapper}>
                    <View style={{ flex: 0.2 }} />
                    <InfoBox
                        body={theme.body}
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
                    />
                    <View style={{ flex: 0.4 }} />
                    <Text style={[styles.subHeaderText, primaryColor]}>{t('walletResetConfirmation:cannotUndo')}</Text>
                    <View style={{ flex: 0.2 }} />
                    <Text style={[styles.confirmationText, textColor]}>{t('global:continue?')}</Text>
                </View>
                <View style={styles.bottomWrapper}>
                    <OnboardingButtons
                        onLeftButtonPress={this.goBack}
                        onRightButtonPress={this.requirePassword}
                        leftButtonText={t('global:noLowerCase')}
                        rightButtonText={t('global:yesLowerCase')}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default WithBackPressGoToHome()(
    translate(['walletResetConfirmation', 'global'])(connect(mapStateToProps)(WalletResetConfirmation)),
);
