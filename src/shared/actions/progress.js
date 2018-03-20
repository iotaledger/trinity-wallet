export const ActionTypes = {
    SET_NEXT_STEP_AS_ACTIVE: 'IOTA/PROGRESS/SET_NEXT_STEP_AS_ACTIVE',
    SET_ACTIVE_STEP_INDEX: 'IOTA/PROGRESS/SET_ACTIVE_STEP_INDEX',
    RESET: 'IOTA/PROGRESS/RESET',
    START_TRACKING_PROGRESS: 'IOTA/PROGRESS/START_TRACKING_PROGRESS',
};

export const setNextStepAsActive = () => ({
    type: ActionTypes.SET_NEXT_STEP_AS_ACTIVE,
});

export const setActiveStepIndex = (payload) => ({
    type: ActionTypes.SET_ACTIVE_STEP_INDEX,
    payload,
});

export const reset = () => ({
    type: ActionTypes.RESET,
});

export const startTrackingProgress = (payload) => ({
    type: ActionTypes.START_TRACKING_PROGRESS,
    payload,
});
