const initialState = {
    balance: 0,
    ready: false,
    receiveAddress: '',
    password: '',
    seed: 'ABCDEFG',
    seedName: 'My seed',
    transactions: [],
    isGeneratingReceiveAddress: false,
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
        case 'SET_SEED_NAME':
            return {
                ...state,
                seedName: action.payload,
            };
        case 'SET_PASSWORD':
            return {
                ...state,
                password: action.payload,
            };
        case 'SET_ADDRESS':
            return {
                ...state,
                receiveAddress: action.payload,
            };
        case 'GENERATE_NEW_ADDRESS_REQUEST':
            return {
                ...state,
                isGeneratingReceiveAddress: true,
            };
        case 'GENERATE_NEW_ADDRESS_SUCCESS':
            return {
                ...state,
                isGeneratingReceiveAddress: false,
                receiveAddress: action.payload,
            };
        case 'GENERATE_NEW_ADDRESS_ERROR':
            return {
                ...state,
                isGeneratingReceiveAddress: false,
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
                receiveAddress: '',
                seed: '',
                password: '',
                ready: false,
            };
        default:
            return state;
    }
};
