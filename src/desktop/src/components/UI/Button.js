import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import css from './Button.css';

export default class Button extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        className: PropTypes.string,
        loading: PropTypes.bool,
        variant: PropTypes.oneOf(['primary', 'secondary', 'positive', 'negative', 'extra', 'highlight']).isRequired,
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
