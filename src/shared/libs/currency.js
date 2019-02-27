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

export const availableCurrencies = [
    'USD',
    'GBP',
    'EUR',
    'AUD',
    'BGN',
    'BRL',
    'CAD',
    'CHF',
    'CNY',
    'CZK',
    'DKK',
    'HKD',
    'HRK',
    'HUF',
    'IDR',
    'ILS',
    'INR',
    'ISK',
    'JPY',
    'KRW',
    'MXN',
    'MYR',
    'NOK',
    'NZD',
    'PHP',
    'PLN',
    'RON',
    'RUB',
    'SEK',
    'SGD',
    'THB',
    'TRY',
    'ZAR',
];
