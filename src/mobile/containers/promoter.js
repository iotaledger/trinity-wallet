import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import size from 'lodash/size';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { sortWithProp } from '../../shared/libs/accountUtils';
import {
    initializeTxPromotion,
    setNewUnconfirmedBundleTails,
    setNewLastPromotedBundleTails,
    removeBundleFromLastPromotedBundleTails,
    removeBundleFromUnconfirmedBundleTails,
} from '../../shared/actions/account';
import { isWithinAnHourAndTenMinutesAgo } from '../../shared/libs/promoter';
import { isMinutesAgo, convertUnixTimeToJSDate } from '../../shared/libs/dateUtils';
import { rearrangeObjectKeys } from '../../shared/libs/util';

class Promoter extends Component {
    static propTypes = {
        unconfirmedBundleTails: PropTypes.object.isRequired,
        lastPromotedBundleTails: PropTypes.object.isRequired,
        isPromoting: PropTypes.bool.isRequired,
        startPromotionAfter: PropTypes.number,
        initializeTxPromotion: PropTypes.func.isRequired,
        setNewUnconfirmedBundleTails: PropTypes.func.isRequired,
        removeBundleFromUnconfirmedBundleTails: PropTypes.func.isRequired,
        setNewLastPromotedBundleTails: PropTypes.func.isRequired,
        removeBundleFromLastPromotedBundleTails: PropTypes.func.isRequired,
    };

    static isReady(latestTail) {
        return isWithinAnHourAndTenMinutesAgo(latestTail.timestamp);
    }

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
        const { startPromotionAfter, unconfirmedBundleTails, lastPromotedBundleTails, isPromoting } = this.props;

        this.timer = isNull(this.timer) && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (!isPromoting) {
                if (!isEmpty(unconfirmedBundleTails)) {
                    const bundles = keys(unconfirmedBundleTails);
                    const top = bundles[0];
                    const tails = unconfirmedBundleTails[top];
                    const isTheOnlyBundle = size(bundles) === 1;

                    const tailsSortedWithTimestamp = sortWithProp(tails, 'timestamp');

                    if (Promoter.isReady(tailsSortedWithTimestamp[0])) {
                        this.props.initializeTxPromotion(top, unconfirmedBundleTails[top], false);
                    } else {
                        // Check where it lies within the ten minutes
                        if (!isMinutesAgo(convertUnixTimeToJSDate(tailsSortedWithTimestamp[0].timestamp), 1)) {
                            // Move the top transaction to the last
                            // Ignore if its the only bundle
                            if (!isTheOnlyBundle) {
                                this.props.setNewUnconfirmedBundleTails(
                                    rearrangeObjectKeys(unconfirmedBundleTails, top),
                                );
                            }
                        } else if (isMinutesAgo(convertUnixTimeToJSDate(tailsSortedWithTimestamp[0]), 60)) {
                            this.props.removeBundleFromUnconfirmedBundleTails(top);
                        }
                    }
                } else if (!isEmpty(lastPromotedBundleTails)) {
                    const bundles = keys(lastPromotedBundleTails);
                    const top = bundles[0];
                    const tails = lastPromotedBundleTails[top];
                    const isTheOnlyBundle = size(bundles) === 1;

                    const tailsSortedWithTimestamp = sortWithProp(tails, 'timestamp');

                    if (Promoter.isReady(tailsSortedWithTimestamp[0])) {
                        this.props.initializeTxPromotion(top, lastPromotedBundleTails[top], true);
                    } else {
                        if (!isMinutesAgo(convertUnixTimeToJSDate(tailsSortedWithTimestamp[0].timestamp), 1)) {
                            if (!isTheOnlyBundle) {
                                this.props.setNewLastPromotedBundleTails(
                                    rearrangeObjectKeys(lastPromotedBundleTails, top),
                                );
                            }
                        } else if (isMinutesAgo(convertUnixTimeToJSDate(tailsSortedWithTimestamp[0]), 60)) {
                            this.props.removeBundleFromLastPromotedBundleTails(top);
                        }
                    }
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
    startPromotionAfter: 60000,
};

const mapStateToProps = ({ tempAccount, account }) => ({
    unconfirmedBundleTails: account.unconfirmedBundleTails,
    lastPromotedBundleTails: account.lastPromotedBundleTails,
    isPromoting: tempAccount.isPromoting,
});

const mapDispatchToProps = dispatch => ({
    initializeTxPromotion: (bundle, tails, isPromotingLast) =>
        dispatch(initializeTxPromotion(bundle, tails, isPromotingLast)),
    setNewUnconfirmedBundleTails: payload => dispatch(setNewUnconfirmedBundleTails(payload)),
    removeBundleFromUnconfirmedBundleTails: payload => dispatch(removeBundleFromUnconfirmedBundleTails(payload)),
    setNewLastPromotedBundleTails: payload => dispatch(setNewLastPromotedBundleTails(payload)),
    removeBundleFromLastPromotedBundleTails: payload => dispatch(removeBundleFromLastPromotedBundleTails(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Promoter);
