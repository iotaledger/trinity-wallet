import { ActionTypes } from '../actions/alerts.js';

const initialState = {
    isFetchingCurrencyInfo: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SHOW:
            return {
                ...state,
                category: action.category,
                title: action.title,
                message: action.message,
            };
        case ActionTypes.HIDE:
            return initialState;
        default:
            return state;
    }
};
