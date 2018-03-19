import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Keyboard
} from 'react-native';
import { connect } from 'react-redux';
import { setPassword, setSetting } from 'iota-wallet-shared-modules/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import Fonts from '../theme/fonts';
import { changePassword } from '../utils/keychain';
import { getPasswordHash } from '../utils/crypto';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import CustomTextInput from '../components/CustomTextInput';
import { Icon } from '../theme/icons.js';
import InfoBox from '../components/InfoBox';

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
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
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
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginLeft: width / 20,
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
        setSetting: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        textColor: PropTypes.object.isRequired,
        borderColor: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
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

    isValid(currentPwdHash) {
        const { currentPassword, newPassword, confirmedNewPassword } = this.state;
        const { password } = this.props;

        return (
            currentPwdHash === password &&
            newPassword.length >= 12 &&
            confirmedNewPassword.length >= 12 &&
            newPassword === confirmedNewPassword &&
            newPassword !== currentPassword
        );
    }

    changePassword() {
        const { setPassword, generateAlert, password, t } = this.props;
        const { newPassword, currentPassword } = this.state;
        const newPwdHash = getPasswordHash(newPassword);
        const currentPwdHash = getPasswordHash(currentPassword);
        const isValid = this.isValid(currentPwdHash);

        if (isValid) {
            const throwErr = () => generateAlert('error', t('somethingWentWrong'), t('somethingWentWrongTryAgain'));
            changePassword(password, newPwdHash)
                .then(() => {
                    setPassword(newPwdHash);
                    this.fallbackToInitialState();

                    generateAlert('success', t('passwordUpdated'), t('passwordUpdatedExplanation'));

                    this.props.setSetting('mainSettings');
                })
                .catch(() => throwErr());
        }

        return this.renderInvalidSubmissionAlerts(currentPwdHash);
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

        const { theme } = this.props;
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
            theme,
        };

        return <CustomTextInput {...props} />;
    }

    renderInvalidSubmissionAlerts(currentPwdHash) {
        const { currentPassword, newPassword, confirmedNewPassword } = this.state;
        const { password, generateAlert, t } = this.props;
        if (currentPwdHash !== password) {
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
        const { t, textColor, body } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <InfoBox
                            body={body}
                            text={
                                <View>
                                    <Text style={[styles.infoText, textColor]}>{t('ensureStrongPassword')}</Text>
                                </View>
                            }
                        />
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
                            onPress={() => this.props.setSetting('mainSettings')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={body.color} />
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
                                        <Icon name="tick" size={width / 28} color={body.color} />
                                    </View>
                                </TouchableOpacity>
                            )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    password: state.tempAccount.password,
    textColor: { color: state.settings.theme.body.color },
    borderColor: { borderColor: state.settings.theme.body.color },
    body: state.settings.theme.body,
    theme: state.settings.theme
});

const mapDispatchToProps = {
    setPassword,
    setSetting,
    generateAlert
};

export default translate(['changePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(ChangePassword),
);
