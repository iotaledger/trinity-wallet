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
        /** Target link */
        to: PropTypes.string,
        /** Click event callback function */
        /** @param {object} event - Click event object */
        onClick: PropTypes.func,
        /** Button or link element content */
        children: PropTypes.node,
        /** Custom button style definitions */
        style: PropTypes.object,
        /** Buttons style type */
        variant: PropTypes.oneOf(['primary', 'secondary', 'positive', 'negative', 'extra', 'highlight']).isRequired,
        /** Buttons custom class */
        className: PropTypes.oneOf(['outline', 'small']),
        /** Buttons loading state */
        loading: PropTypes.bool,
    };

    static defaultProps = {
        variant: 'primary',
    };

    render() {
        const { onClick, children, className, to, variant, loading, style } = this.props;

        const loadingClass = loading ? css.loading : null;

        if (to) {
            return (
                <Link {...this.props} className={classNames(css[className], css[variant])}>
                    {children}
                </Link>
            );
        }

        return (
            <button style={style} onClick={onClick} className={classNames(css[className], css[variant], loadingClass)}>
                {children}
            </button>
        );
    }
}
