import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { initializeTxPromotion } from '../../shared/actions/account';

class Promoter extends Component {
    static propTypes = {
        unconfirmedBundleTails: PropTypes.object.isRequired,
        lastPromotedBundleTails: PropTypes.object.isRequired,
        isReattaching: PropTypes.bool.isRequired,
        isPromoting: PropTypes.bool.isRequired,
        startPromotionAfter: PropTypes.number,
        initializeTxPromotion: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.promote = this.promote.bind(this);
    }

    componentDidMount() {
        this.promote();
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    promote() {
        const {
            startPromotionAfter,
            unconfirmedBundleTails,
            lastPromotedBundleTails,
            isPromoting,
            isReattaching,
        } = this.props;

        this.timer = isNull(this.timer) && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (!isPromoting || !isReattaching) {
                if (!isEmpty(unconfirmedBundleTails)) {
                    const bundles = keys(unconfirmedBundleTails);
                    const top = bundles[0];

                    this.props.initializeTxPromotion(top, unconfirmedBundleTails[top], false);
                } else if (!isEmpty(lastPromotedBundleTails)) {
                    const bundles = keys(lastPromotedBundleTails);
                    const top = bundles[0];

                    this.props.initializeTxPromotion(top, lastPromotedBundleTails[top], true);
                }
            }

            this.timer = null;
            this.promote();
        }, startPromotionAfter);
    }

    render() {
        return null;
    }
}

Promoter.defaultProps = {
    startPromotionAfter: 30000,
};

const mapStateToProps = ({ tempAccount, account }) => ({
    unconfirmedBundleTails: account.unconfirmedBundleTails,
    lastPromotedBundleTails: account.lastPromotedBundleTails,
    isReattaching: tempAccount.isReattaching,
    isPromoting: tempAccount.isReattaching,
});

const mapDispatchToProps = dispatch => ({
    initializeTxPromotion: (bundle, tails, isPromotingLast) =>
        dispatch(initializeTxPromotion(bundle, tails, isPromotingLast)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Promoter);
