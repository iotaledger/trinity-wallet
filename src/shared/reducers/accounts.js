import get from 'lodash/get';
import has from 'lodash/has';
import isBoolean from 'lodash/isBoolean';
import isUndefined from 'lodash/isUndefined';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import some from 'lodash/some';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import transform from 'lodash/transform';
import { ActionTypes } from '../actions/accounts';
import { ActionTypes as PollingActionTypes } from '../actions/polling';
import { ActionTypes as TransfersActionTypes } from '../actions/transfers';
import { renameKeys } from '../libs/utils';

/**
 * Removes account name from account info and reorders account indexes (Fill in missing gaps)
 *
 * @method removeAccountAndReorderIndexes
 * @param {object} accountInfo
 * @param {string} accountNameToDelete
 *
 * @returns {object}
 */
export const removeAccountAndReorderIndexes = (accountInfo, accountNameToDelete) => {
    if (!has(accountInfo, accountNameToDelete)) {
        return accountInfo;
    }

    const { index } = accountInfo[accountNameToDelete];

    return mapValues(
        // Remove account
        omit(accountInfo, accountNameToDelete),
        // Reorder (fill in missing) account indexes
        (data) => ({ ...data, index: data.index > index ? data.index - 1 : data.index }),
    );
};

/**
 * Stop overriding local spend status for a known address
 *
 * @method preserveAddressLocalSpendStatus
 * @param existingAddressData
 * @param newAddressData
 *
 * @returns {object}
 */
const preserveAddressLocalSpendStatus = (existingAddressData, newAddressData) =>
    mapValues(newAddressData, (data, address) => {
        const isSeenAddress = has(existingAddressData, address);
        if (isSeenAddress && isBoolean(get(existingAddressData[address], 'spent.local'))) {
            const { spent: { local } } = existingAddressData[address];

            return {
                ...data,
                spent: { ...data.spent, local: local || get(data, 'spent.local') },
            };
        }

        return data;
    });

/**
 * Merge latest address data into existing address data for an account
 *
 * @method setAddressData
 * @param {object} existingAddressData
 * @param {object} newAddressData
 *
 * @returns {object}
 */
export const setAddressData = (existingAddressData, newAddressData) => {
    if (isEmpty(existingAddressData)) {
        return newAddressData;
    }

    return preserveAddressLocalSpendStatus(existingAddressData, newAddressData);
};

/**
 * Merge latest address data into existing address data for an account
 *
 * @method mergeAddressData
 * @param {object} existingAddressData
 * @param {object} newAddressData
 *
 * @returns {object}
 */
export const mergeAddressData = (existingAddressData, newAddressData) => {
    if (isEmpty(existingAddressData)) {
        return newAddressData;
    }

    return {
        ...existingAddressData,
        ...preserveAddressLocalSpendStatus(existingAddressData, newAddressData),
    };
};

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
            // Set seed index
            index: isUndefined(payload.accountIndex)
                ? get(state.accountInfo, `${payload.accountName}.index`)
                : payload.accountIndex,
            meta: payload.accountMeta || get(state.accountInfo, `${payload.accountName}.meta`) || { type: 'keychain' },
            balance: payload.balance,
            addresses: mergeAddressData(get(state.accountInfo, `${payload.accountName}.addresses`), payload.addresses),
            transfers: {
                ...get(state.accountInfo, `${payload.accountName}.transfers`),
                ...payload.transfers,
            },
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
    const { accountInfo, unconfirmedBundleTails, setupInfo, tasks, failedBundleHashes } = state;

    const { oldAccountName, newAccountName } = payload;

    const keyMap = { [oldAccountName]: newAccountName };

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
        unconfirmedBundleTails: transform(unconfirmedBundleTails, updateAccountInUnconfirmedBundleTails, {}),
    };
};

const account = (
    state = {
        /**
         * Temporary storage for account info during setup
         */
        accountInfoDuringSetup: {
            /**
             * Account name
             */
            name: '',
            /**
             * Account meta - { type, index, page, indexAddress }
             */
            meta: {},
            /**
             * Determines if a user used an existing seed during account setup
             */
            usedExistingSeed: false,
            /**
             * Determines if the account info is complete and account ready to be created and synced
             */
            completed: false,
        },
        /**
         * Determines if onboarding process is completed
         */
        onboardingComplete: false,
        /**
         * Keeps track of signed bundle hashes failed to broadcast
         */
        failedBundleHashes: {},
        /**
         * Keeps track of each account information (name, addresses, transfers, balance)
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
        case ActionTypes.SET_ACCOUNT_INFO_DURING_SETUP:
            return {
                ...state,
                accountInfoDuringSetup: {
                    ...state.accountInfoDuringSetup,
                    ...action.payload,
                },
            };
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
                accountInfo: removeAccountAndReorderIndexes(state.accountInfo, action.payload),
                failedBundleHashes: omit(state.failedBundleHashes, action.payload),
                tasks: omit(state.tasks, action.payload),
                setupInfo: omit(state.setupInfo, action.payload),
                unconfirmedBundleTails: omitBy(state.unconfirmedBundleTails, (tailTransactions) =>
                    some(tailTransactions, (tx) => tx.account === action.payload),
                ),
            };
        case ActionTypes.UPDATE_ACCOUNT_AFTER_TRANSITION:
        case ActionTypes.SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION:
        case ActionTypes.UPDATE_ACCOUNT_AFTER_REATTACHMENT:
        case ActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING:
        case PollingActionTypes.SYNC_ACCOUNT_WHILE_POLLING:
        case PollingActionTypes.SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION:
        case ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
        case TransfersActionTypes.RETRY_FAILED_TRANSACTION_SUCCESS:
        case ActionTypes.SYNC_ACCOUNT_BEFORE_SWEEPING:
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
        case ActionTypes.SET_ONBOARDING_COMPLETE:
            return {
                ...state,
                onboardingComplete: action.payload,
            };
        case ActionTypes.MANUAL_SYNC_SUCCESS:
            return {
                ...state,
                // Set new account info by assigning latest balance, addresses and transfers
                accountInfo: {
                    ...state.accountInfo,
                    [action.payload.accountName]: {
                        // Preserve the account index
                        index: get(state.accountInfo, `${action.payload.accountName}.index`),
                        meta: get(state.accountInfo, `${action.payload.accountName}.meta`) || { type: 'keychain' },
                        balance: action.payload.balance,
                        addresses: mergeAddressData(
                            get(state.accountInfo, `${action.payload.accountName}.addresses`),
                            action.payload.addresses,
                        ),
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
        case ActionTypes.OVERRIDE_ACCOUNT_INFO:
            return {
                ...state,
                // Override account state for provided account name
                accountInfo: {
                    ...state.accountInfo,
                    [action.payload.accountName]: {
                        index: get(state.accountInfo, `${action.payload.accountName}.index`),
                        meta: get(state.accountInfo, `${action.payload.accountName}.meta`) || { type: 'keychain' },
                        balance: action.payload.balance,
                        addresses: setAddressData(
                            get(state.accountInfo, `${action.payload.accountName}.addresses`),
                            action.payload.addresses,
                        ),
                        transfers: action.payload.transfers,
                        hashes: action.payload.hashes,
                    },
                },
                unconfirmedBundleTails: merge(
                    {},
                    // Remove all existing bundle tails from provided account
                    omitBy(state.unconfirmedBundleTails, (tailTransactions) =>
                        some(tailTransactions, (tx) => tx.account === action.payload.accountName),
                    ),
                    // Merge latest bundle tails
                    action.payload.unconfirmedBundleTails,
                ),
            };
        case ActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                unconfirmedBundleTails: merge({}, state.unconfirmedBundleTails, action.payload.unconfirmedBundleTails),
                // Reset (temporarily) stored account info during account setup.
                accountInfoDuringSetup: {
                    name: '',
                    meta: {},
                    completed: false,
                    usedExistingSeed: false,
                },
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
        case ActionTypes.ASSIGN_ACCOUNT_INDEX:
            return {
                ...state,
                accountInfo: transform(
                    keys(state.accountInfo),
                    (acc, name, index) => {
                        acc[name] = { ...state.accountInfo[name], index };
                    },
                    {},
                ),
            };
        default:
            return state;
    }
};

export default account;
