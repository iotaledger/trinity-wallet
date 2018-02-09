import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'ui/components/Icon';
import css from './input.css';

/**
 * Password input component
 */
export default class PasswordInput extends React.PureComponent {
    static propTypes = {
        /* Current password value */
        value: PropTypes.string.isRequired,
        /* Password input label */
        label: PropTypes.string.isRequired,
        /* Password change event function
         * @param {string} value - Current password value
         */
        onChange: PropTypes.func.isRequired,
    };

    state = {
        hidden: true,
    };

    setVisibility = () => {
        this.setState({
            hidden: !this.state.hidden,
        });
    };

    render() {
        const { label, value, onChange } = this.props;
        const { hidden } = this.state;
        return (
            <div className={css.input}>
                <fieldset>
                    <a className={hidden ? css.strike : null} onClick={this.setVisibility}>
                        <Icon icon="eye" size={16} />
                    </a>
                    <input
                        type={hidden ? 'password' : 'text'}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <small>{label}</small>
                </fieldset>
            </div>
        );
    }
}
