import { ActionTypes } from '../actions/notifications.js';

const initialState = {};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.ADD:
            return {
                ...state,
                [action.payload.id]: action.payload,
            };

        case ActionTypes.REMOVE:
            const notifications = {
                ...state,
            };

            delete notifications[action.payload];

            return notifications;

        // case ActionTypes.REMOVE_ALL:
    }

    return state;
};
