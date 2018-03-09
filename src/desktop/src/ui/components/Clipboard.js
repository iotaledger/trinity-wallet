/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { generateAlert } from 'actions/alerts';

import css from './clipboard.css';

/**
 * Copy to clipboard wrapper component
 */
class Clipboard extends React.PureComponent {
    static propTypes = {
        /** Target content copied to clipboard */
        text: PropTypes.string.isRequired,
        /** Element chidlren content */
        children: PropTypes.object,
        /** Timeout to clear the clipboard */
        timeout: PropTypes.number,
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
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    copy() {
        const { text, generateAlert, title, success, timeout, t } = this.props;

        Electron.clipboard(text);
        generateAlert('success', title, success);

        if (timeout > 0) {
            setTimeout(() => {
                Electron.clipboard('');
            }, timeout * 1000);
        }
    }

    render() {
        const { children, label, text } = this.props;

        return (
            <span className={css.clipboard} onClick={() => this.copy()}>
                {children || label || text}
            </span>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Clipboard));
