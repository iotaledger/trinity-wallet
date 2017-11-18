const initialState = {
    ready: false,
    receiveAddress: ' ',
    password: '',
    seed: '                                                                                 ',
    seedName: 'MAIN WALLET',
    seedIndex: 0,
    isGeneratingReceiveAddress: false,
    usedSeedToLogin: false,
    lastTxAddress: '',
    lastTxValue: 0,
    isSendingTransfer: false,
    isGettingTransfers: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
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
        case 'SET_RECEIVE_ADDRESS':
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
        case 'SEND_TRANSFER_REQUEST':
            return {
                ...state,
                isSendingTransfer: true,
            };
        case 'SEND_TRANSFER_SUCCESS':
            return {
                ...state,
                isSendingTransfer: false,
                lastTxAddress: action.address,
                lastTxValue: action.value,
            };
        case 'SEND_TRANSFER_ERROR':
            return {
                ...state,
                isSendingTransfer: false,
            };
        case 'SET_READY':
            return {
                ...state,
                ready: action.payload,
            };
        case 'INCREMENT_SEED_INDEX':
            return {
                ...state,
                seedIndex: state.seedIndex + 1,
            };
        case 'DECREMENT_SEED_INDEX':
            return {
                ...state,
                seedIndex: state.seedIndex - 1,
            };
        case 'SET_USED_SEED_TO_LOGIN':
            return {
                ...state,
                usedSeedToLogin: action.payload,
            };
        case 'CLEAR_TEMP_DATA':
            return {
                ...state,
                ready: false,
                receiveAddress: ' ',
                usedSeedToLogin: false,
                seedIndex: 0,
                isGeneratingReceiveAddress: false,
                isSendingTransfer: false,
                lastTxAddress: '',
                lastTxValue: 0,
            };
        case 'GET_TRANSFERS_REQUEST':
            return {
                ...state,
                isGettingTransfers: true,
            };
        case 'GET_TRANSFERS_SUCCESS':
            return {
                ...state,
                isGettingTransfers: false,
            };
        case 'CLEAR_SEED':
            return {
                ...state,
                seed: action.payload,
            };
        default:
            return state;
    }
};
