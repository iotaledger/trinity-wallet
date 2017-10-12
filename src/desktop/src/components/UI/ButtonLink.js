import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import css from './Button.css';

export default class ButtonLink extends React.PureComponent {

    static propTypes = {
        children: PropTypes.node,
        variant: PropTypes.oneOf([
            'default',
            'success',
            'warning',
            'danger',
            'info',
        ]).isRequired,
    };

    static defaultProps = {
        variant: 'default',
    };

    render() {
        const { children, variant } = this.props;
        return (
            <Link {...this.props} className={css[variant]}>
                {children}
            </Link>
        );
    }

}
