import React from 'react';
import PropTypes from 'prop-types';
import css from './Button.css';

export default class Button extends React.PureComponent {

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
            <button className={css[variant]}>{children}</button>
        );
    }

}
