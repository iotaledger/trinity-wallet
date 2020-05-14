import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    getSelectedAccountName,
    getSelectedAccountMeta,
    getAccountNamesFromState,
    getTransactionsForAccountIndex,
    getAddressesForAccountIndex,
} from '../../selectors/accounts';

import { generateAlert } from '../../actions/alerts';
import { toggleEmptyTransactions } from '../../actions/settings';
import { promoteTransaction, retryFailedTransaction } from '../../actions/transfers';

import { getThemeFromState } from '../../selectors/global';

import { formatRelevantTransactions } from '../../libs/iota/transfers';

/**
 * List component container
 * @ignore
 */
export default function withListData(ListComponent) {
    class ListData extends React.PureComponent {
        static propTypes = {
            index: PropTypes.number,
            seedIndex: PropTypes.number.isRequired,
            ui: PropTypes.object.isRequired,
            accountName: PropTypes.string,
            accountMeta: PropTypes.object.isRequired,
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
            generateAlert: PropTypes.func.isRequired,
            password: PropTypes.object.isRequired,
            accountNames: PropTypes.array.isRequired,
            transactions: PropTypes.array.isRequired,
            addresses: PropTypes.array.isRequired,
        };

        promoteTransaction = (hash, seedStore) => {
            this.props.promoteTransaction(hash, this.props.accountName, seedStore);
        };

        retryFailedTransaction = (bundle, seedStore) => {
            this.props.retryFailedTransaction(this.props.accountName, bundle, seedStore);
        };

        render() {
            const {
                accountNames,
                accountMeta,
                password,
                index,
                seedIndex,
                transactions,
                addresses,
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
                generateAlert,
                ui,
                t,
            } = this.props;

            const isBusy = ui.isSyncing || ui.isSendingTransfer || ui.isAttachingToTangle || ui.isTransitioning;

            const accountName = accountNames[typeof index === 'number' ? index : seedIndex];

            if (!accountName && index !== -1) {
                return null;
            }

            const relevantTransactions = formatRelevantTransactions(transactions, addresses);

            const ListProps = {
                transactions: relevantTransactions,
                accountMeta,
                password,
                updateAccount,
                setItem,
                currentItem,
                compact,
                theme,
                limit,
                filter,
                isBusy,
                mode,
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

    const makeMapStateToProps = () => {
        const _getTransactionsForAccountIndex = getTransactionsForAccountIndex();
        const _getAddressesForAccountIndex = getAddressesForAccountIndex();

        const mapStateToProps = (state, props) => {
            return {
                seedIndex: state.wallet.seedIndex,
                accountName: getSelectedAccountName(state),
                theme: getThemeFromState(state),
                accountMeta: getSelectedAccountMeta(state),
                accountNames: getAccountNamesFromState(state),
                transactions: _getTransactionsForAccountIndex(state, props.index),
                addresses: _getAddressesForAccountIndex(state, props.index),
                mode: state.settings.mode,
                ui: state.ui,
                hideEmptyTransactions: state.settings.hideEmptyTransactions,
                password: state.wallet.password,
            };
        };

        return mapStateToProps
    };

    const mapDispatchToProps = {
        toggleEmptyTransactions,
        promoteTransaction,
        retryFailedTransaction,
        generateAlert,
    };

    return connect(makeMapStateToProps, mapDispatchToProps)(ListData);
}
