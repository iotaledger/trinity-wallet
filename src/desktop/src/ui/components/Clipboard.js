import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { showNotification } from 'actions/notifications';

import css from './clipboard.css';

/**
 * Copy to clipboard wrapper component
 */
class Clipboard extends React.PureComponent {
    static propTypes = {
        /* Target content copied to clipboard */
        text: PropTypes.string.isRequired,
        /* Optional element content, defaults to `text` prop */
        label: PropTypes.string,
        /* Success notification title */
        title: PropTypes.string.isRequired,
        /* Success notification description */
        success: PropTypes.string.isRequired,
        /* Notification helper function
         * @ignore
         */
        showNotification: PropTypes.func.isRequired,
    };

    render() {
        const { label, text, showNotification, title, success } = this.props;

        return (
            <CopyToClipboard text={text}>
                <span
                    className={css.clipboard}
                    onClick={() =>
                        showNotification({
                            type: 'success',
                            title: title,
                            text: success,
                        })
                    }
                >
                    {label || text}
                </span>
            </CopyToClipboard>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    showNotification,
};

export default connect(mapStateToProps, mapDispatchToProps)(Clipboard);
