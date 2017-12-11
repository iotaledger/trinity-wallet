import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './PasswordInput.css';

export default class PasswordInput extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string,
        value: PropTypes.string,
        className: PropTypes.string,
    };

    state = {
        type: 'password',
    };

    toggleVisibility = () => {
        this.setState(state => ({
            type: state.type === 'password' ? 'text' : 'password',
        }));
    };

    render() {
        const { name, className, ...props } = this.props;
        const { type } = this.state;
        return (
            <span className={classNames(css.wrapper, type === 'text' && css.isVisible)}>
                <input type={type} name={name} className={classNames(className, css.password)} {...props} />
                <button type="button" onClick={this.toggleVisibility} />
            </span>
        );
    }
}
