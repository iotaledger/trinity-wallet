import get from 'lodash/get';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { ActionTypes } from '../actions/accounts';
import { ActionTypes as PollingActionTypes } from '../actions/polling';
import { ActionTypes as TransfersActionTypes } from '../actions/transfers';
import { renameKeys } from '../libs/utils';

/**
 * Stop overriding local spend status for a known address
 *
 * @method preserveAddressLocalSpendStatus
 * @param existingAddressData
 * @param newAddressData
 *
 * @returns {object}
 */
export const preserveAddressLocalSpendStatus = (existingAddressData, newAddressData) =>
    map(newAddressData, (addressObject) => {
        const seenAddress = find(existingAddressData, { address: addressObject.address });

        if (seenAddress && isBoolean(get(seenAddress, 'spent.local'))) {
            const { spent: { local } } = seenAddress;

            return {
                ...addressObject,
                spent: { ...addressObject.spent, local: local || get(seenAddress, 'spent.local') },
            };
        }

        return addressObject;
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
            type: payload.accountType || get(state.accountInfo, `${payload.accountName}.type`) || 'keychain',
            addresses: setAddressData(get(state.accountInfo, `${payload.accountName}.addresses`), payload.addresses),
            transactions: payload.transactions
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
                tasks: omit(state.tasks, action.payload),
                setupInfo: omit(state.setupInfo, action.payload)
            };
        case ActionTypes.UPDATE_ACCOUNT_AFTER_TRANSITION:
        case ActionTypes.SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION:
        case ActionTypes.UPDATE_ACCOUNT_AFTER_REATTACHMENT:
        case ActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING:
        case PollingActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
        case PollingActionTypes.SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION:
        case ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
        case TransfersActionTypes.RETRY_FAILED_TRANSACTION_SUCCESS:
        case ActionTypes.SYNC_ACCOUNT_BEFORE_SWEEPING:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
            };
        case ActionTypes.UPDATE_ADDRESSES:
            return {
                ...state,
                accountInfo: {
                    ...state.accountInfo,
                    [action.accountName]: {
                        ...state.accountInfo[action.accountName],
                        addressData: action.addressData,
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
                        addressData: action.payload.addresses,
                        transactions: action.payload.transactions,
                    },
                },
            };
        case ActionTypes.OVERRIDE_ACCOUNT_INFO:
            return {
                ...state,
                // Override account state for provided account name
                accountInfo: {
                    ...state.accountInfo,
                    [action.payload.accountName]: {
                        addressData: action.payload.addresses,
                        transactions: action.payload.transactions,
                    },
                },
            };
        case ActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                ...updateAccountInfo(state, action.payload),
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
