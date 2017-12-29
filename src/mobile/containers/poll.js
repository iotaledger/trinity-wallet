import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import timer from 'react-native-timer';
import { getSelectedAccountNameViaSeedIndex } from 'iota-wallet-shared-modules/selectors/account';

import { fetchMarketData, fetchChartData, fetchPrice, setPollFor, getAccountInfo } from '../../shared/actions/polling';
import keychain, { getSeed } from '../util/keychain';

export class Poll extends Component {
    static propTypes = {
        pollFor: PropTypes.string.isRequired,
        allPollingServices: PropTypes.array.isRequired,
        isFetchingPrice: PropTypes.bool.isRequired,
        isFetchingChartData: PropTypes.bool.isRequired,
        isFetchingMarketData: PropTypes.bool.isRequired,
        isFetchingAccountInfo: PropTypes.bool.isRequired,
        isSyncing: PropTypes.bool.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        seedIndex: PropTypes.number.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        setPollFor: PropTypes.func.isRequired,
        fetchMarketData: PropTypes.func.isRequired,
        fetchPrice: PropTypes.func.isRequired,
        fetchChartData: PropTypes.func.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.fetchLatestAccountInfo = this.fetchLatestAccountInfo.bind(this);
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
            props.isSyncing || props.isSendingTransfer || props.isGeneratingReceiveAddress;

        const isAlreadyPollingSomething =
            props.isFetchingPrice ||
            props.isFetchingChartData ||
            props.isFetchingMarketData ||
            props.isFetchingAccountInfo;

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
        };

        // In case something messed up, reinitialize
        return dict[service] ? dict[service]() : this.props.setPollFor(this.props.setPollFor[0]); // eslint-disable-line consistent-return
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
        timer.setInterval('polling', () => this.fetch(this.props.pollFor), 1000);
    }

    render() {
        console.log(this.props.pollFor);
        return null;
    }
}

const mapStateToProps = state => ({
    pollFor: state.polling.pollFor,
    allPollingServices: state.polling.allPollingServices, // oneOf
    isFetchingPrice: state.polling.isFetchingPrice,
    isFetchingChartData: state.polling.isFetchingChartData,
    isFetchingMarketData: state.polling.isFetchingMarketData,
    isFetchingAccountInfo: state.polling.isFetchingAccountInfo,
    isSyncing: state.tempAccount.isSyncing,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    seedIndex: state.tempAccount.seedIndex,
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
});

const mapDispatchToProps = {
    fetchMarketData,
    fetchChartData,
    fetchPrice,
    setPollFor,
    getAccountInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(Poll);
