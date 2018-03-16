import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import size from 'lodash/size';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import timer from 'react-native-timer';
import { AppState } from 'react-native';
import { translate } from 'react-i18next';
import { getSelectedAccountNameViaSeedIndex } from 'iota-wallet-shared-modules/selectors/account';
import { removeBundleFromUnconfirmedBundleTails } from 'iota-wallet-shared-modules/actions/account';
import {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    setPollFor,
    getAccountInfo,
    promoteTransfer,
} from 'iota-wallet-shared-modules/actions/polling';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { getSeedFromKeychain } from '../util/keychain';

export class Poll extends Component {
    static propTypes = {
        pollFor: PropTypes.string.isRequired,
        allPollingServices: PropTypes.array.isRequired, // oneOf
        generateAlert: PropTypes.func.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        unconfirmedBundleTails: PropTypes.object.isRequired,
        setPollFor: PropTypes.func.isRequired,
        fetchMarketData: PropTypes.func.isRequired,
        fetchPrice: PropTypes.func.isRequired,
        fetchChartData: PropTypes.func.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        promoteTransfer: PropTypes.func.isRequired,
        password: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.fetchLatestAccountInfo = this.fetchLatestAccountInfo.bind(this);
        this.promote = this.promote.bind(this);
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
            props.isTransitioning;

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
            promotion: this.promote,
            marketData: this.props.fetchMarketData,
            price: this.props.fetchPrice,
            chartData: this.props.fetchChartData,
            accountInfo: this.fetchLatestAccountInfo,
        };

        // In case something messed up, reinitialize
        return dict[service] ? dict[service]() : this.props.setPollFor(this.props.allPollingServices[0]); // eslint-disable-line consistent-return
    }

    fetchLatestAccountInfo() {
        const { t, selectedAccountName, password } = this.props;

        getSeedFromKeychain(password, selectedAccountName).then((seed) => {
            if (seed === null) {
                return this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongRestart'),
                );
            }
            this.props.getAccountInfo(seed, selectedAccountName);
        });
    }

    startBackgroundProcesses() {
        timer.setInterval(this, 'polling', () => this.fetch(this.props.pollFor), 15000);
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
    }

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
    isSyncing: state.tempAccount.isSyncing,
    addingAdditionalAccount: state.tempAccount.addingAdditionalAccount,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    isFetchingLatestAccountInfoOnLogin: state.tempAccount.isFetchingLatestAccountInfoOnLogin,
    seedIndex: state.tempAccount.seedIndex,
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.accountNames),
    unconfirmedBundleTails: state.account.unconfirmedBundleTails,
    isTransitioning: state.tempAccount.isTransitioning,
    password: state.tempAccount.password,
});

const mapDispatchToProps = {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    setPollFor,
    getAccountInfo,
    promoteTransfer,
    removeBundleFromUnconfirmedBundleTails,
    generateAlert,
};

export default translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(Poll));
