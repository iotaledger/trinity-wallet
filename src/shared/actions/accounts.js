import takeRight from 'lodash/takeRight';
import { iota } from '../libs/iota';
import { selectedAccountStateFactory } from '../selectors/accounts';
import { syncAccount, getAccountData, syncAccountAfterSpending } from '../libs/iota/accounts';
import { formatAddresses, syncAddresses, getNewAddress } from '../libs/iota/addresses';
import {
    clearTempData,
    updateTransitionBalance,
    switchBalanceCheckToggle,
    snapshotTransitionRequest,
    updateTransitionAddresses,
    snapshotTransitionSuccess,
    snapshotTransitionError,
    snapshotAttachToTangleRequest,
    snapshotAttachToTangleComplete,
} from './app';
import {
    generateAccountInfoErrorAlert,
    generateSyncingCompleteAlert,
    generateSyncingErrorAlert,
    generateAccountDeletedAlert,
    generateTransitionErrorAlert,
    generateAlert,
} from '../actions/alerts';
import { pushScreen } from '../libs/util';
import { DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE } from '../config';

export const ActionTypes = {
    UPDATE_ACCOUNT_INFO_AFTER_SPENDING: 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
    UPDATE_ACCOUNT_AFTER_REATTACHMENT: 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_REATTACHMENT',
    SET_FIRST_USE: 'IOTA/ACCOUNTS/SET_FIRST_USE',
    UPDATE_ADDRESSES: 'IOTA/ACCOUNTS/UPDATE_ADDRESSES',
    CHANGE_ACCOUNT_NAME: 'IOTA/ACCOUNTS/CHANGE_ACCOUNT_NAME',
    REMOVE_ACCOUNT: 'IOTA/ACCOUNTS/REMOVE_ACCOUNT',
    SET_ONBOARDING_COMPLETE: 'IOTA/ACCOUNTS/SET_ONBOARDING_COMPLETE',
    INCREASE_SEED_COUNT: 'IOTA/ACCOUNTS/INCREASE_SEED_COUNT',
    ADD_ACCOUNT_NAME: 'IOTA/ACCOUNTS/ADD_ACCOUNT_NAME',
    UPDATE_ACCOUNT_AFTER_TRANSITION: 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_TRANSITION',
    SET_NEW_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNTS/SET_NEW_UNCONFIRMED_BUNDLE_TAILS',
    UPDATE_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNTS/UPDATE_UNCONFIRMED_BUNDLE_TAILS',
    REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNTS/REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS',
    FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_REQUEST: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_REQUEST',
    FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_SUCCESS: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_SUCCESS',
    FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_ERROR: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_ERROR',
    FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_REQUEST: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_REQUEST',
    FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_SUCCESS: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_SUCCESS',
    FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_ERROR: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_ERROR',
    MANUAL_SYNC_REQUEST: 'IOTA/ACCOUNTS/MANUAL_SYNC_REQUEST',
    MANUAL_SYNC_SUCCESS: 'IOTA/ACCOUNTS/MANUAL_SYNC_SUCCESS',
    MANUAL_SYNC_ERROR: 'IOTA/ACCOUNTS/MANUAL_SYNC_ERROR',
    ACCOUNT_INFO_FETCH_REQUEST: 'IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_REQUEST',
    ACCOUNT_INFO_FETCH_SUCCESS: 'IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_SUCCESS',
    ACCOUNT_INFO_FETCH_ERROR: 'IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_ERROR',
};

export const updateAccountInfoAfterSpending = (payload) => ({
    type: ActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING,
    payload,
});

export const updateAccountAfterReattachment = (payload) => ({
    type: ActionTypes.UPDATE_ACCOUNT_AFTER_REATTACHMENT,
    payload,
});

export const setFirstUse = (payload) => ({
    type: ActionTypes.SET_FIRST_USE,
    payload,
});

export const updateAddresses = (accountName, addresses) => ({
    type: ActionTypes.UPDATE_ADDRESSES,
    accountName,
    addresses,
});

export const changeAccountName = (accountInfo, accountNames) => ({
    type: ActionTypes.CHANGE_ACCOUNT_NAME,
    accountInfo,
    accountNames,
});

export const removeAccount = (payload) => ({
    type: ActionTypes.REMOVE_ACCOUNT,
    payload,
});

export const setOnboardingComplete = (payload) => ({
    type: ActionTypes.SET_ONBOARDING_COMPLETE,
    payload,
});

export const addAccountName = (accountName) => ({
    type: ActionTypes.ADD_ACCOUNT_NAME,
    accountName,
});

export const increaseSeedCount = () => ({
    type: ActionTypes.INCREASE_SEED_COUNT,
});

export const updateAccountAfterTransition = (accountName, addresses, balance) => ({
    type: ActionTypes.UPDATE_ACCOUNT_AFTER_TRANSITION,
    accountName,
    addresses,
    balance,
});

export const setNewUnconfirmedBundleTails = (payload) => ({
    type: ActionTypes.SET_NEW_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

export const updateUnconfirmedBundleTails = (payload) => ({
    type: ActionTypes.UPDATE_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

export const removeBundleFromUnconfirmedBundleTails = (payload) => ({
    type: ActionTypes.REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

export const fullAccountInfoAdditionalSeedFetchRequest = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_REQUEST,
});

export const fullAccountInfoAdditionalSeedFetchSuccess = (payload) => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_SUCCESS,
    payload,
});

export const fullAccountInfoAdditionalSeedFetchError = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_ERROR,
});

export const fullAccountInfoFirstSeedFetchRequest = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_REQUEST,
});

export const fullAccountInfoFirstSeedFetchSuccess = (payload) => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_SUCCESS,
    payload,
});

export const fullAccountInfoFirstSeedFetchError = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_ERROR,
});

export const manualSyncRequest = () => ({
    type: ActionTypes.MANUAL_SYNC_REQUEST,
});

export const manualSyncSuccess = (payload) => ({
    type: ActionTypes.MANUAL_SYNC_SUCCESS,
    payload,
});

export const manualSyncError = () => ({
    type: ActionTypes.MANUAL_SYNC_ERROR,
});

export const accountInfoFetchRequest = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_REQUEST,
});

export const accountInfoFetchSuccess = (payload) => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS,
    payload,
});

export const accountInfoFetchError = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_ERROR,
});

/**
 *   Fetches account information from tangle for an additional seed.
 * 
 *   @method getFullAccountInfoAdditionalSeed
 *   @param {string} seed
 *   @param {string} accountName
 *   @param {string} password
 *   @param {function} storeInKeychainPromise
 *   @param {object} [navigator=null]
 *   @param {function} genFn
 *   @returns {function} dispatch
 **/
export const getFullAccountInfoAdditionalSeed = (
    seed,
    accountName,
    password,
    storeInKeychainPromise,
    navigator = null,
    genFn,
) => (dispatch) => {
    const onError = (err) => {
        if (navigator) {
            navigator.pop({ animated: false });
        }

        dispatch(generateAccountInfoErrorAlert(err));
        dispatch(fullAccountInfoAdditionalSeedFetchError());
    };

    dispatch(fullAccountInfoAdditionalSeedFetchRequest());

    getAccountData(seed, accountName, genFn)
        .then((data) => {
            dispatch(clearTempData()); // Clean up partial state for reducer.
            if (storeInKeychainPromise) {
                storeInKeychainPromise(password, seed, accountName)
                    .then(() => dispatch(fullAccountInfoAdditionalSeedFetchSuccess(data)))
                    .catch((err) => onError(err));
            } else {
                dispatch(fullAccountInfoAdditionalSeedFetchSuccess(data));
            }
        })
        .catch((err) => onError(err));
};

export const getFullAccountInfoFirstSeed = (seed, accountName, navigator = null, genFn) => {
    return (dispatch) => {
        dispatch(fullAccountInfoFirstSeedFetchRequest());

        getAccountData(seed, accountName, genFn)
            .then((data) => dispatch(fullAccountInfoFirstSeedFetchSuccess(data)))
            .catch((err) => {
                pushScreen(navigator, 'login');
                dispatch(generateAccountInfoErrorAlert(err));
                dispatch(fullAccountInfoFirstSeedFetchError());
            });
    };
};

export const manuallySyncAccount = (seed, accountName, genFn) => {
    return (dispatch) => {
        dispatch(manualSyncRequest());

        getAccountData(seed, accountName, genFn)
            .then((data) => {
                dispatch(generateSyncingCompleteAlert());
                dispatch(manualSyncSuccess(data));
            })
            .catch((err) => {
                dispatch(generateSyncingErrorAlert(err));
                dispatch(manualSyncError());
            });
    };
};

/**
 *   Gather current account information and checks for updated account information.
 *   - Starts by checking if there are pending transaction hashes. In case there are it would grab persistence on those.
 *   - Checks for latest addresses.
 *   - Grabs balance on latest addresses
 *   - Grabs transaction hashes on all unspent addresses
 *   - Checks if there are new transaction hashes by comparing it with a local copy of transaction hashes.
 *     In case there are new hashes, constructs the bundle and dispatch with latest account information
 *   Stops at the point where there are no transaction hashes associated with last (total defaults to --> 10) addresses
 *
 *   @method getAccountInfo
 *   @param {string} seed
 *   @param {string} accountName
 *   @param {object} [navigator=null]
 *   @returns {function} dispatch
 **/
export const getAccountInfo = (seed, accountName, navigator = null, genFn) => {
    return (dispatch, getState) => {
        dispatch(accountInfoFetchRequest());

        const existingAccountState = selectedAccountStateFactory(accountName)(getState());

        return syncAddresses(seed, existingAccountState, genFn)
            .then((accountData) => {
                return syncAccount(accountData);
            })
            .then((newAccountData) => dispatch(accountInfoFetchSuccess(newAccountData)))
            .catch((err) => {
                if (navigator) {
                    navigator.pop({ animated: false });
                }

                dispatch(accountInfoFetchError());
                dispatch(generateAccountInfoErrorAlert(err));
            });
    };
};

export const deleteAccount = (accountName) => (dispatch) => {
    dispatch(removeAccount(accountName));
    dispatch(generateAccountDeletedAlert());
};
