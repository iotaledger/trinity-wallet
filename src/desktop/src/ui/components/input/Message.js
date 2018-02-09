import React from 'react';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import css from './input.css';

/**
 * Message input component
 */
export default class MessageInput extends React.PureComponent {
    static propTypes = {
        /* Current message value */
        message: PropTypes.string.isRequired,
        /* Message input label */
        label: PropTypes.string,
        /* Message change event function
         * @param {string} value - Current message value
         */
        onChange: PropTypes.func.isRequired,
    };

    render() {
        const { message, label, onChange } = this.props;

        return (
            <div className={css.input}>
                <fieldset>
                    <Textarea value={message} onChange={(e) => onChange(e.target.value)} />
                    <small>{label}</small>
                </fieldset>
            </div>
        );
    }
}
