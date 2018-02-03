import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import RNExitApp from 'react-native-exit-app';
import { StyleSheet, View, TouchableWithoutFeedback, Image, Keyboard, BackHandler } from 'react-native';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';
import OnboardingButtons from './onboardingButtons';
import CustomTextInput from './customTextInput';
import { connect } from 'react-redux';
import FingerprintScanner from 'react-native-fingerprint-scanner';

const styles = StyleSheet.create({
    topContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4.8,
        width,
        alignItems: 'center',
        paddingTop: height / 5,
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
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
    },
    loginText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
});

class EnterPasswordOnLogin extends Component {
    state = {
        label: '',
    };

    componentDidMount() {
        BackHandler.addEventListener('loginBackPress', () => {
            RNExitApp.exitApp();
            return true;
        });
        this.handleChangedLogin();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('loginBackPress');
    }

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

    handleLogin = () => {
        const { onLoginPress, password } = this.props;
        onLoginPress(password);
    };

    changeNode = () => {
        const { navigateToNodeSelection } = this.props;
        navigateToNodeSelection();
    };

    render() {
        const { t, secondaryBackgroundColor, negativeColor, password } = this.props;
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
                            value={password}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <OnboardingButtons
                            onLeftButtonPress={this.changeNode}
                            onRightButtonPress={this.handleLogin}
                            leftText={t('setNode')}
                            rightText={t('login')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

EnterPasswordOnLogin.propTypes = {
    onLoginPress: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    secondaryBackgroundColor: PropTypes.string.isRequired,
    negativeColor: PropTypes.object.isRequired,
    navigateToNodeSelection: PropTypes.func.isRequired,
    setLoginPasswordField: PropTypes.func.isRequired,
    isFingerprintEnabled: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
    isFingerprintEnabled: state.account.isFingerprintEnabled,
});

export default translate(['login', 'global', 'fingerprintEnable'])(connect(mapStateToProps)(EnterPasswordOnLogin));
