import { ActionTypes } from '../actions/app.js';

const initialState = {
    isOnboardingCompleted: false,
    mode: 'STANDARD',
    root: 'initialLoading',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_ONBOARDING_COMPLETED:
            return {
                ...state,
                isOnboardingCompleted: action.payload,
            };
    }
    return state;
};
