import { MoonPayExchangeActionTypes } from '../../../types';
import { generateAlert } from '../../alerts';
import api, { IOTA_CURRENCY_CODE } from '../../../exchanges/MoonPay';
import { getCustomerEmail } from '../../../selectors/exchanges/MoonPay';
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
 * Dispatch to set supported currencies by MoonPay
 *
 * @method setSupportedCountries
 *
 * @param {array} payload
 *
 * @returns {{type: {string}, payload: {array} }}
 */
export const setSupportedCountries = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_SUPPORTED_COUNTRIES,
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
 * Dispatch to set currency quote
 *
 * @method setCurrencyQuote
 *
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setCurrencyQuote = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_CURRENCY_QUOTE,
    payload,
});

/**
 * Dispatch to set account name
 *
 * @method setAccountName
 *
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setAccountName = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_ACCOUNT_NAME,
    payload,
});

/**
 * Dispatch to update customer info
 *
 * @method updateCustomerInfo
 *
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateCustomerInfo = (payload) => ({
    type: MoonPayExchangeActionTypes.UPDATE_CUSTOMER_INFO,
    payload,
});

/**
 * Dispatch when request for email authentication is about to be made
 *
 * @method fullAccountInfoFetchRequest
 *
 * @returns {{type: {string} }}
 */
export const authenticateEmailRequest = () => ({
    type: MoonPayExchangeActionTypes.AUTHENTICATE_EMAIL_REQUEST,
});

/**
 * Dispatch when request for email authentication is successfully made
 *
 * @method authenticateEmailSuccess
 *
 * @returns {{type: {string} }}
 */
export const authenticateEmailSuccess = () => ({
    type: MoonPayExchangeActionTypes.AUTHENTICATE_EMAIL_SUCCESS,
});

/**
 * Dispatch when request for email authentication is not successful
 *
 * @method authenticateEmailError
 *
 * @returns {{type: {string} }}
 */
export const authenticateEmailError = () => ({
    type: MoonPayExchangeActionTypes.AUTHENTICATE_EMAIL_ERROR,
});

/**
 * Dispatch when request for email verification is about to be made
 *
 * @method verifyEmailRequest
 *
 * @returns {{type: {string} }}
 */
export const verifyEmailRequest = () => ({
    type: MoonPayExchangeActionTypes.VERIFY_EMAIL_REQUEST,
});

/**
 * Dispatch when request for email verification is successfully made
 *
 * @method verifyEmailSuccess
 *
 * @returns {{type: {string} }}
 */
export const verifyEmailSuccess = () => ({
    type: MoonPayExchangeActionTypes.VERIFY_EMAIL_SUCCESS,
});

/**
 * Dispatch when request for email verification is not successful
 *
 * @method verifyEmailError
 *
 * @returns {{type: {string} }}
 */
export const verifyEmailError = () => ({
    type: MoonPayExchangeActionTypes.VERIFY_EMAIL_ERROR,
});

/**
 * Dispatch when request for customer update is about to be made
 *
 * @method updateCustomerRequest
 *
 * @returns {{type: {string} }}
 */
export const updateCustomerRequest = () => ({
    type: MoonPayExchangeActionTypes.UPDATE_CUSTOMER_REQUEST,
});

/**
 * Dispatch when request for customer update is successfully made
 *
 * @method updateCustomerSuccess
 *
 * @returns {{type: {string} }}
 */
export const updateCustomerSuccess = () => ({
    type: MoonPayExchangeActionTypes.UPDATE_CUSTOMER_SUCCESS,
});

/**
 * Dispatch when request for customer update is not successful
 *
 * @method updateCustomerError
 *
 * @returns {{type: {string} }}
 */
export const updateCustomerError = () => ({
    type: MoonPayExchangeActionTypes.UPDATE_CUSTOMER_ERROR,
});

/**
 * Dispatch to set payment card info
 *
 * @method setPaymentCardInfo
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setPaymentCardInfo = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_PAYMENT_CARD_INFO,
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
 * Fetches list of all countries supported by MoonPay
 *
 * @method fetchCountries
 *
 * @returns {function}
 */
export const fetchCountries = () => (dispatch) => {
    api.fetchCountries()
        .then((countries) => dispatch(setSupportedCountries(countries)))
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
        .then((quote) => dispatch(setCurrencyQuote(quote)))
        .catch((error) => {
            if (__DEV__) {
                /* eslint-disable no-console */
                console.log(error);
                /* eslint-enable no-console */
            }
        });
};

/**
 * Authenticates customer via email
 *
 * @method authenticateViaEmail
 *
 * @param {string} email
 *
 * @returns {function}
 */
export const authenticateViaEmail = (email) => (dispatch) => {
    dispatch(authenticateEmailRequest());

    api.login(email)
        .then(() => {
            dispatch(updateCustomerInfo({ email }));
            dispatch(authenticateEmailSuccess());
        })
        .catch(() => {
            dispatch(
                generateAlert(
                    'error',
                    'Error authenticating email',
                    'There was an error authenticating your email address. Please try again.',
                ),
            );

            dispatch(authenticateEmailError());
        });
};

/**
 * Verifies customer's email
 *
 * @method verifyEmail
 *
 * @param {string} securityCode
 *
 * @returns {function}
 */
export const verifyEmail = (securityCode) => (dispatch, getState) => {
    dispatch(verifyEmailRequest());

    api.login(getCustomerEmail(getState()), securityCode)
        .then((data) => {
            dispatch(updateCustomerInfo(data.customer));
            dispatch(verifyEmailSuccess());
        })
        .catch(() => {
            dispatch(
                generateAlert(
                    'error',
                    'Error verifying email',
                    'The security code you provided is incorrect. Please try again.',
                ),
            );

            dispatch(verifyEmailError());
        });
};

/**
 * Updates customer's information
 *
 * @method updateCustomer
 *
 * @param {object} info
 *
 * @returns {function}
 */
export const updateCustomer = (info) => (dispatch) => {
    dispatch(updateCustomerRequest());

    // api.updateUserInfo(info)
    new Promise((resolve) => {
        setTimeout(() => resolve(info), 2000);
    })
        // eslint-disable-next-line
        .then((data) => {
            // dispatch(updateCustomerInfo(data.customer));
            dispatch(updateCustomerInfo(info));
            dispatch(updateCustomerSuccess());
        })
        .catch(() => {
            dispatch(
                generateAlert(
                    'error',
                    'Error updating user details',
                    'An unknown error has occurred updating user details. Please try again.',
                ),
            );

            dispatch(updateCustomerError());
        });
};
