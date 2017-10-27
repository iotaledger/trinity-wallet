export const ActionTypes = {
    CHANGE_HOME_SCREEN_CHILD_ROUTE: 'CHANGE_HOME_SCREEN_CHILD_ROUTE',
};

export const changeHomeScreenRoute = payload => ({
    type: ActionTypes.CHANGE_HOME_SCREEN_CHILD_ROUTE,
    payload,
});
