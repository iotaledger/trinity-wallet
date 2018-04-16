export const ActionTypes = {
    CHANGE_HOME_SCREEN_CHILD_ROUTE: 'IOTA/HOME/ROUTE/CHANGE',
    TOGGLE_TOP_BAR_DISPLAY: 'IOTA/HOME/TOP_BAR/TOGGLE',
    CLOSE_TOP_BAR: 'IOTA/HOME/TOP_BAR/CLOSE',
};

export const changeHomeScreenRoute = (payload) => ({
    type: ActionTypes.CHANGE_HOME_SCREEN_CHILD_ROUTE,
    payload,
});

export const toggleTopBarDisplay = () => ({
    type: ActionTypes.TOGGLE_TOP_BAR_DISPLAY,
});
