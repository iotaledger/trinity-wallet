import { ActionTypes as SettingsActionTypes } from '../actions/settings';

const initialState = {
    isFetchingCurrencyData: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SettingsActionTypes.CURRENCY_DATA_FETCH_REQUEST:
            return {
                ...state,
                isFetchingCurrencyData: true,
            };
        case SettingsActionTypes.CURRENCY_DATA_FETCH_SUCCESS:
        case SettingsActionTypes.CURRENCY_DATA_FETCH_ERROR:
            return {
                ...state,
                isFetchingCurrencyData: false,
            };
        default:
            return state;
    }
};
