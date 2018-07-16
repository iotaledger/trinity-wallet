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
import { ActionTypes } from '../actions/accounts';
import { ActionTypes as PollingActionTypes } from '../actions/polling';
import { ActionTypes as TransfersActionTypes } from '../actions/transfers';
import { renameKeys } from '../libs/utils';

/**
 * Updates account information for a single account
 *
 * @method updateAccountInfo
 *
 * @param state - Account state object
 * @param payload - New account information
 * @returns {{accountInfo: {}}}
 */
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
            hashes: payload.hashes,
        },
    },
});

/**
 * Updates account name
 *
 * @method updateAccountName
 *
 * @param state - Account state object
 * @param payload - New account information
 * @returns {{accountInfo: {}}}
 */
const updateAccountName = (state, payload) => {
    const { accountInfo, accountNames, unconfirmedBundleTails, setupInfo, tasks, failedBundleHashes } = state;

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
        failedBundleHashes: renameKeys(failedBundleHashes, keyMap),
        tasks: renameKeys(tasks, keyMap),
        setupInfo: renameKeys(setupInfo, keyMap),
        accountNames: map(accountNames, updateName),
        unconfirmedBundleTails: transform(unconfirmedBundleTails, updateAccountInUnconfirmedBundleTails, {}),
    };
};

const account = (
    state = {
        /**
         * Keeps track of the number of total seeds (accounts) added in wallet
         */
        seedCount: 0,
        /**
         * List of unique account names added in wallet
         */
        accountNames: [],
        /**
         * Determines if the wallet is being setup for the first time
         */
        firstUse: true,
        /**
         * Determines if onboarding process is completed
         */
        onboardingComplete: false,
        /**
         * Keeps track of signed bundle hashes failed to broadcast
         */
        failedBundleHashes: {},
        /**
         * Keeps track of each account information (addresses, transfers, balance)
         */
        accountInfo: {},
        /**
         * Keeps track information during account setup.
         * For example: Keeps track if a user used an existing seed or generated within Trinity
         */
        setupInfo: {},
        /**
         * Keeps track on tasks wallet needs to perform
         * For example: Keeps track if user was displayed with the transaction guide modal
         */
        tasks: {},
        /**
         * Keeps track of all unconfirmed transfers categorised by bundle hashes for all accounts
         */
        unconfirmedBundleTails: {},
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
                ...updateAccountName(state, action.payload),
            };
        case ActionTypes.REMOVE_ACCOUNT:
            return {
                ...state,
                accountInfo: omit(state.accountInfo, action.payload),
                failedBundleHashes: omit(state.failedBundleHashes, action.payload),
                tasks: omit(state.tasks, action.payload),
                setupInfo: omit(state.setupInfo, action.payload),
                unconfirmedBundleTails: omitBy(state.unconfirmedBundleTails, (tailTransactions) =>
                    some(tailTransactions, (tx) => tx.account === action.payload),
                ),
                accountNames: filter(state.accountNames, (name) => name !== action.payload),
                seedCount: state.seedCount - 1,
            };
        case ActionTypes.UPDATE_ACCOUNT_AFTER_TRANSITION:
        case ActionTypes.SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION:
        case ActionTypes.UPDATE_ACCOUNT_AFTER_REATTACHMENT:
        case ActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING:
        case PollingActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
        case PollingActionTypes.SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION:
        case ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
        case TransfersActionTypes.RETRY_FAILED_TRANSACTION_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                // All these cases do a deep merge while updating existing unconfirmed bundle tails so just assign those
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
        case ActionTypes.SET_FIRST_USE:
            return {
                ...state,
                firstUse: action.payload,
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
        case ActionTypes.ADD_ACCOUNT_NAME:
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
                        hashes: action.payload.hashes,
                    },
                },
                unconfirmedBundleTails: merge(
                    {},
                    // Remove all tail transactions that were associated with this account.
                    omitBy(state.unconfirmedBundleTails, (tailTransactions) =>
                        some(tailTransactions, (tx) => tx.account === action.payload.accountName),
                    ),
                    // Merge latest tail transactions for valid pending value transfers
                    action.payload.unconfirmedBundleTails,
                ),
            };
        case ActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                firstUse: false,
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload.unconfirmedBundleTails),
            };
        case ActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                seedCount: state.seedCount + 1,
                accountNames: union(state.accountNames, [action.payload.accountName]),
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload.unconfirmedBundleTails),
            };
        case ActionTypes.SET_BASIC_ACCOUNT_INFO:
            return {
                ...state,
                setupInfo: {
                    ...state.setupInfo,
                    [action.payload.accountName]: {
                        usedExistingSeed: action.payload.usedExistingSeed,
                    },
                },
                tasks: {
                    ...state.tasks,
                    [action.payload.accountName]: {
                        hasDisplayedTransitionGuide: false, // Initialize with a default
                    },
                },
            };
        case ActionTypes.MARK_TASK_AS_DONE:
            return {
                ...state,
                tasks: {
                    ...state.tasks,
                    [action.payload.accountName]: {
                        ...get(state.tasks, `${action.payload.accountName}`),
                        [action.payload.task]: true,
                    },
                },
            };
        case ActionTypes.MARK_BUNDLE_BROADCAST_STATUS_PENDING:
            return {
                ...state,
                failedBundleHashes: {
                    ...state.failedBundleHashes,
                    [action.payload.accountName]: {
                        ...state.failedBundleHashes[action.payload.accountName],
                        ...{
                            [action.payload.bundleHash]: action.payload.transactionObjects,
                        },
                    },
                },
            };
        case ActionTypes.MARK_BUNDLE_BROADCAST_STATUS_COMPLETE:
            return {
                ...state,
                failedBundleHashes: {
                    ...state.failedBundleHashes,
                    [action.payload.accountName]: omit(
                        state.failedBundleHashes[action.payload.accountName],
                        action.payload.bundleHash,
                    ),
                },
            };
        default:
            return state;
    }
};

export default account;
