import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import css from './button.css';

/**
 * Button component
 */
export default class Button extends React.PureComponent {
    static propTypes = {
        /* Button or link element content */
        children: PropTypes.node,
        /* Buttons style type */
        variant: PropTypes.oneOf(['primary', 'secondary', 'positive', 'negative', 'extra', 'highlight']).isRequired,
        /* Buttons custom class */
        className: PropTypes.oneOf(['outline']),
        /* Buttons loading state */
        loading: PropTypes.bool,
        /* Target link */
        to: PropTypes.string,
    };

    static defaultProps = {
        variant: 'primary',
    };

    render() {
        const { children, className, to, variant, loading } = this.props;

        const loadingClass = loading ? css.loading : null;

        if (to) {
            return (
                <Link {...this.props} className={classNames(css[className], css[variant])}>
                    {children}
                </Link>
            );
        }

        return (
            <button {...this.props} className={classNames(css[className], css[variant], loadingClass)}>
                {children}
            </button>
        );
    }
}
