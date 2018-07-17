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
import BackgroundFetch from 'react-native-background-fetch';
import queueFactory from 'react-native-queue';

BackgroundFetch.configure(
    {
        minimumFetchInterval: 15,
    },
    async () => {
        // Based on https://github.com/billmalarky/react-native-queue#os-background-task-full-example
        // and https://github.com/billmalarky/react-native-queue/blob/master/docs/easy-os-background-tasks-in-react-native.md
        console.log('Task defined');
        // Initialize the queue
        const queue = await queueFactory();
        console.log('Queue initialized');

        // Register the background worker
        queue.addWorker('promote-transactions', async (id, payload) => {
            console.log(id);
            console.log(payload);
            await Poll.backgroundPromote(payload);
        });

        console.log('Worker added');

        console.log(queue);

        // Start the queue with a lifespan of 25 sec
        // IMPORTANT: OS background tasks are limited to 30 seconds or less.
        // NOTE: Queue lifespan logic will attempt to stop queue processing 500ms less than passed lifespan for a healthy shutdown buffer.
        console.log('Queue starting');
        await queue.start(30000);

        console.log('Finished');
        
        // Tell OS that we're done the background task
        BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
    },
    (error) => {
        console.log('RNBackgroundFetch failed to start: ' + error);
    },
);

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

    // Same as promote() but refactored for background tasks
    static async backgroundPromote(payload) {
        console.log('Background promoter is running');

        if (!isEmpty(payload)) {
            console.log('Promoting');
            return await Poll.boundPromoteTransfer(payload.bundleHash, payload.tails);
        }
    }

    static async boundPromoteTransfer(bundleHash, tails) {
        return await this.props.promoteTransfer(bundleHash, tails);
    }

    constructor() {
        super();

        this.fetchLatestAccountInfo = this.fetchLatestAccountInfo.bind(this);
        this.promote = this.promote.bind(this);
        Poll.boundPromoteTransfer = Poll.boundPromoteTransfer.bind(this);

        this.state = {
            autoPromoteSkips: 0,
            queue: null,
        };

        this.init();
    }

    componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);
        BackgroundFetch.start();
        this.startBackgroundProcesses();
    }

    componentWillUnmount() {
        timer.clearInterval(this, 'polling');
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    async init() {
        const queue = await queueFactory();
        queue.addWorker('promote-transactions', async (id, payload) => {
            console.log(id);
            console.log(payload);
        });

        this.state.queue = queue;
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

        const bundles = keys(unconfirmedBundleTails);
        const bundleHash = bundles[0];
        console.log(queue);

        if (isAutoPromotionEnabled && !isEmpty(unconfirmedBundleTails)) {
            queue.createJob(
                'promote-transactions', // Job name
                {
                    bundleHash: bundleHash,
                    tails: unconfirmedBundleTails[bundleHash],
                },
                { attempts: 2, timeout: 27000 }, // Retry job up to 2 times if it fails and set a 27 sec timeout
                false, // Must pass false as the last param so the queue starts up in the background task instead of immediately
            );
        } else {
        //    timer.setTimeout(this, 'jobCreator', () => this.createPromoterJob(), 1000);
        }
    }

    startBackgroundProcesses() {
        timer.setInterval(this, 'polling', () => this.fetch(this.props.pollFor), 8000);
        if (this.state.queue) {
            this.createPromoterJob();
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
