import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import {
    getTransfersForSelectedAccount,
    getSelectedAccountName,
    getFailedBundleHashesForSelectedAccount,
} from '../../selectors/accounts';

import { generateAlert } from '../../actions/alerts';
import { toggleEmptyTransactions } from '../../actions/settings';
import { broadcastBundle, promoteTransaction, retryFailedTransaction } from '../../actions/transfers';

/**
 * List component container
 * @ignore
 */
export default function withListData(ListComponent) {
    class ListData extends React.PureComponent {
        static propTypes = {
            transfers: PropTypes.object.isRequired,
            ui: PropTypes.object.isRequired,
            accountName: PropTypes.string.isRequired,
            mode: PropTypes.string.isRequired,
            limit: PropTypes.number,
            filter: PropTypes.string,
            compact: PropTypes.bool,
            setItem: PropTypes.func.isRequired,
            currentItem: PropTypes.any,
            t: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
            updateAccount: PropTypes.func.isRequired,
            toggleEmptyTransactions: PropTypes.func.isRequired,
            hideEmptyTransactions: PropTypes.bool.isRequired,
            promoteTransaction: PropTypes.func.isRequired,
            broadcastBundle: PropTypes.func.isRequired,
            retryFailedTransaction: PropTypes.func.isRequired,
            remotePoW: PropTypes.bool.isRequired,
            generateAlert: PropTypes.func.isRequired,
            failedHashes: PropTypes.object.isRequired,
        };

        promoteTransaction = (hash, powFn) => {
            this.props.promoteTransaction(hash, this.props.accountName, powFn);
        };

        broadcastBundle = (bundle) => {
            this.props.broadcastBundle(bundle, this.props.accountName);
        };

        retryFailedTransaction = (bundle, powFn) => {
            this.props.retryFailedTransaction(this.props.accountName, bundle, powFn);
        };

        render() {
            const {
                updateAccount,
                transfers,
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
                failedHashes,
                ui,
                t,
            } = this.props;

            const isBusy = ui.isSyncing || ui.isSendingTransfer || ui.isAttachingToTangle || ui.isTransitioning;

            const ListProps = {
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
                remotePoW,
                isLoading: ui.isFetchingLatestAccountInfoOnLogin,
                currentlyPromotingBundleHash: ui.currentlyPromotingBundleHash,
                isBroadcastingBundle: ui.isBroadcastingBundle,
                isRetryingFailedTransaction: ui.isRetryingFailedTransaction,
                hideEmptyTransactions,
                toggleEmptyTransactions: toggleEmptyTransactions,
                broadcastBundle: this.broadcastBundle,
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
        accounts: state.accounts,
        accountName: getSelectedAccountName(state),
        transfers: getTransfersForSelectedAccount(state),
        failedHashes: getFailedBundleHashesForSelectedAccount(state),
        theme: state.settings.theme,
        mode: state.settings.mode,
        ui: state.ui,
        hideEmptyTransactions: state.settings.hideEmptyTransactions,
        remotePoW: state.settings.remotePoW,
    });

    const mapDispatchToProps = {
        toggleEmptyTransactions,
        broadcastBundle,
        promoteTransaction,
        retryFailedTransaction,
        generateAlert,
    };

    return connect(
        mapStateToProps,
        mapDispatchToProps,
    )(translate()(ListData));
}
