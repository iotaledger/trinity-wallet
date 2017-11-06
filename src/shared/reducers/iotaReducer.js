import get from 'lodash/get';
import reduce from 'lodash/reduce';
import each from 'lodash/each';
import size from 'lodash/size';
import { iota } from '../libs/iota';

const initialState = {
    balance: 0,
    ready: false,
    receiveAddress: '',
    password: '',
    seed: '                                                                                 ',
    seedName: 'MAIN WALLET',
    seedIndex: 0,
    transactions: [],
    isGeneratingReceiveAddress: false,
    usedSeedToLogin: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case 'SET_ACCOUNTINFO':
            return {
                ...state,
                balance: action.balance,
                transactions: [],
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
        case 'CLEAR_IOTA':
            return {
                ...state,
                balance: 0,
                transactions: [],
                receiveAddress: '',
                seed: '',
                password: '',
                ready: false,
                usedSeedToLogin: false,
            };
        default:
            return state;
    }
};

export const getTailTransactionHashesForPendingTransactions = (transfers, addresses) => {
    if (size(transfers)) {
        const normalize = (res, val) => {
            each(val, v => {
                if (!v.persistence && v.currentIndex === 0) {
                    res.push(v.hash);
                }
            });

            return res;
        };

        const categorizedTransfers = iota.utils.categorizeTransfers(transfers, addresses);
        const sentTransfers = get(categorizedTransfers, 'sent');

        return reduce(sentTransfers, normalize, []);
    }

    return [];
};
