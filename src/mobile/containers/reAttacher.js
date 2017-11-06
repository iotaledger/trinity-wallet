import isNull from 'lodash/isNull';
import size from 'lodash/size';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

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

    autoReAttach() {
        const { reAttachAfter, attachments } = this.props;
        console.log('ATTACHMENTs', attachments);
        this.timer = isNull(this.timer) && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            // Check if there are transactions
            if (size(attachments)) {
                console.log(attachments);
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
    reAttachAfter: 60000,
};

ReAttacher.propTypes = {
    reAttachAfter: PropTypes.number,
    attachments: PropTypes.array.isRequired,
};
