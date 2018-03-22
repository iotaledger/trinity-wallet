import merge from 'lodash/merge';
import { ActionTypes } from '../actions/app.js';

const initialState = {
    isOnboardingCompleted: false,
    mode: 'STANDARD',
    root: 'initialLoading',
    versions: {},
    activationCode: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_ONBOARDING_COMPLETED:
            return {
                ...state,
                isOnboardingCompleted: action.payload,
            };
        case ActionTypes.SET_VERSIONS:
            return merge({}, state, {
                versions: action.payload,
            });
        case ActionTypes.SET_ACTIVATION_CODE:
            return merge({}, state, {
                activationCode: action.payload,
            });
    }
    return state;
};
