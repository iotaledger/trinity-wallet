import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Image, Keyboard } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import tickImagePath from 'iota-wallet-shared-modules/images/tick.png';
import infoImagePath from 'iota-wallet-shared-modules/images/info.png';
import arrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left.png';
import Colors from '../theme/Colors';
import Fonts from '../theme/Fonts';
import keychain from '../util/keychain';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';
import THEMES from '../theme/themes';
import { translate } from 'react-i18next';

class ChangePassword extends Component {
    static propTypes = {
        password: PropTypes.string.isRequired,
        setPassword: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
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
        const { password, setPassword, generateAlert, t } = this.props;
        const { newPassword } = this.state;

        if (isValid) {
            const throwErr = () => generateAlert('error', t('somethingWentWrong'), t('somethingWentWrongExplanation'));

            keychain
                .get()
                .then(credentials => {
                    const payload = get(credentials, 'data');

                    if (payload) {
                        return keychain.set(newPassword, payload);
                    }

                    throw 'Error';
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
        const props = {
            ref: ref,
            style: styles.textField,
            labelTextStyle: { fontFamily: Fonts.tertiary },
            labelFontSize: height / 55,
            fontSize: height / 40,
            baseColor: Colors.white,
            tintColor: THEMES.getHSL(this.props.negativeColor),
            autoCapitalize: 'none',
            autoCorrect: false,
            enablesReturnKeyAutomatically: true,
            containerStyle: styles.textFieldContainer,
            secureTextEntry: true,
            label,
            value,
            onChangeText,
            returnKeyType,
            onSubmitEditing,
        };

        return <TextField {...props} />;
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
    }

    render() {
        const { currentPassword, newPassword, confirmedNewPassword } = this.state;
        const { t } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={styles.infoTextWrapper}>
                            <Image source={infoImagePath} style={styles.infoIcon} />
                            <Text style={styles.infoText}>{t('ensureStrongPassword')}</Text>
                        </View>
                        {this.renderTextField(
                            'currentPassword',
                            currentPassword,
                            t('currentPassword'),
                            currentPassword => this.setState({ currentPassword }),
                            'next',
                            onSubmitEditing => this.refs.newPassword.focus(),
                        )}
                        {this.renderTextField(
                            'newPassword',
                            newPassword,
                            t('newPassword'),
                            newPassword => this.setState({ newPassword }),
                            'next',
                            onSubmitEditing => this.refs.confirmedNewPassword.focus(),
                        )}
                        {this.renderTextField(
                            'confirmedNewPassword',
                            confirmedNewPassword,
                            t('confirmPassword'),
                            confirmedNewPassword => this.setState({ confirmedNewPassword }),
                            'done',
                            onSubmitEditing => this.changePassword(),
                        )}
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={event => this.props.backPress()}>
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                        {currentPassword !== '' &&
                            newPassword !== '' &&
                            confirmedNewPassword !== '' && (
                                <TouchableOpacity onPress={() => this.changePassword()}>
                                    <View style={styles.itemRight}>
                                        <Image source={tickImagePath} style={styles.icon} />
                                        <Text style={styles.titleText}>{t('global:save')}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

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
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        height: width / 5,
        width: width / 5,
    },
    infoTextWrapper: {
        borderColor: 'white',
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
        color: Colors.white,
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
        color: Colors.white,
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
    icon: {
        width: width / 22,
        height: width / 22,
        marginRight: width / 25,
    },
    titleText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
});

export default translate(['changePassword', 'global'])(ChangePassword);
