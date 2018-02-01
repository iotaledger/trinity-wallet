import React from 'react';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import css from './Input.css';

export default class MessageInput extends React.PureComponent {
    static propTypes = {
        message: PropTypes.string.isRequired,
        label: PropTypes.string,
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
