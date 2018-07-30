import React, { Component } from 'react';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getAccountInfo } from 'iota-wallet-shared-modules/actions/accounts';
import { getSelectedAccountName } from 'iota-wallet-shared-modules/selectors/accounts';
import { translate } from 'react-i18next';
import { getSeedFromKeychain } from '../utils/keychain';

const mapDispatchToProps = {
    generateAlert,
    getAccountInfo,
};

const mapStateToProps = (state) => ({
    isPollingAccountInfo: state.polling.isFetchingAccountInfo,
    isFetchingLatestAccountInfo: state.ui.isFetchingLatestAccountInfoOnLogin,
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isSendingTransfer: state.ui.isSendingTransfer,
    isTransitioning: state.ui.isTransitioning,
    isSyncing: state.ui.isSyncing,
    selectedAccountName: getSelectedAccountName(state),
    password: state.wallet.password,
    seedIndex: state.wallet.seedIndex,
});

export default () => (C) => {
    class WithManualRefresh extends Component {
        constructor(props) {
            super(props);
            this.state = {
                isRefreshing: false,
            };
            this.onRefresh = this.onRefresh.bind(this);
        }

        componentWillReceiveProps(newProps) {
            const { seedIndex } = this.props;
            if (this.props.isFetchingLatestAccountInfo && !newProps.isFetchingLatestAccountInfo) {
                this.setState({ isRefreshing: false });
            }
            if (this.props.isPollingAccountInfo && !newProps.isPollingAccountInfo) {
                this.setState({ isRefreshing: false });
            }
            if (seedIndex !== newProps.seedIndex) {
                this.setState({ isRefreshing: false });
            }
        }

        /**
         * Triggers a refresh
         */
        onRefresh() {
            const { isRefreshing, isPollingAccountInfo } = this.state;

            if (isRefreshing) {
                return;
            }

            if (isPollingAccountInfo) {
                return this.setState({ isRefreshing: true });
            }

            if (!this.shouldPreventManualRefresh()) {
                this.setState({ isRefreshing: true });
                this.updateAccountData();
            }
        }

        /**
         *  Updates account with latest data
         */
        updateAccountData() {
            const { t, selectedAccountName, password } = this.props;
            getSeedFromKeychain(password, selectedAccountName)
                .then((seed) => {
                    if (seed === null) {
                        return this.props.generateAlert(
                            'error',
                            t('global:somethingWentWrong'),
                            t('global:somethingWentWrongTryAgain'),
                        );
                    }
                    this.props.getAccountInfo(seed, selectedAccountName);
                })
                .catch((err) => console.log(err));
        }

        /**
         * Prevents more than one refresh from occurring at the same time
         */
        shouldPreventManualRefresh() {
            const {
                isSyncing,
                isSendingTransfer,
                isGeneratingReceiveAddress,
                isTransitioning,
                isPollingAccountInfo,
            } = this.props;

            const isAlreadyDoingSomeHeavyLifting =
                isSyncing || isSendingTransfer || isGeneratingReceiveAddress || isTransitioning;

            const isAlreadyFetchingAccountInfo = isPollingAccountInfo;

            return isAlreadyDoingSomeHeavyLifting || isAlreadyFetchingAccountInfo;
        }

        render() {
            const props = { ...this.props, onRefresh: this.onRefresh, isRefreshing: this.state.isRefreshing };
            return <C {...props} />;
        }
    }

    WithManualRefresh.propTypes = {
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Account name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Hash for wallet's password */
        password: PropTypes.object.isRequired,
        /** Fetch latest account information
         * @param {string} seed - seed value
         * @param {string} selectedAccountName
         */
        getAccountInfo: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification titleinactivityLogoutContainer
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Determines if there is already a network call going on for fetching latest account info */
        isFetchingLatestAccountInfo: PropTypes.bool.isRequired,
        /** Determines if background poll is already fetching latest acocunt info */
        isPollingAccountInfo: PropTypes.bool.isRequired,
        /** Determines if wallet is manually syncing account information */
        isSyncing: PropTypes.bool.isRequired,
        /** Determines if wallet is making a transaction */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** Determines if wallet is generating receive address */
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        /** Determines if wallet is doing snapshot transition */
        isTransitioning: PropTypes.bool.isRequired,
        /** Index of currently selected account in accountNames list */
        seedIndex: PropTypes.number.isRequired,
    };

    return translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(WithManualRefresh));
};
