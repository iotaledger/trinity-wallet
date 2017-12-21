import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './PasswordInput.css';
import Button from 'components/UI/Button';

import IconEye from 'images/eye.png';

export default class PasswordInput extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string,
        value: PropTypes.string,
        className: PropTypes.string,
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
        const { name, className, ...props } = this.props;
        const { type } = this.state;
        return (
            <div className={css.wrapper}>
                <div>
                    <input type={type} name={name} className={classNames(className, css.password)} {...props} />
                    <small />
                </div>
                <Button variant="default" onClick={this.toggleVisibility}>
                    {type === 'password' ? (
                        <span>
                            <img src={IconEye} alt="" /> Show
                        </span>
                    ) : (
                        <span>
                            <img src={IconEye} alt="" /> Hide
                        </span>
                    )}
                </Button>
            </div>
        );
    }
}
