import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import has from 'lodash/has';
import isUndefined from 'lodash/isUndefined';
import transform from 'lodash/transform';
import keys from 'lodash/keys';
import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import { preserveAddressLocalSpendStatus } from '../libs/iota/addresses';
import { AccountsActionTypes, PollingActionTypes, TransfersActionTypes } from '../types';
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
 * Merge latest address data into existing address data for an account
 *
 * @method setAddressData
 * @param {object} existingAddressData
 * @param {object} newAddressData
 *
 * @returns {array}
 */
export const setAddressData = (existingAddressData, newAddressData) => {
    if (isEmpty(existingAddressData)) {
        return newAddressData;
    }

    return preserveAddressLocalSpendStatus(existingAddressData, newAddressData);
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
            ...get(state.accountInfo, [payload.accountName]),
            // Set seed index
            index: isUndefined(payload.index) ? get(state.accountInfo, [payload.accountName, 'index']) : payload.index,
            meta: payload.meta || get(state.accountInfo, [payload.accountName, 'meta']) || { type: 'keychain' },
            addressData: setAddressData(
                get(state.accountInfo, [payload.accountName, 'addressData']),
                payload.addressData,
            ),
            transactions: payload.transactions,
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
    const { accountInfo, setupInfo, tasks } = state;

    const { oldAccountName, newAccountName } = payload;

    const keyMap = { [oldAccountName]: newAccountName };

    return {
        accountInfo: renameKeys(accountInfo, keyMap),
        tasks: renameKeys(tasks, keyMap),
        setupInfo: renameKeys(setupInfo, keyMap),
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
         * Keeps track of each account information (name, addresses[], transactions[])
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
    },
    action,
) => {
    switch (action.type) {
        case AccountsActionTypes.SET_ACCOUNT_INFO_DURING_SETUP:
            return {
                ...state,
                accountInfoDuringSetup: {
                    ...state.accountInfoDuringSetup,
                    ...action.payload,
                },
            };
        case AccountsActionTypes.CHANGE_ACCOUNT_NAME:
            return {
                ...state,
                ...updateAccountName(state, action.payload),
            };
        case AccountsActionTypes.REMOVE_ACCOUNT:
            return {
                ...state,
                accountInfo: removeAccountAndReorderIndexes(state.accountInfo, action.payload),
                tasks: omit(state.tasks, action.payload),
                setupInfo: omit(state.setupInfo, action.payload),
            };
        case AccountsActionTypes.SET_ONBOARDING_COMPLETE:
            return {
                ...state,
                onboardingComplete: action.payload,
            };
        case AccountsActionTypes.SET_BASIC_ACCOUNT_INFO:
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
                        displayedSnapshotTransitionGuide: false, // Initialize with a default
                    },
                },
            };
        case AccountsActionTypes.MARK_TASK_AS_DONE:
            return {
                ...state,
                tasks: {
                    ...state.tasks,
                    [action.payload.accountName]: {
                        ...get(state.tasks, [action.payload.accountName]),
                        [action.payload.task]: true,
                    },
                },
            };
        case AccountsActionTypes.UPDATE_ADDRESS_DATA:
            return {
                ...state,
                accountInfo: {
                    ...state.accountInfo,
                    [action.accountName]: {
                        ...state.accountInfo[action.accountName],
                        addressData: setAddressData(
                            get(state.accountInfo, [action.accountName, 'addressData']),
                            action.addressData,
                        ),
                    },
                },
            };
        case AccountsActionTypes.UPDATE_ACCOUNT_AFTER_TRANSITION:
        case AccountsActionTypes.SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION:
        case AccountsActionTypes.UPDATE_ACCOUNT_AFTER_REATTACHMENT:
        case AccountsActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING:
        case PollingActionTypes.SYNC_ACCOUNT_WHILE_POLLING:
        case PollingActionTypes.SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION:
        case AccountsActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
        case TransfersActionTypes.RETRY_FAILED_TRANSACTION_SUCCESS:
        case AccountsActionTypes.SYNC_ACCOUNT_BEFORE_SWEEPING:
        case AccountsActionTypes.MANUAL_SYNC_SUCCESS:
        case AccountsActionTypes.OVERRIDE_ACCOUNT_INFO:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
                accountInfoDuringSetup: {
                    name: '',
                    meta: {},
                    usedExistingSeed: false,
                },
            };
        case AccountsActionTypes.ASSIGN_ACCOUNT_INDEX:
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
