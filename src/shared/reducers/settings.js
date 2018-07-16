import merge from 'lodash/merge';
import union from 'lodash/union';
import sortBy from 'lodash/sortBy';
import { ActionTypes } from '../actions/settings';
import { DESKTOP_VERSION, defaultNode as node, nodes } from '../config';
import themes from '../themes/themes';

const initialState = {
    locale: 'en',
    node,
    nodes,
    customNodes: [],
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
    remotePoW: false,
    autoPromotion: true,
    backgroundProcesses: false,
    lockScreenTimeout: 3,
    autoNodeSwitching: true,
    versions: {},
    is2FAEnabled: false,
    isFingerprintEnabled: false,
    acceptedTerms: false,
    acceptedPrivacy: false,
    hasVisitedSeedShareTutorial: false,
    hideEmptyTransactions: false,
};

const settingsReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_REMOTE_POW:
            return {
                ...state,
                remotePoW: action.payload,
            };
        case ActionTypes.SET_AUTO_PROMOTION:
            return {
                ...state,
                autoPromotion: action.payload,
            };
        case ActionTypes.SET_BACKGROUND_PROCESSES:
            return {
                ...state,
                backgroundProcesses: action.payload,
            };
        case ActionTypes.UPDATE_AUTO_NODE_SWITCHING:
            return {
                ...state,
                autoNodeSwitching: action.payload === undefined ? !state.autoNodeSwitching : action.payload,
            };
        case ActionTypes.SET_LOCK_SCREEN_TIMEOUT:
            return {
                ...state,
                lockScreenTimeout: action.payload,
            };
        case ActionTypes.SET_LOCALE:
            return {
                ...state,
                locale: action.payload,
            };
        case ActionTypes.SET_NODE:
            return {
                ...state,
                node: action.payload,
            };
        case ActionTypes.ADD_CUSTOM_NODE_SUCCESS:
            return {
                ...state,
                node: action.payload,
                nodes: union(state.nodes, [action.payload]),
                customNodes: state.nodes.includes(action.payload)
                    ? state.customNodes
                    : union(state.customNodes, [action.payload]),
            };
        case ActionTypes.REMOVE_CUSTOM_NODE:
            return {
                ...state,
                nodes: state.customNodes.includes(action.payload)
                    ? state.nodes.filter((node) => node !== action.payload)
                    : state.nodes,
                customNodes: state.customNodes.filter((node) => node !== action.payload),
            };
        case ActionTypes.SET_NODELIST:
            return {
                ...state,
                nodes: union(action.payload, state.customNodes, [state.node]),
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
                availableCurrencies:
                    action.payload.availableCurrencies.length > 0
                        ? sortBy(action.payload.availableCurrencies, ['desc'])
                        : state.availableCurrencies,
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
                node: action.payload,
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
        case ActionTypes.ACCEPT_TERMS:
            return {
                ...state,
                acceptedTerms: true,
            };
        case ActionTypes.ACCEPT_PRIVACY:
            return {
                ...state,
                acceptedPrivacy: true,
            };
        case ActionTypes.SET_SEED_SHARE_TUTORIAL_VISITATION_STATUS:
            return {
                ...state,
                hasVisitedSeedShareTutorial: action.payload,
            };
        case ActionTypes.TOGGLE_EMPTY_TRANSACTIONS:
            return {
                ...state,
                hideEmptyTransactions: !state.hideEmptyTransactions,
            };
    }

    return state;
};

export default settingsReducer;
