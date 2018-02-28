import omit from 'lodash/omit';
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
            return omit(state, action.payload);
        default:
            return state;
    }
};
