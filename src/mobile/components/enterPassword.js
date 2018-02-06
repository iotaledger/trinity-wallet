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
    constructor() {
        super();
        this.state = {
            password: '',
        };
    }
    componentWillUnmount() {
        FingerprintScanner.release();
    }

    activateFingerPrintScanner() {
        const { t } = this.props;

        FingerprintScanner.authenticate({ description: t('fingerprintSetup:instructionsLogin') })
            .then(() => {
                this.props.setUserActivity({ inactive: false });
            })
            .catch(error => {
                this.props.generateAlert(
                    'error',
                    t('fingerprintSetup:fingerprintAuthFailed'),
                    t('fingerprintSetup:fingerprintAuthFailedExplanation'),
                );
            });
    }

    handleLogin = () => {
        const { onLoginPress } = this.props;
        const { password } = this.state;
        onLoginPress(password);
    };

    render() {
        const { t, positiveColor, secondaryBackgroundColor, negativeColor, isFingerprintEnabled } = this.props;
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
                            label={t('global:password')}
                            onChangeText={text => this.setState({ password: text })}
                            containerStyle={{ width: width / 1.36 }}
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            secureTextEntry
                            onSubmitEditing={this.handleLogin}
                            secondaryBackgroundColor={secondaryBackgroundColor}
                            negativeColor={negativeColor}
                            onFingerprintPress={() => this.activateFingerPrintScanner()}
                            fingerprintAuthentication={isFingerprintEnabled}
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

export default translate(['login', 'global', 'fingerprintSetup'])(
    connect(mapStateToProps, mapDispatchToProps)(EnterPassword),
);
