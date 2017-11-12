import isNull from 'lodash/isNull';
import size from 'lodash/size';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RNShakeEvent from 'react-native-shake-event'; // For HockeyApp bug reporting

export default class ReAttacher extends Component {
    constructor() {
        super();

        this.autoReAttach = this.autoReAttach.bind(this);
    }

    componentDidMount() {
        this.autoReAttach();
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    componentWillMount() {
        RNShakeEvent.addEventListener('shake', () => {
            HockeyApp.feedback();
        });
    }

    componentWillUnmount() {
        RNShakeEvent.removeEventListener('shake');
    }

    autoReAttach() {
        const { reAttachAfter, attachments } = this.props;

        this.timer = isNull(this.timer) && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            // Check if there are transactions
            const totalAttachments = size(attachments);
            if (totalAttachments) {
                for (let i = totalAttachments; i--; ) {
                    this.props.attach(attachments[i]);
                }
            }
            this.timer = null;
            this.autoReAttach(reAttachAfter);
        }, reAttachAfter);
    }

    render() {
        return null;
    }
}

ReAttacher.defaultProps = {
    reAttachAfter: 600000,
};

ReAttacher.propTypes = {
    reAttachAfter: PropTypes.number,
    attachments: PropTypes.array.isRequired,
    attach: PropTypes.func.isRequired,
};
