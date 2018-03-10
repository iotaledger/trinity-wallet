import { ActionTypes } from '../actions/progress';

// The setup for state assumes that there would only be one active progress at a time.
const initialState = {
    lastStepInitializationTime: Date.now(),
    timeTakenByEachStep: [],
    activeStepIndex: 0,
    activeSteps: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_ACTIVE_STEP_INDEX:
            return {
                ...state,
                activeStepIndex: action.payload,
            };
        case ActionTypes.SET_NEXT_STEP_AS_ACTIVE:
            return {
                ...state,
                activeStepIndex: state.activeStepIndex + 1,
                lastStepInitializationTime: Date.now(),
                timeTakenByEachStep: [
                    ...state.timeTakenByEachStep,
                    ((Date.now() - state.lastStepInitializationTime) / 1000).toFixed(1),
                ],
            };
        case ActionTypes.START_TRACKING_PROGRESS:
            return {
                ...state,
                lastStepInitializationTime: Date.now(),
                activeSteps: action.payload,
            };
        case ActionTypes.RESET:
            return initialState;
        default:
            return state;
    }
};
