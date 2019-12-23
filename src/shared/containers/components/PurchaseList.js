import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getAllTransactions as getAllMoonPayTransactions } from '../../selectors/exchanges/MoonPay';

import {
    fetchTransactions as fetchMoonPayTransactions,
    updateTransactionDetails as updateMoonPayTransactionDetails,
} from '../../actions/exchanges/MoonPay';

/**
 * Purchase list component container
 * @ignore
 */
export default function withPurchaseListData(ListComponent) {
    class PurchaseListData extends React.PureComponent {
        static propTypes = {
            /** @ignore */
            isFetchingMoonPayTransactions: PropTypes.bool.isRequired,
            /** @ignore */
            moonpayPurchases: PropTypes.array.isRequired,
            /** @ignore */
            exchangeRates: PropTypes.object.isRequired,
            /** @ignore */
            ui: PropTypes.object.isRequired,
            currentItem: PropTypes.any,
            /** @ignore */
            fetchMoonPayTransactions: PropTypes.func.isRequired,
            /** @ignore */
            updateMoonPayTransactionDetails: PropTypes.func.isRequired,
            /** @ignore */
            setItem: PropTypes.func.isRequired,
            /** @ignore */
            t: PropTypes.func.isRequired,
        };

        render() {
            const {
                exchangeRates,
                moonpayPurchases,
                isFetchingMoonPayTransactions,
                ui,
                t,
                setItem,
                currentItem,
                updateMoonPayTransactionDetails,
            } = this.props;

            const isBusy = ui.isSyncing || ui.isSendingTransfer || ui.isAttachingToTangle || ui.isTransitioning;

            const ListProps = {
                currentItem,
                exchangeRates,
                purchaseHistory: moonpayPurchases,
                fetchPurchaseHistory: this.props.fetchMoonPayTransactions,
                updateMoonPayTransactionDetails,
                isBusy,
                isLoading: isFetchingMoonPayTransactions,
                setItem,
                t,
            };

            return <ListComponent {...ListProps} />;
        }
    }

    PurchaseListData.displayName = `withPurchaseListData(${ListComponent.displayName || ListComponent.name})`;

    const mapStateToProps = (state) => ({
        isFetchingMoonPayTransactions: state.exchanges.moonpay.isFetchingTransactions,
        exchangeRates: state.exchanges.moonpay.exchangeRates,
        moonpayPurchases: getAllMoonPayTransactions(state),
        ui: state.ui,
    });

    const mapDispatchToProps = {
        fetchMoonPayTransactions,
        updateMoonPayTransactionDetails,
    };

    return connect(mapStateToProps, mapDispatchToProps)(PurchaseListData);
}
