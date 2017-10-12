const accountReducer = (state = {}, action) => {
    switch (action.type) {
        case 'SET_FIRSTUSE':
            state = {
                ...state,
                firstUse: action.payload,
            };
            break;
    }
    return state;
};

export default accountReducer;
