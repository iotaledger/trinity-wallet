export const ActionTypes = {
    SET_NEXT_STEP_AS_ACTIVE: 'IOTA/PROGRESS/SET_NEXT_STEP_AS_ACTIVE',
    SET_ACTIVE_STEP_INDEX: 'IOTA/PROGRESS/SET_ACTIVE_STEP_INDEX',
    RESET: 'IOTA/PROGRESS/RESET',
    START_TRACKING_PROGRESS: 'IOTA/PROGRESS/START_TRACKING_PROGRESS',
};

/**
 * Dispatch to set active progress bar step as completed
 *
 * @method setNextStepAsActive
 *
 * @returns {{type: {string} }}
 */
export const setNextStepAsActive = () => ({
    type: ActionTypes.SET_NEXT_STEP_AS_ACTIVE,
});

/**
 * Dispatch to set active step index from the progress bar steps list
 *
 * @method setActiveStepIndex
 * @param {number} payload
 *
 * @returns {{type: {string}, payload: {number} }}
 */
export const setActiveStepIndex = (payload) => ({
    type: ActionTypes.SET_ACTIVE_STEP_INDEX,
    payload,
});

/**
 * Dispatch to reset progress bar
 *
 * @method reset
 *
 * @returns {{type: {string} }}
 */
export const reset = () => ({
    type: ActionTypes.RESET,
});

/**
 * Dispatch to initialize progress bar
 *
 * @method startTrackingProgress
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const startTrackingProgress = (payload) => ({
    type: ActionTypes.START_TRACKING_PROGRESS,
    payload,
});
