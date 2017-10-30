export const ActionTypes = {
    CHANGE_HOME_SCREEN_CHILD_ROUTE: 'IOTA/APP/HOME/ROUTE/CHANGE',
};

export const changeHomeScreenRoute = payload => ({
    type: ActionTypes.CHANGE_HOME_SCREEN_CHILD_ROUTE,
    payload,
});
