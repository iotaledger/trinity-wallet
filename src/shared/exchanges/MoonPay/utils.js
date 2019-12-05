import includes from 'lodash/includes';
import get from 'lodash/get';
import {
    ALLOWED_IOTA_DENOMINATIONS,
    DEFAULT_FIAT_CURRENCY,
    MOONPAY_EXTERNAL_URL,
    IOTA_CURRENCY_CODE,
    MOONPAY_REDIRECT_URL,
} from './index';
import i18next from '../../libs/i18next';

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
        // Fallback to default since we don't allow user to set a default currency.
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
 * @method convertFiatToMiota
 *
 * @param {number} fiatAmount
 * @param {string} denomination
 * @param {object} exchangeRates
 *
 * @returns {number}
 */
export const convertFiatToMiota = (fiatAmount, denomination, exchangeRates) => {
    return fiatAmount / exchangeRates[getActiveFiatCurrency(denomination)];
};

/**
 * Converts fiat currency to another
 * E.g: USD -> GBP
 *
 * @method convertFiatCurrency
 *
 * @param {number} fiatAmount
 * @param {object} exchangeRates
 * @param {string} activeDenomination
 * @param {string} targetDenomination
 *
 * @returns {number}
 */
export const convertFiatCurrency = (fiatAmount, exchangeRates, activeDenomination, targetDenomination = 'EUR') => {
    // If current currency is equal to target currency, then no need to convert
    if (activeDenomination === targetDenomination) {
        return fiatAmount;
    }

    const miotas = convertFiatToMiota(fiatAmount, activeDenomination, exchangeRates);

    return miotas * exchangeRates[targetDenomination];
};

/**
 * Prepares MoonPay external link for performing identity verification
 *
 * @method prepareMoonPayExternalLink
 *
 * @param {string} email
 * @param {string} address
 * @param {string} baseCurrencyAmount
 * @param {string} baseCurrencyCode
 *
 * @return {string}
 */
export const prepareMoonPayExternalLink = (email, address, baseCurrencyAmount, baseCurrencyCode) => {
    return `${MOONPAY_EXTERNAL_URL}&email=${email}&currencyCode=${IOTA_CURRENCY_CODE}&walletAddress=${address}&baseCurrencyAmount=${baseCurrencyAmount}&baseCurrencyCode=${baseCurrencyCode}&redirectURL=${MOONPAY_REDIRECT_URL}`;
};

/**
 * Returns purchase failure reason string
 *
 * @method getPurchaseFailureReason
 *
 * @param {string} failure reason
 *
 * @return {string}
 */
export const getPurchaseFailureReason = (failureReason) => {
    const failureReasons = {
        'Payment authorization declined': i18next.t('moonpay:paymentAuthorisationDeclined'),
        '3D Secure timeout': i18next.t('moonpay:3DSecureTimeout'),
        'Transaction declined': i18next.t('moonpay:transactionDeclined'),
        'Internal error': i18next.t('moonpay:internalError'),
        'Identity check timeout': i18next.t('moonpay:identityCheckTimeout'),
        'Refund': i18next.t('moonpay:refund'),
        'Rejection is final for user identity check': i18next.t('moonpay:idRejection'),
        'Card not supported': i18next.t('moonpay:cardNotSupported'),
        'Cancelled': i18next.t('moonpay:cancelled')
    }
    return get(failureReasons, failureReason, i18next.t('global:unknown'));
}
