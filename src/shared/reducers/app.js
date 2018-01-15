import merge from 'lodash/merge';
import { ActionTypes } from '../actions/app.js';

const initialState = {
    isOnboardingCompleted: false,
    mode: 'STANDARD',
    root: 'initialLoading',
    versions: {
        android: {},
        ios: {},
    },
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
    }
    return state;
};
