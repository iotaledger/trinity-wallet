import merge from 'lodash/merge';
import omit from 'lodash/omit';
import filter from 'lodash/filter';
import { ActionTypes } from '../actions/account';
import { ActionTypes as TempAccountActionTypes } from '../actions/tempAccount';
import { ActionTypes as PollingActionTypes } from '../actions/polling';

const account = (
    state = {
        seedCount: 0,
        seedNames: [],
        firstUse: true,
        onboardingComplete: false,
        accountInfo: {},
        unconfirmedBundleTails: {}, // Regardless of the selected account, this would hold all the unconfirmed transfers by bundles.
        unspentAddressesHashes: {},
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
        case ActionTypes.SET_ACCOUNT_INFO:
            return {
                ...state,
                accountInfo: {
                    ...state.accountInfo,
                    [action.seedName]: {
                        addresses: action.addresses,
                        transfers: action.transfers,
                        balance: action.balance,
                    },
                },
            };
        case ActionTypes.CHANGE_ACCOUNT_NAME:
            return {
                ...state,
                seedNames: action.accountNames,
                accountInfo: action.accountInfo,
            };
        case ActionTypes.REMOVE_ACCOUNT:
            return {
                ...state,
                accountInfo: omit(state.accountInfo, action.payload),
                seedNames: filter(state.seedNames, name => name !== action.payload),
                seedCount: state.seedCount - 1,
            };
        case ActionTypes.NEW_ADDRESS_DATA_FETCH_SUCCESS:
            return {
                ...state,
                accountInfo: merge({}, state.accountInfo, {
                    [action.payload.accountName]: {
                        addresses: action.payload.addresses,
                    },
                }),
            };
        case ActionTypes.UPDATE_ADDRESSES:
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
        case ActionTypes.UPDATE_TRANSFERS:
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
        case TempAccountActionTypes.GET_TRANSFERS_SUCCESS:
            return {
                ...state,
                accountInfo: merge({}, state.accountInfo, {
                    [action.payload.accountName]: {
                        transfers: action.payload.transfers,
                    },
                }),
            };
        case ActionTypes.SET_FIRST_USE:
            return {
                ...state,
                firstUse: action.payload,
            };
        case ActionTypes.SET_BALANCE:
            return {
                ...state,
                accountInfo: {
                    ...state.accountInfo,
                    [action.payload.accountName]: {
                        ...state.accountInfo[action.payload.accountName],
                        balance: action.payload.balance,
                    },
                },
            };
        case ActionTypes.SET_ONBOARDING_COMPLETE:
            return {
                ...state,
                onboardingComplete: action.payload,
            };
        case ActionTypes.INCREASE_SEED_COUNT:
            return {
                ...state,
                seedCount: state.seedCount + 1,
            };
        case ActionTypes.ADD_SEED_NAME:
            return {
                ...state,
                seedNames: [...state.seedNames, action.seedName],
            };
        case ActionTypes.FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_REQUEST:
            return {
                ...state,
                firstUse: true,
            };
        case ActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                accountInfo: merge({}, state.accountInfo, {
                    [action.payload.accountName]: {
                        addresses: action.payload.addresses,
                        transfers: action.payload.transfers,
                        balance: action.payload.balance,
                    },
                }),
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload.unconfirmedBundleTails),
                unspentAddressesHashes: merge({}, state.unspentAddressesHashes, {
                    [action.payload.accountName]: action.payload.hashes,
                }),
            };
        case ActionTypes.FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_SUCCESS:
            return {
                ...state,
                seedCount: state.seedCount + 1,
                seedNames: [...state.seedNames, action.payload.accountName],
                accountInfo: merge({}, state.accountInfo, {
                    [action.payload.accountName]: {
                        addresses: action.payload.addresses,
                        transfers: action.payload.transfers,
                        balance: action.payload.balance,
                    },
                }),
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload.unconfirmedBundleTails),
                unspentAddressesHashes: merge({}, state.unspentAddressesHashes, {
                    [action.payload.accountName]: action.payload.hashes,
                }),
                firstUse: false,
            };
        case ActionTypes.FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_ERROR:
            return {
                ...state,
                firstUse: true,
            };
        default:
            return state;
    }
};

export default account;
