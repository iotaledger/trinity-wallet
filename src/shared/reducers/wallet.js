import union from 'lodash/union';
import { ActionTypes } from '../actions/wallet';
import { ActionTypes as AccountsActionTypes } from '../actions/accounts';
import { ActionTypes as UiActionTypes } from '../actions/ui';

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
     * User's seed stored temporarily during account setup
     */
    seed: Array(82).join(' '),
    /**
     * Determines if a user used an existing seed during account setup
     */
    usedExistingSeed: false,
    /**
     * Account name set by user during initial account setup
     */
    accountName: 'MAIN WALLET',
    /**
     * Active account index from the list of added account names
     */
    seedIndex: 0,
    /**
     * Active setting name on settings screen
     */
    currentSetting: 'mainSettings',
    /**
     * Account name set by user during additional account setup
     */
    additionalAccountName: '',
    /**
     * Total balance detected during snapshot transition
     */
    transitionBalance: 0,
    /**
     * Total addresses found during snapshot transition that will be attached to tangle
     */
    transitionAddresses: [],
    /**
     * Determines if wallet is adding additional account
     */
    addingAdditionalAccount: false,
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
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_ADDITIONAL_ACCOUNT_INFO:
            return {
                ...state,
                ...action.payload,
            };
        case UiActionTypes.SET_ONBOARDING_SEED:
            return {
                ...state,
                seed: action.payload.seed,
                usedExistingSeed: !action.payload.isGenerated,
            };
        case ActionTypes.SET_ACCOUNT_NAME:
            return {
                ...state,
                accountName: action.payload,
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
                usedExistingSeed: false,
            };
        case ActionTypes.CLEAR_SEED:
            return {
                ...state,
                seed: action.payload,
            };
        case ActionTypes.SET_SETTING:
            return {
                ...state,
                currentSetting: action.payload,
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_REQUEST:
            return {
                ...state,
                ready: false,
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_SUCCESS:
            return {
                ...state,
                ready: true,
                seed: Array(82).join(' '),
                addingAdditionalAccount: false,
                additionalAccountName: '',
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_ERROR:
            return {
                ...state,
                ready: true,
                addingAdditionalAccount: false,
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_REQUEST:
            return {
                ...state,
                ready: false,
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_SUCCESS:
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
        default:
            return state;
    }
};
