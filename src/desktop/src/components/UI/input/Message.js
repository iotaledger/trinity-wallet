import React from 'react';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import css from './Message.css';

export default class MessageInput extends React.PureComponent {
    static propTypes = {
        message: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        onChange: PropTypes.func.isRequired,
    };

    render() {
        const { message, placeholder, onChange } = this.props;

        return (
            <div className={css.messageInput}>
                <div>
                    <Textarea
                        value={message}
                        placeholder={placeholder}
                        onChange={e => this.props.onChange(e.target.value)}
                    />
                    <small />
                </div>
            </div>
        );
    }
}
