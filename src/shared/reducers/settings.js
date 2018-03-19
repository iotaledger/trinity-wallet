import { ActionTypes } from '../actions/settings.js';
import { DESKTOP_VERSION, defaultNode as node, nodes } from '../config';
import themes from '../themes/themes';

const initialState = {
    locale: 'en',
    node,
    nodes,
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
    themeName: 'Default',
    theme: themes.Default,
    hasRandomizedNode: false,
    update: {
        done: true,
        error: false,
        version: DESKTOP_VERSION,
        notes: [],
    },
    remotePoW: true,
    versions: {},
    is2FAEnabled: false,
    isFingerprintEnabled: false,
};

const settingsReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.UPDATE_POW_SETTINGS:
            return {
                ...state,
                remotePoW: !state.remotePoW,
            };
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
                node: action.payload,
            };
        case ActionTypes.ADD_CUSTOM_POW_NODE:
            return {
                ...state,
                nodes: state.availablePoWNodes.includes(action.payload)
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
        case ActionTypes.SET_UPDATE_ERROR:
            return {
                ...state,
                update: {
                    ...state.update,
                    done: action.payload.force ? false : state.update.done,
                    error: true,
                },
            };
        case ActionTypes.SET_UPDATE_SUCCESS:
            return {
                ...state,
                update: {
                    done:
                        action.payload.force || action.payload.version !== state.update.version
                            ? false
                            : state.update.done,
                    error: false,
                    version: action.payload.version,
                    notes: action.payload.notes,
                },
            };
        case ActionTypes.SET_UPDATE_DONE:
            return {
                ...state,
                update: {
                    ...state.update,
                    done: true,
                },
            };
        case ActionTypes.SET_2FA_STATUS:
            return {
                ...state,
                is2FAEnabled: action.payload,
            };
        case ActionTypes.SET_FINGERPRINT_STATUS:
            return {
                ...state,
                isFingerprintEnabled: action.payload,
            };
        case ActionTypes.SET_VERSIONS:
            return merge({}, state, {
                versions: action.payload,
            });
    }

    return state;
};

export default settingsReducer;
