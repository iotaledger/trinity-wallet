import get from 'lodash/get';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import filter from 'lodash/filter';
import { ActionTypes } from '../actions/account';
import { ActionTypes as PollingActionTypes } from '../actions/polling';

const updateAccountInfo = (state, payload) => ({
    accountInfo: {
        ...state.accountInfo,
        [payload.accountName]: {
            ...get(state.accountInfo, `${payload.accountName}`),
            balance: payload.balance,
            addresses: {
                ...get(state.accountInfo, `${payload.accountName}.addresses`),
                ...payload.addresses,
            },
            transfers: payload.transfers,
            isFingerprintEnabled: false,
        },
    },
});

const account = (
    state = {
        seedCount: 0,
        seedNames: [],
        firstUse: true,
        onboardingComplete: false,
        accountInfo: {},
        unconfirmedBundleTails: {}, // Regardless of the selected account, this would hold all the unconfirmed transfers by bundles.
        unspentAddressesHashes: {},
        pendingTxTailsHashes: {},
        is2FAEnabled: false,
        key2FA: '',
        isFingerprintEnabled: false,
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
        case PollingActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
        case ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                unspentAddressesHashes: {
                    ...state.unspentAddressesHashes,
                    [action.payload.accountName]: action.payload.unspentAddressesHashes,
                },
                pendingTxTailsHashes: {
                    ...state.pendingTxTailsHashes,
                    [action.payload.accountName]: action.payload.pendingTxTailsHashes,
                },
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
        case ActionTypes.MANUAL_SYNC_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload.unconfirmedBundleTails),
                unspentAddressesHashes: {
                    ...state.unspentAddressesHashes,
                    [action.payload.accountName]: action.payload.unspentAddressesHashes,
                },
                pendingTxTailsHashes: {
                    ...state.pendingTxTailsHashes,
                    [action.payload.accountName]: action.payload.pendingTxTailsHashes,
                },
            };
        case ActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                firstUse: false,
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload.unconfirmedBundleTails),
                unspentAddressesHashes: {
                    ...state.unspentAddressesHashes,
                    [action.payload.accountName]: action.payload.unspentAddressesHashes,
                },
                pendingTxTailsHashes: {
                    ...state.pendingTxTailsHashes,
                    [action.payload.accountName]: action.payload.pendingTxTailsHashes,
                },
            };
        case ActionTypes.FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                seedCount: state.seedCount + 1,
                seedNames: [...state.seedNames, action.payload.accountName],
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload.unconfirmedBundleTails),
                unspentAddressesHashes: {
                    ...state.unspentAddressesHashes,
                    [action.payload.accountName]: action.payload.unspentAddressesHashes,
                },
                pendingTxTailsHashes: {
                    ...state.pendingTxTailsHashes,
                    [action.payload.accountName]: action.payload.pendingTxTailsHashes,
                },
            };
        case ActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload.unconfirmedBundleTails),
                unspentAddressesHashes: {
                    ...state.unspentAddressesHashes,
                    [action.payload.accountName]: action.payload.unspentAddressesHashes,
                },
                pendingTxTailsHashes: {
                    ...state.pendingTxTailsHashes,
                    [action.payload.accountName]: action.payload.pendingTxTailsHashes,
                },
            };
        case ActionTypes.SET_2FA_STATUS:
            return {
                ...state,
                is2FAEnabled: action.payload,
            };
        case ActionTypes.SET_2FA_KEY:
            return {
                ...state,
                key2FA: action.payload,
            };
        case ActionTypes.SET_FINGERPRINT_STATUS:
            return {
                ...state,
                isFingerprintEnabled: action.payload,
            };
        case ActionTypes.SET_PENDING_TRANSACTION_TAILS_HASHES_FOR_ACCOUNT:
            return {
                ...state,
                pendingTxTailsHashes: {
                    ...state.pendingTxTailsHashes,
                    [action.payload.accountName]: action.payload.pendingTxTailsHashes,
                },
            };
        case ActionTypes.UPDATE_ACCOUNT_AFTER_TRANSITION:
            return {
                ...state,
                accountInfo: {
                    ...state.accountInfo,
                    [action.accountName]: {
                        balance: action.balance,
                        addresses: action.addresses,
                        transfers: state.accountInfo[action.accountName].transfers,
                    },
                },
            };
        default:
            return state;
    }
};

export default account;
