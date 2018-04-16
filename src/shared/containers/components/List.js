import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { getTransfersForSelectedAccount } from '../../selectors/accounts';

/**
 * List component container
 * @ignore
 */
export default function withListData(ListComponent) {
    class ListData extends React.PureComponent {
        static propTypes = {
            transfers: PropTypes.object.isRequired,
            wallet: PropTypes.object.isRequired,
            limit: PropTypes.number,
            filter: PropTypes.string,
            compact: PropTypes.bool,
            setItem: PropTypes.func.isRequired,
            currentItem: PropTypes.any,
            t: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
            updateAccount: PropTypes.func.isRequired,
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
                wallet,
                theme,
                t,
            } = this.props;

            const isBusy =
                wallet.isSyncing || wallet.isSendingTransfer || wallet.isAttachingToTangle || wallet.isTransitioning;

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
                isLoading: wallet.isFetchingLatestAccountInfoOnLogin,
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
        wallet: state.wallet,
    });

    return connect(mapStateToProps, {})(translate()(ListData));
}
