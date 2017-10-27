import { ActionTypes } from '../actions/home';

const initialState = {
    childRoute: 'balance', // left most tab
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.CHANGE_HOME_SCREEN_CHILD_ROUTE:
            return {
                ...state,
                childRoute: action.payload,
            };
        default:
            return state;
    }
};
