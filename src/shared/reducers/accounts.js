import get from 'lodash/get';
import find from 'lodash/find';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
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
            addressData: setAddressData(
                get(state.accountInfo, `${payload.accountName}.addressData`),
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
                setupInfo: omit(state.setupInfo, action.payload),
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
        case ActionTypes.OVERRIDE_ACCOUNT_INFO:
        case ActionTypes.MANUAL_SYNC_SUCCESS:
        case ActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS:
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
                        addressData: setAddressData(
                            get(state.accountInfo, `${action.accountName}.addressData`),
                            action.addressData,
                        ),
                    },
                },
            };
        case ActionTypes.SET_ONBOARDING_COMPLETE:
            return {
                ...state,
                onboardingComplete: action.payload,
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
                        displayedSnapshotTransitionGuide: false, // Initialize with a default
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
        default:
            return state;
    }
};

export default account;
