import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { zxcvbn } from 'shared-modules/libs/exports';
import { generateAlert } from 'shared-modules/actions/alerts';
import { passwordReasons } from 'shared-modules/libs/password';
import { height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import CustomTextInput from './CustomTextInput';

const MIN_PASSWORD_LENGTH = 11;

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

class PasswordFields extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Called if password(s) meet requirements */
        onAcceptPassword: PropTypes.func.isRequired,
        /** Callback function returning PasswordFields component instance as an argument */
        /** @param {object} instance - PasswordFields instance
         */
        onRef: PropTypes.func.isRequired,
        /** @ignore */
        setPassword: PropTypes.func.isRequired,
        /** @ignore */
        setReentry: PropTypes.func.isRequired,
        /** @ignore */
        password: PropTypes.string.isRequired,
        /** @ignore */
        reentry: PropTypes.string.isRequired,
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    /**
     * Checks if password meets requirements
     *
     * @method checkPassword
     */
    checkPassword() {
        const { t, password, reentry } = this.props;
        const score = zxcvbn(password);
        if (password.length >= MIN_PASSWORD_LENGTH && password === reentry && score.score === 4) {
            this.props.onAcceptPassword();
        } else if (!(password === reentry)) {
            this.props.generateAlert('error', t('passwordMismatch'), t('passwordMismatchExplanation'));
        } else if (password.length < MIN_PASSWORD_LENGTH || reentry.length < MIN_PASSWORD_LENGTH) {
            this.props.generateAlert(
                'error',
                t('passwordTooShort'),
                t('passwordTooShortExplanation', {
                    minLength: MIN_PASSWORD_LENGTH,
                    currentLength: password.length,
                }),
            );
        } else if (score.score < 4) {
            const reason = score.feedback.warning
                ? t(`changePassword:${passwordReasons[score.feedback.warning]}`)
                : t('changePassword:passwordTooWeakReason');
            return this.props.generateAlert('error', t('changePassword:passwordTooWeak'), reason);
        }
    }

    render() {
        const { t, theme, password, reentry } = this.props;
        const score = zxcvbn(password);
        const isValid = score.score === 4;

        return (
            <View style={[styles.container]}>
                <CustomTextInput
                    label={t('global:password')}
                    onChangeText={(password) => this.props.setPassword(password)}
                    containerStyle={{ width: Styling.contentWidth }}
                    autoCapitalize="none"
                    widget="password"
                    isPasswordValid={isValid}
                    passwordStrength={score.score}
                    autoCorrect={false}
                    enablesReturnKeyAutomatically
                    returnKeyType="next"
                    onSubmitEditing={() => {
                        if (password) {
                            this.reentry.focus();
                        }
                    }}
                    secureTextEntry
                    testID="setPassword-passwordbox"
                    theme={theme}
                />
                <CustomTextInput
                    onRef={(c) => {
                        this.reentry = c;
                    }}
                    label={t('retypePassword')}
                    onChangeText={(reentry) => this.props.setReentry(reentry)}
                    containerStyle={{ width: Styling.contentWidth, marginTop: height / 60 }}
                    widget="passwordReentry"
                    isPasswordValid={isValid && password === reentry}
                    autoCapitalize="none"
                    autoCorrect={false}
                    enablesReturnKeyAutomatically
                    returnKeyType="done"
                    secureTextEntry
                    testID="setPassword-reentrybox"
                    theme={theme}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    generateAlert,
};

export default withNamespaces(['setPassword', 'global'])(connect(mapStateToProps, mapDispatchToProps)(PasswordFields));
