import React from 'react';
import PropTypes from 'prop-types';
import css from 'components/UI/input/Input.css';

import Icon from 'ui/components/Icon';

export default class PasswordInput extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    state = {
        type: 'password',
    };

    toggleVisibility = (e) => {
        e.preventDefault();
        this.setState((state) => ({
            type: state.type === 'password' ? 'text' : 'password',
        }));
    };

    render() {
        const { label, value, onChange } = this.props;
        const { type } = this.state;
        return (
            <div className={css.input}>
                <fieldset>
                    <a className={type === 'text' ? css.strike : null} onClick={this.toggleVisibility}>
                        <Icon icon="eye" size={16} />
                    </a>
                    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
                    <small>{label}</small>
                </fieldset>
            </div>
        );
    }
}
