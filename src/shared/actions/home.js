export const ActionTypes = {
    CHANGE_HOME_SCREEN_CHILD_ROUTE: 'IOTA/HOME/ROUTE/CHANGE',
    TOGGLE_TOP_BAR_DISPLAY: 'IOTA/HOME/TOP_BAR/TOGGLE',
};

/**
 * Dispatch to set active home screen route for mobile
 *
 * @method changeHomeScreenRoute
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const changeHomeScreenRoute = (payload) => ({
    type: ActionTypes.CHANGE_HOME_SCREEN_CHILD_ROUTE,
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
    type: ActionTypes.TOGGLE_TOP_BAR_DISPLAY,
});
