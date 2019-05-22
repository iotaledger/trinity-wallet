import merge from 'lodash/merge';
import unionBy from 'lodash/unionBy';
import sortBy from 'lodash/sortBy';
import { ActionTypes } from '../actions/settings';
import { ActionTypes as MigrationsActionTypes } from '../actions/migrations';
import { DEFAULT_NODE, DEFAULT_NODES, QUORUM_SIZE } from '../config';
import { availableCurrencies } from '../libs/currency';

export const initialState = {
    /**
     * Selected locale for wallet
     */
    locale: 'en',
    /**
     * Selected IRI node for wallet
     */
    node: DEFAULT_NODE,
    /**
     * List of IRI nodes
     */
    nodes: DEFAULT_NODES,
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
    availableCurrencies,
    /**
     * Conversion rate for IOTA token
     */
    conversionRate: 1,
    /**
     * Active theme name
     */
    themeName: 'Default',
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
     * Keeps track of wallet's version information.
     */
    versions: {},
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
    /**
     * Determines the status of AsyncStorage to realm migration
     */
    completedMigration: false,
    /*
     * Desktop: Use system proxy settings
     */
    ignoreProxy: false,
    /**
     * Determines if deep linking is enabled
     */
    deepLinking: false,
    /**
     * Quorum configuration
     */
    quorum: {
        /**
         * User-defined quorum size
         */
        size: QUORUM_SIZE,
        /**
         * Determines if quorum is enabled
         */
        enabled: true,
    },
    /**
     * Determines if (primary) node should automatically be auto-switched
     */
    nodeAutoSwitch: false,
    /**
     * - When true: pull in nodes from endpoint (config#NODELIST_URL) and include the custom nodes in the quorum selection
     * - When false: only use custom nodes in quorum selection
     */
    autoNodeList: true,
};

const settingsReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_LOCK_SCREEN_TIMEOUT:
            return {
                ...state,
                lockScreenTimeout: action.payload,
            };
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
                customNodes: unionBy(state.customNodes, [action.payload], 'url'),
            };
        case ActionTypes.REMOVE_CUSTOM_NODE:
            return {
                ...state,
                customNodes: state.customNodes.filter((node) => node.url !== action.payload),
            };
        case ActionTypes.SET_NODELIST:
            return {
                ...state,
                nodes: unionBy(action.payload, state.customNodes, [state.node], 'url'),
            };
        case ActionTypes.SET_MODE:
            return {
                ...state,
                mode: action.payload,
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
                themeName: action.payload,
            };
        case ActionTypes.SET_RANDOMLY_SELECTED_NODE:
            return {
                ...state,
                node: action.payload,
                hasRandomizedNode: true,
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
                // FIXME: byteTritInfo not defined in initial state.
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
        case MigrationsActionTypes.SET_REALM_MIGRATION_STATUS:
            return {
                ...state,
                completedMigration: action.payload,
            };
        case ActionTypes.SET_PROXY:
            return {
                ...state,
                ignoreProxy: action.payload,
            };
        case ActionTypes.RESET_NODES_LIST:
            return {
                ...state,
                nodes: [],
            };
        case ActionTypes.SET_DEEP_LINKING:
            return {
                ...state,
                deepLinking: !state.deepLinking,
            };
        case ActionTypes.UPDATE_QUORUM_CONFIG:
            return {
                ...state,
                quorum: { ...state.quorum, ...action.payload },
            };
        case ActionTypes.UPDATE_NODE_AUTO_SWITCH_SETTING:
            return {
                ...state,
                nodeAutoSwitch: action.payload,
            };
        case ActionTypes.UPDATE_AUTO_NODE_LIST_SETTING:
            return {
                ...state,
                autoNodeList: action.payload,
            };
    }

    return state;
};

export default settingsReducer;
