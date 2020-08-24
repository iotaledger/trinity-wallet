/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { generateAlert } from 'actions/alerts';

import css from './clipboard.scss';

/**
 * Copy to clipboard wrapper component
 */
export class ClipboardComponent extends React.PureComponent {
    static timeout = null;

    static propTypes = {
        /** Target content copied to clipboard */
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        /** Clipboard wrapper content */
        children: PropTypes.any,
        /** Timeout to clear the clipboard */
        timeout: PropTypes.number,
        /** Determines whether to disable the copy to clipboard functionality */
        disableCopy: PropTypes.bool,
        /** Success notification title */
        title: PropTypes.string.isRequired,
        /** Success notification description */
        success: PropTypes.string.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
    };

    copy = (e) => {
        if (e) {
            e.stopPropagation();
        }

        const { disableCopy, text, generateAlert, title, success, timeout } = this.props;

        if (!disableCopy) {
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
    };

    render() {
        const { children, text } = this.props;

        return (
            <span className={css.clipboard} onClick={this.copy}>
                {children || text}
            </span>
        );
    }
}

const mapDispatchToProps = {
    generateAlert,
};

export default connect(null, mapDispatchToProps)(ClipboardComponent);
