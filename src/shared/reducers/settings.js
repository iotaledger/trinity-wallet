import { ActionTypes } from '../actions/settings.js';
import { defaultNode as fullNode } from '../config';

const initialState = {
    locale: 'en',
    fullNode,
    availableNodes: [
        'https://ceres.iota.community:14600/',
        'https://nodes.iota.cafe:443',
        'https://node.tangle.works:443',
        'http://148.251.181.105:14265/',
        'https://n1.iota.nu:443',
        'http://iotanode.us:443',
        'http://node.lukaseder.de:14265',
        'http://eugene.iotasupport.com:14999',
        'http://node02.iotatoken.nl:14265',
        'http://eugeneoldisoft.iotasupport.com:14265',
        'http://88.198.230.98:14265',
        'http://eugene.iota.community:14265',
        'http://node03.iotatoken.nl:15265',
        'http://wallets.iotamexico.com:80',
        'http://node01.iotatoken.nl:14265',
        'http://5.9.149.169:14265',
        'http://5.9.137.199:14265',
        'http://service.iotasupport.com:14265',
        'http://5.9.118.112:14265',
        'http://176.9.3.149:14265',
        'http://mainnet.necropaz.com:14500',
        'http://iota.bitfinex.com:80',
    ],
    mode: 'Standard',
    theme: 'Standard',
    language: 'English (International)',
    currency: 'USD',
    availableCurrencies: [
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
    ],
    conversionRate: 1,
};

const settingsReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.LOCALE:
            return {
                ...state,
                locale: action.payload,
            };

        case ActionTypes.SET_LOCALE:
            return {
                ...state,
                locale: action.payload,
            };

        case ActionTypes.SET_FULLNODE:
            return {
                ...state,
                fullNode: action.payload,
            };

        case ActionTypes.ADD_CUSTOM_NODE:
            return {
                ...state,
                availableNodes: state.availableNodes.includes(action.payload)
                    ? state.availableNodes
                    : [].concat(state.availableNodes, action.payload),
            };
        case ActionTypes.SET_MODE:
            return {
                ...state,
                mode: action.payload,
            };
        case ActionTypes.SET_THEME:
            return {
                ...state,
                theme: action.payload,
            };
        case ActionTypes.SET_LANGUAGE:
            return {
                ...state,
                language: action.payload,
            };
        case ActionTypes.SET_CURRENCY_DATA:
            return {
                ...state,
                currency: action.currency,
                conversionRate: action.conversionRate,
            };
    }

    return state;
};

export default settingsReducer;
