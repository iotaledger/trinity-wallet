import get from 'lodash/get';
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
        const attachmentTimestamp = get(latestTail, 'attachmentTimestamp');
        return (
            isWithinAnHourAndTenMinutesAgo(attachmentTimestamp) ||
            isWithinAnHourAndTenMinutesAgo(attachmentTimestamp / 1000)
        );
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
        const { startPromotionAfter, unconfirmedBundleTails, isPromoting } = this.props;

        this.timer = isNull(this.timer) && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (!isPromoting) {
                if (!isEmpty(unconfirmedBundleTails)) {
                    const bundles = keys(unconfirmedBundleTails);
                    const top = bundles[0];
                    const tails = unconfirmedBundleTails[top];
                    const isTheOnlyBundle = size(bundles) === 1;

                    const tailsSortedWithAttachmentTimestamp = sortWithProp(tails, 'attachmentTimestamp');
                    const tailWithMostRecentTimestamp = get(tailsSortedWithAttachmentTimestamp, '[0]');

                    if (Promoter.isReady(tailWithMostRecentTimestamp)) {
                        this.props.initializeTxPromotion(top, unconfirmedBundleTails[top]);
                    } else {
                        // Check where it lies within the ten minutes
                        if (
                            !isMinutesAgo(
                                convertUnixTimeToJSDate(
                                    get(tailWithMostRecentTimestamp, 'attachmentTimestamp') ||
                                        !isMinutesAgo(
                                            convertUnixTimeToJSDate(
                                                get(tailWithMostRecentTimestamp, 'attachmentTimestamp') / 1000,
                                            ),
                                        ),
                                ),
                                1,
                            )
                        ) {
                            // Move the top transaction to the last
                            // Ignore if its the only bundle
                            if (!isTheOnlyBundle) {
                                this.props.setNewUnconfirmedBundleTails(
                                    rearrangeObjectKeys(unconfirmedBundleTails, top),
                                );
                            }
                        } else if (
                            isMinutesAgo(
                                convertUnixTimeToJSDate(get(tailWithMostRecentTimestamp, 'attachmentTimestamp')),
                                60,
                            ) ||
                            isMinutesAgo(
                                convertUnixTimeToJSDate(get(tailWithMostRecentTimestamp, 'attachmentTimestamp') / 1000),
                                60,
                            )
                        ) {
                            this.props.removeBundleFromUnconfirmedBundleTails(top);
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
    startPromotionAfter: 30000,
};

const mapStateToProps = ({ tempAccount, account }) => ({
    unconfirmedBundleTails: account.unconfirmedBundleTails,
    isPromoting: tempAccount.isPromoting,
});

const mapDispatchToProps = dispatch => ({
    initializeTxPromotion: (bundle, tails) => dispatch(initializeTxPromotion(bundle, tails)),
    setNewUnconfirmedBundleTails: payload => dispatch(setNewUnconfirmedBundleTails(payload)),
    removeBundleFromUnconfirmedBundleTails: payload => dispatch(removeBundleFromUnconfirmedBundleTails(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Promoter);
