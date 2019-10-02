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

        console.log('Currencies', currencies);
        return filter(currencies, (currency) => currency.type === 'fiat');
    },
);
