import { ActionTypes } from '../actions/alerts.js';

const initialState = {
    category: '',
    title: '',
    message: '',
    closeInterval: 5500
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SHOW:
            return {
                ...state,
                category: action.category,
                title: action.title,
                message: action.message,
                closeInterval: action.closeInterval
            };
        case ActionTypes.HIDE:
            return initialState;
        default:
            return state;
    }
};
