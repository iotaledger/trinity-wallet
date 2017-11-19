import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import reduce from 'lodash/reduce';
import map from 'lodash/map';
import each from 'lodash/each';
import keys from 'lodash/keys';
import { iota } from '../libs/iota';

const account = (
    state = {
        seedCount: 0,
        seedNames: [],
        firstUse: true,
        onboardingComplete: false,
        balance: 0,
    },
    action,
) => {
    switch (action.type) {
        case 'SET_ACCOUNT_INFO':
            return {
                ...state,
                balance: action.balance,
                accountInfo: {
                    ...state.accountInfo,
                    [action.seedName]: {
                        addresses: action.addresses,
                        transfers: action.transfers,
                    },
                },
            };
        case 'UPDATE_ADDRESSES':
            return {
                ...state,
                accountInfo: {
                    ...state.accountInfo,
                    [action.seedName]: {
                        ...state.accountInfo[action.seedName],
                        addresses: action.addresses,
                    },
                },
            };
        case 'UPDATE_TRANSFERS':
            return {
                ...state,
                accountInfo: {
                    ...state.accountInfo,
                    [action.seedName]: {
                        ...state.accountInfo[action.seedName],
                        transfers: action.transfers,
                    },
                },
            };
        case 'SET_FIRST_USE':
            return {
                ...state,
                firstUse: action.payload,
            };
        case 'SET_BALANCE':
            return {
                ...state,
                balance: action.payload,
            };
        case 'SET_ONBOARDING_COMPLETE':
            return {
                ...state,
                onboardingComplete: action.payload,
            };
        case 'INCREASE_SEED_COUNT':
            return {
                ...state,
                seedCount: state.seedCount + 1,
            };
        case 'ADD_SEED_NAME':
            return {
                ...state,
                seedNames: [...state.seedNames, action.seedName],
            };
        default:
            return state;
    }
};

export default account;

export const getTailTransactionHashesForPendingTransactions = (accountInfo, currentIndex) => {
    const propKeys = keys(accountInfo);
    const seedName = get(propKeys, `[${currentIndex}]`);
    const currentSeedAccountInfo = get(accountInfo, seedName);
    const addressesAsDict = get(currentSeedAccountInfo, 'addresses');
    const transfers = get(currentSeedAccountInfo, 'transfers');

    if (!isEmpty(transfers) && !isEmpty(addressesAsDict)) {
        const normalize = (res, val) => {
            each(val, v => {
                if (!v.persistence && v.currentIndex === 0) {
                    res.push(v.hash);
                }
            });

            return res;
        };

        const addresses = map(addressesAsDict, (v, k) => k);

        const categorizedTransfers = iota.utils.categorizeTransfers(transfers, addresses);
        const sentTransfers = get(categorizedTransfers, 'sent');

        return reduce(sentTransfers, normalize, []);
    }

    return [];
};
