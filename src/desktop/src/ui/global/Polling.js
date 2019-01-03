/* global Electron */
import filter from 'lodash/filter';
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import random from 'lodash/random';
import size from 'lodash/size';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    getAccountNamesFromState,
    isSettingUpNewAccount,
    getPromotableBundlesFromState,
    getSelectedAccountName,
} from 'selectors/accounts';
import {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    fetchNodeList,
    setPollFor,
    promoteTransfer,
    getAccountInfoForAllAccounts,
} from 'actions/polling';

/**
 * Background polling component
 */
class Polling extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** Name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** @ignore */
        pollFor: PropTypes.string.isRequired,
        /** @ignore */
        getAccountInfoForAllAccounts: PropTypes.func.isRequired,
        /** @ignore */
        allPollingServices: PropTypes.array.isRequired,
        /** @ignore */
        unconfirmedBundleTails: PropTypes.object.isRequired,
        /** @ignore */
        autoPromotion: PropTypes.bool.isRequired,
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
        promoteTransfer: PropTypes.func.isRequired,
    };

    state = {
        autoPromoteSkips: 0,
    };

    componentDidMount() {
        this.onPollTick = this.fetch.bind(this);
        this.interval = setInterval(this.onPollTick, 8000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    shouldSkipCycle() {
        const props = this.props;

        const isAlreadyDoingSomeHeavyLifting =
            props.isSyncing ||
            props.isSendingTransfer ||
            props.isGeneratingReceiveAddress ||
            props.isFetchingAccountInfo || // In case the app is already fetching latest account info, stop polling because the market related data is already fetched on login
            props.addingAdditionalAccount ||
            props.isTransitioning;

        const isAlreadyPollingSomething =
            props.isPollingPrice ||
            props.isPollingChartData ||
            props.isPollingMarketData ||
            props.isPollingAccountInfo ||
            props.isAutoPromoting;

        return isAlreadyDoingSomeHeavyLifting || isAlreadyPollingSomething;
    }

    fetch = () => {
        if (this.shouldSkipCycle()) {
            return;
        }

        const service = this.props.pollFor;

        const dict = {
            promotion: this.promote,
            marketData: this.props.fetchMarketData,
            price: this.props.fetchPrice,
            chartData: this.props.fetchChartData,
            nodeList: this.props.fetchNodeList,
            accountInfo: this.fetchLatestAccountInfo,
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

    promote = () => {
        const { unconfirmedBundleTails, allPollingServices, pollFor, autoPromotion } = this.props;

        const index = allPollingServices.indexOf(pollFor);
        const next = index === size(allPollingServices) - 1 ? 0 : index + 1;

        const { autoPromoteSkips } = this.state;

        if (autoPromotion && !isEmpty(unconfirmedBundleTails)) {
            if (autoPromoteSkips) {
                this.setState({ autoPromoteSkips: autoPromoteSkips - 1 });
            } else {
                this.setState({ autoPromoteSkips: 2 });

                const bundleHashes = keys(unconfirmedBundleTails);
                const bundleHashToPromote = bundleHashes[random(size(bundleHashes) - 1)];

                const { accountName } = unconfirmedBundleTails[bundleHashToPromote];

                return this.props.promoteTransfer(bundleHashToPromote, accountName);
            }
        }

        // In case there are no unconfirmed bundle tails or auto-promotion is off, move to the next service item
        return this.props.setPollFor(allPollingServices[next]);
    };

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
    isSyncing: state.ui.isSyncing,
    addingAdditionalAccount: isSettingUpNewAccount(state),
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isSendingTransfer: state.ui.isSendingTransfer,
    isFetchingAccountInfo: state.ui.isFetchingAccountInfo,
    autoPromotion: state.settings.autoPromotion,
    accountNames: getAccountNamesFromState(state),
    unconfirmedBundleTails: getPromotableBundlesFromState(state),
    selectedAccountName: getSelectedAccountName(state),
    isTransitioning: state.ui.isTransitioning,
});

const mapDispatchToProps = {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    fetchNodeList,
    setPollFor,
    promoteTransfer,
    getAccountInfoForAllAccounts,
};

export default connect(mapStateToProps, mapDispatchToProps)(Polling);
