import React from 'react';
import PropTypes from 'prop-types';
import css from './input.css';

/**
 * Single ine input component
 */
export default class TextInput extends React.PureComponent {
    static propTypes = {
        /** Current input value */
        value: PropTypes.string.isRequired,
        /** Input label */
        label: PropTypes.string,
        /** Address change event function
         * @param {string} value - Current input value
         */
        onChange: PropTypes.func.isRequired,
    };

    render() {
        const { value, label, onChange } = this.props;

        return (
            <div className={css.input}>
                <fieldset>
                    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
                    <small>{label}</small>
                </fieldset>
            </div>
        );
    }
}
