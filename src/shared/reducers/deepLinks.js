import { ActionTypes } from '../actions/deepLinks';

const initialState = {
    amount: ''
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SEND_AMOUNT:
            return {
                ...state,
                amount: action.amount
            };
    }
};
