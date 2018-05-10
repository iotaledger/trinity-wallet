import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import css from './checkbox.scss';

/**
 * Checkbox component
 */
export default class Checkbox extends React.PureComponent {
    static propTypes = {
        /** Checkbox state */
        checked: PropTypes.bool.isRequired,
        /** Input label */
        label: PropTypes.string,
        /** Address change event function
         * @param {Bool} value - Current checkbox state
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
