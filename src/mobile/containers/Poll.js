import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import size from 'lodash/size';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import timer from 'react-native-timer';
import { AppState } from 'react-native';
import { getSelectedAccountName } from 'iota-wallet-shared-modules/selectors/accounts';
import { removeBundleFromUnconfirmedBundleTails } from 'iota-wallet-shared-modules/actions/accounts';
import {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    fetchNodeList,
    setPollFor,
    getAccountInfo,
    promoteTransfer,
} from 'iota-wallet-shared-modules/actions/polling';
import BackgroundTask from 'react-native-background-task';
import queueFactory from 'react-native-queue';

BackgroundTask.define(async () => {
    // Based on https://github.com/billmalarky/react-native-queue#os-background-task-full-example
    console.log('Task defined');
    // Initialize the queue
    const queue = await queueFactory();
    console.log('queueFactory initialized');

    // Register the background worker
    queue.addWorker('background-promoter', async (id, payload) => {
        console.log('We have transactions to promote!'); //eslint-disable-line no-console
        Poll.backgroundPromote();
    });

    console.log('Worker added');

    // Start the queue with a lifespan of 25 sec
    // IMPORTANT: OS background tasks are limited to 30 seconds or less.
    // NOTE: Queue lifespan logic will attempt to stop queue processing 500ms less than passed lifespan for a healthy shutdown buffer.
    await queue.start(25000);

    // Tell OS that we're done the background task
    BackgroundTask.finish();
});

export class Poll extends Component {
    static propTypes = {
        pollFor: PropTypes.string.isRequired,
        allPollingServices: PropTypes.array.isRequired, // oneOf
        selectedAccountName: PropTypes.string.isRequired,
        unconfirmedBundleTails: PropTypes.object.isRequired,
        isAutoPromotionEnabled: PropTypes.bool.isRequired,
        setPollFor: PropTypes.func.isRequired,
        fetchMarketData: PropTypes.func.isRequired,
        fetchPrice: PropTypes.func.isRequired,
        fetchNodeList: PropTypes.func.isRequired,
        fetchChartData: PropTypes.func.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        promoteTransfer: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.fetchLatestAccountInfo = this.fetchLatestAccountInfo.bind(this);
        this.promote = this.promote.bind(this);

        this.state = {
            autoPromoteSkips: 0,
            queue: null,
        };

        queueFactory().then((queue) => {
            this.setState({ queue });
        });
    }

    componentDidMount() {
        this.startBackgroundProcesses();
        AppState.addEventListener('change', this.handleAppStateChange);
        BackgroundTask.schedule();
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

    createPromoterJob() {
        const { isAutoPromotionEnabled, unconfirmedBundleTails } = this.props;
        const { queue } = this.state;

        if (isAutoPromotionEnabled && !isEmpty(unconfirmedBundleTails) && queue !== null) {
            queue.createJob(
                'promote-transactions', // Job name
                {}, // Empty payload, the promoter will get the hashes from the state
                { attempts: 2, timeout: 20000 }, // Retry job up to 2 times if it fails and set a 20 sec timeout
                false, // Must pass false as the last param so the queue starts up in the background task instead of immediately
            );
        }
    }

    startBackgroundProcesses() {
        timer.setInterval(this, 'polling', () => this.fetch(this.props.pollFor), 8000);
        if (this.state.queue === null) {
            this.createPromoterJob(); // Only create the job if one does not already exist
        }
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

    // Same as function above but optimized for background tasks
    backgroundPromote() {
        console.log('Background promoter is running');
        const { isAutoPromotionEnabled, unconfirmedBundleTails } = this.props;

        if (isAutoPromotionEnabled && !isEmpty(unconfirmedBundleTails)) {
            const bundles = keys(unconfirmedBundleTails);
            const bundleHash = bundles[0];

            return this.props.promoteTransfer(bundleHash, unconfirmedBundleTails[bundleHash]);
        }
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
