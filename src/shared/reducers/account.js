import get from 'lodash/get';
import some from 'lodash/some';
import map from 'lodash/map';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import transform from 'lodash/transform';
import union from 'lodash/union';
import { ActionTypes } from '../actions/account';
import { ActionTypes as PollingActionTypes } from '../actions/polling';
import { renameKeys } from '../libs/util';

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
        },
    },
});

const updateAccountName = (state, payload) => {
    const {
        accountInfo,
        accountNames,
        unconfirmedBundleTails,
        txHashesForUnspentAddresses,
        pendingTxHashesForSpentAddresses
    } = state;

    const { oldAccountName, newAccountName } = payload;

    const keyMap = { [oldAccountName]: newAccountName };
    const accountIndex = findIndex(accountNames, (name) => name === oldAccountName);

    const updateName = (name, idx) => {
        if (idx === accountIndex) {
            return newAccountName;
        }

        return name;
    };

    const updateAccountInUnconfirmedBundleTails = (acc, tailTransactions, bundle) => {
        if (some(tailTransactions, (tx) => tx.account === oldAccountName)) {
            acc[bundle] = map(tailTransactions, (tx) => ({ ...tx, account: newAccountName }));
        } else {
            acc[bundle] = tailTransactions;
        }
    };

    return {
        accountInfo: renameKeys(accountInfo, keyMap),
        txHashesForUnspentAddresses: renameKeys(txHashesForUnspentAddresses, keyMap),
        pendingTxHashesForSpentAddresses: renameKeys(pendingTxHashesForSpentAddresses, keyMap),
        accountNames: map(accountNames, updateName),
        unconfirmedBundleTails: transform(unconfirmedBundleTails, updateAccountInUnconfirmedBundleTails, {})
    };
};

const account = (
    state = {
        seedCount: 0,
        accountNames: [],
        firstUse: true,
        onboardingComplete: false,
        accountInfo: {},
        unconfirmedBundleTails: {}, // Regardless of the selected account, this would hold all the unconfirmed transfers by bundles.
        txHashesForUnspentAddresses: {},
        pendingTxHashesForSpentAddresses: {},
        is2FAEnabled: false,
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
                ...updateAccountName(state, action.payload)
            };
        case ActionTypes.REMOVE_ACCOUNT:
            return {
                ...state,
                accountInfo: omit(state.accountInfo, action.payload),
                txHashesForUnspentAddresses: omit(state.txHashesForUnspentAddresses, action.payload),
                pendingTxHashesForSpentAddresses: omit(state.pendingTxHashesForSpentAddresses, action.payload),
                unconfirmedBundleTails: omitBy(state.unconfirmedBundleTails, (tailTransactions) =>
                    some(tailTransactions, (tx) => tx.account === action.payload),
                ),
                accountNames: filter(state.accountNames, (name) => name !== action.payload),
                seedCount: state.seedCount - 1,
            };
        case PollingActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
        case ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                txHashesForUnspentAddresses: {
                    ...state.txHashesForUnspentAddresses,
                    [action.payload.accountName]: action.payload.txHashesForUnspentAddresses,
                },
                pendingTxHashesForSpentAddresses: {
                    ...state.pendingTxHashesForSpentAddresses,
                    [action.payload.accountName]: action.payload.pendingTxHashesForSpentAddresses,
                },
                // Both these cases do a deep merge while updating existing unconfirmed bundle tails so just assign those
                // Also they omit confirmed bundles
                unconfirmedBundleTails: action.payload.unconfirmedBundleTails,
            };
        case ActionTypes.UPDATE_ADDRESSES:
            return {
                ...state,
                accountInfo: {
                    ...state.accountInfo,
                    [action.accountName]: {
                        ...state.accountInfo[action.accountName],
                        addresses: action.addresses,
                    },
                },
            };
        case ActionTypes.UPDATE_TRANSFERS:
            return {
                ...state,
                accountInfo: {
                    ...state.accountInfo,
                    [action.accountName]: {
                        ...state.accountInfo[action.accountName],
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
                accountNames: [...state.accountNames, action.accountName],
            };
        case ActionTypes.MANUAL_SYNC_SUCCESS:
            return {
                ...state,
                // Set new account info by assigning latest balance, addresses and transfers
                accountInfo: {
                    ...state.accountInfo,
                    [action.payload.accountName]: {
                        balance: action.payload.balance,
                        addresses: action.payload.addresses,
                        transfers: action.payload.transfers,
                    },
                },
                unconfirmedBundleTails: merge(
                    {},
                    // Remove all tail transactions that were assosicated with this account.
                    omitBy(state.unconfirmedBundleTails, (tailTransactions) =>
                        some(tailTransactions, (tx) => tx.account === action.payload.accountName),
                    ),
                    // Merge latest tail transactions for valid pending value transfers
                    action.payload.unconfirmedBundleTails,
                ),
                // Set latest transaction hashes for unspent addresses
                txHashesForUnspentAddresses: {
                    ...state.txHashesForUnspentAddresses,
                    [action.payload.accountName]: action.payload.txHashesForUnspentAddresses,
                },
                // Set latest transaction hashes for spent addresses with pending transactions
                pendingTxHashesForSpentAddresses: {
                    ...state.pendingTxHashesForSpentAddresses,
                    [action.payload.accountName]: action.payload.pendingTxHashesForSpentAddresses,
                },
            };
        case ActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                firstUse: false,
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload.unconfirmedBundleTails),
                txHashesForUnspentAddresses: {
                    ...state.txHashesForUnspentAddresses,
                    [action.payload.accountName]: action.payload.txHashesForUnspentAddresses,
                },
                pendingTxHashesForSpentAddresses: {
                    ...state.pendingTxHashesForSpentAddresses,
                    [action.payload.accountName]: action.payload.pendingTxHashesForSpentAddresses,
                },
            };
        case ActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                seedCount: state.seedCount + 1,
                accountNames: union(state.accountNames, [action.payload.accountName]),
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload.unconfirmedBundleTails),
                txHashesForUnspentAddresses: {
                    ...state.txHashesForUnspentAddresses,
                    [action.payload.accountName]: action.payload.txHashesForUnspentAddresses,
                },
                pendingTxHashesForSpentAddresses: {
                    ...state.pendingTxHashesForSpentAddresses,
                    [action.payload.accountName]: action.payload.pendingTxHashesForSpentAddresses,
                },
            };
        case ActionTypes.UPDATE_ACCOUNT_AFTER_REATTACHMENT:
        case ActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload.unconfirmedBundleTails),
                txHashesForUnspentAddresses: {
                    ...state.txHashesForUnspentAddresses,
                    [action.payload.accountName]: action.payload.txHashesForUnspentAddresses,
                },
                pendingTxHashesForSpentAddresses: {
                    ...state.pendingTxHashesForSpentAddresses,
                    [action.payload.accountName]: action.payload.pendingTxHashesForSpentAddresses,
                },
            };
        case ActionTypes.SET_2FA_STATUS:
            return {
                ...state,
                is2FAEnabled: action.payload,
            };
        case ActionTypes.SET_FINGERPRINT_STATUS:
            return {
                ...state,
                isFingerprintEnabled: action.payload,
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
