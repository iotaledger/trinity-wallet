import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/iota/utils';
import OnboardingButtons from '../containers/OnboardingButtons';
import InfoBox from '../components/InfoBox';
import { Icon } from '../theme/icons.js';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 4,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    greetingTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 1.5,
    },
    greetingText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    questionText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});

/** Wallet setup screen component */
class WalletSetup extends Component {
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

    onYesPress() {
        const { theme } = this.props;

        this.props.navigator.push({
            screen: 'enterSeed',
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

    onNoPress() {
        const { theme } = this.props;
        this.props.navigator.push({
            screen: 'newSeedSetup',
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

    render() {
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                <DynamicStatusBar backgroundColor={theme.body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={theme.body.color} />
                </View>
                <View style={styles.midContainer}>
                    <View style={{ flex: 0.7 }} />
                    <View style={styles.greetingTextContainer}>
                        <Text style={[styles.greetingText, textColor]}>{t('okay')}</Text>
                    </View>
                    <View style={{ flex: 0.5 }} />
                    <InfoBox
                        body={theme.body}
                        text={
                            <View>
                                <Text style={[styles.infoText, textColor]}>
                                    {t('seedExplanation', { maxLength: MAX_SEED_LENGTH })}
                                </Text>
                                <Trans i18nKey="walletSetup:explanation">
                                    <Text style={[styles.infoText, textColor]}>
                                        <Text style={styles.infoTextLight}>
                                            You can use it to access your funds from
                                        </Text>
                                        <Text style={styles.infoTextRegular}> any wallet</Text>
                                        <Text style={styles.infoTextLight}>, on</Text>
                                        <Text style={styles.infoTextRegular}> any device</Text>
                                        <Text style={styles.infoTextLight}>
                                            . But if you lose your seed, you also lose your IOTA.
                                        </Text>
                                    </Text>
                                </Trans>
                                <Text style={[styles.infoText, textColor]}>{t('keepSafe')}</Text>
                            </View>
                        }
                    />
                    <View style={{ flex: 0.5 }} />
                    <View style={styles.greetingTextContainer}>
                        <Text style={[styles.questionText, textColor]}>{t('doYouAlreadyHaveASeed')}</Text>
                    </View>
                    <View style={{ flex: 0.5 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onNoPress()}
                        onRightButtonPress={() => this.onYesPress()}
                        leftText={t('global:no')}
                        rightText={t('global:yes')}
                        leftButtonTestID="walletSetup-no"
                        rightButtonTestID="walletSetup-yes"
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default translate(['walletSetup', 'global'])(connect(mapStateToProps)(WalletSetup));
