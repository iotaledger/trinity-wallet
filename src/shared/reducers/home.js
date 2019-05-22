import { HomeActionTypes, UiActionTypes } from '../types';

const initialState = {
    /**
     * Mobile dashboard active route name
     */
    childRoute: 'balance', // left most tab
    /**
     * Determines if the topBar on mobile dashboard is active or not
     */
    isTopBarActive: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case HomeActionTypes.CHANGE_HOME_SCREEN_CHILD_ROUTE:
            return {
                ...state,
                childRoute: action.payload,
            };
        case HomeActionTypes.TOGGLE_TOP_BAR_DISPLAY:
            return {
                ...state,
                isTopBarActive: !state.isTopBarActive,
            };
        case UiActionTypes.TOGGLE_MODAL_ACTIVITY:
            return {
                ...state,
                isTopBarActive: false,
            };
        default:
            return state;
    }
};
