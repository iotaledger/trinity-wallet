import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import size from 'lodash/size';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import timer from 'react-native-timer';
import { getSelectedAccountNameViaSeedIndex } from 'iota-wallet-shared-modules/selectors/account';
import {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    setPollFor,
    getAccountInfo,
    promoteTransfer,
} from '../../shared/actions/polling';
import { setNewUnconfirmedBundleTails, removeBundleFromUnconfirmedBundleTails } from '../../shared/actions/account';
import keychain, { getSeed } from '../util/keychain';
import { isWithinAnHourAndTenMinutesAgo, isTenMinutesAgo, isAnHourAgo } from '../../shared/libs/promoter';
import { sortWithProp } from '../../shared/libs/accountUtils';
import { rearrangeObjectKeys } from '../../shared/libs/util';

export class Poll extends Component {
    static propTypes = {
        pollFor: PropTypes.string.isRequired,
        allPollingServices: PropTypes.array.isRequired, // oneOf
        isFetchingPrice: PropTypes.bool.isRequired,
        isFetchingChartData: PropTypes.bool.isRequired,
        isFetchingMarketData: PropTypes.bool.isRequired,
        isFetchingAccountInfo: PropTypes.bool.isRequired,
        isPromoting: PropTypes.bool.isRequired,
        isSyncing: PropTypes.bool.isRequired,
        addingAdditionalAccount: PropTypes.bool.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        isFetchingLatestAccountInfoOnLogin: PropTypes.bool.isRequired,
        seedIndex: PropTypes.number.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        unconfirmedBundleTails: PropTypes.object.isRequired,
        setPollFor: PropTypes.func.isRequired,
        fetchMarketData: PropTypes.func.isRequired,
        fetchPrice: PropTypes.func.isRequired,
        fetchChartData: PropTypes.func.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        promoteTransfer: PropTypes.func.isRequired,
        setNewUnconfirmedBundleTails: PropTypes.func.isRequired,
        removeBundleFromUnconfirmedBundleTails: PropTypes.func.isRequired,
    };

    static shouldPromote(latestTail) {
        const attachmentTimestamp = get(latestTail, 'attachmentTimestamp');
        return isWithinAnHourAndTenMinutesAgo(attachmentTimestamp);
    }

    constructor() {
        super();

        this.fetchLatestAccountInfo = this.fetchLatestAccountInfo.bind(this);
        this.promote = this.promote.bind(this);
    }

    componentDidMount() {
        this.startBackgroundProcesses();
    }

    componentWillUnmount() {
        timer.clearInterval('polling');
    }

    shouldSkipCycle() {
        const props = this.props;

        const isAlreadyDoingSomeHeavyLifting =
            props.isSyncing ||
            props.isSendingTransfer ||
            props.isGeneratingReceiveAddress ||
            props.isFetchingLatestAccountInfoOnLogin || // In case the app is already fetching latest account info, stop polling because the market related data is already fetched on login
            props.addingAdditionalAccount;

        const isAlreadyPollingSomething =
            props.isFetchingPrice ||
            props.isFetchingChartData ||
            props.isFetchingMarketData ||
            props.isFetchingAccountInfo ||
            props.isPromoting;

        return isAlreadyDoingSomeHeavyLifting || isAlreadyPollingSomething;
    }

    fetch(service) {
        if (this.shouldSkipCycle()) {
            return;
        }

        const dict = {
            marketData: this.props.fetchMarketData,
            price: this.props.fetchPrice,
            chartData: this.props.fetchChartData,
            accountInfo: this.fetchLatestAccountInfo,
            promotion: this.promote,
        };

        // In case something messed up, reinitialize
        return dict[service] ? dict[service]() : this.props.setPollFor(this.props.allPollingServices[0]); // eslint-disable-line consistent-return
    }

    fetchLatestAccountInfo() {
        const { seedIndex, selectedAccountName } = this.props;

        keychain
            .get()
            .then(credentials => {
                if (get(credentials, 'data')) {
                    const seed = getSeed(credentials.data, seedIndex);
                    this.props.getAccountInfo(seed, selectedAccountName);
                }
            })
            .catch(err => console.error(err)); // eslint-disable-line no-console
    }

    startBackgroundProcesses() {
        timer.setInterval('polling', () => this.fetch(this.props.pollFor), 15000);
    }

    promote() {
        const { unconfirmedBundleTails, allPollingServices, pollFor } = this.props;

        const index = allPollingServices.indexOf(pollFor);
        const next = index === size(allPollingServices) - 1 ? 0 : index + 1;

        if (!isEmpty(unconfirmedBundleTails)) {
            const bundles = keys(unconfirmedBundleTails);
            const top = bundles[0];

            const tails = unconfirmedBundleTails[top];
            const isTheOnlyBundle = size(bundles) === 1;

            const tailsSortedWithAttachmentTimestamp = sortWithProp(tails, 'attachmentTimestamp');
            const tailWithMostRecentTimestamp = get(tailsSortedWithAttachmentTimestamp, '[0]');

            if (Poll.shouldPromote(tailWithMostRecentTimestamp)) {
                this.props.promoteTransfer(top, unconfirmedBundleTails[top]);
            } else {
                /* eslint-disable no-lonely-if */
                // Check where it lies within the ten minutes

                if (!isTenMinutesAgo(get(tailWithMostRecentTimestamp, 'attachmentTimestamp'))) {
                    this.props.setPollFor(allPollingServices[next]);

                    // Move the top transaction to the last
                    // Ignore if its the only bundle
                    if (!isTheOnlyBundle) {
                        this.props.setNewUnconfirmedBundleTails(rearrangeObjectKeys(unconfirmedBundleTails, top));
                    }
                }

                if (isAnHourAgo(get(tailWithMostRecentTimestamp, 'attachmentTimestamp'))) {
                    this.props.removeBundleFromUnconfirmedBundleTails(top);
                    this.props.setPollFor(allPollingServices[next]);
                }

                /* eslint-enable no-lonely-if */
            }
        } else {
            // In case there are no unconfirmed bundle tails, move to the next service item
            this.props.setPollFor(allPollingServices[next]);
        }
    }

    render() {
        return null;
    }
}

const mapStateToProps = state => ({
    pollFor: state.polling.pollFor,
    allPollingServices: state.polling.allPollingServices,
    isFetchingPrice: state.polling.isFetchingPrice,
    isFetchingChartData: state.polling.isFetchingChartData,
    isFetchingMarketData: state.polling.isFetchingMarketData,
    isFetchingAccountInfo: state.polling.isFetchingAccountInfo,
    isPromoting: state.polling.isPromoting,
    isSyncing: state.tempAccount.isSyncing,
    addingAdditionalAccount: state.tempAccount.addingAdditionalAccount,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    isFetchingLatestAccountInfoOnLogin: state.tempAccount.isFetchingLatestAccountInfoOnLogin,
    seedIndex: state.tempAccount.seedIndex,
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
    unconfirmedBundleTails: state.account.unconfirmedBundleTails,
});

const mapDispatchToProps = {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    setPollFor,
    getAccountInfo,
    promoteTransfer,
    setNewUnconfirmedBundleTails,
    removeBundleFromUnconfirmedBundleTails,
};

export default connect(mapStateToProps, mapDispatchToProps)(Poll);
