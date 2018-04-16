import React from 'react';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import size from 'lodash/size';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { removeBundleFromUnconfirmedBundleTails } from 'actions/accounts';
import {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    setPollFor,
    promoteTransfer,
    getAccountInfo,
} from 'actions/polling';

/** Background wallet polling component */
class Polling extends React.PureComponent {
    static propTypes = {
        accountNames: PropTypes.array.isRequired,
        pollFor: PropTypes.string.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        allPollingServices: PropTypes.array.isRequired,
        unconfirmedBundleTails: PropTypes.object.isRequired,
        setPollFor: PropTypes.func.isRequired,
        fetchMarketData: PropTypes.func.isRequired,
        fetchPrice: PropTypes.func.isRequired,
        fetchChartData: PropTypes.func.isRequired,
        promoteTransfer: PropTypes.func.isRequired,
    };

    state = {
        accountIndex: 0,
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
            props.isFetchingLatestAccountInfoOnLogin || // In case the app is already fetching latest account info, stop polling because the market related data is already fetched on login
            props.addingAdditionalAccount ||
            props.isTransitioning;

        const isAlreadyPollingSomething =
            props.isFetchingPrice ||
            props.isFetchingChartData ||
            props.isFetchingMarketData ||
            props.isFetchingAccountInfo ||
            props.isPromoting;

        return isAlreadyDoingSomeHeavyLifting || isAlreadyPollingSomething;
    }

    fetch = () => {
        if (this.shouldSkipCycle()) {
            return;
        }

        let service = this.props.pollFor;

        //Loop all accounts before reseting poll service queue
        if (this.state.accountIndex) {
            if (this.state.accountIndex >= this.props.accountNames.length) {
                this.props.setPollFor(this.props.allPollingServices[0]);
                service = this.props.allPollingServices[0];
                this.setState({
                    accountIndex: 0,
                });
            } else {
                this.fetchLatestAccountInfo();
                return;
            }
        }

        const dict = {
            promotion: this.promote,
            marketData: this.props.fetchMarketData,
            price: this.props.fetchPrice,
            chartData: this.props.fetchChartData,
            accountInfo: this.fetchLatestAccountInfo,
        };

        dict[service] ? dict[service]() : this.props.setPollFor(this.props.allPollingServices[0]);
    };

    fetchLatestAccountInfo = async () => {
        const { accountIndex } = this.state;
        const { accountNames } = this.props;
        this.props.getAccountInfo(accountNames[accountIndex]);
        this.setState({
            accountIndex: accountIndex + 1,
        });
    };

    promote = () => {
        const { unconfirmedBundleTails, allPollingServices, pollFor } = this.props;

        const index = allPollingServices.indexOf(pollFor);
        const next = index === size(allPollingServices) - 1 ? 0 : index + 1;

        if (!isEmpty(unconfirmedBundleTails)) {
            const bundles = keys(unconfirmedBundleTails);
            const top = bundles[0];

            return this.props.promoteTransfer(top, unconfirmedBundleTails[top]);
        }

        // In case there are no unconfirmed bundle tails, move to the next service item
        return this.props.setPollFor(allPollingServices[next]);
    };

    render() {
        return null;
    }
}

const mapStateToProps = (state) => ({
    pollFor: state.polling.pollFor,
    allPollingServices: state.polling.allPollingServices,
    isFetchingPrice: state.polling.isFetchingPrice,
    isFetchingChartData: state.polling.isFetchingChartData,
    isFetchingMarketData: state.polling.isFetchingMarketData,
    isFetchingAccountInfo: state.polling.isFetchingAccountInfo,
    isPromoting: state.polling.isPromoting,
    isSyncing: state.ui.isSyncing,
    addingAdditionalAccount: state.wallet.addingAdditionalAccount,
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isSendingTransfer: state.ui.isSendingTransfer,
    isFetchingLatestAccountInfoOnLogin: state.ui.isFetchingLatestAccountInfoOnLogin,
    accountNames: state.accounts.accountNames,
    unconfirmedBundleTails: state.accounts.unconfirmedBundleTails,
    isTransitioning: state.ui.isTransitioning,
});

const mapDispatchToProps = {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    setPollFor,
    promoteTransfer,
    getAccountInfo,
    removeBundleFromUnconfirmedBundleTails,
};

export default connect(mapStateToProps, mapDispatchToProps)(Polling);
