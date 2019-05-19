import filter from 'lodash/filter';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import size from 'lodash/size';
import random from 'lodash/random';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import timer from 'react-native-timer';
import { AppState } from 'react-native';
import SeedStore from 'libs/SeedStore';
import {
    getSelectedAccountName,
    getPromotableBundlesFromState,
    getAccountNamesFromState,
    isSettingUpNewAccount,
    getFailedBundleHashes,
} from 'shared-modules/selectors/accounts';
import {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    fetchNodeList,
    setPollFor,
    getAccountInfoForAllAccounts,
    promoteTransfer,
} from 'shared-modules/actions/polling';
import { retryFailedTransaction } from 'shared-modules/actions/transfers';

export class Poll extends Component {
    static propTypes = {
        /** @ignore */
        pollFor: PropTypes.string.isRequired,
        /** @ignore */
        allPollingServices: PropTypes.array.isRequired,
        /** Name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Names of wallet accounts */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        unconfirmedBundleTails: PropTypes.object.isRequired,
        /** @ignore */
        isAutoPromotionEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        setPollFor: PropTypes.func.isRequired,
        /** @ignore */
        fetchMarketData: PropTypes.func.isRequired,
        /** @ignore */
        fetchPrice: PropTypes.func.isRequired,
        /** @ignore */
        fetchNodeList: PropTypes.func.isRequired,
        /** @ignore */
        fetchChartData: PropTypes.func.isRequired,
        /** @ignore */
        getAccountInfoForAllAccounts: PropTypes.func.isRequired,
        /** @ignore */
        promoteTransfer: PropTypes.func.isRequired,
        /** Bundle hashes for failed transactions categorised by account name & type */
        failedBundleHashes: PropTypes.shape({
            name: PropTypes.string,
            type: PropTypes.string,
        }).isRequired,
        /** @ignore */
        retryFailedTransaction: PropTypes.func.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.fetchLatestAccountInfo = this.fetchLatestAccountInfo.bind(this);
        this.promote = this.promote.bind(this);
        this.retryFailedTransaction = this.retryFailedTransaction.bind(this);

        this.state = {
            autoPromoteSkips: 0,
        };
    }

    componentDidMount() {
        this.startBackgroundProcesses();
        AppState.addEventListener('change', this.handleAppStateChange);
    }

    componentWillUnmount() {
        timer.clearInterval(this, 'polling');
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    handleAppStateChange = (nextAppState) => {
        if (nextAppState.match(/inactive|background/)) {
            this.stopBackgroundProcesses();
        } else if (nextAppState === 'active') {
            this.startBackgroundProcesses();
        }
    };

    shouldSkipCycle() {
        const props = this.props;

        const isAlreadyDoingSomeHeavyLifting =
            props.isSyncing ||
            props.isSendingTransfer ||
            props.isGeneratingReceiveAddress ||
            props.isFetchingAccountInfo || // In case the app is already fetching latest account info, stop polling because the market related data is already fetched on login
            props.addingAdditionalAccount ||
            props.isTransitioning ||
            props.isPromotingTransaction ||
            props.isRetryingFailedTransaction;

        const isAlreadyPollingSomething =
            props.isPollingPrice ||
            props.isPollingNodeList ||
            props.isPollingChartData ||
            props.isPollingMarketData ||
            props.isPollingAccountInfo ||
            props.isAutoPromoting;

        return isAlreadyDoingSomeHeavyLifting || isAlreadyPollingSomething;
    }

    /**
     * Sets next polling service (in queue) as the active polling service
     *
     * @method moveToNextPollService
     *
     * @returns {undefined}
     */
    moveToNextPollService() {
        const { allPollingServices, pollFor } = this.props;

        const index = allPollingServices.indexOf(pollFor);
        const next = index === size(allPollingServices) - 1 ? 0 : index + 1;

        this.props.setPollFor(allPollingServices[next]);
    }

    fetch(service) {
        if (this.shouldSkipCycle()) {
            return;
        }

        const dict = {
            promotion: this.promote,
            marketData: this.props.fetchMarketData,
            price: this.props.fetchPrice,
            chartData: this.props.fetchChartData,
            nodeList: this.props.fetchNodeList,
            accountInfo: this.fetchLatestAccountInfo,
            broadcast: this.retryFailedTransaction,
        };

        // In case something messed up, reinitialize
        return dict[service] ? dict[service]() : this.props.setPollFor(this.props.allPollingServices[0]); // eslint-disable-line consistent-return
    }

    fetchLatestAccountInfo() {
        const { selectedAccountName, accountNames } = this.props;

        this.props.getAccountInfoForAllAccounts([
            selectedAccountName,
            ...filter(accountNames, (name) => name !== selectedAccountName),
        ]);
    }

    /**
     * Retries (performs proof-of-work & broadcasts) a failed transaction
     *
     * @method retryFailedTransaction
     *
     * @returns {undefined}
     */
    async retryFailedTransaction() {
        const { failedBundleHashes, password } = this.props;

        if (!isEmpty(failedBundleHashes)) {
            const bundleHashes = keys(failedBundleHashes);
            const bundleForRetry = head(bundleHashes);
            const { name, type } = failedBundleHashes[bundleForRetry];

            const seedStore = await new SeedStore[type](password, name);

            this.props.retryFailedTransaction(name, bundleForRetry, seedStore);
        } else {
            this.moveToNextPollService();
        }
    }

    startBackgroundProcesses() {
        timer.setInterval(this, 'polling', () => this.fetch(this.props.pollFor), 8000);
    }

    stopBackgroundProcesses() {
        timer.clearInterval(this, 'polling');
    }

    promote() {
        const { isAutoPromotionEnabled, unconfirmedBundleTails } = this.props;

        const { autoPromoteSkips } = this.state;

        if (isAutoPromotionEnabled && !isEmpty(unconfirmedBundleTails)) {
            if (autoPromoteSkips > 0) {
                this.setState({
                    autoPromoteSkips: autoPromoteSkips - 1,
                });
            } else {
                // TODO (laumair): Promote transactions in order of oldest to latest
                const bundleHashes = keys(unconfirmedBundleTails);
                const bundleHashToPromote = bundleHashes[random(size(bundleHashes) - 1)];

                this.setState({
                    autoPromoteSkips: 2,
                });

                const { accountName } = unconfirmedBundleTails[bundleHashToPromote];
                return this.props.promoteTransfer(bundleHashToPromote, accountName);
            }
        }

        return this.moveToNextPollService();
    }

    render() {
        return null;
    }
}

const mapStateToProps = (state) => ({
    pollFor: state.polling.pollFor,
    allPollingServices: state.polling.allPollingServices,
    isPollingPrice: state.polling.isFetchingPrice,
    isPollingNodeList: state.polling.isFetchingNodeList,
    isPollingChartData: state.polling.isFetchingChartData,
    isPollingMarketData: state.polling.isFetchingMarketData,
    isPollingAccountInfo: state.polling.isFetchingAccountInfo,
    isAutoPromoting: state.polling.isAutoPromoting,
    isAutoPromotionEnabled: state.settings.autoPromotion,
    isPromotingTransaction: state.ui.isPromotingTransaction,
    isRetryingFailedTransaction: state.ui.isRetryingFailedTransaction,
    isSyncing: state.ui.isSyncing,
    addingAdditionalAccount: isSettingUpNewAccount(state),
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isSendingTransfer: state.ui.isSendingTransfer,
    isFetchingAccountInfo: state.ui.isFetchingAccountInfo,
    seedIndex: state.wallet.seedIndex,
    selectedAccountName: getSelectedAccountName(state),
    unconfirmedBundleTails: getPromotableBundlesFromState(state),
    accountNames: getAccountNamesFromState(state),
    isTransitioning: state.ui.isTransitioning,
    failedBundleHashes: getFailedBundleHashes(state),
    password: state.wallet.password,
});

const mapDispatchToProps = {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    fetchNodeList,
    setPollFor,
    getAccountInfoForAllAccounts,
    promoteTransfer,
    retryFailedTransaction,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Poll);
