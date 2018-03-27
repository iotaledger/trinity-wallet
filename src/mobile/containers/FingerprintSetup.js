import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Image } from 'react-native';
import { setFingerprintStatus } from 'iota-wallet-shared-modules/actions/settings';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { translate } from 'react-i18next';
import tinycolor from 'tinycolor2';
import whiteFingerprintImagePath from 'iota-wallet-shared-modules/images/fingerprint-white.png';
import blackFingerprintImagePath from 'iota-wallet-shared-modules/images/fingerprint-black.png';
import WithBackPressGoToHome from '../components/BackPressGoToHome';
import DynamicStatusBar from '../components/DynamicStatusBar';
import Fonts from '../theme/fonts';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import { Icon } from '../theme/icons.js';

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
        paddingTop: height / 16,
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
    fingerprint: {
        height: width / 5,
        width: width / 5,
    },
});

/** Fingerprint enable component */
class FingerprintEnable extends Component {
    static propTypes = {
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Sets fingerprint security status
       * @param {boolean} - status
       */
        setFingerprintStatus: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Translation helper
        * @param {string} translationString - locale string identifier to be translated
        */
        t: PropTypes.func.isRequired,
        /** Determines whther fingerprint is enabled */
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
        const { theme } = this.props;

        // FIXME: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: theme.body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: theme.body.bg,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: false,
            },
        });
    }

    render() {
        const { t, isFingerprintEnabled, theme } = this.props;
        const backgroundColor = { backgroundColor: theme.body.bg };
        const textColor = { color: theme.body.color };
        const authenticationStatus = isFingerprintEnabled ? t('enabled') : t('disabled');
        const instructions = isFingerprintEnabled ? t('buttonInstructionsDisable') : t('buttonInstructionsEnable');
        const fingerprintImagePath = tinycolor(theme.body.bg).isDark()
            ? whiteFingerprintImagePath
            : blackFingerprintImagePath;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.container, backgroundColor]}>
                    <DynamicStatusBar backgroundColor={theme.body.bg} />
                    <View style={styles.topWrapper}>
                        <Icon name="iota" size={width / 8} color={theme.body.color} />
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
                            <View style={[styles.backButton, { borderColor: theme.secondary.color }]}>
                                <Text style={[styles.backText, { color: theme.secondary.color }]}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <StatefulDropdownAlert textColor={theme.body.color} backgroundColor={theme.body.bg} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
});

const mapDispatchToProps = {
    setFingerprintStatus,
    generateAlert,
};

export default WithBackPressGoToHome()(
    translate(['fingerprintSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(FingerprintEnable)),
);
