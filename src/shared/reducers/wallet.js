import isEmpty from 'lodash/isEmpty';
import union from 'lodash/union';
import { ActionTypes } from '../actions/wallet';
import { ActionTypes as AccountsActionTypes } from '../actions/accounts';

const initialState = {
    /**
     * Determines if wallet should be redirected from loading to dashboard screen
     */
    ready: false,
    /**
     * Wallet password hash
     */
    password: {},
    /**
     * Active account index from the list of added account names
     */
    seedIndex: 0,
    /**
     * Active setting name on settings screen
     */
    currentSetting: 'mainSettings',
    /**
     * Total balance detected during snapshot transition
     */
    transitionBalance: 0,
    /**
     * Total addresses found during snapshot transition that will be attached to tangle
     */
    transitionAddresses: [],
    /**
     * Displays balance check request during snapshot transition
     */
    balanceCheckFlag: false,
    /**
     * Determines if deep linking is activated on the wallet
     */
    deepLinkActive: false,
    /**
     * Determines if wallet has an active internet connection
     */
    hasConnection: true,
    /**
     * Determines if wallet is validating the displayed address
     */
    isValidatingAddress: false,
    /**
     * Navigation stack
     */
    navStack: [],
    /**
     * Determines whether user should update
     */
    shouldUpdate: false,
    /**
     * Determines whether user is forced to update
     */
    forceUpdate: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case AccountsActionTypes.SET_ACCOUNT_INFO_DURING_SETUP:
            return {
                ...state,
                seed: !isEmpty(action.payload.seed) ? action.payload.seed : state.seed,
            };
        case ActionTypes.SET_PASSWORD:
            return {
                ...state,
                password: action.payload,
            };
        case ActionTypes.SET_READY:
            return {
                ...state,
                ready: action.payload,
            };
        case ActionTypes.SET_SEED_INDEX:
            return {
                ...state,
                seedIndex: action.payload,
            };
        case ActionTypes.CLEAR_WALLET_DATA:
            return {
                ...state,
                ready: false,
                seedIndex: 0,
                isGeneratingReceiveAddress: false,
                currentSetting: 'mainSettings',
                deepLinkActive: false,
            };
        case ActionTypes.SET_SETTING:
            return {
                ...state,
                currentSetting: action.payload,
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_REQUEST:
            return {
                ...state,
                ready: false,
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                ready: true,
            };
        case AccountsActionTypes.ACCOUNT_INFO_FETCH_REQUEST:
            return {
                ...state,
                ready: false,
            };
        case AccountsActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                ready: true,
            };
        case AccountsActionTypes.REMOVE_ACCOUNT:
            return {
                ...state,
                seedIndex: 0,
                currentSetting: 'accountManagement',
            };
        case ActionTypes.CANCEL_SNAPSHOT_TRANSITION:
        case ActionTypes.SNAPSHOT_TRANSITION_SUCCESS:
        case ActionTypes.SNAPSHOT_TRANSITION_ERROR:
            return {
                ...state,
                transitionBalance: 0,
                transitionAddresses: [],
                displayBalanceCheck: false,
            };
        case ActionTypes.SET_BALANCE_CHECK_FLAG:
            return {
                ...state,
                balanceCheckFlag: action.payload,
            };
        case ActionTypes.UPDATE_TRANSITION_BALANCE:
            return {
                ...state,
                transitionBalance: state.transitionBalance + action.payload,
            };
        case ActionTypes.UPDATE_TRANSITION_ADDRESSES:
            return {
                ...state,
                transitionAddresses: union(state.transitionAddresses, action.payload),
            };
        case ActionTypes.SET_DEEP_LINK:
            return {
                ...state,
                deepLinkActive: true,
            };
        case ActionTypes.SET_DEEP_LINK_INACTIVE:
            return {
                ...state,
                deepLinkActive: false,
            };
        case ActionTypes.CONNECTION_CHANGED:
            return {
                ...state,
                hasConnection: action.payload.isConnected,
            };
        case ActionTypes.ADDRESS_VALIDATION_REQUEST:
            return {
                ...state,
                isValidatingAddress: true,
            };
        case ActionTypes.ADDRESS_VALIDATION_SUCCESS:
            return {
                ...state,
                isValidatingAddress: false,
            };
        case ActionTypes.PUSH_ROUTE:
            return {
                ...state,
                navStack: state.navStack.slice().concat(action.payload),
            };
        case ActionTypes.POP_ROUTE:
            return {
                ...state,
                navStack: state.navStack.slice(0, state.navStack.length - 1),
            };
        case ActionTypes.RESET_ROUTE:
            return {
                ...state,
                navStack: [action.payload],
            };
        case ActionTypes.SHOULD_UPDATE:
            return {
                ...state,
                shouldUpdate: true,
            };
        case ActionTypes.FORCE_UPDATE:
            return {
                ...state,
                forceUpdate: true,
            };
        default:
            return state;
    }
};
