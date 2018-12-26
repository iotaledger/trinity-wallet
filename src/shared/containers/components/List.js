import React from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';
import {
    getSelectedAccountName,
    getFailedBundleHashesForSelectedAccount,
    getSelectedAccountMeta,
    getAccountNamesFromState,
} from '../../selectors/accounts';

import { generateAlert } from '../../actions/alerts';
import { toggleEmptyTransactions } from '../../actions/settings';
import { promoteTransaction, retryFailedTransaction } from '../../actions/transfers';

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
            failedHashes: PropTypes.object.isRequired,
            password: PropTypes.object.isRequired,
            /** Wallet account names */
            accountNames: PropTypes.array.isRequired,
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
                generateAlert,
                failedHashes,
                ui,
                t,
            } = this.props;

            const isBusy = ui.isSyncing || ui.isSendingTransfer || ui.isAttachingToTangle || ui.isTransitioning;

            const accountName = accountNames[typeof index === 'number' ? index : seedIndex];

            if (!accountName && index !== -1) {
                return null;
            }

            const transfers =
                index !== -1
                    ? map(accounts.accountInfo[accountName].transfers, (tx) => tx)
                    : Object.entries(accounts.accountInfo).reduce(
                          (list, account) => list.concat(map(account[1].transfers, (tx) => tx)),
                          [],
                      );

            const ListProps = {
                accountMeta,
                password,
                transfers,
                updateAccount,
                setItem,
                currentItem,
                failedHashes,
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

    const mapStateToProps = (state) => ({
        seedIndex: state.wallet.seedIndex,
        accounts: state.accounts,
        accountName: getSelectedAccountName(state),
        accountMeta: getSelectedAccountMeta(state),
        failedHashes: getFailedBundleHashesForSelectedAccount(state),
        accountNames: getAccountNamesFromState(state),
        theme: state.settings.theme,
        mode: state.settings.mode,
        ui: state.ui,
        hideEmptyTransactions: state.settings.hideEmptyTransactions,
        password: state.wallet.password,
    });

    const mapDispatchToProps = {
        toggleEmptyTransactions,
        promoteTransaction,
        retryFailedTransaction,
        generateAlert,
    };

    return connect(mapStateToProps, mapDispatchToProps)(withI18n()(ListData));
}
