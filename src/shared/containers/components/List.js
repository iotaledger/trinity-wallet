import React from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';
import { getSelectedAccountName, getAccountNamesFromState } from '../../selectors/accounts';

import { generateAlert } from '../../actions/alerts';
import { toggleEmptyTransactions } from '../../actions/settings';
import { promoteTransaction, retryFailedTransaction } from '../../actions/transfers';

import { getThemeFromState } from '../../selectors/global';

import { mapNormalisedTransactions, formatRelevantTransactions } from '../../libs/iota/transfers';

/**
 * List component container
 * @ignore
 */
export default function withListData(ListComponent) {
    class ListData extends React.PureComponent {
        static propTypes = {
            /** Current account index, where -1 is total balance */
            index: PropTypes.number,
            seedIndex: PropTypes.number.isRequired,
            ui: PropTypes.object.isRequired,
            accounts: PropTypes.object.isRequired,
            accountName: PropTypes.string,
            mode: PropTypes.string.isRequired,
            limit: PropTypes.number,
            filter: PropTypes.string,
            compact: PropTypes.bool,
            setItem: PropTypes.func.isRequired,
            currentItem: PropTypes.any,
            t: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
            updateAccount: PropTypes.func,
            toggleEmptyTransactions: PropTypes.func.isRequired,
            hideEmptyTransactions: PropTypes.bool.isRequired,
            promoteTransaction: PropTypes.func.isRequired,
            retryFailedTransaction: PropTypes.func.isRequired,
            remotePoW: PropTypes.bool.isRequired,
            generateAlert: PropTypes.func.isRequired,
            /** Wallet account names */
            accountNames: PropTypes.array.isRequired,
        };

        getAccountTransactions = (accountData) => {
            const addresses = map(accountData.addressData, (addressData) => addressData.address);
            const transactions = mapNormalisedTransactions(accountData.transactions, accountData.addressData);
            return formatRelevantTransactions(transactions, addresses);
        };

        retryFailedTransaction = (bundle, powFn) => {
            this.props.retryFailedTransaction(this.props.accountName, bundle, powFn);
        };

        promoteTransaction = (hash, powFn) => {
            this.props.promoteTransaction(hash, this.props.accountName, powFn);
        };

        render() {
            const {
                accountNames,
                index,
                seedIndex,
                accounts,
                updateAccount,
                limit,
                compact,
                filter,
                mode,
                setItem,
                currentItem,
                toggleEmptyTransactions,
                hideEmptyTransactions,
                theme,
                remotePoW,
                generateAlert,
                ui,
                t,
            } = this.props;

            const isBusy = ui.isSyncing || ui.isSendingTransfer || ui.isAttachingToTangle || ui.isTransitioning;

            const accountName = accountNames[typeof index === 'number' ? index : seedIndex];

            if (!accountName && index !== -1) {
                return null;
            }

            const transactions =
                index !== -1
                    ? this.getAccountTransactions(accounts.accountInfo[accountName])
                    : Object.entries(accounts.accountInfo).reduce(
                          (transactions, [_accountName, accountData]) => transactions.concat(this.getAccountTransactions(accountData)),
                          [],
                      );

            const ListProps = {
                transactions,
                updateAccount,
                setItem,
                currentItem,
                compact,
                theme,
                limit,
                filter,
                isBusy,
                mode,
                remotePoW,
                isLoading: ui.isFetchingAccountInfo,
                currentlyPromotingBundleHash: ui.currentlyPromotingBundleHash,
                isRetryingFailedTransaction: ui.isRetryingFailedTransaction,
                hideEmptyTransactions,
                toggleEmptyTransactions: toggleEmptyTransactions,
                promoteTransaction: this.promoteTransaction,
                retryFailedTransaction: this.retryFailedTransaction,
                generateAlert,
                t,
            };

            return <ListComponent {...ListProps} />;
        }
    }

    ListData.displayName = `withListData(${ListComponent.displayName || ListComponent.name})`;

    const mapStateToProps = (state) => ({
        seedIndex: state.wallet.seedIndex,
        accounts: state.accounts,
        accountName: getSelectedAccountName(state),
        theme: getThemeFromState(state),
        accountNames: getAccountNamesFromState(state),
        mode: state.settings.mode,
        ui: state.ui,
        hideEmptyTransactions: state.settings.hideEmptyTransactions,
        remotePoW: state.settings.remotePoW,
    });

    const mapDispatchToProps = {
        toggleEmptyTransactions,
        promoteTransaction,
        retryFailedTransaction,
        generateAlert,
    };

    return connect(
        mapStateToProps,
        mapDispatchToProps,
    )(withI18n()(ListData));
}
