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
        const { password, setPassword, generateAlert } = this.props;
        const { newPassword } = this.state;

        if (isValid) {
            const throwErr = () =>
                generateAlert(
                    'error',
                    'Oops! Something went wrong',
                    'Looks like something went wrong while updating your password. Please try again.',
                );

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

                    generateAlert('success', 'Password updated', 'Your password has been successfully updated.');

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
        const { password, generateAlert } = this.props;

        if (currentPassword !== password) {
            return generateAlert(
                'error',
                'Incorrect password',
                'Your current password is incorrect. Please try again.',
            );
        } else if (newPassword !== confirmedNewPassword) {
            return generateAlert('error', 'Password mismatch', 'Passwords do not match. Please try again.');
        } else if (newPassword.length < 12 || confirmedNewPassword.length < 12) {
            return generateAlert(
                'error',
                'Password is too short',
                'Your password must be at least 12 characters. Please try again.',
            );
        } else if (newPassword === currentPassword) {
            return generateAlert(
                'error',
                'Cannot set old password',
                'You cannot use the old password as your new password. Please try again with a new password.',
            );
        }
    }

    render() {
        const { currentPassword, newPassword, confirmedNewPassword } = this.state;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={styles.infoTextWrapper}>
                            <Image source={infoImagePath} style={styles.infoIcon} />
                            <Text style={styles.infoText}>
                                Ensure you use a strong password of at least 12 characters.
                            </Text>
                        </View>
                        {this.renderTextField(
                            'currentPassword',
                            currentPassword,
                            'Current Password',
                            currentPassword => this.setState({ currentPassword }),
                            'next',
                            onSubmitEditing => this.refs.newPassword.focus(),
                        )}
                        {this.renderTextField(
                            'newPassword',
                            newPassword,
                            'New Password',
                            newPassword => this.setState({ newPassword }),
                            'next',
                            onSubmitEditing => this.refs.confirmedNewPassword.focus(),
                        )}
                        {this.renderTextField(
                            'confirmedNewPassword',
                            confirmedNewPassword,
                            'Confirm New Password',
                            confirmedNewPassword => this.setState({ confirmedNewPassword }),
                            'done',
                            onSubmitEditing => this.changePassword(),
                        )}
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={event => this.props.backPress()}>
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.iconLeft} />
                                <Text style={styles.titleTextLeft}>Back</Text>
                            </View>
                        </TouchableOpacity>
                        {currentPassword !== '' &&
                            newPassword !== '' &&
                            confirmedNewPassword !== '' && (
                                <TouchableOpacity onPress={() => this.changePassword()}>
                                    <View style={styles.itemRight}>
                                        <Text style={styles.titleTextRight}>Save</Text>
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
    iconLeft: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleTextLeft: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    iconRight: {
        width: width / 28,
        height: width / 28,
    },
    titleTextRight: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

export default ChangePassword;
