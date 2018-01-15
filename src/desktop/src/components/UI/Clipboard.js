import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { showNotification } from 'actions/notifications';

import css from './Clipboard.css';

class Clipboard extends React.PureComponent {
    static propTypes = {
        text: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        success: PropTypes.string.isRequired,
        showNotification: PropTypes.func.isRequired,
    };

    render() {
        const { text, showNotification, title, success } = this.props;

        return (
            <CopyToClipboard text={text}>
                <span
                    className={css.clipboard}
                    onClick={() =>
                        showNotification({
                            type: 'success',
                            title: title,
                            text: success,
                        })}
                >
                    {text}
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
