// FIXME: Temporarily needed for password migration

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import { navigator } from 'libs/navigation';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { zxcvbn } from 'shared-modules/libs/exports';
import { setSetting } from 'shared-modules/actions/wallet';
import { passwordReasons } from 'shared-modules/libs/password';
import { generateAlert } from 'shared-modules/actions/alerts';
import { setCompletedForcedPasswordUpdate } from 'shared-modules/actions/settings';
import { getThemeFromState } from 'shared-modules/selectors/global';
import timer from 'react-native-timer';
import SplashScreen from 'react-native-splash-screen';
import { changePassword, authorize } from 'libs/keychain';
import { generatePasswordHash, getSalt, getOldPasswordHash, hexToUint8 } from 'libs/crypto';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import CustomTextInput from 'ui/components/CustomTextInput';
import { Icon } from 'ui/theme/icons';
import InfoBox from 'ui/components/InfoBox';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    topContainer: {
        flex: 11,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
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
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

/**
 * Change Password component
 */
class ForceChangePassword extends Component {
    static propTypes = {
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setCompletedForcedPasswordUpdate: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            currentPassword: null,
            newPassword: null,
            newPasswordReentry: null,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('ChangePassword');
        if (!isAndroid) {
            SplashScreen.hide();
        }
    }

    componentWillUnmount() {
        delete this.state.currentPassword;
        delete this.state.newPassword;
        delete this.state.newPasswordReentry;
    }

    async onSavePress() {
        const { t } = this.props;
        const { newPassword, currentPassword } = this.state;

        let oldPwdHash = await getOldPasswordHash(currentPassword);
        oldPwdHash = hexToUint8(oldPwdHash);
        const salt = await getSalt();
        const newPwdHash = await generatePasswordHash(newPassword, salt);

        if (this.isNewPasswordValid()) {
            const throwError = (err) => {
                if (err.message === 'Incorrect password') {
                    this.props.generateAlert(
                        'error',
                        t('global:unrecognisedPassword'),
                        t('global:unrecognisedPasswordExplanation'),
                    );
                }
                this.props.generateAlert('error', t('somethingWentWrong'), t('somethingWentWrongTryAgain'));
            };
            return authorize(oldPwdHash)
                .then(() => {
                    changePassword(oldPwdHash, newPwdHash, salt).then(() => {
                        global.passwordHash = newPwdHash;
                        this.props.setCompletedForcedPasswordUpdate();
                        this.navigateToLogin();
                        timer.setTimeout(
                            'delaySuccessAlert',
                            () =>
                                this.props.generateAlert(
                                    'success',
                                    t('passwordUpdated'),
                                    t('passwordUpdatedExplanation'),
                                ),
                            500,
                        );
                    });
                })
                .catch((err) => throwError(err));
        }
        return this.renderInvalidSubmissionAlerts();
    }

    isNewPasswordValid() {
        const { newPassword, newPasswordReentry } = this.state;
        const score = zxcvbn(newPassword);
        return (
            newPassword.length >= 11 &&
            newPasswordReentry.length >= 11 &&
            newPassword === newPasswordReentry &&
            score.score === 4
        );
    }

    navigateToLogin() {
        navigator.setStackRoot('login');
    }

    renderTextField(
        ref,
        value,
        label,
        onValidTextChange,
        returnKeyType,
        onSubmitEditing,
        widget = 'empty',
        isPasswordValid = false,
        passwordStrength = 0,
        isPasswordInput = true,
    ) {
        const { theme } = this.props;
        const props = {
            onRef: ref,
            label,
            onValidTextChange,
            containerStyle: { width: Styling.contentWidth },
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
            isPasswordInput,
        };

        return <CustomTextInput {...props} />;
    }

    renderInvalidSubmissionAlerts() {
        const { newPassword, newPasswordReentry } = this.state;
        const { generateAlert, t } = this.props;
        const score = zxcvbn(newPassword);

        if (newPassword !== newPasswordReentry) {
            return generateAlert('error', t('passwordsDoNotMatch'), t('passwordsDoNotMatchExplanation'));
        } else if (newPassword.length < 11 || newPasswordReentry.length < 11) {
            return generateAlert('error', t('passwordTooShort'), t('passwordTooShortExplanation'));
        } else if (score.score < 4) {
            const reason = score.feedback.warning
                ? t(`changePassword:${passwordReasons[score.feedback.warning]}`)
                : t('changePassword:passwordTooWeakReason');
            return this.props.generateAlert('error', t('changePassword:passwordTooWeak'), reason);
        }

        return null;
    }

    render() {
        const { t, theme: { body } } = this.props;
        const { currentPassword, newPassword, newPasswordReentry } = this.state;
        const textColor = { color: body.color };
        const score = zxcvbn(newPassword);
        const isValid = score.score === 4;

        return (
            <KeyboardAwareScrollView contentContainerStyle={[styles.container, { backgroundColor: body.bg }]}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1, width }}>
                    <View style={styles.container}>
                        <View style={{ flex: 1.5 }} />
                        <View style={styles.topContainer}>
                            <InfoBox>
                                <Text style={[styles.infoText, textColor]}>
                                    With update 0.5.0, it is necessary to change your password before using Trinity. If
                                    your current password fulfils the password strength requirements then you may use
                                    your current password again.
                                </Text>
                            </InfoBox>
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
                                () => this.onSavePress(),
                                'passwordReentry',
                                isValid && newPassword === newPasswordReentry,
                            )}
                            <View style={{ flex: 0.2 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            {currentPassword !== '' &&
                                newPassword !== '' &&
                                newPasswordReentry !== '' && (
                                    <TouchableOpacity
                                        onPress={() => this.onSavePress()}
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
                        <View style={{ flex: 0.5 }} />
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAwareScrollView>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
    setCompletedForcedPasswordUpdate,
};

export default withNamespaces(['changePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(ForceChangePassword),
);
