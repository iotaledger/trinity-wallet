import { ActionTypes } from '../actions/home';

const initialState = {
    childRoute: 'balance', // left most tab
    isTopBarActive: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.CHANGE_HOME_SCREEN_CHILD_ROUTE:
            return {
                ...state,
                childRoute: action.payload,
            };
        case ActionTypes.TOGGLE_TOP_BAR_DISPLAY:
            return {
                ...state,
                isTopBarActive: !state.isTopBarActive,
            };
        default:
            return state;
    }
};
