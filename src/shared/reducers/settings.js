import { ActionTypes } from '../actions/settings.js';
import { defaultNode as fullNode, nodes as availablePoWNodes } from '../config';

const initialState = {
    locale: 'en',
    fullNode,
    availablePoWNodes,
    availableNodes: [
        'https://iri2-api.iota.fm:443',
        'https://ceres.iota.community:14600',
        'https://nodes.iota.cafe:443',
        'https://node.tangle.works:443',
        'http://148.251.181.105:14265',
        'http://iri3.iota.fm:80',
        'http://nelson1.iota.fm:80',
        'https://n1.iota.nu:443',
        'https://iotanode.us:443',
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
    themeName: 'Standard',
    theme: {
        backgroundColor: {
            h: 191.66666666666663,
            s: 0.4090909090909091,
            l: 0.17254901960784313,
            a: 1,
        },
        barColor: {
            h: 191.66666666666669,
            s: 0.6206896551724137,
            l: 0.11372549019607844,
            a: 1,
        },
        ctaColor: {
            h: 143.77358490566039,
            s: 1,
            l: 0.31176470588235294,
            a: 1,
        },
        positiveColor: {
            h: 131.0204081632653,
            s: 1,
            l: 0.807843137254902,
            a: 1,
        },
        negativeColor: {
            h: 50.44897959183674,
            s: 0.9839357429718876,
            l: 0.48823529411764705,
            a: 1,
        },
        extraColor: {
            h: 201.68067226890756,
            s: 1,
            l: 0.7666666666666666,
            a: 1,
        },
        secondaryBarColor: 'white',
        secondaryBackgroundColor: 'white',
        secondaryCtaColor: 'white',
        ctaBorderColor: 'transparent',
        pendingColor: '#f75602',
        chartLineColor: '#FFA25B',
    },
    hasRandomizedNode: false,
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
        case ActionTypes.ADD_CUSTOM_POW_NODE:
            return {
                ...state,
                availablePoWNodes: state.availablePoWNodes.includes(action.payload)
                    ? state.availablePoWNodes
                    : [].concat(state.availablePoWNodes, action.payload),
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
        case ActionTypes.CURRENCY_DATA_FETCH_SUCCESS:
            return {
                ...state,
                currency: action.payload.currency,
                conversionRate: action.payload.conversionRate,
            };
        case ActionTypes.UPDATE_THEME:
            return {
                ...state,
                theme: action.theme,
                themeName: action.themeName,
            };
        case ActionTypes.SET_RANDOMLY_SELECTED_NODE:
            return {
                ...state,
                fullNode: action.payload,
                hasRandomizedNode: true,
            };
    }

    return state;
};

export default settingsReducer;
