export const getCurrencySymbol = (currency) => {
    switch (currency) {
        case 'USD':
            return '$';
        case 'GBP':
            return '£';
        case 'EUR':
            return '€';
        case 'AUD':
            return '$';
        case 'BTC':
            return '₿';
        case 'ETH':
            return 'Ξ';
        case 'ARS':
            return '$';
        case 'BGN':
            return 'лв';
        case 'BRL':
            return 'R$';
        case 'CAD':
            return '$';
        case 'CHF':
            return 'CHF';
        case 'CNY':
            return '¥';
        case 'CZK':
            return 'Kč';
        case 'DKK':
            return 'kr';
        case 'HKD':
            return '$';
        case 'HRK':
            return 'kn';
        case 'HUF':
            return 'Ft';
        case 'IDR':
            return 'Rp';
        case 'ILS':
            return '₪';
        case 'INR':
            return '₹';
        case 'JPY':
            return '¥';
        case 'KRW':
            return '₩';
        case 'MXN':
            return '$';
        case 'MYR':
            return 'RM';
        case 'NOK':
            return 'kr';
        case 'NZD':
            return '$';
        case 'PHP':
            return '₱';
        case 'PLN':
            return 'zł';
        case 'RON':
            return 'RON';
        case 'RUB':
            return '₽';
        case 'SEK':
            return 'kr';
        case 'SGD':
            return '$';
        case 'THB':
            return '฿';
        case 'TRY':
            return '₺';
        case 'ZAR':
            return 'R';
    }
};

export const getNextDenomination = (currency, denomination) => {
    const availableDenominations = ['i', 'Ki', 'Mi', 'Gi', 'Ti', getCurrencySymbol(currency)];
    const indexOfDenomination = availableDenominations.indexOf(denomination);
    const nextDenomination =
        indexOfDenomination === -1 || indexOfDenomination === 5
            ? availableDenominations[0]
            : availableDenominations[indexOfDenomination + 1];
    return nextDenomination;
};

export const getIOTAUnitMultiplier = (denomination) => {
    let multiplier = 1;
    switch (denomination) {
        case 'i':
            break;
        case 'Ki':
            multiplier = 1000;
            break;
        case 'Mi':
            multiplier = 1000000;
            break;
        case 'Gi':
            multiplier = 1000000000;
            break;
        case 'Ti':
            multiplier = 1000000000000;
            break;
    }
    return multiplier;
};

/**
 * Format iotas to monetary value
 * @param {*} iotas - Input value in iotas
 * @param {*} unitPrice - One iota price
 * @param {string} currency - Target currency code
 */
export const formatMonetaryValue = (iotas, unitPrice, currency) => {
    const value = (Math.round((iotas * unitPrice) / 10000) / 100).toFixed(2);
    return `${currency ? getCurrencySymbol(currency) + ' ' : ''}${value}`;
};

/**
 * Returns fiat balance
 * @param {number} balance
 * @param {number} usdPrice
 * @param {number} conversionRate
 */
export const getFiatBalance = (balance, usdPrice, conversionRate) => {
    return ((balance * usdPrice) / 1000000) * conversionRate;
};

/**
 * Format fiat balance
 * @param  {string} locale
 * @param  {string} currency
 * @param  {number} fiatBalance
 * @return {string}
 */
export const formatFiatBalance = (locale, currency, fiatBalance) => {
    // FIXME(rajivshah3): Temporarily mitigate crashes
    // Will be fixed when language codes are standardized
    // See https://github.com/iotaledger/trinity-wallet/issues/2039
    let intl = null;

    // Replace underscore with hyphen
    locale = locale.replace(/_/g, '-');
    try {
        intl = new Intl.NumberFormat(locale, { style: 'currency', currency, localeMatcher: 'best fit' });
    } catch {
        intl = new Intl.NumberFormat('en', { style: 'currency', currency, localeMatcher: 'best fit' });
    }
    return intl.format(fiatBalance);
};

export const availableCurrencies = {
    USD: 1,
    GBP: 1,
    EUR: 1,
    AUD: 1,
    BGN: 1,
    BRL: 1,
    CAD: 1,
    CHF: 1,
    CNY: 1,
    CZK: 1,
    DKK: 1,
    HKD: 1,
    HRK: 1,
    HUF: 1,
    IDR: 1,
    ILS: 1,
    INR: 1,
    ISK: 1,
    JPY: 1,
    KRW: 1,
    MXN: 1,
    MYR: 1,
    NOK: 1,
    NZD: 1,
    PHP: 1,
    PLN: 1,
    RON: 1,
    RUB: 1,
    SEK: 1,
    SGD: 1,
    THB: 1,
    TRY: 1,
    ZAR: 1,
};
