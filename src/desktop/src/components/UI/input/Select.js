import React from 'react';
import PropTypes from 'prop-types';
import css from './Input.css';

export default class Select extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        disabled: PropTypes.bool,
        label: PropTypes.string,
    };

    render() {
        const { children, label, disabled } = this.props;

        return (
            <div className={css.input}>
                <fieldset disabled={disabled}>
                    <a className={css.down}>&shy;</a>
                    <select {...this.props}>{children}</select>
                    <small>{label}</small>
                </fieldset>
            </div>
        );
    }
}
