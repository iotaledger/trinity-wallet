import { ActionTypes as SettingsActionTypes } from '../actions/settings';
import { ActionTypes as UiActionTypes } from '../actions/ui';
import { ActionTypes as TransfersActionTypes } from '../actions/transfers';
import { ActionTypes as WalletActionTypes } from '../actions/wallet';
import { ActionTypes as AccountsActionTypes } from '../actions/accounts';

const initialState = {
    isGeneratingReceiveAddress: false,
    isFetchingCurrencyData: false,
    hasErrorFetchingCurrencyData: false,
    isBroadcastingBundle: false,
    isPromotingTransaction: false,
    isTransitioning: false,
    isAttachingToTangle: false,
    isFetchingLatestAccountInfoOnLogin: false,
    hasErrorFetchingAccountInfoOnLogin: false,
    isSendingTransfer: false,
    isSyncing: false,
    inactive: false,
    minimised: false,
    sendAddressFieldText: '',
    sendAmountFieldText: '',
    sendMessageFieldText: '',
    loginPasswordFieldText: '',
    sendDenomination: 'i',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SettingsActionTypes.CURRENCY_DATA_FETCH_REQUEST:
            return {
                ...state,
                isFetchingCurrencyData: true,
                hasErrorFetchingCurrencyData: false,
            };
        case SettingsActionTypes.CURRENCY_DATA_FETCH_SUCCESS:
            return {
                ...state,
                isFetchingCurrencyData: false,
            };
        case SettingsActionTypes.CURRENCY_DATA_FETCH_ERROR:
            return {
                ...state,
                isFetchingCurrencyData: false,
                hasErrorFetchingCurrencyData: true,
            };
        case UiActionTypes.SET_LOGIN_PASSWORD_FIELD:
            return {
                ...state,
                loginPasswordFieldText: action.payload,
            };
        case UiActionTypes.SET_SEND_ADDRESS_FIELD:
            return {
                ...state,
                sendAddressFieldText: action.payload,
            };
        case UiActionTypes.SET_SEND_AMOUNT_FIELD:
            return {
                ...state,
                sendAmountFieldText: action.payload,
            };
        case UiActionTypes.SET_SEND_MESSAGE_FIELD:
            return {
                ...state,
                sendMessageFieldText: action.payload,
            };
        case UiActionTypes.CLEAR_SEND_FIELDS:
            return {
                ...state,
                sendAddressFieldText: '',
                sendAmountFieldText: '',
                sendMessageFieldText: '',
            };
        case UiActionTypes.SET_SEND_DENOMINATION:
            return {
                ...state,
                sendDenomination: action.payload,
            };
        case TransfersActionTypes.BROADCAST_BUNDLE_REQUEST:
            return {
                ...state,
                isBroadcastingBundle: true,
            };
        case TransfersActionTypes.BROADCAST_BUNDLE_SUCCESS:
        case TransfersActionTypes.BROADCAST_BUNDLE_ERROR:
            return {
                ...state,
                isBroadcastingBundle: false,
            };
        case TransfersActionTypes.PROMOTE_TRANSACTION_REQUEST:
            return {
                ...state,
                isPromotingTransaction: true,
            };
        case TransfersActionTypes.PROMOTE_TRANSACTION_SUCCESS:
        case TransfersActionTypes.PROMOTE_TRANSACTION_ERROR:
            return {
                ...state,
                isPromotingTransaction: false,
            };
        case UiActionTypes.SET_USER_ACTIVITY:
            return {
                ...state,
                ...action.payload,
            };
        case WalletActionTypes.GENERATE_NEW_ADDRESS_REQUEST:
            return {
                ...state,
                isGeneratingReceiveAddress: true,
            };
        case WalletActionTypes.GENERATE_NEW_ADDRESS_SUCCESS:
            return {
                ...state,
                isGeneratingReceiveAddress: false
            };
        case WalletActionTypes.GENERATE_NEW_ADDRESS_ERROR:
            return {
                ...state,
                isGeneratingReceiveAddress: false,
            };
        case TransfersActionTypes.SEND_TRANSFER_REQUEST:
            return {
                ...state,
                isSendingTransfer: true,
            };
        case TransfersActionTypes.SEND_TRANSFER_SUCCESS:
        case TransfersActionTypes.SEND_TRANSFER_ERROR:
            return {
                ...state,
                isSendingTransfer: false
            };
        case WalletActionTypes.CLEAR_WALLET_DATA:
            return {
                ...state,
                isSendingTransfer: false
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_REQUEST:
            return {
                ...state,
                hasErrorFetchingAccountInfoOnLogin: false
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_ERROR:
            return {
                ...state,
                hasErrorFetchingAccountInfoOnLogin: true
            };
        case AccountsActionTypes.ACCOUNT_INFO_FETCH_REQUEST:
            return {
                ...state,
                isFetchingLatestAccountInfoOnLogin: true
            };
        case AccountsActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
        case AccountsActionTypes.ACCOUNT_INFO_FETCH_ERROR:
            return {
                ...state,
                isFetchingLatestAccountInfoOnLogin: false,
            };
        case AccountsActionTypes.MANUAL_SYNC_REQUEST:
            return {
                ...state,
                isSyncing: true,
            };
        case AccountsActionTypes.MANUAL_SYNC_SUCCESS:
            return {
                ...state,
                isSyncing: false,
            };
        case AccountsActionTypes.MANUAL_SYNC_ERROR:
            return {
                ...state,
                isSyncing: false,
            };
        default:
            return state;
    }
};
