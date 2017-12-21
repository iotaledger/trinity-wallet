import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import { AppState } from 'react-native';
import { connect } from 'react-redux';

import { getAccountInfo, setFirstUse } from 'iota-wallet-shared-modules/actions/account';
import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { setUserActivity } from 'iota-wallet-shared-modules/actions/app';

import DropdownHolder from './dropdownHolder';

const mapStateToProps = state => ({
    alerts: state.alerts,
    tempAccount: state.tempAccount,
    settings: state.settings,
    account: state.account,
});

const mapDispatchToProps = {
    getAccountInfo,
    setFirstUse,
    getMarketData,
    getPrice,
    getChartData,
    setUserActivity,
};

export default () => C => {
    class withUserActivity extends Component {
        componentDidMount() {
            this.startBackgroundProcesses();
        }

        componentWillUnmount() {
            this.endBackgroundProcesses();
        }

        onNodeErrorPolling = () => {
            const dropdown = DropdownHolder.getDropdown();
            const { t } = this.props;
            dropdown.alertWithType('error', t('global:invalidResponse'), t('invalidResponsePollingExplanation'));
        };

        startChartPolling = () => {
            const { settings, getMarketData, getChartData, getPrice } = this.props;
            // 'console.log('POLLING CHART DATA')'
            if (!settings.isSyncing && !settings.isGeneratingReceiveAddress && !settings.isSendingTransfer) {
                getMarketData();
                getChartData();
                getPrice();
            }
        };

        startAccountPolling = () => {
            const { tempAccount, account, getAccountInfo } = this.props;
            if (!tempAccount.isGettingTransfers && !tempAccount.isSendingTransfer && !tempAccount.isSyncing) {
                // console.log('POLLING TX HISTORY')
                const seedIndex = tempAccount.seedIndex;
                const seedName = account.seedNames[seedIndex];
                const accountInfo = account.accountInfo;
                getAccountInfo(seedName, seedIndex, accountInfo, (error, success) => {
                    if (error) this.onNodeErrorPolling();
                });
            }
        };

        startBackgroundProcesses = () => {
            AppState.addEventListener('change', this.handleAppStateChange);
            timer.setInterval('polling', () => this.startAccountPolling(), 47000);
            timer.setInterval('chartPolling', () => this.startChartPolling(), 101000);
        };

        endBackgroundProcesses = () => {
            AppState.removeEventListener('change', this.handleAppStateChange);
            timer.clearInterval('polling');
            timer.clearInterval('chartPolling');
        };

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
        setUserActivity: PropTypes.func.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        getMarketData: PropTypes.func.isRequired,
        getChartData: PropTypes.func.isRequired,
        getPrice: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
    };

    return translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(withUserActivity));
};
