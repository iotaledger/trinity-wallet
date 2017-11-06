import isNull from 'lodash/isNull';
import size from 'lodash/size';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { iota } from '../../shared/libs/iota';

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
        const { reAttachAfter, transfers, addresses } = this.props;
        this.timer = isNull(this.timer) && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            // Check if there are transfers
            if (size(transfers)) {
                const categorizedTransfers = iota.utils.categorizeTransfers(transfers, addresses);
                const sent = get(categorizedTransfers, 'sent');
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
    transfers: PropTypes.array.isRequired,
    addresses: PropTypes.array.isRequired,
};
