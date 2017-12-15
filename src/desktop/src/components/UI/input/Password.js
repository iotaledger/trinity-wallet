import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './Password.css';
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
        console.log('wtf', e.target);
        e.preventDefault();
        this.setState(state => ({
            type: state.type === 'password' ? 'text' : 'password',
        }));
    };

    render() {
        const { className } = this.props;
        const { type } = this.state;
        return (
            <div className={css.wrapper}>
                <div>
                    <input type={type} className={classNames(className, css.password)} {...this.props} />
                    <small />
                </div>
                <Button type="button" variant="default" onClick={this.toggleVisibility}>
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
