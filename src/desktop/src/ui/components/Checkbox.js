import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import css from './checkbox.scss';

/**
 * Checkbox component
 */
export default class Checkbox extends React.PureComponent {
    static propTypes = {
        /** Is checkbox checked */
        checked: PropTypes.bool.isRequired,
        /** Checkbox label */
        label: PropTypes.string,
        /** Address change event function
         * @param {Bool} Value - Current checkbox state
         * @returns {undefined}
         */
        onChange: PropTypes.func.isRequired,
    };

    render() {
        const { checked, label, onChange } = this.props;

        return (
            <div className={classNames(css.checkbox, checked ? css.on : null)} onClick={() => onChange(!checked)}>
                {label}
            </div>
        );
    }
}
