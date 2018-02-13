import React from 'react';
import PropTypes from 'prop-types';
import css from './input.css';

/**
 * Drop-down list
 */
export default class Select extends React.PureComponent {
    static propTypes = {
        /** Drop-down options options */
        children: PropTypes.node,
        /** Drop-downs selected item's value */
        defaultValue: PropTypes.string,
        /** Drop-down disabeld state */
        disabled: PropTypes.bool,
        /** Select element label */
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
