import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { getTransfersForSelectedAccount } from '../../selectors/accounts';
import { toggleEmptyTransactions } from '../../actions/ui';

/**
 * List component container
 * @ignore
 */
export default function withListData(ListComponent) {
    class ListData extends React.PureComponent {
        static propTypes = {
            transfers: PropTypes.object.isRequired,
            ui: PropTypes.object.isRequired,
            limit: PropTypes.number,
            filter: PropTypes.string,
            compact: PropTypes.bool,
            setItem: PropTypes.func.isRequired,
            currentItem: PropTypes.any,
            t: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
            updateAccount: PropTypes.func.isRequired,
            toggleEmptyTransactions: PropTypes.func.isRequired,
        };
        render() {
            const {
                updateAccount,
                transfers,
                limit,
                compact,
                filter,
                setItem,
                currentItem,
                toggleEmptyTransactions,
                theme,
                ui,
                t,
            } = this.props;

            const isBusy = ui.isSyncing || ui.isSendingTransfer || ui.isAttachingToTangle || ui.isTransitioning;

            const ListProps = {
                transfers,
                updateAccount,
                setItem,
                currentItem,
                compact,
                theme,
                limit,
                filter,
                isBusy,
                isLoading: ui.isFetchingLatestAccountInfoOnLogin,
                hideEmptyTransactions: ui.hideEmptyTransactions,
                toggleEmptyTransactions: toggleEmptyTransactions,
                t,
            };

            return <ListComponent {...ListProps} />;
        }
    }

    ListData.displayName = `withListData(${ListComponent.displayName || ListComponent.name})`;

    const mapStateToProps = (state) => ({
        accounts: state.accounts,
        transfers: getTransfersForSelectedAccount(state),
        theme: state.settings.theme,
        ui: state.ui,
    });

    const mapDispatchToProps = {
        toggleEmptyTransactions,
    };

    return connect(mapStateToProps, mapDispatchToProps)(translate()(ListData));
}
