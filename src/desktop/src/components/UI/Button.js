import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import css from './Button.css';

export default class Button extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        className: PropTypes.string,
        variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'info', 'extra', 'cta']).isRequired,
        to: PropTypes.string,
    };

    static defaultProps = {
        variant: 'default',
    };

    render() {
        const { children, className, to, variant } = this.props;

        if (to) {
            return (
                <Link {...this.props} className={classNames(className, css[variant])}>
                    {children}
                </Link>
            );
        }

        return (
            <button {...this.props} className={classNames(className, css[variant])}>
                {children}
            </button>
        );
    }
}
