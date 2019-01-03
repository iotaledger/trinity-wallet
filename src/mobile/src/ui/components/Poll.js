import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import size from 'lodash/size';
import random from 'lodash/random';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import timer from 'react-native-timer';
import { AppState } from 'react-native';
import {
    getSelectedAccountName,
    getPromotableBundlesFromState,
    getAccountNamesFromState,
    isSettingUpNewAccount,
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
    };

    constructor() {
        super();

        this.fetchLatestAccountInfo = this.fetchLatestAccountInfo.bind(this);
        this.promote = this.promote.bind(this);

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

    shouldSkipCycle() {
        const props = this.props;

        const isAlreadyDoingSomeHeavyLifting =
            props.isSyncing ||
            props.isSendingTransfer ||
            props.isGeneratingReceiveAddress ||
            props.isFetchingAccountInfo || // In case the app is already fetching latest account info, stop polling because the market related data is already fetched on login
            props.addingAdditionalAccount ||
            props.isTransitioning ||
            props.isPromotingTransaction;

        const isAlreadyPollingSomething =
            props.isPollingPrice ||
            props.isPollingNodeList ||
            props.isPollingChartData ||
            props.isPollingMarketData ||
            props.isPollingAccountInfo ||
            props.isAutoPromoting;

        return isAlreadyDoingSomeHeavyLifting || isAlreadyPollingSomething;
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

    startBackgroundProcesses() {
        timer.setInterval(this, 'polling', () => this.fetch(this.props.pollFor), 8000);
    }

    handleAppStateChange = (nextAppState) => {
        if (nextAppState.match(/inactive|background/)) {
            this.stopBackgroundProcesses();
        } else if (nextAppState === 'active') {
            this.startBackgroundProcesses();
        }
    };

    stopBackgroundProcesses() {
        timer.clearInterval(this, 'polling');
    }

    promote() {
        const { isAutoPromotionEnabled, unconfirmedBundleTails, allPollingServices, pollFor } = this.props;

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

        const index = allPollingServices.indexOf(pollFor);
        const next = index === size(allPollingServices) - 1 ? 0 : index + 1;

        // In case there are no unconfirmed bundle tails or auto-promotion is disabled, move to the next service item
        return this.props.setPollFor(allPollingServices[next]);
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
});

const mapDispatchToProps = {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    fetchNodeList,
    setPollFor,
    getAccountInfoForAllAccounts,
    promoteTransfer,
};

export default connect(mapStateToProps, mapDispatchToProps)(Poll);
