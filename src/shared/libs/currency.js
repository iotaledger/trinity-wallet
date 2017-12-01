export const getCurrencySymbol = currency => {
    let symbol = '';
    switch (currency) {
        case 'USD':
            symbol = '$';
            break;
        case 'GBP':
            symbol = '£';
            break;
        case 'EUR':
            symbol = '€';
            break;
        case 'AUD':
            symbol = '$';
            break;
        case 'BGN':
            symbol = 'лв';
            break;
        case 'BRL':
            symbol = 'R$';
            break;
        case 'CAD':
            symbol = '$';
            break;
        case 'CHF':
            symbol = 'CHF';
            break;
        case 'CNY':
            symbol = '¥';
            break;
        case 'CZK':
            symbol = 'Kč';
            break;
        case 'DKK':
            symbol = 'kr';
            break;
        case 'HKD':
            symbol = '$';
            break;
        case 'HRK':
            symbol = 'kn';
            break;
        case 'HUF':
            symbol = 'Ft';
            break;
        case 'IDR':
            symbol = 'Rp';
            break;
        case 'ILS':
            symbol = '₪';
            break;
        case 'INR':
            symbol = '₹';
            break;
        case 'JPY':
            symbol = '¥';
            break;
        case 'KRW':
            symbol = '₩';
            break;
        case 'MXN':
            symbol = '$';
            break;
        case 'MYR':
            symbol = 'RM';
            break;
        case 'NOK':
            symbol = 'kr';
            break;
        case 'NZD':
            symbol = '$';
            break;
        case 'PHP':
            symbol = '₱';
            break;
        case 'PLN':
            symbol = 'zł';
            break;
        case 'RON':
            symbol = 'RON';
            break;
        case 'RUB':
            symbol = '₽';
            break;
        case 'SEK':
            symbol = 'kr';
            break;
        case 'SGD':
            symbol = '$';
            break;
        case 'THB':
            symbol = '฿';
            break;
        case 'TRY':
            symbol = '₺';
            break;
        case 'ZAR':
            symbol = 'R';
            break;
    }
    return symbol;
};
