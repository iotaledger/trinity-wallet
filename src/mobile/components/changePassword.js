import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Image, Keyboard } from 'react-native';
import blackInfoImagePath from 'iota-wallet-shared-modules/images/info-black.png';
import whiteInfoImagePath from 'iota-wallet-shared-modules/images/info-white.png';
import Fonts from '../theme/Fonts';
import keychain from '../util/keychain';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';
import CustomTextInput from './customTextInput';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topContainer: {
        flex: 9,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    logo: {
        height: width / 5,
        width: width / 5,
    },
    infoTextWrapper: {
        borderWidth: 1,
        borderRadius: GENERAL.borderRadius,
        width: width / 1.6,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width / 40,
        borderStyle: 'dotted',
        paddingVertical: height / 50,
    },
    infoText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    infoIcon: {
        width: width / 20,
        height: width / 20,
    },
    textField: {
        fontFamily: Fonts.tertiary,
    },
    textFieldContainer: {
        width: width / 1.36,
        paddingTop: height / 90,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-end',
    },
    iconLeft: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    iconRight: {
        width: width / 28,
        height: width / 28,
    },
    titleTextRight: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

class ChangePassword extends Component {
    static propTypes = {
        password: PropTypes.string.isRequired,
        setPassword: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        textColor: PropTypes.object.isRequired,
        borderColor: PropTypes.object.isRequired,
        tickImagePath: PropTypes.number.isRequired,
        arrowLeftImagePath: PropTypes.number.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            currentPassword: '',
            newPassword: '',
            confirmedNewPassword: '',
        };
    }

    isValid() {
        const { currentPassword, newPassword, confirmedNewPassword } = this.state;
        const { password } = this.props;

        return (
            currentPassword === password &&
            newPassword.length >= 12 &&
            confirmedNewPassword.length >= 12 &&
            newPassword === confirmedNewPassword &&
            newPassword !== currentPassword
        );
    }

    changePassword() {
        const isValid = this.isValid();
        const { setPassword, generateAlert, t } = this.props;
        const { newPassword } = this.state;

        if (isValid) {
            const throwErr = () => generateAlert('error', t('somethingWentWrong'), t('somethingWentWrongExplanation'));

            keychain
                .get()
                .then((credentials) => {
                    const payload = get(credentials, 'data');

                    if (payload) {
                        return keychain.set(newPassword, payload);
                    }

                    throw new Error('Error');
                })
                .then(() => {
                    setPassword(newPassword);
                    this.fallbackToInitialState();

                    generateAlert('success', t('passwordUpdated'), t('passwordUpdatedExplanation'));

                    this.props.backPress();
                })
                .catch(() => throwErr());
        }

        return this.renderInvalidSubmissionAlerts();
    }

    fallbackToInitialState() {
        this.setState({
            currentPassword: '',
            newPassword: '',
            confirmedNewPassword: '',
        });
    }

    renderTextField(ref, value, label, onChangeText, returnKeyType, onSubmitEditing) {
        // This should be abstracted away as an independent component
        // We are using almost the same field styles and props
        // across all app

        const { negativeColor, secondaryBackgroundColor } = this.props;
        const props = {
            onRef: ref,
            label,
            onChangeText,
            containerStyle: { width: width / 1.2 },
            autoCapitalize: 'none',
            autoCorrect: false,
            enablesReturnKeyAutomatically: true,
            secureTextEntry: true,
            returnKeyType,
            onSubmitEditing,
            value,
            secondaryBackgroundColor,
            negativeColor,
        };

        return <CustomTextInput {...props} />;
    }

    renderInvalidSubmissionAlerts() {
        const { currentPassword, newPassword, confirmedNewPassword } = this.state;
        const { password, generateAlert, t } = this.props;

        if (currentPassword !== password) {
            return generateAlert('error', t('incorrectPassword'), t('incorrectPasswordExplanation'));
        } else if (newPassword !== confirmedNewPassword) {
            return generateAlert('error', t('passwordsDoNotMatch'), t('passwordsDoNotMatchExplanation'));
        } else if (newPassword.length < 12 || confirmedNewPassword.length < 12) {
            return generateAlert('error', t('passwordTooShort'), t('passwordTooShortExplanation'));
        } else if (newPassword === currentPassword) {
            return generateAlert('error', t('oldPassword'), t('oldPasswordExplanation'));
        }

        return null;
    }

    render() {
        const { currentPassword, newPassword, confirmedNewPassword } = this.state;
        const { t, textColor, borderColor, secondaryBackgroundColor, tickImagePath, arrowLeftImagePath } = this.props;
        const infoImagePath = secondaryBackgroundColor === 'white' ? whiteInfoImagePath : blackInfoImagePath;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={[styles.infoTextWrapper, borderColor]}>
                            <Image source={infoImagePath} style={styles.infoIcon} />
                            <Text style={[styles.infoText, textColor]}>{t('ensureStrongPassword')}</Text>
                        </View>
                        <View style={{ flex: 0.2 }} />
                        {this.renderTextField(
                            (c) => {
                                this.currentPassword = c;
                            },
                            currentPassword,
                            t('currentPassword'),
                            (password) => this.setState({ currentPassword: password }),
                            'next',
                            () => this.newPassword.focus(),
                        )}
                        {this.renderTextField(
                            (c) => {
                                this.newPassword = c;
                            },
                            newPassword,
                            t('newPassword'),
                            (password) => this.setState({ newPassword: password }),
                            'next',
                            () => this.confirmedNewPassword.focus(),
                        )}
                        {this.renderTextField(
                            (c) => {
                                this.confirmedNewPassword = c;
                            },
                            confirmedNewPassword,
                            t('confirmPassword'),
                            (password) => this.setState({ confirmedNewPassword: password }),
                            'done',
                            () => this.changePassword(),
                        )}
                        <View style={{ flex: 0.2 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.backPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.iconLeft} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        {currentPassword !== '' &&
                            newPassword !== '' &&
                            confirmedNewPassword !== '' && (
                                <TouchableOpacity
                                    onPress={() => this.changePassword()}
                                    hitSlop={{
                                        top: height / 55,
                                        bottom: height / 55,
                                        left: width / 55,
                                        right: width / 55,
                                    }}
                                >
                                    <View style={styles.itemRight}>
                                        <Text style={[styles.titleTextRight, textColor]}>{t('global:save')}</Text>
                                        <Image source={tickImagePath} style={styles.iconRight} />
                                    </View>
                                </TouchableOpacity>
                            )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['changePassword', 'global'])(ChangePassword);
