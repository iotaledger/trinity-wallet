import merge from 'lodash/merge';
import union from 'lodash/union';
import sortBy from 'lodash/sortBy';
import { ActionTypes } from '../actions/settings';
import { defaultNode as node, nodes } from '../config';
import themes from '../themes/themes';

const initialState = {
    /**
     * Selected locale for wallet
     */
    locale: 'en',
    /**
     * Selected IRI node for wallet
     */
    node,
    /**
     * List of IRI nodes
     */
    nodes,
    /**
     * List of custom nodes added by user
     */
    customNodes: [],
    /**
     * Active wallet mode
     * Could either be Expert or Standard
     */
    mode: 'Standard',
    /**
     * Selected language name
     */
    language: 'English (International)',
    /**
     * Selected currency for conversions in wallet
     */
    currency: 'USD',
    /**
     * Wallet's available currencies
     */
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
    /**
     * Conversion rate for IOTA token
     */
    conversionRate: 1,
    /**
     * Active theme name
     */
    themeName: 'Default',
    /**
     * Active theme object
     */
    theme: themes.Default,
    /**
     * Determines if the wallet has randomised node on initial setup.
     *
     */
    hasRandomizedNode: false,
    /**
     * Determines if proof of work should be offloaded to the selected IRI node
     */
    remotePoW: false,
    /**
     * Determines if polling should auto promote unconfirmed transactions
     */
    autoPromotion: true,
    /**
     * Determines the time for locking user out of dashboard screens to lock/login screen
     */
    lockScreenTimeout: 3,
    /**
     * Determines if wallet should automatically switch to a healthy node in case of errors
     */
    autoNodeSwitching: false,
    /**
     * Keeps track of wallet's version information.
     */
    versions: {},
    /**
     * Determines if user has enabled two factor authentication on the wallet
     */
    is2FAEnabled: false,
    /**
     * Determines if user has enabled finger print authentication
     */
    isFingerprintEnabled: false,
    /**
     * Keeps track if user has accepted terms and conditions during the initial setup
     */
    acceptedTerms: false,
    /**
     * Keeps track if a user has accepted privacy agreement during the initial setup
     */
    acceptedPrivacy: false,
    /**
     * Determines if wallet should hide empty transactions on history screens
     */
    hideEmptyTransactions: false,
    /**
     * Determines if the tray app is enabled on desktop wallet
     */
    isTrayEnabled: true,
    /**
     * Determines the status of byte-trit check
     */
    completedByteTritSweep: false,
    /**
     * Determines if native OS notifications are enabled
     */
    notifications: {
        general: true,
        confirmations: true,
        messages: true,
    },
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
        case ActionTypes.TOGGLE_EMPTY_TRANSACTIONS:
            return {
                ...state,
                hideEmptyTransactions: !state.hideEmptyTransactions,
            };
        // FIXME: Temporarily needed for password migration
        case ActionTypes.SET_COMPLETED_FORCED_PASSWORD_UPDATE:
            return {
                ...state,
                completedForcedPasswordUpdate: true,
            };
        case ActionTypes.SET_BYTETRIT_STATUS:
            return {
                ...state,
                completedByteTritSweep: action.payload,
            };
        case ActionTypes.SET_BYTETRIT_INFO:
            return {
                ...state,
                byteTritInfo: action.payload,
            };
        case ActionTypes.SET_TRAY:
            return {
                ...state,
                isTrayEnabled: action.payload,
            };
        case ActionTypes.SET_NOTIFICATIONS:
            return {
                ...state,
                notifications: {
                    ...state.notifications,
                    [action.payload.type]: action.payload.enabled,
                },
            };
    }

    return state;
};

export default settingsReducer;
