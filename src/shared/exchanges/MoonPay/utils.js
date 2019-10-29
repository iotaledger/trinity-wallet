import includes from 'lodash/includes';
import {
    ALLOWED_IOTA_DENOMINATIONS,
    DEFAULT_FIAT_CURRENCY,
    MOONPAY_EXTERNAL_LINK_BASE_URL,
    IOTA_CURRENCY_CODE,
} from './index';

/**
 * Gets active fiat currency.
 *
 * @method getActiveFiatCurrency
 *
 * @param {string}
 *
 * @returns {string}
 */
export const getActiveFiatCurrency = (denomination) => {
    if (includes(ALLOWED_IOTA_DENOMINATIONS, denomination)) {
        // Default to USD since we don't allow user to set a default currency.
        return DEFAULT_FIAT_CURRENCY;
    }

    return denomination;
};

/**
 * Gets amount in fiat
 *
 * @method getAmountInFiat
 *
 * @param {number} amount
 * @param {string} denomination
 * @param {object} exchangeRates
 *
 * @returns {number}
 */
export const getAmountInFiat = (amount, denomination, exchangeRates) => {
    if (includes(ALLOWED_IOTA_DENOMINATIONS, denomination)) {
        return amount * exchangeRates[getActiveFiatCurrency(denomination)];
    }

    return amount;
};

/**
 * Gets amount in Miota
 *
 * @method getAmountinMiota
 *
 * @param {number} amount
 * @param {string} denomination
 * @param {object} exchangeRates
 *
 * @returns {number}
 */
export const getAmountinMiota = (amount, denomination, exchangeRates) => {
    if (includes(ALLOWED_IOTA_DENOMINATIONS, denomination)) {
        return amount;
    }

    return amount / exchangeRates[getActiveFiatCurrency(denomination)];
};

/**
 * Gets amount in EUR
 *
 * @method getAmountInEuros
 *
 * @param {number} amount
 * @param {string} denomination
 * @param {object} exchangeRates
 *
 * @returns {number}
 */
export const getAmountInEuros = (amount, denomination, exchangeRates) => {
    if (includes(ALLOWED_IOTA_DENOMINATIONS, denomination)) {
        return amount * exchangeRates.EUR;
    }

    const miotas = getAmountinMiota(amount, denomination, exchangeRates);

    return miotas * exchangeRates.EUR;
};

/**
 * Gets amount in EUR
 *
 * @method getAmountInEuros
 *
 * @param {number} fiatAmount
 * @param {object} exchangeRates
 * @param {string} activeDenomination
 * @param {string} targetDenomination
 *
 * @returns {number}
 */
export const convertCurrency = (fiatAmount, exchangeRates, activeDenomination, targetDenomination = 'EUR') => {
    if (activeDenomination === targetDenomination) {
        return fiatAmount;
    }

    const miotas = getAmountinMiota(fiatAmount, activeDenomination, exchangeRates);

    return miotas * exchangeRates[targetDenomination];
};

export const prepareMoonPayExternalLink = (address, baseCurrencyAmount, baseCurrencyCode) => {
    return `${MOONPAY_EXTERNAL_LINK_BASE_URL}/?currencyCode=${IOTA_CURRENCY_CODE}&walletAddress=${address}&baseCurrencyAmount=${baseCurrencyAmount}&baseCurrencyCode=${baseCurrencyCode}&redirectUrl=iota://moonpay_success`;
};
