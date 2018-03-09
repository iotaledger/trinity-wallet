import { ActionTypes } from '../actions/progress';

// The setup for state assumes that there would only be one active progress at a time.
const initialState = {
    lastStepInitializationTime: Date.now(),
    timeTakenByEachStep: [],
    active: 0,
    steps: {
        localPow: [
            'Preparing inputs',
            'Preparing transfers',
            'Getting transactions to approve',
            'Proof of work',
            'Broadcasting',
        ],
    },
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_ACTIVE_STEP_INDEX:
            return {
                ...state,
                active: action.payload,
            };
        case ActionTypes.SET_NEXT_STEP_AS_ACTIVE:
            return {
                ...state,
                active: state.active + 1,
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
            };
        case ActionTypes.RESET:
            return initialState;
        default:
            return state;
    }
};
