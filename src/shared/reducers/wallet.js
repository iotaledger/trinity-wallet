import union from 'lodash/union';
import { ActionTypes } from '../actions/wallet';
import { ActionTypes as AccountActionTypes } from '../actions/accounts';

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
        case AccountActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_REQUEST:
            return {
                ...state,
                ready: false,
            };
        case AccountActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_SUCCESS:
            return {
                ...state,
                ready: true,
                seed: Array(82).join(' '),
                addingAdditionalAccount: false,
                additionalAccountName: '',
            };
        case AccountActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_REQUEST:
            return {
                ...state,
                hasErrorFetchingAccountInfoOnLogin: false,
                ready: false,
            };
        case AccountActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_SUCCESS:
            return {
                ...state,
                ready: true,
            };
        case AccountActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_ERROR:
            return {
                ...state,
                hasErrorFetchingAccountInfoOnLogin: true,
            };
        case AccountActionTypes.ACCOUNT_INFO_FETCH_REQUEST:
            return {
                ...state,
                ready: false,
                isFetchingLatestAccountInfoOnLogin: true,
            };
        case AccountActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                ready: true,
                isFetchingLatestAccountInfoOnLogin: false,
            };
        case AccountActionTypes.ACCOUNT_INFO_FETCH_ERROR:
            return {
                ...state,
                isFetchingLatestAccountInfoOnLogin: false,
            };
        case AccountActionTypes.REMOVE_ACCOUNT:
            return {
                ...state,
                seedIndex: 0,
                currentSetting: 'accountManagement',
            };
        case AccountActionTypes.MANUAL_SYNC_REQUEST:
            return {
                ...state,
                isSyncing: true,
            };
        case AccountActionTypes.MANUAL_SYNC_SUCCESS:
            return {
                ...state,
                isSyncing: false,
            };
        case ActionTypes.MANUAL_SYNC_ERROR:
            return {
                ...state,
                isSyncing: false,
            };
        case ActionTypes.SET_USER_ACTIVITY:
            return {
                ...state,
                ...action.payload,
            };
        case ActionTypes.SNAPSHOT_TRANSITION_REQUEST:
            return {
                ...state,
                isTransitioning: true,
            };
        case ActionTypes.SNAPSHOT_TRANSITION_SUCCESS:
            return {
                ...state,
                isTransitioning: false,
                transitionBalance: 0,
                transitionAddresses: [],
            };
        case ActionTypes.SNAPSHOT_TRANSITION_ERROR:
            return {
                ...state,
                isTransitioning: false,
                transitionBalance: 0,
                transitionAddresses: [],
            };
        case ActionTypes.SNAPSHOT_ATTACH_TO_TANGLE_REQUEST:
            return {
                ...state,
                isAttachingToTangle: true,
            };
        case ActionTypes.SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE:
            return {
                ...state,
                isAttachingToTangle: false,
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
        default:
            return state;
    }
};
