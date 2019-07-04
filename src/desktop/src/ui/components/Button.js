import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import css from './button.scss';

/**
 * Button component
 */
export default class Button extends React.PureComponent {
    static propTypes = {
        /** Target link */
        to: PropTypes.string,
        /** Click event callback function
         * @param {object} Event - Click event object
         * @returns {undefined}
         */
        onClick: PropTypes.func,
        /** Button content */
        children: PropTypes.node,
        /** Element ID */
        id: PropTypes.string,
        /** Custom button style definitions */
        style: PropTypes.object,
        /** Is button disabled */
        disabled: PropTypes.bool,
        /** Button element type */
        type: PropTypes.oneOf(['button', 'submit']),
        /** Button style class */
        variant: PropTypes.oneOf(['primary', 'secondary', 'positive', 'negative', 'extra', 'dark']).isRequired,
        /** Buttons secondary class */
        className: PropTypes.oneOf(['outline', 'small', 'outlineSmall', 'square', 'icon']),
        /** Is button loading state active */
        loading: PropTypes.bool,
    };

    static defaultProps = {
        variant: 'primary',
    };

    render() {
        const { onClick, children, className, id, to, variant, loading, style, type, disabled } = this.props;

        const loadingClass = loading ? css.loading : null;

        if (to) {
            return (
                <Link
                    {...this.props}
                    className={classNames(css.button, css[className], css[variant], disabled ? css.disabled : null)}
                >
                    {children}
                </Link>
            );
        }

        return (
            //eslint-disable-next-line react/button-has-type
            <button
                style={style}
                type={type ? type : 'button'}
                id={id}
                onClick={onClick}
                disabled={disabled}
                className={classNames(css.button, css[className], css[variant], loadingClass)}
            >
                {children}
            </button>
        );
    }
}
