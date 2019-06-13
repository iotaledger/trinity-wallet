import { HomeActionTypes } from '../types';

/**
 * Dispatch to set active home screen route for mobile
 *
 * @method changeHomeScreenRoute
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const changeHomeScreenRoute = (payload) => ({
    type: HomeActionTypes.CHANGE_HOME_SCREEN_CHILD_ROUTE,
    payload,
});

/**
 * Dispatch to show/hide dashboard top bar on mobile
 *
 * @method toggleTopBarDisplay
 *
 * @returns {{type: {string} }}
 */
export const toggleTopBarDisplay = () => ({
    type: HomeActionTypes.TOGGLE_TOP_BAR_DISPLAY,
});
