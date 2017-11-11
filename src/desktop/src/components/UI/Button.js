import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import css from './Button.css';

export default class Button extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'info', 'extra', 'cta']).isRequired,
        to: PropTypes.string,
    };

    static defaultProps = {
        variant: 'default',
    };

    render() {
        const { children, to, variant } = this.props;

        if (to) {
            return (
                <Link {...this.props} className={css[variant]}>
                    {children}
                </Link>
            );
        }

        return (
            <button {...this.props} className={css[variant]}>
                {children}
            </button>
        );
    }
}
