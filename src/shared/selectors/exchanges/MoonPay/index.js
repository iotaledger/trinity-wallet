import head from 'lodash/head';
import get from 'lodash/get';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';
import size from 'lodash/size';
import uniqBy from 'lodash/uniqBy';
import { createSelector } from 'reselect';
import {
    BASIC_IDENITY_VERIFICATION_LEVEL_NAME,
    ADVANCED_IDENITY_VERIFICATION_LEVEL_NAME,
    COUNTRY_CODES_REQUIRING_STATE,
} from '../../../exchanges/MoonPay';

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
export const getFiatCurrencies = createSelector(getExchangesFromState, (exchanges) => {
    const currencies = exchanges.moonpay.currencies;

    return filter(currencies, (currency) => currency.type === 'fiat');
});

/**
 * Selects MoonPay fee
 *
 * @method getMoonPayFee
 *
 * @param {object} state
 *
 * @returns {number}
 */
export const getMoonPayFee = createSelector(getExchangesFromState, (exchanges) => {
    const currencyQuote = exchanges.moonpay.currencyQuote;

    return get(currencyQuote, 'feeAmount') || 0;
});

/**
 * Selects total purchase amount
 *
 * @method getTotalPurchaseAmount
 *
 * @param {object} state
 *
 * @returns {number}
 */
export const getTotalPurchaseAmount = createSelector(getExchangesFromState, (exchanges) => {
    const currencyQuote = exchanges.moonpay.currencyQuote;

    return get(currencyQuote, 'totalAmount') || 0;
});

/**
 * Selects customer email from state
 *
 * @method getCustomerEmail
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getCustomerEmail = createSelector(getExchangesFromState, (exchanges) => {
    const customer = exchanges.moonpay.customer;

    return get(customer, 'email') || '';
});

/**
 * Selects customer id from state
 *
 * @method getCustomerId
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getCustomerId = createSelector(getExchangesFromState, (exchanges) => {
    const customer = exchanges.moonpay.customer;

    return get(customer, 'id');
});

/**
 * Selects customer country code from state
 *
 * @method getCustomerCountryCode
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getCustomerCountryCode = createSelector(getExchangesFromState, (exchanges) => {
    const customer = exchanges.moonpay.customer;

    return get(customer, 'address.country');
});

/**
 * Determines whether state should be taken as input from user
 *
 * @method shouldRequireStateInput
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const shouldRequireStateInput = createSelector(getExchangesFromState, (exchanges) => {
    const customer = exchanges.moonpay.customer;

    return includes(COUNTRY_CODES_REQUIRING_STATE, get(customer, 'address.country'));
});

/**
 * Selects customer daily limits from state
 *
 * @method getCustomerDailyLimits
 *
 * @param {object} state
 *
 * @returns {object}
 */
export const getCustomerDailyLimits = createSelector(getExchangesFromState, (exchanges) => {
    const purchaseLimits = exchanges.moonpay.customer.purchaseLimits;

    return {
        dailyLimit: get(purchaseLimits, 'limits[0].dailyLimit'),
        dailyLimitRemaining: get(purchaseLimits, 'limits[0].dailyLimitRemaining'),
    };
});

/**
 * Selects customer monthly limits from state
 *
 * @method getCustomerMonthlyLimits
 *
 * @param {object} state
 *
 * @returns {object}
 */
export const getCustomerMonthlyLimits = createSelector(getExchangesFromState, (exchanges) => {
    const purchaseLimits = exchanges.moonpay.customer.purchaseLimits;

    return {
        monthlyLimit: get(purchaseLimits, 'limits[0].monthlyLimit'),
        monthlyLimitRemaining: get(purchaseLimits, 'limits[0].monthlyLimitRemaining'),
    };
});

/**
 * Selects default currency code
 *
 * @method getDefaultCurrencyCode
 *
 * @param {object} state
 *
 * @returns {object}
 */
export const getDefaultCurrencyCode = createSelector(getExchangesFromState, (exchanges) => {
    const customer = exchanges.moonpay.customer;

    return get(customer, 'defaultCurrencyCode');
});

/**
 * Selects selected account name
 *
 * @method getSelectedAccountName
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getSelectedAccountName = createSelector(getExchangesFromState, (exchanges) => {
    return exchanges.moonpay.accountName;
});

/**
 * Selects most recent transaction
 *
 * @method getMostRecentTransaction
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getMostRecentTransaction = createSelector(getExchangesFromState, (exchanges) => {
    const transactions = exchanges.moonpay.transactions;

    return size(transactions)
        ? head(sortBy(transactions, (transaction) => new Date(transaction.createdAt)).reverse())
        : {};
});

/**
 * Gets all Moonpay transactions
 *
 * @method getAllTransactions
 *
 * @param {object} state
 *
 * @returns {array}
 */
export const getAllTransactions = createSelector(getExchangesFromState, (exchanges) => {
    return exchanges.moonpay.transactions;
});

/**
 * Selects active transaction
 *
 * @method getActiveTransaction
 *
 * @param {object} state
 *
 * @returns {object}
 */
export const getActiveTransaction = createSelector(getExchangesFromState, (exchanges) => {
    const transactions = exchanges.moonpay.transactions;

    return find(transactions, { active: true });
});

/**
 * Determines whether a customer has completed basic identity verification
 *
 * @method hasCompletedBasicIdentityVerification
 *
 * @param {object} state
 *
 * @returns {boolean}
 */
export const hasCompletedBasicIdentityVerification = createSelector(getExchangesFromState, (exchanges) => {
    const purchaseLimits = exchanges.moonpay.customer.purchaseLimits;

    const advancedVerification = find(get(purchaseLimits, 'verificationLevels'), {
        name: BASIC_IDENITY_VERIFICATION_LEVEL_NAME,
    });

    return get(advancedVerification, 'completed');
});

/**
 * Determines whether a customer requires advanced identity verification
 *
 * @method hasCompletedAdvancedIdentityVerification
 *
 * @param {object} state
 *
 * @returns {boolean}
 */
export const hasCompletedAdvancedIdentityVerification = createSelector(getExchangesFromState, (exchanges) => {
    const purchaseLimits = exchanges.moonpay.customer.purchaseLimits;

    const advancedVerification = find(get(purchaseLimits, 'verificationLevels'), {
        name: ADVANCED_IDENITY_VERIFICATION_LEVEL_NAME,
    });

    return get(advancedVerification, 'completed');
});

/**
 * Determines if purchase limit increase is allowed by MoonPay
 *
 * @method isLimitIncreaseAllowed
 *
 * @param {object} state
 *
 * @returns {boolean}
 */
export const isLimitIncreaseAllowed = createSelector(getExchangesFromState, (exchanges) => {
    const purchaseLimits = exchanges.moonpay.customer.purchaseLimits;

    return get(purchaseLimits, 'limitIncreaseEligible');
});

/**
 * Gets customer address
 *
 * @method getCustomerAddress
 *
 * @param {object} state
 *
 * @returns {object}
 */
export const getCustomerAddress = createSelector(getExchangesFromState, (exchanges) => {
    const customer = exchanges.moonpay.customer;

    return get(customer, 'address');
});

/**
 * Determines if customer has already added some payment cards on MoonPay servers
 *
 * @method hasStoredAnyPaymentCards
 *
 * @param {object} state
 *
 * @returns {boolean}
 */
export const hasStoredAnyPaymentCards = createSelector(getExchangesFromState, (exchanges) => {
    const customer = exchanges.moonpay.customer;

    return size(get(customer, 'paymentCards')) > 0;
});

/**
 * Gets selected payment card
 *
 * @method getSelectedPaymentCard
 *
 * @param {object} state
 *
 * @returns {boolean}
 */
export const getSelectedPaymentCard = createSelector(getExchangesFromState, (exchanges) => {
    const customer = exchanges.moonpay.customer;
    const paymentCards = get(customer, 'paymentCards');

    return find(paymentCards, { selected: true });
});

/**
 * Gets customer payment cards
 *
 * @method getCustomerPaymentCards
 *
 * @param {object} state
 *
 * @returns {boolean}
 */
export const getCustomerPaymentCards = createSelector(getExchangesFromState, (exchanges) => {
    const customer = exchanges.moonpay.customer;

    // MoonPay card API does not check for duplicates.
    // So it is possible that the payment cards we receive from their servers
    // have duplicate cards. Therefore, just keep a single copy of each card and remove duplicates.
    return uniqBy(get(customer, 'paymentCards'), (card) => [card.lastDigits, card.brand].join()) || [];
});

/**
 * Gets payment card expiry info
 *
 * @method getPaymentCardExpiryInfo
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getPaymentCardExpiryInfo = createSelector(getSelectedPaymentCard, (paymentCard) => {
    return `${get(paymentCard, 'expiryMonth')}/${get(paymentCard, 'expiryYear')}`;
});

/**
 * Gets payment card brand e.g., Visa
 *
 * @method getPaymentCardBrand
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getPaymentCardBrand = createSelector(getSelectedPaymentCard, (paymentCard) => {
    return get(paymentCard, 'brand');
});

/**
 * Gets payment card last digits
 *
 * @method getPaymentCardLastDigits
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getPaymentCardLastDigits = createSelector(getSelectedPaymentCard, (paymentCard) => {
    return get(paymentCard, 'lastDigits');
});

/**
 * Determines if user IP address is allowed
 *
 * @method isIPAddressAllowed
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const isIPAddressAllowed = createSelector(getExchangesFromState, (exchanges) => {
    const ipAddress = exchanges.moonpay.ipAddress;

    return get(ipAddress, 'isAllowed');
});

/**
 * Gets alpha-3 country code for user IP address
 *
 * @method getAlpha3CodeForIPAddress
 *
 * @param {object} state
 *
 * @returns {string}
 */
export const getAlpha3CodeForIPAddress = createSelector(getExchangesFromState, (exchanges) => {
    const ipAddress = exchanges.moonpay.ipAddress;

    return get(ipAddress, 'alpha3');
});
