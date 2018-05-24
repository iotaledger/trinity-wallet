/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { generateAlert } from 'actions/alerts';

import css from './clipboard.scss';

/**
 * Copy to clipboard wrapper component
 */
class Clipboard extends React.PureComponent {
    static propTypes = {
        /** Target content copied to clipboard */
        text: PropTypes.string.isRequired,
        /** EOptional element chidlren content */
        children: PropTypes.any,
        /** Timeout to clear the clipboard */
        timeout: PropTypes.number,
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

    static timeout = null;

    copy(e) {
        e.stopPropagation();

        const { text, generateAlert, title, success, timeout } = this.props;

        Electron.clipboard(text);
        generateAlert('success', title, success);

        if (timeout > 0) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(() => {
                Electron.clipboard('');
            }, timeout * 1000);
        }
    }

    render() {
        const { children, text } = this.props;

        return (
            <span className={css.clipboard} onClick={(e) => this.copy(e)}>
                {children || text}
            </span>
        );
    }
}

const mapDispatchToProps = {
    generateAlert,
};

export default connect(null, mapDispatchToProps)(Clipboard);
