const initialState = {
    balance: 0,
    ready: false,
    addresses: [],
    password: '',
    seed: '                                                                                 ',
    transactions: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case 'SET_ACCOUNTINFO':
            return {
                ...state,
                balance: action.balance,
                transactions: action.transactions,
            };
        case 'SET_SEED':
            return {
                ...state,
                seed: action.payload,
            };
        case 'SET_PASSWORD':
            return {
                ...state,
                password: action.payload,
            };
        case 'SET_ADDRESS':
            return {
                ...state,
                addresses: [...state.addresses, action.payload],
            };
        case 'SET_READY':
            return {
                ...state,
                ready: action.payload,
            };
        case 'CLEAR_IOTA':
            return {
                ...state,
                balance: 0,
                transactions: [],
                addresses: [],
                seed: '',
                password: '',
                ready: false,
            };
        default:
            return state;
    }
};
