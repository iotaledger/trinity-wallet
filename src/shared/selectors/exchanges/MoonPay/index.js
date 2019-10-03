import get from 'lodash/get';
import filter from 'lodash/filter';
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
 * @returns {array}
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
 * @returns {array}
 */
export const getTotalPurchaseAmount = createSelector(
    getExchangesFromState,
    (exchanges) => {
        const currencyQuote = exchanges.moonpay.currencyQuote;

        return get(currencyQuote, 'totalAmount') || 0;
    },
);
