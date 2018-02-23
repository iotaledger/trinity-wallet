import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { setFingerprintStatus } from 'iota-wallet-shared-modules/actions/account';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import whiteFingerprintImagePath from 'iota-wallet-shared-modules/images/fingerprint-white.png';
import blackFingerprintImagePath from 'iota-wallet-shared-modules/images/fingerprint-black.png';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import WithBackPressGoToHome from '../components/withBackPressGoToHome';
import DynamicStatusBar from '../components/dynamicStatusBar';
import Fonts from '../theme/Fonts';
import StatefulDropdownAlert from './statefulDropdownAlert';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
        width,
    },
    midWrapper: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 10,
    },
    bottomWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    subHeaderText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    fingerprint: {
        height: width / 5,
        width: width / 5,
    },
    backButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    backText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
});

class FingerprintEnable extends Component {
    static propTypes = {
        backgroundColor: PropTypes.string.isRequired,
        generateAlert: PropTypes.func.isRequired,
        setFingerprintStatus: PropTypes.func.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
        isFingerprintEnabled: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.navigateToHome = this.navigateToHome.bind(this);
    }

    componentWillUnmount() {
        FingerprintScanner.release();
    }

    onFingerprintPress() {
        const { isFingerprintEnabled } = this.props;

        if (isFingerprintEnabled) {
            this.deactivateFingerPrintScanner();
        } else {
            this.activateFingerPrintScanner();
        }
    }

    activateFingerPrintScanner() {
        const { t } = this.props;
        FingerprintScanner.isSensorAvailable()
            .then(
                FingerprintScanner.authenticate({
                    description: t('instructionsEnable'),
                    onAttempt: this.handleAuthenticationAttempted,
                })
                    .then(() => {
                        this.props.setFingerprintStatus(true);
                        this.timeout = setTimeout(() => {
                            this.props.generateAlert(
                                'success',
                                t('fingerprintAuthEnabled'),
                                t('fingerprintAuthEnabledExplanation'),
                            );
                        }, 300);
                    })
                    .catch((err) => {
                        this.props.generateAlert(
                            'error',
                            t('fingerprintAuthFailed'),
                            t('fingerprintAuthFailedExplanation'),
                        );
                        console.log(err);
                    }),
            )
            .catch(() => {
                this.props.generateAlert('error', t('fingerprintUnavailable'), t('fingerprintUnavailableExplanation'));
            });
    }

    deactivateFingerPrintScanner() {
        const { t } = this.props;
        FingerprintScanner.authenticate({
            description: t('instructionsDisable'),
        })
            .then(() => {
                this.props.setFingerprintStatus(false);
                this.timeout = setTimeout(() => {
                    this.props.generateAlert(
                        'success',
                        t('fingerprintAuthDisabled'),
                        t('fingerprintAuthDisabledExplanation'),
                    );
                }, 300);
            })
            .catch(() => {
                this.props.generateAlert('error', t('fingerprintAuthFailed'), t('fingerprintAuthFailedExplanation'));
            });
    }

    navigateToHome() {
        // FIXME: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: this.props.backgroundColor,
                    drawUnderStatusBar: true,
                    statusBarColor: this.props.backgroundColor,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: false,
            },
        });
    }

    render() {
        const { t, secondaryBackgroundColor, isFingerprintEnabled } = this.props;
        const backgroundColor = { backgroundColor: this.props.backgroundColor };
        const textColor = { color: secondaryBackgroundColor };
        const isWhite = secondaryBackgroundColor === 'white';
        const iotaLogoImagePath = isWhite ? whiteIotaImagePath : blackIotaImagePath;
        const fingerprintImagePath = isWhite ? whiteFingerprintImagePath : blackFingerprintImagePath;
        const authenticationStatus = isFingerprintEnabled ? t('enabled') : t('disabled');
        const instructions = isFingerprintEnabled ? t('buttonInstructionsDisable') : t('buttonInstructionsEnable');

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.container, backgroundColor]}>
                    <DynamicStatusBar
                        textColor={secondaryBackgroundColor}
                        backgroundColor={this.props.backgroundColor}
                    />
                    <View style={styles.topWrapper}>
                        <Image source={iotaLogoImagePath} style={styles.iotaLogo} />
                    </View>
                    <View style={styles.midWrapper}>
                        <View style={{ flex: 0.25 }} />
                        <Text style={[styles.subHeaderText, textColor]}>{instructions}</Text>
                        <View style={{ flex: 0.2 }} />
                        <TouchableOpacity onPress={() => this.onFingerprintPress()}>
                            <Image source={fingerprintImagePath} style={styles.fingerprint} />
                        </TouchableOpacity>
                        <View style={{ flex: 0.2 }} />
                        <Text style={[styles.subHeaderText, textColor]}>
                            {t('status')}: {authenticationStatus}
                        </Text>
                    </View>
                    <View style={styles.bottomWrapper}>
                        <TouchableOpacity onPress={() => this.navigateToHome()}>
                            <View style={styles.backButton}>
                                <Text style={styles.backText}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <StatefulDropdownAlert />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
const mapDispatchToProps = {
    setFingerprintStatus,
    generateAlert,
};

const mapStateToProps = (state) => ({
    backgroundColor: state.settings.theme.backgroundColor,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
    isFingerprintEnabled: state.account.isFingerprintEnabled,
});

export default WithBackPressGoToHome()(
    translate(['fingerprintSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(FingerprintEnable)),
);
