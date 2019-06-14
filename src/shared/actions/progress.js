import { ProgressActionTypes } from '../types';

/**
 * Dispatch to set active progress bar step as completed
 *
 * @method setNextStepAsActive
 *
 * @returns {{type: {string} }}
 */
export const setNextStepAsActive = () => ({
    type: ProgressActionTypes.SET_NEXT_STEP_AS_ACTIVE,
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
    type: ProgressActionTypes.SET_ACTIVE_STEP_INDEX,
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
    type: ProgressActionTypes.RESET,
});

/**
 * Dispatch to initialise progress bar
 *
 * @method startTrackingProgress
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const startTrackingProgress = (payload) => ({
    type: ProgressActionTypes.START_TRACKING_PROGRESS,
    payload,
});
