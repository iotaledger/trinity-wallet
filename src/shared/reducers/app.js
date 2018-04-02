import merge from 'lodash/merge';
import { ActionTypes } from '../actions/app';

const initialState = {
    root: 'initialLoading',
    activationCode: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_ACTIVATION_CODE:
            return merge({}, state, {
                activationCode: action.payload,
            });
    }
    return state;
};
