import { ActionTypes as SettingsActionTypes } from '../actions/settings';

const initialState = {
    isFetchingCurrencyData: false,
    hasErrorFetchingCurrencyData: false,
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
        default:
            return state;
    }
};
