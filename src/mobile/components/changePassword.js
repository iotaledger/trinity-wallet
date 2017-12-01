import isUndefined from 'lodash/isUndefined';
import toUpper from 'lodash/toUpper';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    ImageBackground,
    ScrollView,
    StatusBar,
} from 'react-native';
import Colors from '../theme/Colors';
import Fonts from '../theme/Fonts';
import { getFromKeychain, deleteFromKeyChain, storeValueInKeychain } from '../../shared/libs/cryptography';
import { TextField } from 'react-native-material-textfield';
import { Keyboard } from 'react-native';

const width = Dimensions.get('window').width;
const height = global.height;

class ChangePassword extends Component {
    constructor() {
        super();
        this.state = {
            currentPassword: '',
            newPassword: '',
            confirmedNewPassword: '',
        };
    }

    renderTextField(ref, value, label, onChangeText, onSubmitEditing) {
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
            tintColor: Colors.orangeDark,
            autoCapitalize: 'none',
            autoCorrect: false,
            enablesReturnKeyAutomatically: true,
            returnKeyType: 'next',
            containerStyle: styles.textFieldContainer,
            secureTextEntry: true,
            label,
            value,
            onChangeText,
            onSubmitEditing
        };

        return <TextField {...props} />;
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
        const { password, setPassword } = this.props;
        const { newPassword } = this.state;

        if (isValid) {
            const throwErr = () =>
                this.props.dropdown.alertWithType(
                    'error',
                    'Oops! Something went wrong',
                    'Looks like something wrong while updating your password. Please try again.',
                );

            const updatePassword = value =>
                Promise.resolve(storeValueInKeychain(newPassword, value))
                    .then(() => {
                        deleteFromKeyChain(password);
                        setPassword(newPassword);
                        this.fallbackToInitialState();
                        // TODO:
                        // We might need to rethink on having a global dropdown alerting system
                        // via redux. Generally we should redirect user to the previous screen
                        // on password update but we are kind of limited as we have to keep track
                        // on dropdown reference inside this component.
                        this.props.dropdown.alertWithType(
                            'success',
                            'Password updated.',
                            'Your password has been successfully updated.',
                        );
                        this.props.backPress();
                    })
                    .catch(throwErr);

            return getFromKeychain(password, value => (!isUndefined(value) ? updatePassword(value) : throwErr()));
        }

        return this.renderInvalidSubmissionAlerts();
    }

    renderInvalidSubmissionAlerts() {
        const { currentPassword, newPassword, confirmedNewPassword } = this.state;
        const { password } = this.props;

        if (currentPassword !== password) {
            return this.props.dropdown.alertWithType(
                'error',
                'Incorrect password',
                'Your current password is incorrect. Please try again.',
            );
        } else if (newPassword !== confirmedNewPassword) {
            return this.props.dropdown.alertWithType(
                'error',
                'Password mismatch',
                'Passwords do not match. Please try again.',
            );
        } else if (newPassword.length < 12 || confirmedNewPassword.length < 12) {
            return this.props.dropdown.alertWithType(
                'error',
                'Password is too short',
                'Your password must be at least 12 characters. Please try again.',
            );
        } else if (newPassword === currentPassword) {
            return this.props.dropdown.alertWithType(
                'error',
                'Cannot set old password',
                'You cannot use the old password as your new password. Please try again with a new password.',
            );
        }
    }

    fallbackToInitialState() {
        this.setState({
            currentPassword: '',
            newPassword: '',
            confirmedNewPassword: '',
        });
    }

    render() {
        const { currentPassword, newPassword, confirmedNewPassword } = this.state;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={styles.infoTextWrapper}>
                            <Image source={require('../../shared/images/info.png')} style={styles.infoIcon} />
                            <Text style={styles.infoText}>
                                Ensure you use a strong password of at least 12 characters.
                            </Text>
                        </View>
                        {this.renderTextField('currentPassword', currentPassword, 'Current Password', currentPassword =>
                            this.setState({ currentPassword }), onSubmitEditing => this.refs.newPassword.focus(),
                        )}
                        {this.renderTextField('newPassword', newPassword, 'New Password', newPassword =>
                            this.setState({ newPassword }), onSubmitEditing => this.refs.confirmedNewPassword.focus(),
                        )}
                        {this.renderTextField('confirmedNewPassword', confirmedNewPassword, 'Confirm New Password', confirmedNewPassword =>
                            this.setState({ confirmedNewPassword }), onSubmitEditing => this.changePassword(),
                        )}
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={event => this.props.backPress()}>
                            <View style={styles.itemLeft}>
                                <Image source={require('../../shared/images/arrow-left.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                        {currentPassword != '' &&
                            newPassword != '' &&
                            confirmedNewPassword != '' && (
                                <TouchableOpacity onPress={() => this.changePassword()}>
                                    <View style={styles.itemRight}>
                                        <Image source={require('../../shared/images/tick.png')} style={styles.icon} />
                                        <Text style={styles.titleText}>Save</Text>
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
        flex: 0.5,
        width: width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    topContainer: {
        flex: 4.5,
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
        borderRadius: 15,
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

ChangePassword.propTypes = {
    password: PropTypes.string.isRequired,
    setPassword: PropTypes.func.isRequired,
};

export default ChangePassword;
