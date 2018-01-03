import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './Input.css';

import IconEye from 'images/eye.png';

export default class PasswordInput extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string,
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    };

    state = {
        type: 'password',
    };

    toggleVisibility = e => {
        e.preventDefault();
        this.setState(state => ({
            type: state.type === 'password' ? 'text' : 'password',
        }));
    };

    render() {
        const { className, label, value } = this.props;
        const { type } = this.state;
        return (
            <div className={css.input}>
                <fieldset>
                    <a className={type === 'text' ? css.strike : null} onClick={this.toggleVisibility}>
                        <img src={IconEye} alt="" />
                    </a>
                    <input type={type} value={value} onChange={e => this.props.onChange(e.target.value)} />
                    <small>{label}</small>
                </fieldset>
            </div>
        );
    }
}
