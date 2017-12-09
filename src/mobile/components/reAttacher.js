import isNull from 'lodash/isNull';
import size from 'lodash/size';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';

export default class Reattacher extends Component {
    constructor() {
        super();

        this.autoReattach = this.autoReattach.bind(this);
    }

    componentDidMount() {
        this.autoReattach();
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    autoReattach() {
        const { reattachAfter, attachments } = this.props;

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
            this.autoReattach();
        }, reattachAfter);
    }

    render() {
        return null;
    }
}

Reattacher.defaultProps = {
    reattachAfter: 600000,
};

Reattacher.propTypes = {
    reattachAfter: PropTypes.number,
    attachments: PropTypes.array.isRequired,
    attach: PropTypes.func.isRequired,
};
