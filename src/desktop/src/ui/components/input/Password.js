import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import zxcvbn from 'zxcvbn';

import Icon from 'ui/components/Icon';
import css from './input.scss';

/**
 * Password input component
 */
export default class PasswordInput extends React.PureComponent {
    static propTypes = {
        /** Current password value */
        value: PropTypes.string.isRequired,
        /** Should input focus when changed to true */
        focus: PropTypes.bool,
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
    };

    state = {
        hidden: true,
    };

    componentDidMount() {
        if (this.props.focus) {
            this.input.focus();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.focus && nextProps.focus) {
            this.input.focus();
        }
    }

    setVisibility = () => {
        this.setState({
            hidden: !this.state.hidden,
        });
    };

    render() {
        const { label, value, onChange, showScore, showValid, match } = this.props;
        const { hidden } = this.state;

        const score = zxcvbn(value);
        const isValid = score.score === 4 && (!match || match === value);

        return (
            <div className={css.input}>
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
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <small>{label}</small>
                    {showScore ? (
                        <div className={css.score} data-strength={score.score}>
                            <span />
                            <span />
                            <span />
                        </div>
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
