import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import css from './toggle.scss';

/**
 * Toggle component
 */
const Toggle = ({ off, on, inline, disabled, checked, onChange }) => {
    return (
        <div
            className={classNames(css.toggle, inline && css.inline, disabled && css.disabled)}
            onClick={() => onChange(!checked)}
        >
            {inline}
            <div className={checked ? css.on : null}>
                <span>{off}</span>
                <span>{on}</span>
            </div>
        </div>
    );
};

Toggle.propTypes = {
    /** Checkbox state */
    checked: PropTypes.bool.isRequired,
    /** Is toggle component disabled */
    disabled: PropTypes.bool,
    /* Inline style label */
    inline: PropTypes.string,
    /** Checked state label */
    on: PropTypes.string,
    /** Unhecked state label */
    off: PropTypes.string,
    /**Toggle state event function
     * @param {Bool} value - Current checkbox state
     * @returns {Void}
     */
    onChange: PropTypes.func.isRequired,
};

export default Toggle;
