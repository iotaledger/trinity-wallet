import isEmpty from 'lodash/isEmpty';
import union from 'lodash/union';
import { AccountsActionTypes, WalletActionTypes } from '../types';

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
     * Determines if a deep link request is in progress
     */
    deepLinkRequestActive: false,
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
    /**
     * Determines whether to display test version warning
     */
    displayTestWarning: false,
    activationCode: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case AccountsActionTypes.SET_ACCOUNT_INFO_DURING_SETUP:
            return {
                ...state,
                seed: !isEmpty(action.payload.seed) ? action.payload.seed : state.seed,
            };
        case WalletActionTypes.SET_PASSWORD:
            return {
                ...state,
                password: action.payload,
            };
        case WalletActionTypes.SET_READY:
            return {
                ...state,
                ready: action.payload,
            };
        case WalletActionTypes.SET_SEED_INDEX:
            return {
                ...state,
                seedIndex: action.payload,
            };
        case WalletActionTypes.CLEAR_WALLET_DATA:
            return {
                ...state,
                ready: false,
                seedIndex: 0,
                isGeneratingReceiveAddress: false,
                currentSetting: 'mainSettings',
                deepLinkRequestActive: false,
            };
        case WalletActionTypes.SET_SETTING:
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
        case WalletActionTypes.CANCEL_SNAPSHOT_TRANSITION:
        case WalletActionTypes.SNAPSHOT_TRANSITION_SUCCESS:
        case WalletActionTypes.SNAPSHOT_TRANSITION_ERROR:
            return {
                ...state,
                transitionBalance: 0,
                transitionAddresses: [],
                displayBalanceCheck: false,
            };
        case WalletActionTypes.SET_BALANCE_CHECK_FLAG:
            return {
                ...state,
                balanceCheckFlag: action.payload,
            };
        case WalletActionTypes.UPDATE_TRANSITION_BALANCE:
            return {
                ...state,
                transitionBalance: state.transitionBalance + action.payload,
            };
        case WalletActionTypes.UPDATE_TRANSITION_ADDRESSES:
            return {
                ...state,
                transitionAddresses: union(state.transitionAddresses, action.payload),
            };
        case WalletActionTypes.INITIATE_DEEP_LINK_REQUEST:
            return {
                ...state,
                deepLinkRequestActive: true,
            };
        case WalletActionTypes.COMPLETE_DEEP_LINK_REQUEST:
            return {
                ...state,
                deepLinkRequestActive: false,
            };
        case WalletActionTypes.CONNECTION_CHANGED:
            return {
                ...state,
                hasConnection: action.payload.isConnected,
            };
        case WalletActionTypes.ADDRESS_VALIDATION_REQUEST:
            return {
                ...state,
                isValidatingAddress: true,
            };
        case WalletActionTypes.ADDRESS_VALIDATION_SUCCESS:
            return {
                ...state,
                isValidatingAddress: false,
            };
        case WalletActionTypes.PUSH_ROUTE:
            return {
                ...state,
                navStack: state.navStack.slice().concat(action.payload),
            };
        case WalletActionTypes.POP_ROUTE:
            return {
                ...state,
                navStack: state.navStack.slice(0, state.navStack.length - 1),
            };
        case WalletActionTypes.POP_TO_ROUTE:
            return {
                ...state,
                navStack: state.navStack.slice(0, state.navStack.indexOf(action.payload) + 1),
            };
        case WalletActionTypes.RESET_ROUTE:
            return {
                ...state,
                navStack: [action.payload],
            };
        case WalletActionTypes.SHOULD_UPDATE:
            return {
                ...state,
                shouldUpdate: true,
            };
        case WalletActionTypes.FORCE_UPDATE:
            return {
                ...state,
                forceUpdate: true,
            };
        case WalletActionTypes.DISPLAY_TEST_WARNING:
            return {
                ...state,
                displayTestWarning: true,
            };
        case WalletActionTypes.SET_ACTIVATION_CODE:
            return {
                ...state,
                activationCode: action.payload,
            };
        default:
            return state;
    }
};
