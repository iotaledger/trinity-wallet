import includes from 'lodash/includes';
import toLower from 'lodash/toLower';
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { getLatestAddressForMoonPaySelectedAccount } from 'selectors/accounts';
import {
    getMoonPayFee,
    getTotalPurchaseAmount,
    getCustomerDailyLimits,
    getCustomerMonthlyLimits,
    getDefaultCurrencyCode,
    hasCompletedAdvancedIdentityVerification,
    isLimitIncreaseAllowed,
    getPaymentCardExpiryInfo,
    getPaymentCardBrand,
    getPaymentCardLastDigits,
    getActiveTransaction,
} from 'selectors/exchanges/MoonPay';
import { createTransaction } from 'actions/exchanges/MoonPay';
import { generateAlert } from 'actions/alerts';
import { getCurrencySymbol } from 'libs/currency';
import { ALLOWED_IOTA_DENOMINATIONS } from 'exchanges/MoonPay';
import { getActiveFiatCurrency, getAmountInFiat, convertFiatCurrency } from 'exchanges/MoonPay/utils';

import css from './index.scss';

export default function withPurchaseSummary(WrappedComponent) {
    /** MoonPay purchase summary screen component */
    class PurchaseSummary extends React.Component {
        static propTypes = {
            /** @ignore */
            history: PropTypes.shape({
                push: PropTypes.func.isRequired,
            }).isRequired,
            /** @ignore */
            amount: PropTypes.string.isRequired,
            /** @ignore */
            denomination: PropTypes.string.isRequired,
            /** @ignore */
            exchangeRates: PropTypes.object.isRequired,
            /** @ignore */
            fee: PropTypes.number.isRequired,
            /** @ignore */
            totalAmount: PropTypes.number.isRequired,
            /** @ignore */
            address: PropTypes.string.isRequired,
            /** @ignore */
            brand: PropTypes.string.isRequired,
            /** @ignore */
            lastDigits: PropTypes.string.isRequired,
            /** @ignore */
            isCreatingTransaction: PropTypes.bool.isRequired,
            /** @ignore */
            hasErrorCreatingTransaction: PropTypes.bool.isRequired,
            /** @ignore */
            isFetchingTransactionDetails: PropTypes.bool.isRequired,
            /** @ignore */
            hasErrorFetchingTransactionDetails: PropTypes.bool.isRequired,
            /** @ignore */
            dailyLimits: PropTypes.object.isRequired,
            /** @ignore */
            monthlyLimits: PropTypes.object.isRequired,
            /** @ignore */
            defaultCurrencyCode: PropTypes.string.isRequired,
            /** @ignore */
            expiryInfo: PropTypes.string.isRequired,
            /** @ignore */
            hasCompletedAdvancedIdentityVerification: PropTypes.bool.isRequired,
            /** @ignore */
            isPurchaseLimitIncreaseAllowed: PropTypes.bool.isRequired,
            /** @ignore */
            createTransaction: PropTypes.func.isRequired,
            /** @ignore */
            activeTransaction: PropTypes.object,
            /** @ignore */
            generateAlert: PropTypes.func.isRequired,
            /** @ignore */
            t: PropTypes.func.isRequired,
        };

        constructor(props) {
            super(props);

            this.createTransaction = this.createTransaction.bind(this);
        }

        /**
         * Gets receive amount
         *
         * @method getReceiveAmount
         *
         * @returns {string}
         */
        getReceiveAmount() {
            const { amount, denomination, exchangeRates } = this.props;

            if (includes(ALLOWED_IOTA_DENOMINATIONS, denomination)) {
                return amount ? `${amount} Mi` : '0 Mi';
            }

            return amount
                ? `${(Number(amount) / exchangeRates[getActiveFiatCurrency(denomination)]).toFixed(2)} Mi`
                : '0 Mi';
        }

        /**
         * Gets stringified amount in fiat
         *
         * @method getStringifiedFiatAmount
         *
         * @param {number} amount
         *
         * @returns {string}
         */
        getStringifiedFiatAmount(amount) {
            const { denomination } = this.props;
            const activeFiatCurrency = getActiveFiatCurrency(denomination);

            return amount
                ? `${getCurrencySymbol(activeFiatCurrency)}${amount.toFixed(2)}`
                : `${getCurrencySymbol(activeFiatCurrency)}0`;
        }

        /**
         * Creates transaction
         *
         * @method createTransaction
         *
         * @returns {void}
         */
        createTransaction() {
            const {
                amount,
                exchangeRates,
                defaultCurrencyCode,
                dailyLimits,
                monthlyLimits,
                denomination,
                address,
                isPurchaseLimitIncreaseAllowed,
                hasCompletedAdvancedIdentityVerification,
            } = this.props;

            const purchaseAmount = convertFiatCurrency(
                getAmountInFiat(Number(amount), denomination, exchangeRates),
                exchangeRates,
                denomination,
                // Convert to currency code set by user (not in the app) but what it is set on MoonPay servers
                defaultCurrencyCode,
            );

            if (
                isPurchaseLimitIncreaseAllowed &&
                !hasCompletedAdvancedIdentityVerification &&
                (purchaseAmount > dailyLimits.dailyLimitRemaining ||
                    purchaseAmount > monthlyLimits.monthlyLimitRemaining)
            ) {
                this.props.history.push('/exchanges/moonpay/identity-confirmation-warning');
            } else {
                this.props.createTransaction(
                    Number(getAmountInFiat(Number(amount), denomination, exchangeRates).toFixed(2)),
                    toLower(getActiveFiatCurrency(denomination)),
                    address,
                );
            }
        }

        render() {
            const {
                isCreatingTransaction,
                hasErrorCreatingTransaction,
                isFetchingTransactionDetails,
                hasErrorFetchingTransactionDetails,
                amount,
                address,
                brand,
                denomination,
                lastDigits,
                history,
                fee,
                totalAmount,
                t,
                exchangeRates,
                expiryInfo,
                activeTransaction,
                generateAlert,
            } = this.props;

            const receiveAmount = this.getReceiveAmount();
            const activeFiatCurrency = getActiveFiatCurrency(denomination);

            return (
                <WrappedComponent
                    t={t}
                    history={history}
                    activeTransaction={activeTransaction}
                    createTransaction={this.createTransaction}
                    isCreatingTransaction={isCreatingTransaction}
                    hasErrorCreatingTransaction={hasErrorCreatingTransaction}
                    isFetchingTransactionDetails={isFetchingTransactionDetails}
                    hasErrorFetchingTransactionDetails={hasErrorFetchingTransactionDetails}
                    generateAlert={generateAlert}
                >
                    <div className={css.summary}>
                        <div>
                            <span>{t('moonpay:order')}</span>
                            <span>{receiveAmount}</span>
                        </div>
                        <div>
                            <span>{t('moonpay:trinityWalletAddress')}</span>
                        </div>
                        <div>
                            <small>{address}</small>
                        </div>
                        <div>
                            <span>{t('moonpay:debitCard', { brand })}</span>
                            <span>**** **** **** {lastDigits}</span>
                        </div>
                        <div>
                            <span> {t('moonpay:cardExpiry', { brand: 'Visa' })}</span>
                            <span>{expiryInfo}</span>
                        </div>
                        <div>
                            <span>{t('moonpay:youWillReceive')}</span>
                            <span>{receiveAmount}</span>
                        </div>
                        <div>
                            <span>
                                {t('moonpay:marketPrice')}: {receiveAmount} @ {getCurrencySymbol(activeFiatCurrency)}
                                {exchangeRates[activeFiatCurrency]}
                            </span>
                            <span>
                                {this.getStringifiedFiatAmount(
                                    getAmountInFiat(Number(amount), denomination, exchangeRates),
                                )}
                            </span>
                        </div>
                        <div>
                            <span>{t('moonpay:moonpayFee')}</span>
                            <span>
                                {getCurrencySymbol(activeFiatCurrency)}
                                {fee}
                            </span>
                        </div>
                        <div>
                            <span>{t('global:total')}</span>
                            <span>
                                {getCurrencySymbol(activeFiatCurrency)}
                                {totalAmount}
                            </span>
                        </div>
                    </div>
                </WrappedComponent>
            );
        }
    }

    const mapStateToProps = (state) => ({
        amount: state.exchanges.moonpay.amount,
        denomination: state.exchanges.moonpay.denomination,
        exchangeRates: state.exchanges.moonpay.exchangeRates,
        fee: getMoonPayFee(state),
        totalAmount: getTotalPurchaseAmount(state),
        address: getLatestAddressForMoonPaySelectedAccount(state),
        brand: getPaymentCardBrand(state),
        lastDigits: getPaymentCardLastDigits(state),
        expiryInfo: getPaymentCardExpiryInfo(state),
        isCreatingTransaction: state.exchanges.moonpay.isCreatingTransaction,
        hasErrorCreatingTransaction: state.exchanges.moonpay.hasErrorCreatingTransaction,
        isFetchingTransactionDetails: state.exchanges.moonpay.isFetchingTransactionDetails,
        hasErrorFetchingTransactionDetails: state.exchanges.moonpay.hasErrorFetchingTransactionDetails,
        dailyLimits: getCustomerDailyLimits(state),
        monthlyLimits: getCustomerMonthlyLimits(state),
        defaultCurrencyCode: getDefaultCurrencyCode(state),
        hasCompletedAdvancedIdentityVerification: hasCompletedAdvancedIdentityVerification(state),
        isPurchaseLimitIncreaseAllowed: isLimitIncreaseAllowed(state),
        activeTransaction: getActiveTransaction(state),
    });

    const mapDispatchToProps = {
        createTransaction,
        generateAlert,
    };

    return connect(
        mapStateToProps,
        mapDispatchToProps,
    )(withTranslation()(PurchaseSummary));
}
