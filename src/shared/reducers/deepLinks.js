import { ActionTypes } from '../actions/deepLinks';

const initialState = {
    amount: 0,
    address: '',
    message: '',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SEND_AMOUNT:
            return {
                ...state,
                amount: action.payload.amount,
                address: action.payload.address,
                message: action.payload.message,
            };
        default:
            return state;
    }
};
