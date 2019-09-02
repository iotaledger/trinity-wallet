import isEmpty from 'lodash/isEmpty';
import size from 'lodash/size';
import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { zxcvbn } from 'shared-modules/libs/exports';
import { generateAlert } from 'shared-modules/actions/alerts';
import passwordReasons from 'shared-modules/libs/password';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { UInt8ToString } from 'libs/crypto';
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
        password: PropTypes.object,
        /** @ignore */
        reentry: PropTypes.object,
        /** First text input label */
        passwordLabel: PropTypes.any,
        /** Second text input label */
        reentryLabel: PropTypes.string,
    };

    constructor() {
        super();
        this.state = {
            zxcvbn: {},
        };
    }

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
        const {
            zxcvbn: { score },
        } = this.state;
        if (isEmpty(password)) {
            return this.props.generateAlert('error', t('login:emptyPassword'), t('emptyPasswordExplanation'));
        } else if (size(password) >= MIN_PASSWORD_LENGTH && isEqual(password, reentry) && score === 4) {
            return this.props.onAcceptPassword();
        } else if (!isEqual(password, reentry)) {
            return this.props.generateAlert('error', t('passwordMismatch'), t('passwordMismatchExplanation'));
        } else if (size(password) < MIN_PASSWORD_LENGTH || size(reentry) < MIN_PASSWORD_LENGTH) {
            return this.props.generateAlert(
                'error',
                t('passwordTooShort'),
                t('passwordTooShortExplanation', {
                    minLength: MIN_PASSWORD_LENGTH,
                    currentLength: password.length,
                }),
            );
        } else if (score < 4) {
            const {
                feedback: { warning },
            } = this.state.zxcvbn;
            const reason = warning
                ? t(`changePassword:${passwordReasons[warning]}`)
                : t('changePassword:passwordTooWeakReason');
            return this.props.generateAlert('error', t('changePassword:passwordTooWeak'), reason);
        }
    }

    render() {
        const { t, theme, password, reentry, passwordLabel, reentryLabel } = this.props;
        const {
            zxcvbn: { score },
        } = this.state;
        const isValid = score === 4;

        return (
            <View style={[styles.container]}>
                <CustomTextInput
                    onRef={(c) => {
                        this.password = c;
                    }}
                    label={passwordLabel || t('global:password')}
                    onValidTextChange={(password) => {
                        this.props.setPassword(password);
                        this.setState({ zxcvbn: zxcvbn(password ? UInt8ToString(password) : '') });
                    }}
                    containerStyle={{ width: Styling.contentWidth }}
                    autoCapitalize="none"
                    widgets={['checkMark']}
                    isPasswordValid={isValid}
                    passwordStrength={score}
                    autoCorrect={false}
                    enablesReturnKeyAutomatically
                    returnKeyType="next"
                    onSubmitEditing={() => {
                        if (password) {
                            this.password.blur();
                            this.reentry.focus();
                        }
                    }}
                    testID="setPassword-passwordbox"
                    theme={theme}
                    value={password}
                    secureTextEntry
                    isPasswordInput
                />
                <CustomTextInput
                    onRef={(c) => {
                        this.reentry = c;
                    }}
                    label={reentryLabel || t('setPassword:retypePassword')}
                    onValidTextChange={(reentry) => this.props.setReentry(reentry)}
                    containerStyle={{ width: Styling.contentWidth, marginTop: height / 60 }}
                    widgets={['checkMark']}
                    isPasswordValid={isValid && isEqual(password, reentry)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    enablesReturnKeyAutomatically
                    returnKeyType="done"
                    testID="setPassword-reentrybox"
                    theme={theme}
                    value={reentry}
                    secureTextEntry
                    isPasswordInput
                    onSubmitEditing={() => {
                        if (reentry) {
                            this.reentry.blur();
                            this.password.focus();
                            this.password.blur();
                        }
                    }}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    generateAlert,
};

export default withTranslation(['setPassword', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(PasswordFields),
);
