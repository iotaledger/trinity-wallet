import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { zxcvbn } from 'iota-wallet-shared-modules/libs/exports';
import { setPassword, setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { passwordReasons } from 'iota-wallet-shared-modules/libs/password';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { changePassword } from '../utils/keychain';
import { getPasswordHash } from '../utils/crypto';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import CustomTextInput from '../components/CustomTextInput';
import { Icon } from '../theme/icons.js';
import InfoBox from '../components/InfoBox';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

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
        flex: 11,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
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
    titleTextLeft: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

/**
 * Change Password component
 */
class ChangePassword extends Component {
    static propTypes = {
        /** Hash for wallet's password */
        password: PropTypes.string.isRequired,
        /** Set new password hash
         * @param {string} passwordHash
         */
        setPassword: PropTypes.func.isRequired,
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            currentPassword: '',
            newPassword: '',
            newPasswordReentry: '',
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('ChangePassword');
    }

    isValid(currentPwdHash) {
        const { currentPassword, newPassword, newPasswordReentry } = this.state;
        const { password } = this.props;
        const score = zxcvbn(password);

        return (
            currentPwdHash === password &&
            newPassword.length >= 12 &&
            newPasswordReentry.length >= 12 &&
            newPassword === newPasswordReentry &&
            newPassword !== currentPassword &&
            score.score === 4
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

                    this.props.setSetting('securitySettings');
                })
                .catch(() => throwErr());
        }

        return this.renderInvalidSubmissionAlerts(currentPwdHash);
    }

    fallbackToInitialState() {
        this.setState({
            currentPassword: '',
            newPassword: '',
            newPasswordReentry: '',
        });
    }

    renderTextField(
        ref,
        value,
        label,
        onChangeText,
        returnKeyType,
        onSubmitEditing,
        widget = 'empty',
        isPasswordValid = false,
        passwordStrength = 0,
    ) {
        const { theme } = this.props;
        const props = {
            onRef: ref,
            label,
            onChangeText,
            containerStyle: { width: width / 1.15 },
            autoCapitalize: 'none',
            autoCorrect: false,
            enablesReturnKeyAutomatically: true,
            secureTextEntry: true,
            returnKeyType,
            onSubmitEditing,
            value,
            theme,
            widget,
            isPasswordValid,
            passwordStrength,
        };

        return <CustomTextInput {...props} />;
    }

    renderInvalidSubmissionAlerts(currentPwdHash) {
        const { currentPassword, newPassword, newPasswordReentry } = this.state;
        const { password, generateAlert, t } = this.props;
        const score = zxcvbn(password);

        if (currentPwdHash !== password) {
            return generateAlert('error', t('incorrectPassword'), t('incorrectPasswordExplanation'));
        } else if (newPassword !== newPasswordReentry) {
            return generateAlert('error', t('passwordsDoNotMatch'), t('passwordsDoNotMatchExplanation'));
        } else if (newPassword.length < 12 || newPasswordReentry.length < 12) {
            return generateAlert('error', t('passwordTooShort'), t('passwordTooShortExplanation'));
        } else if (newPassword === currentPassword) {
            return generateAlert('error', t('oldPassword'), t('oldPasswordExplanation'));
        } else if (score.score < 4) {
            const reason = score.feedback.warning
                ? t(`changePassword:${passwordReasons[score.feedback.warning]}`)
                : t('changePassword:passwordTooWeakReason');
            return this.props.generateAlert('error', t('changePassword:passwordTooWeak'), reason);
        }

        return null;
    }

    render() {
        const { currentPassword, newPassword, newPasswordReentry } = this.state;
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };
        const score = zxcvbn(newPassword);
        const isValid = score.score === 4;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <InfoBox
                            body={theme.body}
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
                            () => {
                                if (currentPassword) {
                                    this.newPassword.focus();
                                }
                            },
                        )}
                        {this.renderTextField(
                            (c) => {
                                this.newPassword = c;
                            },
                            newPassword,
                            t('newPassword'),
                            (password) => this.setState({ newPassword: password }),
                            'next',
                            () => {
                                if (newPassword) {
                                    this.newPasswordReentry.focus();
                                }
                            },
                            'password',
                            isValid,
                            score.score,
                        )}
                        {this.renderTextField(
                            (c) => {
                                this.newPasswordReentry = c;
                            },
                            newPasswordReentry,
                            t('confirmPassword'),
                            (password) => this.setState({ newPasswordReentry: password }),
                            'done',
                            () => this.changePassword(),
                            'passwordReentry',
                            isValid && newPassword === newPasswordReentry,
                        )}
                        <View style={{ flex: 0.2 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('securitySettings')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={theme.body.color} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        {currentPassword !== '' &&
                            newPassword !== '' &&
                            newPasswordReentry !== '' && (
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
                                        <Icon name="tick" size={width / 28} color={theme.body.color} />
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
    password: state.wallet.password,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setPassword,
    setSetting,
    generateAlert,
};

export default translate(['changePassword', 'global'])(connect(mapStateToProps, mapDispatchToProps)(ChangePassword));
