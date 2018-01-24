import { ActionTypes } from '../actions/alerts.js';

const initialState = {
    category: '',
    title: '',
    message: '',
    closeInterval: 5500,
    notificationLog: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SHOW:
            return {
                ...state,
                category: action.category,
                title: action.title,
                message: action.message,
                closeInterval: action.closeInterval,
            };
        case ActionTypes.HIDE:
            return {
                category: '',
                title: '',
                message: '',
                closeInterval: 5500,
                notificationLog: [...state.notificationLog],
            };
        case ActionTypes.UPDATE_LOG:
            return {
                ...state,
                notificationLog: [...state.notificationLog, action.logItem],
            };
        case ActionTypes.CLEAR_LOG:
            return {
                ...state,
                notificationLog: [],
            };
        default:
            return state;
    }
};
