import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withI18n } from 'react-i18next';
import { zxcvbn } from 'libs/exports';

import { passwordReasons } from 'libs/password';

import Icon from 'ui/components/Icon';
import css from './input.scss';

/**
 * Password input component
 */
class PasswordInput extends React.PureComponent {
    static propTypes = {
        /** Current password value */
        value: PropTypes.string.isRequired,
        /** Should input focus when changed to true */
        focus: PropTypes.bool,
        /** Is the component disabled */
        disabled: PropTypes.bool,
        /** Should input show the password strength score */
        showScore: PropTypes.bool,
        /** Should input show the validation checkmark */
        showValid: PropTypes.bool,
        /** Should the input match a string */
        match: PropTypes.string,
        /** Password input label */
        label: PropTypes.string.isRequired,
        /** Password change event function
         * @param {string} value - Current password value
         */
        onChange: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        hidden: true,
        capsLock: false,
    };

    componentDidMount() {
        if (this.props.focus) {
            this.input.focus();
        }
        this.onKey = this.setCapsLock.bind(this);
        window.addEventListener('keydown', this.onKey);
        window.addEventListener('keyup', this.onKey);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.focus && nextProps.focus) {
            this.input.focus();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKey);
        window.removeEventListener('keyup', this.onKey);
    }

    setVisibility = () => {
        this.setState({
            hidden: !this.state.hidden,
        });
    };

    setCapsLock = (e) => {
        this.setState({
            capsLock: e.getModifierState('CapsLock'),
        });
    };

    render() {
        const { label, value, disabled, onChange, showScore, showValid, match, t } = this.props;
        const { hidden, capsLock } = this.state;

        const score = zxcvbn(value);
        const isValid = score.score === 4 && (typeof match !== 'string' || match === value);

        return (
            <div
                className={classNames(
                    css.input,
                    css.padded,
                    disabled ? css.disabled : null,
                    capsLock ? css.capsLock : null,
                )}
            >
                <fieldset>
                    <a className={hidden ? css.strike : null} onClick={this.setVisibility}>
                        <Icon icon="eye" size={16} />
                    </a>
                    <input
                        type={hidden ? 'password' : 'text'}
                        ref={(input) => {
                            this.input = input;
                        }}
                        value={value}
                        onClick={this.setCapsLock}
                        onKeyDown={this.setCapsLock}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <small>{label}</small>
                    <strong>
                        <Icon icon="attention" size={14} />
                        {t('capsLockIsOn')}
                    </strong>
                    {showScore ? (
                        <React.Fragment>
                            <div className={css.score} data-strength={score.score}>
                                <span />
                                <span />
                                <span />
                            </div>
                            {value.length > 8 && passwordReasons[score.feedback.warning] ? (
                                <div className={css.hint}>
                                    {t(`changePassword:${passwordReasons[score.feedback.warning]}`)}
                                </div>
                            ) : null}
                        </React.Fragment>
                    ) : null}
                    {showValid ? (
                        <div className={classNames(css.valid, isValid ? css.isValid : null)}>
                            <Icon icon="tickRound" size={26} />
                        </div>
                    ) : null}
                </fieldset>
            </div>
        );
    }
}

export default withI18n()(PasswordInput);
