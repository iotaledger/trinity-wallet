import { ActionTypes as SettingsActionTypes } from '../actions/settings';
import { ActionTypes as UiActionTypes } from '../actions/ui';
import { ActionTypes as TransfersActionTypes } from '../actions/transfers';

const initialState = {
    isFetchingCurrencyData: false,
    hasErrorFetchingCurrencyData: false,
    isBroadcastingBundle: false,
    isPromotingTransaction: false,
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
        default:
            return state;
    }
};
