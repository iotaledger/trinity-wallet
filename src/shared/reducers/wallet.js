import union from 'lodash/union';
import { ActionTypes } from '../actions/wallet';
import { ActionTypes as AccountsActionTypes } from '../actions/accounts';
import { ActionTypes as DeepLinkActionTypes } from '../actions/deepLink';

const initialState = {
    ready: false,
    receiveAddress: ' ',
    password: '',
    seed: Array(82).join(' '),
    accountName: 'MAIN WALLET',
    seedIndex: 0,
    usedSeedToLogin: false,
    currentSetting: 'mainSettings',
    copiedToClipboard: false,
    additionalAccountName: '',
    transitionBalance: 0,
    transitionAddresses: [],
    addingAdditionalAccount: false,
    balanceCheckToggle: false,
    deepLinkActive: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_ADDITIONAL_ACCOUNT_INFO:
            return {
                ...state,
                ...action.payload,
            };
        case ActionTypes.SET_SEED:
            return {
                ...state,
                seed: action.payload,
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
        case ActionTypes.SET_RECEIVE_ADDRESS:
            return {
                ...state,
                receiveAddress: action.payload,
            };
        case ActionTypes.GENERATE_NEW_ADDRESS_SUCCESS:
            return {
                ...state,
                receiveAddress: action.payload,
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
        case ActionTypes.SET_USED_SEED_TO_LOGIN:
            return {
                ...state,
                usedSeedToLogin: action.payload,
            };
        case ActionTypes.CLEAR_WALLET_DATA:
            return {
                ...state,
                ready: false,
                receiveAddress: ' ',
                usedSeedToLogin: false,
                seedIndex: 0,
                isGeneratingReceiveAddress: false,
                currentSetting: 'mainSettings',
                copiedToClipboard: false,
                deepLinkActive: false,
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
        case ActionTypes.SET_COPIED_TO_CLIPBOARD:
            return {
                ...state,
                copiedToClipboard: action.payload,
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
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_REQUEST:
            return {
                ...state,
                isFetchingLatestAccountInfoOnLogin: true,
                hasErrorFetchingAccountInfoOnLogin: false,
                ready: false,
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_SUCCESS:
            return {
                ...state,
                isFetchingLatestAccountInfoOnLogin: false,
                ready: true,
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_ERROR:
            return {
                ...state,
                isFetchingLatestAccountInfoOnLogin: false,
                hasErrorFetchingAccountInfoOnLogin: true,
            };
        case AccountsActionTypes.ACCOUNT_INFO_FETCH_REQUEST:
            return {
                ...state,
                ready: false,
                isFetchingLatestAccountInfoOnLogin: true,
            };
        case AccountsActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                ready: true,
                isFetchingLatestAccountInfoOnLogin: false,
            };
        case AccountsActionTypes.ACCOUNT_INFO_FETCH_ERROR:
            return {
                ...state,
                isFetchingLatestAccountInfoOnLogin: false,
            };
        case AccountsActionTypes.REMOVE_ACCOUNT:
            return {
                ...state,
                seedIndex: 0,
                currentSetting: 'accountManagement',
            };
        case ActionTypes.SNAPSHOT_TRANSITION_SUCCESS:
            return {
                ...state,
                transitionBalance: 0,
                transitionAddresses: [],
            };
        case ActionTypes.SNAPSHOT_TRANSITION_ERROR:
            return {
                ...state,
                transitionBalance: 0,
                transitionAddresses: [],
            };
        case ActionTypes.SWITCH_BALANCE_CHECK_TOGGLE:
            return {
                ...state,
                balanceCheckToggle: !state.balanceCheckToggle,
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
        case DeepLinkActionTypes.SET_DEEP_LINK:
            return {
                ...state,
                deepLinkActive: true,
            };
        case DeepLinkActionTypes.SET_DEEP_LINK_INACTIVE:
            return {
                ...state,
                deepLinkActive: false,
            };
        default:
            return state;
    }
};
