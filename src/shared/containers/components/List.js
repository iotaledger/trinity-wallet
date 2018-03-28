import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { selectAccountInfo } from '../../selectors/account';

/**
 * List component container
 * @ignore
 */
export default function withListData(ListComponent) {
    class ListData extends React.PureComponent {
        static propTypes = {
            accountInfo: PropTypes.object.isRequired,
            tempAccount: PropTypes.object.isRequired,
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
                accountInfo,
                updateAccount,
                limit,
                compact,
                filter,
                setItem,
                currentItem,
                tempAccount,
                theme,
                t,
            } = this.props;

            const isBusy =
                tempAccount.isSyncing ||
                tempAccount.isSendingTransfer ||
                tempAccount.isAttachingToTangle ||
                tempAccount.isTransitioning;

            const ListProps = {
                transfers: accountInfo.transfers && accountInfo.transfers.length ? accountInfo.transfers : [],
                addresses: Object.keys(accountInfo.addresses),
                updateAccount,
                setItem,
                currentItem,
                compact,
                theme,
                limit,
                filter,
                isBusy,
                isLoading: tempAccount.isFetchingLatestAccountInfoOnLogin,
                t,
            };

            return <ListComponent {...ListProps} />;
        }
    }

    ListData.displayName = `withListData(${ListComponent.displayName || ListComponent.name})`;

    const mapStateToProps = (state) => ({
        account: state.account,
        accountInfo: selectAccountInfo(state),
        theme: state.settings.theme,
        tempAccount: state.tempAccount,
    });

    return connect(mapStateToProps, {})(translate()(ListData));
}
