import React, { Component } from 'react';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { setFingerprintStatus } from 'iota-wallet-shared-modules/actions/account';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, Keyboard, BackHandler, AppState } from 'react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { Navigation } from 'react-native-navigation';
import Fonts from '../theme/Fonts';
import OnboardingButtons from '../components/onboardingButtons';
import StatefulDropdownAlert from './statefulDropdownAlert';
// import keychain, { hasDuplicateSeed, hasDuplicateAccountName, storeSeedInKeychain } from '../util/keychain';
import { width, height } from '../util/dimensions';
import THEMES from '../theme/themes';
import { translate } from 'react-i18next';

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
    },
    bottomWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    subHeaderText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
        marginBottom: height / 8,
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
});

class FingerprintEnable extends Component {
    static propTypes = {
        backgroundColor: PropTypes.object.isRequired,
        generateAlert: PropTypes.func.isRequired,
        setFingerprintStatus: PropTypes.func.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.goBack = this.goBack.bind(this);
        this.enableFingerprint = this.enableFingerprint.bind(this);
        this.state = {
            code: '',
            authkey: authenticator.generateKey(),
            currentFingerStatusInfo: 'No finger read',
            currentFingerStatus: 0,
            appState: AppState.currentState,
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('newSeedSetupBackPress', () => {
            this.goBack();
            return true;
        });
        AppState.addEventListener('change', this.handleAppStateChange);
        this.activateFingerPrintScanner();
    }
    componentWillReceiveProps(newProps) {
        if (newProps.hasErrorFetchingAccountInfoOnLogin && !this.props.hasErrorFetchingAccountInfoOnLogin) {
            this._showModal();
        }
    }
    componentWillUnmount() {
        FingerprintScanner.release();
    }
    handleAppStateChange = nextAppState => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!');
            this.activateFingerPrintScanner();
        }
        this.setState({ appState: nextAppState });
    };
    activateFingerPrintScanner() {
        const { t } = this.props;
        FingerprintScanner.authenticate({
            onAttempt: this.handleAuthenticationAttempted,
            description: t('instructions'),
        })
            .then(() => {
                //this.props.generateAlert('success', 'Fingerprint authentication', 'Authenticated successfully');
                this.setState({
                    currentFingerStatusInfo: 'Authenticated successfully',
                    currentFingerStatus: 1,
                });
            })
            .catch(error => {
                this.setState({ errorMessage: error.message });
            });
        FingerprintScanner.isSensorAvailable().catch(error => this.setState({ errorMessage: error.message }));
    }
    handleAuthenticationAttempted = () => {
        this.setState({
            currentFingerStatusInfo: 'Invalding fingerprint',
        }); //this.props.generateAlert('error', 'Fingerprint authentication', 'Authenticated unsuccessfully');
    };

    goBack() {
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
            },
            appStyle: {
                orientation: 'portrait',
            },
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
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
            },
        });
    }

    enableFingerprint() {
        const { t } = this.props;
        if (this.state.currentFingerStatus) {
            this.props.setFingerprintStatus(true);
            this.navigateToHome();
            this.timeout = setTimeout(() => {
                this.props.generateAlert(
                    'success',
                    t('fingerprintAuthEnabled'),
                    t('fingerprintAuthEnabledExplanation'),
                );
            }, 300);
        } else {
            this.props.generateAlert(
                'error',
                t('fingerprintAuthNotEnabled'),
                t('fingerprintAuthNotEnabledExplanation'),
            );
        }
    }
    render() {
        const { t, secondaryBackgroundColor } = this.props;
        const backgroundColor = { backgroundColor: THEMES.getHSL(this.props.backgroundColor) };
        const textColor = { color: secondaryBackgroundColor };
        const iotaLogoImagePath = secondaryBackgroundColor === 'white' ? whiteIotaImagePath : blackIotaImagePath;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.container, backgroundColor]}>
                    <DynamicStatusBar textColor={secondaryBackgroundColor} />
                    <StatefulDropdownAlert />
                    <View style={styles.topWrapper}>
                        <Image source={iotaLogoImagePath} style={styles.iotaLogo} />
                    </View>
                    <View style={styles.midWrapper}>
                        <View style={{ flex: 0.25 }} />
                        <Text style={[styles.subHeaderText, textColor]}>{t('instructions')}</Text>
                        <Text style={[styles.subHeaderText, textColor]}>
                            {t('status')}: {this.state.currentFingerStatusInfo}
                        </Text>
                    </View>
                    <View style={styles.bottomWrapper}>
                        <OnboardingButtons
                            onLeftButtonPress={this.goBack}
                            onRightButtonPress={this.enableFingerprint}
                            leftText={t('global:back')}
                            rightText={t('global:done')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
const mapDispatchToProps = {
    setFingerprintStatus,
    generateAlert,
};

const mapStateToProps = state => ({
    backgroundColor: state.settings.theme.backgroundColor,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

export default translate(['fingerprintEnable', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(FingerprintEnable),
);
