import { ActionTypes } from '../actions/app.js';

const initialState = {
    isOnboardingCompleted: false,
    inactive: false,
    minimised: false,
    mode: 'STANDARD',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_ONBOARDING_COMPLETED:
            return {
                ...state,
                isOnboardingCompleted: action.payload,
            };
        case ActionTypes.SET_USER_ACTIVITY:
            return {
                ...state,
                ...action.payload,
            };
    }

    return state;
};
