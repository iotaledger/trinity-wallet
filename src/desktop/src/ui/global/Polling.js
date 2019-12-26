/* global Electron */
import head from 'lodash/head';
import filter from 'lodash/filter';
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import random from 'lodash/random';
import size from 'lodash/size';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SeedStore from 'libs/SeedStore';
import {
    getAccountNamesFromState,
    isSettingUpNewAccount,
    getPromotableBundlesFromState,
    getSelectedAccountName,
    getSelectedAccountType,
    getFailedBundleHashes,
} from 'selectors/accounts';
import {
    fetchMarketData,
    fetchNodeList,
    setPollFor,
    promoteTransfer,
    getAccountInfoForAllAccounts,
    fetchMeta as fetchMoonPayMeta,
} from 'actions/polling';
import { retryFailedTransaction } from 'actions/transfers';

/**
 * Background polling component
 */
class Polling extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** Name for selected account */
        selectedAccountName: PropTypes.string,
        /** Type for selected account */
        selectedAccountType: PropTypes.string.isRequired,
        /** @ignore */
        pollFor: PropTypes.string.isRequired,
        /** @ignore */
        getAccountInfoForAllAccounts: PropTypes.func.isRequired,
        /** @ignore */
        allPollingServices: PropTypes.array.isRequired,
        /** @ignore */
        isPollingMarketData: PropTypes.bool.isRequired,
        /** @ignore */
        unconfirmedBundleTails: PropTypes.object.isRequired,
        /** @ignore */
        autoPromotion: PropTypes.bool.isRequired,
        /** @ignore */
        setPollFor: PropTypes.func.isRequired,
        /** @ignore */
        fetchMarketData: PropTypes.func.isRequired,
        /** @ignore */
        fetchNodeList: PropTypes.func.isRequired,
        /** @ignore */
        promoteTransfer: PropTypes.func.isRequired,
        /** @ignore */
        fetchMoonPayMeta: PropTypes.func.isRequired,
        /** Bundle hashes for failed transactions categorised by account name & type */
        failedBundleHashes: PropTypes.shape({
            name: PropTypes.string,
            type: PropTypes.string,
        }).isRequired,
        /** @ignore */
        retryFailedTransaction: PropTypes.func.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        isPollingPrice: PropTypes.bool.isRequired,
        /** @ignore */
        isPollingChartData: PropTypes.bool.isRequired,
        /** @ignore */
        isPollingAccountInfo: PropTypes.bool.isRequired,
        /** @ignore */
        isPollingMoonPayMeta: PropTypes.bool.isRequired,
        /** @ignore */
        isAutoPromoting: PropTypes.bool.isRequired,
        /** @ignore */
        isTransitioning: PropTypes.bool.isRequired,
        /** @ignore */
        isRetryingFailedTransaction: PropTypes.bool.isRequired,
        /** @ignore */
        isSyncing: PropTypes.bool.isRequired,
        /** @ignore */
        addingAdditionalAccount: PropTypes.bool.isRequired,
        /** @ignore */
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        /** @ignore */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** @ignore */
        isFetchingAccountInfo: PropTypes.bool.isRequired,
        /** @ignore */
        isAuthenticatedForMoonPay: PropTypes.bool.isRequired,
    };

    state = {
        autoPromoteSkips: 0,
    };

    componentDidMount() {
        if (Electron.mode === 'cli') {
            return;
        }

        this.onPollTick = this.fetch.bind(this);
        this.interval = setInterval(this.onPollTick, 8000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    moveToNextPollService = () => {
        const { allPollingServices, pollFor } = this.props;

        const index = allPollingServices.indexOf(pollFor);
        const next = index === size(allPollingServices) - 1 ? 0 : index + 1;

        this.props.setPollFor(allPollingServices[next]);
    };

    fetch = () => {
        if (this.shouldSkipCycle()) {
            return;
        }

        const service = this.props.pollFor;

        const dict = {
            promotion: this.promote,
            marketData: this.props.fetchMarketData,
            nodeList: this.props.fetchNodeList,
            accountInfo: this.fetchLatestAccountInfo,
            broadcast: this.retryFailedTransaction,
            moonpayMeta: this.fetchMoonPayMeta,
        };

        dict[service] ? dict[service]() : this.props.setPollFor(this.props.allPollingServices[0]);
    };

    fetchLatestAccountInfo = async () => {
        const { accountNames, selectedAccountName } = this.props;
        this.props.getAccountInfoForAllAccounts(
            [selectedAccountName, ...filter(accountNames, (name) => name !== selectedAccountName)],
            Electron.notify,
        );
    };

    /**
     * Fetch MoonPay transaction history (if user is authenticated)
     *
     * @method fetchMoonPayTransactions
     *
     * @returns {void}
     */
    fetchMoonPayMeta = () => {
        const { isAuthenticatedForMoonPay } = this.props;

        if (isAuthenticatedForMoonPay) {
            this.props.fetchMoonPayMeta();
        } else {
            this.moveToNextPollService();
        }
    };

    /**
     * Retries (performs proof-of-work & broadcasts) a failed transaction
     *
     * @method retryFailedTransaction
     *
     * @returns {undefined}
     */
    retryFailedTransaction = async () => {
        const { failedBundleHashes, password } = this.props;

        if (!isEmpty(failedBundleHashes) && !isEmpty(password)) {
            const bundleHashes = keys(failedBundleHashes);
            const bundleForRetry = head(bundleHashes);
            const { name, type } = failedBundleHashes[bundleForRetry];

            const seedStore = await new SeedStore[type](password, name);

            this.props.retryFailedTransaction(name, bundleForRetry, seedStore);
        } else {
            this.moveToNextPollService();
        }
    };

    promote = async () => {
        const { unconfirmedBundleTails, autoPromotion, selectedAccountType, password } = this.props;

        const { autoPromoteSkips } = this.state;

        if (autoPromotion && !isEmpty(unconfirmedBundleTails)) {
            if (autoPromoteSkips) {
                this.setState({ autoPromoteSkips: autoPromoteSkips - 1 });
            } else {
                this.setState({ autoPromoteSkips: 2 });

                const bundleHashes = keys(unconfirmedBundleTails);
                const bundleHashToPromote = bundleHashes[random(size(bundleHashes) - 1)];

                const { accountName } = unconfirmedBundleTails[bundleHashToPromote];

                const seedStore = await new SeedStore[selectedAccountType](password, name);

                return this.props.promoteTransfer(bundleHashToPromote, accountName, seedStore);
            }
        }

        return this.moveToNextPollService();
    };

    shouldSkipCycle() {
        const isAlreadyDoingSomeHeavyLifting =
            this.props.isSyncing ||
            this.props.isSendingTransfer ||
            this.props.isGeneratingReceiveAddress ||
            this.props.isFetchingAccountInfo || // In case the app is already fetching latest account info, stop polling because the market related data is already fetched on login
            this.props.addingAdditionalAccount ||
            this.props.isTransitioning ||
            this.props.isRetryingFailedTransaction;

        const isAlreadyPollingSomething =
            this.props.isPollingPrice ||
            this.props.isPollingChartData ||
            this.props.isPollingMarketData ||
            this.props.isPollingAccountInfo ||
            this.props.isAutoPromoting ||
            this.props.isPollingMoonPayMeta;

        return isAlreadyDoingSomeHeavyLifting || isAlreadyPollingSomething;
    }

    render() {
        return null;
    }
}

const mapStateToProps = (state) => ({
    pollFor: state.polling.pollFor,
    allPollingServices: state.polling.allPollingServices,
    isPollingPrice: state.polling.isFetchingPrice,
    isPollingChartData: state.polling.isFetchingChartData,
    isPollingMarketData: state.polling.isFetchingMarketData,
    isPollingAccountInfo: state.polling.isFetchingAccountInfo,
    isAutoPromoting: state.polling.isAutoPromoting,
    isPollingMoonPayMeta: state.polling.isFetchingMoonPayMeta,
    isSyncing: state.ui.isSyncing,
    addingAdditionalAccount: isSettingUpNewAccount(state),
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isSendingTransfer: state.ui.isSendingTransfer,
    isFetchingAccountInfo: state.ui.isFetchingAccountInfo,
    autoPromotion: state.settings.autoPromotion,
    accountNames: getAccountNamesFromState(state),
    unconfirmedBundleTails: getPromotableBundlesFromState(state),
    selectedAccountName: getSelectedAccountName(state),
    selectedAccountType: getSelectedAccountType(state),
    isTransitioning: state.ui.isTransitioning,
    isRetryingFailedTransaction: state.ui.isRetryingFailedTransaction,
    failedBundleHashes: getFailedBundleHashes(state),
    password: state.wallet.password,
    isAuthenticatedForMoonPay: state.exchanges.moonpay.isAuthenticated,
});

const mapDispatchToProps = {
    fetchMarketData,
    fetchNodeList,
    setPollFor,
    promoteTransfer,
    getAccountInfoForAllAccounts,
    retryFailedTransaction,
    fetchMoonPayMeta,
};

export default connect(mapStateToProps, mapDispatchToProps)(Polling);
