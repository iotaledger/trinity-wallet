import head from 'lodash/head';
import get from 'lodash/get';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import size from 'lodash/size';
import { createSelector } from 'reselect';

/**
 * Selects exchanges from state object
 *
 * @method getExchangesFromState
 *
 * @param {object} state
 *
 * @returns {object}
 */
export const getExchangesFromState = (state) => state.exchanges || {};

/**
 * Selects MoonPay supported fiat currencies
 *
 * @method getFiatCurrencies
 *
 * @param {object} state
 *
 * @returns {array}
 */
export const getFiatCurrencies = createSelector(
    getExchangesFromState,
    (exchanges) => {
        const currencies = exchanges.moonpay.currencies;

        return filter(currencies, (currency) => currency.type === 'fiat');
    },
);

/**
 * Selects MoonPay fee
 *
 * @method getMoonPayFee
 *
 * @param {object} state
 *
 * @returns {number}
 */
export const getMoonPayFee = createSelector(
    getExchangesFromState,
    (exchanges) => {
        const currencyQuote = exchanges.moonpay.currencyQuote;

        return get(currencyQuote, 'feeAmount') || 0;
    },
);

/**
 * Selects total purchase amount
 *
 * @method getTotalPurchaseAmount
 *
 * @param {object} state
 *
 * @returns {number}
 */
export const getTotalPurchaseAmount = createSelector(
    getExchangesFromState,
    (exchanges) => {
        const currencyQuote = exchanges.moonpay.currencyQuote;

        return get(currencyQuote, 'totalAmount') || 0;
    },
);

/**
 * Selects customer email from state
 *
 * @method getCustomerEmail
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getCustomerEmail = createSelector(
    getExchangesFromState,
    (exchanges) => {
        const customer = exchanges.moonpay.customer;

        return get(customer, 'email') || '';
    },
);

/**
 * Selects customer daily limits from state
 *
 * @method getCustomerDailyLimits
 *
 * @param {object} state
 *
 * @returns {object}
 */
export const getCustomerDailyLimits = createSelector(
    getExchangesFromState,
    (exchanges) => {
        const customer = exchanges.moonpay.customer;

        return {
            dailyLimit: get(customer, 'dailyLimit'),
            dailyLimitRemaining: get(customer, 'dailyLimitRemaining'),
        };
    },
);

/**
 * Selects customer monthly limits from state
 *
 * @method getCustomerMonthlyLimits
 *
 * @param {object} state
 *
 * @returns {object}
 */
export const getCustomerMonthlyLimits = createSelector(
    getExchangesFromState,
    (exchanges) => {
        const customer = exchanges.moonpay.customer;

        return {
            monthlyLimit: get(customer, 'monthlyLimit'),
            monthlyLimitRemaining: get(customer, 'monthlyLimitRemaining'),
        };
    },
);

/**
 * Selects default currency code
 *
 * @method getDefaultCurrencyCode
 *
 * @param {object} state
 *
 * @returns {object}
 */
export const getDefaultCurrencyCode = createSelector(
    getExchangesFromState,
    (exchanges) => {
        const customer = exchanges.moonpay.customer;

        return get(customer, 'defaultCurrencyCode');
    },
);

/**
 * Selects selected account name
 *
 * @method getSelectedAccountName
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getSelectedAccountName = createSelector(
    getExchangesFromState,
    (exchanges) => {
        return exchanges.moonpay.accountName;
    },
);

/**
 * Selects payment card id
 *
 * @method getPaymentCardId
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getPaymentCardId = createSelector(
    getExchangesFromState,
    (exchanges) => {
        const info = exchanges.moonpay.paymentCardInfo;

        return get(info, 'id') || '';
    },
);

/**
 * Selects payment card id
 *
 * @method getPaymentCardId
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getMostRecentTransaction = createSelector(
    getExchangesFromState,
    (exchanges) => {
        const transactions = exchanges.moonpay.transactions;

        return size(transactions)
            ? head(sortBy(transactions, (transaction) => new Date(transaction.createdAt)).reverse())
            : {};
    },
);
