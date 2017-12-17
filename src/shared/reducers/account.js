import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import reduce from 'lodash/reduce';
import map from 'lodash/map';
import each from 'lodash/each';
import keys from 'lodash/keys';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { iota } from '../libs/iota';
import { ActionTypes } from '../actions/account';
import { isMinutesAgo, convertUnixTimeToJSDate } from '../libs/dateUtils';

const account = (
    state = {
        seedCount: 0,
        seedNames: [],
        firstUse: true,
        onboardingComplete: false,
        balance: 0,
        unconfirmedBundleTails: {}, // Regardless of the selected account, this would hold all the unconfirmed transfers by bundles.
        lastPromotedBundleTails: {},
    },
    action,
) => {
    switch (action.type) {
        case ActionTypes.UPDATE_UNCONFIRMED_BUNDLE_TAILS:
            return {
                ...state,
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload),
            };
        case ActionTypes.REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS:
            return {
                ...state,
                unconfirmedBundleTails: omit(state.unconfirmedBundleTails, action.payload),
            };
        case ActionTypes.UPDATE_LAST_PROMOTED_BUNDLE_TAILS:
            return {
                ...state,
                lastPromotedBundleTails: merge({}, state.lastPromotedBundleTails, action.payload),
            };
        case ActionTypes.REMOVE_BUNDLE_FROM_LAST_PROMOTED_BUNDLE_TAILS:
            return {
                ...state,
                lastPromotedBundleTails: omit(state.unconfirmedBundleTails, action.payload),
            };
        case ActionTypes.SET_NEW_UNCONFIRMED_BUNDLE_TAILS:
            return {
                ...state,
                unconfirmedBundleTails: action.payload,
            };
        case ActionTypes.SET_NEW_LAST_PROMOTED_BUNDLE_TAILS:
            return {
                ...state,
                lastPromotedBundleTails: action.payload,
            };
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
        case 'CHANGE_ACCOUNT_NAME':
            return {
                ...state,
                seedNames: action.accountNames,
                accountInfo: action.accountInfo,
            };
        case 'REMOVE_ACCOUNT':
            return {
                ...state,
                accountInfo: action.accountInfo,
                seedNames: action.accountNames,
                seedCount: state.seedCount - 1,
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
                if (
                    !v.persistence &&
                    v.currentIndex === 0 &&
                    v.value > 0 &&
                    isMinutesAgo(convertUnixTimeToJSDate(v.timestamp), 10) &&
                    !isMinutesAgo(convertUnixTimeToJSDate(v.timestamp), 1440)
                ) {
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
