import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import css from './toggle.scss';

/**
 * Toggle component
 */
export default class Toggle extends React.PureComponent {
    static propTypes = {
        /** Checkbox state */
        checked: PropTypes.bool.isRequired,
        /** On state label */
        on: PropTypes.string.isRequired,
        /** Off state label */
        off: PropTypes.string.isRequired,
        /**Toggle state event function
         * @param {Bool} value - Current checkbox state
         */
        onChange: PropTypes.func.isRequired,
    };

    render() {
        const { off, on, checked, onChange } = this.props;

        return (
            <div className={classNames(css.toggle, checked ? css.on : null)} onClick={() => onChange(!checked)}>
                <span>{off}</span>
                <span>{on}</span>
            </div>
        );
    }
}
