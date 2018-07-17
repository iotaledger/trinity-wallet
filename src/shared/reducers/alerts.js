import { ActionTypes } from '../actions/alerts';

const initialState = {
    /**
     * Type of alert - Could be one of error, success, warning etc
     */
    category: '',
    /**
     * Title of alert
     */
    title: '',
    /**
     * Alert description
     */
    message: '',
    /**
     * Close interval of the active alert
     */
    closeInterval: 5500,
    /**
     * Keeps track of server side errors
     */
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
                ...state,
                category: '',
                title: '',
                message: '',
                closeInterval: 5500,
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
