import { ActionTypes } from '../actions/tempAccount';
import { ActionTypes as AccountActionTypes } from '../actions/account';

const initialState = {
    ready: false,
    receiveAddress: ' ',
    password: '',
    seed: Array(82).join(' '),
    seedName: 'MAIN WALLET',
    seedIndex: 0,
    isGeneratingReceiveAddress: false,
    usedSeedToLogin: false,
    lastTxAddress: '',
    lastTxValue: 0,
    isSendingTransfer: false,
    isGettingTransfers: false,
    isSyncing: false,
    currentSetting: 'mainSettings',
    copiedToClipboard: false,
    isPromoting: false,
    hasErrorFetchingAccountInfoOnLogin: false,
    isFetchingNewAddressData: false,
    hasErrorFetchingNewAddressData: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_SEED:
            return {
                ...state,
                seed: action.payload,
            };
        case ActionTypes.SET_SEED_NAME:
            return {
                ...state,
                seedName: action.payload,
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
        case ActionTypes.GENERATE_NEW_ADDRESS_REQUEST:
            return {
                ...state,
                isGeneratingReceiveAddress: true,
            };
        case ActionTypes.GENERATE_NEW_ADDRESS_SUCCESS:
            return {
                ...state,
                isGeneratingReceiveAddress: false,
                receiveAddress: action.payload,
            };
        case ActionTypes.GENERATE_NEW_ADDRESS_ERROR:
            return {
                ...state,
                isGeneratingReceiveAddress: false,
            };
        case ActionTypes.SEND_TRANSFER_REQUEST:
            return {
                ...state,
                isSendingTransfer: true,
            };
        case ActionTypes.SEND_TRANSFER_SUCCESS:
            return {
                ...state,
                isSendingTransfer: false,
                lastTxAddress: action.payload.address,
                lastTxValue: action.payload.value,
            };
        case ActionTypes.SEND_TRANSFER_ERROR:
            return {
                ...state,
                isSendingTransfer: false,
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
        case ActionTypes.CLEAR_TEMP_DATA:
            return {
                ...state,
                ready: false,
                receiveAddress: ' ',
                usedSeedToLogin: false,
                seedIndex: 0,
                isGeneratingReceiveAddress: false,
                isSendingTransfer: false,
                lastTxAddress: '',
                lastTxValue: 0,
                currentSetting: 'mainSettings',
                copiedToClipboard: false,
            };
        case ActionTypes.GET_TRANSFERS_REQUEST:
            return {
                ...state,
                isGettingTransfers: true,
            };
        case ActionTypes.GET_TRANSFERS_SUCCESS:
            return {
                ...state,
                ready: true,
                isGettingTransfers: false,
            };
        case ActionTypes.GET_TRANSFERS_ERROR:
            return {
                ...state,
                isGettingTransfers: false,
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
        case ActionTypes.SET_PROMOTION_STATUS:
            return {
                ...state,
                isPromoting: action.payload,
            };
        case AccountActionTypes.FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_SUCCESS:
            return {
                ...state,
                ready: true,
                seed: Array(82).join(' '),
            };
        case AccountActionTypes.FULL_ACCOUNT_INFO_FETCH_REQUEST:
            return {
                ...state,
                hasErrorFetchingAccountInfoOnLogin: false,
            };
        case AccountActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                ready: true,
            };
        case AccountActionTypes.FULL_ACCOUNT_INFO_FETCH_ERROR:
            return {
                ...state,
                hasErrorFetchingAccountInfoOnLogin: true,
            };
        case AccountActionTypes.NEW_ADDRESS_DATA_FETCH_REQUEST:
            return {
                ...state,
                isFetchingNewAddressData: true,
                hasErrorFetchingNewAddressData: false,
            };
        case AccountActionTypes.NEW_ADDRESS_DATA_FETCH_SUCCESS:
            return {
                ...state,
                isFetchingNewAddressData: false,
            };
        case AccountActionTypes.NEW_ADDRESS_DATA_FETCH_ERROR:
            return {
                ...state,
                isFetchingNewAddressData: false,
                hasErrorFetchingNewAddressData: true,
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
        default:
            return state;
    }
};
