import get from 'lodash/get';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import { AppState } from 'react-native';
import { connect } from 'react-redux';
import keychain, { getSeed } from '../util/keychain';

import {
    getAccountInfo,
    setFirstUse,
    getNewTransfers,
    getNewAddressData,
} from 'iota-wallet-shared-modules/actions/account';
import {
    getSelectedAccountViaSeedIndex,
    getSelectedAccountNameViaSeedIndex,
} from 'iota-wallet-shared-modules/selectors/account';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { setUserActivity } from 'iota-wallet-shared-modules/actions/app';

const mapStateToProps = state => ({
    selectedAccount: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
    isGettingTransfers: state.tempAccount.isGettingTransfers,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    isSyncing: state.tempAccount.isSyncing,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    seedIndex: state.tempAccount.seedIndex,
    isFetchingNewAddressData: state.tempAccount.isFetchingNewAddressData,
    hasErrorFetchingNewAddressData: state.tempAccount.hasErrorFetchingNewAddressData,
});

const mapDispatchToProps = {
    getAccountInfo,
    setFirstUse,
    getMarketData,
    getPrice,
    getChartData,
    setUserActivity,
    getNewAddressData,
    generateAlert,
};

export default () => C => {
    class withUserActivity extends Component {
        componentDidMount() {
            this.startBackgroundProcesses();
        }

        componentWillReceiveProps(newProps) {
            if (this.shouldPollForTransfers(newProps)) {
                this.pollForTransfers();
            }
        }

        componentWillUnmount() {
            this.endBackgroundProcesses();
        }

        shouldPollForTransfers(newProps) {
            const isDoneFetchingNewAddressData =
                this.props.isFetchingNewAddressData && !newProps.isFetchingNewAddressData;

            console.log('new', newProps.isFetchingNewAddressData);
            console.log('old', this.props.isFetchingNewAddressData);
            console.log('err', newProps.hasErrorFetchingNewAddressData);
            return isDoneFetchingNewAddressData && !newProps.hasErrorFetchingNewAddressData;
        }

        startBackgroundProcesses = () => {
            AppState.addEventListener('change', this.handleAppStateChange);
            timer.setInterval('polling', () => this.pollForNewAddressesAndTransfers(), 59000);
            timer.setInterval('chartPolling', () => this.pollForMarketData(), 101000);
        };

        endBackgroundProcesses = () => {
            AppState.removeEventListener('change', this.handleAppStateChange);
            timer.clearInterval('polling');
            timer.clearInterval('chartPolling');
        };

        pollForTransfers() {
            return this.props.getAccountInfo(this.props.selectedAccountName, this.props.navigator);
        }

        pollForMarketData = () => {
            const {
                isSyncing,
                isGeneratingReceiveAddress,
                isSendingTransfer,
                getMarketData,
                getChartData,
                getPrice,
            } = this.props;

            if (!isSyncing && !isGeneratingReceiveAddress && !isSendingTransfer) {
                getMarketData();
                getChartData();
                getPrice();
            }
        };

        pollForNewAddressesAndTransfers() {
            const {
                isGettingTransfers,
                isSendingTransfer,
                isSyncing,
                seedIndex,
                selectedAccountName,
                getNewAddressData,
            } = this.props;

            if (!isGettingTransfers && !isSendingTransfer && !isSyncing) {
                console.log('POLLING');

                keychain
                    .get()
                    .then(credentials => {
                        if (get(credentials, 'data')) {
                            const seed = getSeed(credentials.data, seedIndex);
                            getNewAddressData(seed, selectedAccountName);
                        }
                    })
                    .catch(err => console.log(err));
            }
        }

        handleAppStateChange = nextAppState => {
            const { setUserActivity } = this.props;
            if (nextAppState.match(/inactive|background/)) {
                setUserActivity({ minimised: true });
                timer.setTimeout(
                    'background',
                    () => {
                        setUserActivity({ inactive: true });
                    },
                    30000,
                );
            } else if (nextAppState === 'active') {
                setUserActivity({ minimised: false });
                timer.clearTimeout('background');
            }
        };

        render() {
            return (
                <C
                    {...this.props}
                    endBackgroundProcesses={this.endBackgroundProcesses}
                    startBackgroundProcesses={this.startBackgroundProcesses}
                />
            );
        }
    }

    withUserActivity.propTypes = {
        selectedAccount: PropTypes.object.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        isGettingTransfers: PropTypes.bool.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        isSyncing: PropTypes.bool.isRequired,
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        seedIndex: PropTypes.number.isRequired,
        isFetchingNewAddressData: PropTypes.bool.isRequired,
        hasErrorFetchingNewAddressData: PropTypes.bool.isRequired,
        setUserActivity: PropTypes.func.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        getNewAddressData: PropTypes.func.isRequired,
        getMarketData: PropTypes.func.isRequired,
        getChartData: PropTypes.func.isRequired,
        getPrice: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
    };

    return translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(withUserActivity));
};
