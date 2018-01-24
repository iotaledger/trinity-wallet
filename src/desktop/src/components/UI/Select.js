import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './Select.css';

export default class Select extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        label: PropTypes.string,
        variant: PropTypes.oneOf(['default', 'success', 'warning']).isRequired,
    };

    static defaultProps = {
        variant: 'default',
    };

    render() {
        const { children, variant, label } = this.props;

        return (
            <div className={classNames(css.select, css[variant])}>
                {label ? <label>{label}</label> : null}
                <div>
                    <select {...this.props}>{children}</select>
                </div>
            </div>
        );
    }
}
