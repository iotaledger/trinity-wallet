import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import size from 'lodash/size';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import timer from 'react-native-timer';
import { AppState } from 'react-native';
import { getSelectedAccountName } from 'shared/selectors/accounts';
import { removeBundleFromUnconfirmedBundleTails } from 'shared/actions/accounts';
import {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    fetchNodeList,
    setPollFor,
    getAccountInfo,
    promoteTransfer,
} from 'shared/actions/polling';

export class Poll extends Component {
    static propTypes = {
        /** @ignore */
        pollFor: PropTypes.string.isRequired,
        /** @ignore */
        allPollingServices: PropTypes.array.isRequired,
        /** Name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
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
        getAccountInfo: PropTypes.func.isRequired,
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
            props.isFetchingLatestAccountInfoOnLogin || // In case the app is already fetching latest account info, stop polling because the market related data is already fetched on login
            props.addingAdditionalAccount ||
            props.isTransitioning ||
            props.isPromotingTransaction;

        const isAlreadyPollingSomething =
            props.isFetchingPrice ||
            props.isFetchingNodeList ||
            props.isFetchingChartData ||
            props.isFetchingMarketData ||
            props.isFetchingAccountInfo ||
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
        const { selectedAccountName } = this.props;

        this.props.getAccountInfo(selectedAccountName);
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
                const bundles = keys(unconfirmedBundleTails);
                const bundleHash = bundles[0];

                this.setState({
                    autoPromoteSkips: 2,
                });

                return this.props.promoteTransfer(bundleHash, unconfirmedBundleTails[bundleHash]);
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
    isFetchingPrice: state.polling.isFetchingPrice,
    isFetchingNodeList: state.polling.isFetchingNodeList,
    isFetchingChartData: state.polling.isFetchingChartData,
    isFetchingMarketData: state.polling.isFetchingMarketData,
    isFetchingAccountInfo: state.polling.isFetchingAccountInfo,
    isAutoPromoting: state.polling.isAutoPromoting,
    isAutoPromotionEnabled: state.settings.autoPromotion,
    isPromotingTransaction: state.ui.isPromotingTransaction,
    isSyncing: state.ui.isSyncing,
    addingAdditionalAccount: state.wallet.addingAdditionalAccount,
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isSendingTransfer: state.ui.isSendingTransfer,
    isFetchingLatestAccountInfoOnLogin: state.ui.isFetchingLatestAccountInfoOnLogin,
    seedIndex: state.wallet.seedIndex,
    selectedAccountName: getSelectedAccountName(state),
    unconfirmedBundleTails: state.accounts.unconfirmedBundleTails,
    isTransitioning: state.ui.isTransitioning,
});

const mapDispatchToProps = {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    fetchNodeList,
    setPollFor,
    getAccountInfo,
    promoteTransfer,
    removeBundleFromUnconfirmedBundleTails,
};

export default connect(mapStateToProps, mapDispatchToProps)(Poll);
