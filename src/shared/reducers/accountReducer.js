const accountReducer = (
    state = {
        seedCount: 0,
        seedNames: [],
        firstUse: true,
    },
    action,
) => {
    switch (action.type) {
        case 'SET_FIRSTUSE':
            return {
                ...state,
                firstUse: action.payload,
            };
        case 'INCREASE_SEEDCOUNT':
            return {
                ...state,
                seedCount: state.seedCount + 1,
            };
        case 'ADD_SEED':
            return {
                ...state,
                seedNames: [...state.seedNames, action.payload],
            };
        default:
            return state;
    }
};

export default accountReducer;
