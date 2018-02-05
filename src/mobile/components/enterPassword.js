import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    Keyboard,
    BackHandler,
    AppState,
} from 'react-native';
import CustomTextInput from '../components/customTextInput';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';
import { connect } from 'react-redux';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { setLoginPasswordField } from 'iota-wallet-shared-modules/actions/ui';
import { setUserActivity } from 'iota-wallet-shared-modules/actions/tempAccount';

const styles = StyleSheet.create({
    topContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4.8,
        alignItems: 'center',
        paddingTop: height / 5,
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 8,
    },
    title: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    loginButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    loginText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
});

class EnterPassword extends Component {
    state = {
        label: '',
        appState: AppState.currentState,
    };

    componentDidMount() {
        BackHandler.addEventListener('loginBackPress', () => {
            RNExitApp.exitApp();
            return true;
        });
        AppState.addEventListener('change', this.handleAppStateChange);
        this.activateFingerPrintScanner();
        this.handleChangedLogin();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('loginBackPress');
        AppState.removeEventListener('change', this.handleAppStateChange);
        FingerprintScanner.release();
    }

    handleAppStateChange = nextAppState => {
        if (this.state.appState.match(/background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!');
            this.activateFingerPrintScanner();
        }
        this.setState({ appState: nextAppState });
    };

    handleAuthenticationAttempted = error => {
        this.props.generateAlert('error', 'Fingerprint authentication', 'Authentication unsuccessful');
    };

    handleChangeText = password => this.props.setLoginPasswordField(password);

    handleChangedLogin = () => {
        const { isFingerprintEnabled, t } = this.props;
        if (isFingerprintEnabled) {
            this.setState({
                label: t('global:passwordOrFingerprint'),
            });
            /*
            FingerprintScanner.authenticate({
                onAttempt: this.handleAuthenticationAttempted,
                description: t('fingerprintEnable:instructions'),
            });
            */
        } else {
            this.setState({
                label: t('global:password'),
            });
        }
    };

    activateFingerPrintScanner() {
        const { t } = this.props;
        console.log('Starting fingerprint');
        const { firstUse, selectedAccount, is2FAEnabled, isFingerprintEnabled } = this.props;
        if (isFingerprintEnabled) {
            FingerprintScanner.authenticate({
                description: t('fingerprintEnable:instructions'),
                onAttempt: this.handleAuthenticationAttempted,
            })
                .then(() => {
                    this.props.setUserActivity({ inactive: false });
                })
                .catch(error => {
                    this.setState({ errorMessage: error.message });
                });
        }
    }

    handleLogin = () => {
        const { onLoginPress, password } = this.props;
        onLoginPress(password);
    };

    render() {
        const { t, positiveColor, secondaryBackgroundColor, textColor, negativeColor } = this.props;
        const borderColor = { borderColor: positiveColor };
        const positiveTextColor = { color: positiveColor };
        const iotaLogoImagePath = secondaryBackgroundColor === 'white' ? whiteIotaImagePath : blackIotaImagePath;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <Image source={iotaLogoImagePath} style={styles.iotaLogo} />
                    </View>
                    <View style={styles.midContainer}>
                        <CustomTextInput
                            label={this.state.label}
                            onChangeText={this.handleChangeText}
                            containerStyle={{ width: width / 1.36 }}
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            secureTextEntry
                            onSubmitEditing={this.handleLogin}
                            secondaryBackgroundColor={secondaryBackgroundColor}
                            negativeColor={negativeColor}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={this.handleLogin}>
                            <View style={[styles.loginButton, borderColor]}>
                                <Text style={[styles.loginText, positiveTextColor]}>{t('login')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

EnterPassword.propTypes = {
    onLoginPress: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    positiveColor: PropTypes.string.isRequired,
    textColor: PropTypes.object.isRequired,
    secondaryBackgroundColor: PropTypes.string.isRequired,
    negativeColor: PropTypes.string.isRequired,
    isFingerprintEnabled: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
    isFingerprintEnabled: state.account.isFingerprintEnabled,
});

const mapDispatchToProps = {
    setLoginPasswordField,
    setUserActivity,
};

export default translate(['login', 'global', 'fingerprintEnable'])(
    connect(mapStateToProps, mapDispatchToProps)(EnterPassword),
);
