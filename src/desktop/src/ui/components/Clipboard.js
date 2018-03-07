import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { generateAlert } from 'actions/alerts';

import css from './clipboard.css';

/**
 * Copy to clipboard wrapper component
 */
class Clipboard extends React.PureComponent {
    static propTypes = {
        /** Target content copied to clipboard */
        text: PropTypes.string.isRequired,
        /** Optional element content, defaults to `text` prop */
        label: PropTypes.string,
        /** Success notification title */
        title: PropTypes.string.isRequired,
        /** Success notification description */
        success: PropTypes.string.isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
    };

    render() {
        const { label, text, generateAlert, title, success } = this.props;

        return (
            <CopyToClipboard text={text}>
                <span className={css.clipboard} onClick={() => generateAlert('success', title, success)}>
                    {label || text}
                </span>
            </CopyToClipboard>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(Clipboard);
