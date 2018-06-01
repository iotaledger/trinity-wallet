import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import Modal from 'react-native-modal';
import { connect } from 'react-redux';
import CustomTextInput from '../components/CustomTextInput';
import FingerPrintModal from '../components/FingerprintModal';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import { isAndroid } from '../utils/device';
import Button from '../components/Button';

const styles = StyleSheet.create({
    topContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
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
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize4,
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
        width: width / 2.7,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    loginText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
});

/** Enter password component */
class EnterPassword extends Component {
    static propTypes = {
        /** Press event callback function
         * @param {string} password
         */
        onLoginPress: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification titleinactivityLogoutContainer
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Set application activity state to active = true*/
        setUserActive: PropTypes.func.isRequired,
        /** Determines if user has activated fingerprint auth */
        isFingerprintEnabled: PropTypes.bool.isRequired,
    };

    constructor() {
        super();
        this.state = {
            password: '',
            isModalVisible: false,
        };
        this.activateFingerprintScanner = this.activateFingerprintScanner.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    componentWillUnmount() {
        if (isAndroid) {
            FingerprintScanner.release();
        }
    }

    handleLogin = () => {
        const { onLoginPress } = this.props;
        const { password } = this.state;
        onLoginPress(password);
    };

    activateFingerprintScanner() {
        const { t } = this.props;
        if (isAndroid) {
            this.setState({ isModalVisible: true });
        }
        FingerprintScanner.authenticate({ description: t('fingerprintSetup:instructionsLogin') })
            .then(() => {
                this.hideModal();
                this.props.setUserActive();
            })
            .catch(() => {
                this.props.generateAlert(
                    'error',
                    t('fingerprintSetup:fingerprintAuthFailed'),
                    t('fingerprintSetup:fingerprintAuthFailedExplanation'),
                );
            });
    }

    hideModal() {
        this.setState({ isModalVisible: false });
    }

    render() {
        const { isModalVisible } = this.state;
        const { t, theme, isFingerprintEnabled } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <Icon name="iota" size={width / 8} color={theme.body.color} />
                    </View>
                    <View style={styles.midContainer}>
                        <CustomTextInput
                            label={t('global:password')}
                            onChangeText={(text) => this.setState({ password: text })}
                            containerStyle={{ width: width / 1.2 }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            secureTextEntry
                            onSubmitEditing={this.handleLogin}
                            theme={theme}
                            fingerprintAuthentication={isFingerprintEnabled}
                            onFingerprintPress={this.activateFingerprintScanner}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <Button
                            onPress={this.handleLogin}
                            style={{
                                wrapper: { backgroundColor: theme.primary.color },
                                children: { color: theme.primary.body },
                            }}
                        >
                            {t('login')}
                        </Button>
                    </View>
                    <Modal
                        animationIn={isAndroid ? 'bounceInUp' : 'zoomIn'}
                        animationOut={isAndroid ? 'bounceOut' : 'zoomOut'}
                        animationInTiming={isAndroid ? 1000 : 300}
                        animationOutTiming={200}
                        backdropTransitionInTiming={isAndroid ? 500 : 300}
                        backdropTransitionOutTiming={200}
                        backdropOpacity={0.9}
                        backdropColor={theme.body.bg}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={isModalVisible}
                        onBackButtonPress={this.hideModal}
                        hideModalContentWhileAnimating
                        useNativeDriver={isAndroid ? true : false}
                    >
                        <FingerPrintModal
                            hideModal={this.hideModal}
                            borderColor={{ borderColor: theme.body.color }}
                            textColor={{ color: theme.body.color }}
                            backgroundColor={{ backgroundColor: theme.body.bg }}
                            instance="login"
                        />
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default translate(['login', 'global'])(connect(mapStateToProps)(EnterPassword));
