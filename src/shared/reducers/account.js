import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { ActionTypes } from '../actions/account';

const account = (
    state = {
        seedCount: 0,
        seedNames: [],
        firstUse: true,
        onboardingComplete: false,
        balance: 0,
        unconfirmedBundleTails: {}, // Regardless of the selected account, this would hold all the unconfirmed transfers by bundles.
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
        case ActionTypes.SET_NEW_UNCONFIRMED_BUNDLE_TAILS:
            return {
                ...state,
                unconfirmedBundleTails: action.payload,
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
