// FIXME: Temporarily needed for password migration

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Keyboard,
    KeyboardAvoidingView,
} from 'react-native';
import { connect } from 'react-redux';
import { zxcvbn } from 'shared/libs/exports';
import { setPassword, setSetting } from 'shared/actions/wallet';
import { passwordReasons } from 'shared/libs/password';
import { generateAlert } from 'shared/actions/alerts';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { setCompletedForcedPasswordUpdate } from 'shared/actions/settings';
import timer from 'react-native-timer';
import SplashScreen from 'react-native-splash-screen';
import { changePassword, getSecretBoxFromKeychainAndOpenIt } from 'mobile/src/libs/keychain';
import { generatePasswordHash, getSalt, getOldPasswordHash, hexToUint8 } from 'mobile/src/libs/crypto';
import { width, height } from 'mobile/src/libs/dimensions';
import GENERAL from 'mobile/src/ui/theme/general';
import CustomTextInput from 'mobile/src/ui/components/CustomTextInput';
import { Icon } from 'mobile/src/ui/theme/icons.js';
import InfoBox from 'mobile/src/ui/components/InfoBox';
import { isAndroid } from 'mobile/src/libs/device';
import StatefulDropdownAlert from 'mobile/src/ui/components/StatefulDropdownAlert';
import { leaveNavigationBreadcrumb } from 'mobile/src/libs/bugsnag';

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
class ForceChangePassword extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Set new password hash
         * @param {string} passwordHash
         */
        setPassword: PropTypes.func.isRequired,
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
            currentPassword: '',
            newPassword: '',
            newPasswordReentry: '',
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('ChangePassword');
        if (!isAndroid) {
            SplashScreen.hide();
        }
    }

    async onSavePress() {
        const { setPassword, t } = this.props;
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
            return getSecretBoxFromKeychainAndOpenIt('seeds', oldPwdHash)
                .then(() => {
                    changePassword(oldPwdHash, newPwdHash, salt).then(() => {
                        setPassword(newPwdHash);
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
        const { theme: { body } } = this.props;
        this.props.navigator.resetTo({
            screen: 'login',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
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

    renderContent() {
        const { currentPassword, newPassword, newPasswordReentry } = this.state;
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };
        const score = zxcvbn(newPassword);
        const isValid = score.score === 4;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1, width }}>
                <View behavior="padding" style={styles.container}>
                    <View style={{ flex: 1.5 }} />
                    <KeyboardAvoidingView behavior="padding" style={styles.topContainer}>
                        <InfoBox
                            body={theme.body}
                            text={
                                <View>
                                    <Text style={[styles.infoText, textColor]}>
                                        With update 0.4.1, it is necessary to change your password before using Trinity.
                                        If your current password fulfils the password strength requirements then you may
                                        use your current password again.
                                    </Text>
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
                            () => this.onSavePress(),
                            'passwordReentry',
                            isValid && newPassword === newPasswordReentry,
                        )}
                        <View style={{ flex: 0.2 }} />
                    </KeyboardAvoidingView>
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
                                        <Icon name="tick" size={width / 28} color={theme.body.color} />
                                    </View>
                                </TouchableOpacity>
                            )}
                    </View>
                    <View style={{ flex: 0.5 }} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
    render() {
        const { theme: { body } } = this.props;

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                {isAndroid ? (
                    <View style={styles.container}>{this.renderContent()}</View>
                ) : (
                    <KeyboardAwareScrollView
                        resetScrollToCoords={{ x: 0, y: 0 }}
                        contentContainerStyle={styles.container}
                        scrollEnabled={false}
                        enableOnAndroid={false}
                    >
                        {this.renderContent()}
                    </KeyboardAwareScrollView>
                )}
                <StatefulDropdownAlert textColor={body.color} backgroundColor={body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setPassword,
    setSetting,
    generateAlert,
    setCompletedForcedPasswordUpdate,
};

export default translate(['changePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(ForceChangePassword),
);
