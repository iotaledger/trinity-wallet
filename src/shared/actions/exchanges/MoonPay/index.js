import { MoonPayExchangeActionTypes } from '../../../types';
import api, { IOTA_CURRENCY_CODE } from '../../../exchanges/MoonPay';
import { __DEV__ } from '../../../config';

/**
 * Dispatch to set supported currencies by MoonPay
 *
 * @method setSupportedCurrencies
 *
 * @param {array} payload
 *
 * @returns {{type: {string}, payload: {array} }}
 */
export const setSupportedCurrencies = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_SUPPORTED_CURRENCIES,
    payload,
});

/**
 * Dispatch to set Iota exchange rates
 *
 * @method setIotaExchangeRates
 *
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setIotaExchangeRates = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_IOTA_EXCHANGE_RATES,
    payload,
});

/**
 * Dispatch to set active denomination on AddAmount MoonPay screen
 *
 * @method setDenomination
 *
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setDenomination = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_DENOMINATION,
    payload,
});

/**
 * Dispatch to set purchase amount
 *
 * @method setAmount
 *
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setAmount = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_AMOUNT,
    payload,
});

/**
 * Fetches list of all currencies supported by MoonPay
 *
 * @method fetchCurrencies
 *
 * @returns {function}
 */
export const fetchCurrencies = () => (dispatch) => {
    api.fetchCurrencies()
        .then((currencies) => dispatch(setSupportedCurrencies(currencies)))
        .catch((error) => {
            if (__DEV__) {
                /* eslint-disable no-console */
                console.log(error);
                /* eslint-enable no-console */
            }
        });
};

/**
 * Fetches Iota exchange rates
 *
 * @method fetchIotaExchangeRates
 *
 * @returns {function}
 */
export const fetchIotaExchangeRates = () => (dispatch) => {
    api.fetchExchangeRates(IOTA_CURRENCY_CODE)
        .then((exchangeRates) => dispatch(setIotaExchangeRates(exchangeRates)))
        .catch((error) => {
            if (__DEV__) {
                /* eslint-disable no-console */
                console.log(error);
                /* eslint-enable no-console */
            }
        });
};

/**
 * Fetches real-time currency quote
 *
 * @method fetchQuote
 *
 * @param {number} baseCurrencyAmount
 * @param {string} baseCurrencyCode
 *
 * @returns {function}
 */
export const fetchQuote = (baseCurrencyAmount, baseCurrencyCode) => (dispatch) => {
    api.fetchQuote(IOTA_CURRENCY_CODE, baseCurrencyAmount, baseCurrencyCode)
        .then((quote) => {})
        .catch((error) => {
            if (__DEV__) {
                /* eslint-disable no-console */
                console.log(error);
                /* eslint-enable no-console */
            }
        });
};
