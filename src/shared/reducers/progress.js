import { ProgressActionTypes } from '../types';

// The setup for state assumes that there would only be one active progress at a time.
const initialState = {
    /**
     * Keeps track of the activation time of most recent progress step
     */
    lastStepInitializationTime: Date.now(),
    /**
     * Keeps track of the time it has taken for each step to execute
     */
    timeTakenByEachStep: [],
    /**
     * Index of the active step from the activeSteps list
     */
    activeStepIndex: -1,
    /**
     * Keeps track of the names of the active progress steps
     */
    activeSteps: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ProgressActionTypes.SET_ACTIVE_STEP_INDEX:
            return {
                ...state,
                activeStepIndex: action.payload,
            };
        case ProgressActionTypes.SET_NEXT_STEP_AS_ACTIVE:
            return {
                ...state,
                activeStepIndex: state.activeStepIndex + 1,
                lastStepInitializationTime: Date.now(),
                timeTakenByEachStep: [
                    ...state.timeTakenByEachStep,
                    ((Date.now() - state.lastStepInitializationTime) / 1000).toFixed(1),
                ],
            };
        case ProgressActionTypes.START_TRACKING_PROGRESS:
            return {
                ...state,
                activeStepIndex: -1,
                timeTakenByEachStep: [],
                lastStepInitializationTime: Date.now(),
                activeSteps: action.payload,
            };
        case ProgressActionTypes.RESET:
            return initialState;
        default:
            return state;
    }
};
