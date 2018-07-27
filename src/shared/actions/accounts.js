import { selectedAccountStateFactory, getAccountNamesFromState } from '../selectors/accounts';
import { syncAccount, getAccountData } from '../libs/iota/accounts';
import { clearWalletData, setSeedIndex } from './wallet';
import {
    generateAccountInfoErrorAlert,
    generateSyncingCompleteAlert,
    generateSyncingErrorAlert,
    generateAccountDeletedAlert,
    generateNodeOutOfSyncErrorAlert,
} from '../actions/alerts';
import { pushScreen } from '../libs/utils';
import Errors from '../libs/errors';

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
    SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION: 'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION',
    SET_BASIC_ACCOUNT_INFO: 'IOTA/ACCOUNTS/SET_BASIC_ACCOUNT_INFO',
    MARK_TASK_AS_DONE: 'IOTA/ACCOUNTS/MARK_TASK_AS_DONE',
    MARK_BUNDLE_BROADCAST_STATUS_PENDING: 'IOTA/ACCOUNTS/MARK_BUNDLE_BROADCAST_STATUS_PENDING',
    MARK_BUNDLE_BROADCAST_STATUS_COMPLETE: 'IOTA/ACCOUNTS/MARK_BUNDLE_BROADCAST_STATUS_COMPLETE',
};

/**
 * Dispatch to update account state before manually promoting a transaction
 *
 * @method syncAccountBeforeManualPromotion
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const syncAccountBeforeManualPromotion = (payload) => ({
    type: ActionTypes.SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION,
    payload,
});

/**
 * Dispatch to update account state after sending a transaction*
 *
 * @method updateAccountInfoAfterSpending
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateAccountInfoAfterSpending = (payload) => ({
    type: ActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING,
    payload,
});

/**
 * Dispatch to update account state after a transaction reattachment
 *
 * @method updateAccountAfterReattachment
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateAccountAfterReattachment = (payload) => ({
    type: ActionTypes.UPDATE_ACCOUNT_AFTER_REATTACHMENT,
    payload,
});

/**
 * Dispatch to mark wallet's "first use" flag as true
 *
 * @method setFirstUse
 *
 * @param {boolean} payload
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setFirstUse = (payload) => ({
    type: ActionTypes.SET_FIRST_USE,
    payload,
});

/**
 * Dispatch to update address data for provided account
 *
 * @method updateAddresses
 * @param {string} accountName
 * @param {object} addresses
 * @returns {{type: string, accountName: string, addresses: object }}
 */
export const updateAddresses = (accountName, addresses) => ({
    type: ActionTypes.UPDATE_ADDRESSES,
    accountName,
    addresses,
});

/**
 * Dispatch to update account name in state
 *
 * @method changeAccountName
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const changeAccountName = (payload) => ({
    type: ActionTypes.CHANGE_ACCOUNT_NAME,
    payload,
});

/**
 * Dispatch to remove an account and its associated data from state
 *
 * @method removeAccount
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const removeAccount = (payload) => ({
    type: ActionTypes.REMOVE_ACCOUNT,
    payload,
});

/**
 * Dispatch to set onboarding as completed
 *
 * @method setOnboardingComplete
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setOnboardingComplete = (payload) => ({
    type: ActionTypes.SET_ONBOARDING_COMPLETE,
    payload,
});

/**
 * Dispatch to add a new account name in state
 *
 * @method addAccountName
 * @param {string} accountName
 *
 * @returns {{type: {string}, accountName: {string} }}
 */
export const addAccountName = (accountName) => ({
    type: ActionTypes.ADD_ACCOUNT_NAME,
    accountName,
});

/**
 * Dispatch to increase number of seeds added to wallet
 *
 * @method increaseSeedCount
 *
 * @returns {{type: {string} }}
 */
export const increaseSeedCount = () => ({
    type: ActionTypes.INCREASE_SEED_COUNT,
});

/**
 * Dispatch to update account state after snapshot transition
 *
 * @method updateAccountAfterTransition
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateAccountAfterTransition = (payload) => ({
    type: ActionTypes.UPDATE_ACCOUNT_AFTER_TRANSITION,
    payload,
});

/**
 * Dispatch to store unconfirmed transaction tails in state for auto promotion
 *
 * @method setNewUnconfirmedBundleTails
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setNewUnconfirmedBundleTails = (payload) => ({
    type: ActionTypes.SET_NEW_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

/**
 * Dispatch to update unconfirmed transaction tails in state with new unconfirmed transactions
 *
 * @method updateUnconfirmedBundleTails
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateUnconfirmedBundleTails = (payload) => ({
    type: ActionTypes.UPDATE_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

/**
 * Dispatch to remove bundle hash (payload) from unconfirmed transaction tails for auto promotion
 *
 * @method removeBundleFromUnconfirmedBundleTails
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const removeBundleFromUnconfirmedBundleTails = (payload) => ({
    type: ActionTypes.REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

/**
 * Dispatch when information for an additional account is about to be fetched
 *
 * @method fullAccountInfoAdditionalSeedFetchRequest
 *
 * @returns {{type: {string} }}
 */
export const fullAccountInfoAdditionalSeedFetchRequest = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_REQUEST,
});

/**
 * Dispatch when account information for an additional account is successfully fetched
 *
 * @method fullAccountInfoAdditionalSeedFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const fullAccountInfoAdditionalSeedFetchSuccess = (payload) => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_SUCCESS,
    payload,
});

/**
 * Dispatch when an error occurs during the process of fetching information for an additional account
 *
 * @method fullAccountInfoAdditionalSeedFetchError
 *
 * @returns {{type: {string} }}
 */
export const fullAccountInfoAdditionalSeedFetchError = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_ERROR,
});

/**
 * Dispatch when information for first account is about to be fetched
 *
 * @method fullAccountInfoFirstSeedFetchRequest
 *
 * @returns {{type: {string} }}
 */
export const fullAccountInfoFirstSeedFetchRequest = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_REQUEST,
});

/**
 *  Dispatch when information for first account is successfully fetched
 *
 * @method fullAccountInfoFirstSeedFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const fullAccountInfoFirstSeedFetchSuccess = (payload) => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_SUCCESS,
    payload,
});

/**
 * Dispatch when an error occurs during the process of fetching information for first account
 *
 * @method fullAccountInfoFirstSeedFetchError
 *
 * @returns {{type: {string} }}
 */
export const fullAccountInfoFirstSeedFetchError = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_ERROR,
});

/**
 * Dispatch when account is about to be manually synced
 *
 * @method manualSyncRequest
 *
 * @returns {{type: {string} }}
 */
export const manualSyncRequest = () => ({
    type: ActionTypes.MANUAL_SYNC_REQUEST,
});

/**
 * Dispatch when account is successfully synced
 *
 * @method manualSyncSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const manualSyncSuccess = (payload) => ({
    type: ActionTypes.MANUAL_SYNC_SUCCESS,
    payload,
});

/**
 * Dispatch when an error occurs during manual sync
 *
 * @method manualSyncError
 *
 * @returns {{type: {string} }}
 */
export const manualSyncError = () => ({
    type: ActionTypes.MANUAL_SYNC_ERROR,
});

/**
 * Dispatch when account information is about to be fetched on login
 *
 * @method accountInfoFetchRequest
 *
 * @returns {{type: {string} }}
 */
export const accountInfoFetchRequest = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_REQUEST,
});

/**
 * Dispatch when account information is successfully synced on login
 *
 * @method accountInfoFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const accountInfoFetchSuccess = (payload) => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS,
    payload,
});

/**
 * Dispatch when an error occurs during account sync on login
 *
 * @method accountInfoFetchError
 *
 * @returns {{type: {string} }}
 */
export const accountInfoFetchError = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_ERROR,
});

/**
 * Dispatch to set basic account info in state
 *
 * For example: To keep track of whether a seed was generated within Trinity
 *
 * @method setBasicAccountInfo
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setBasicAccountInfo = (payload) => ({
    type: ActionTypes.SET_BASIC_ACCOUNT_INFO,
    payload,
});

/**
 * Dispatch to mark a task as completed in state
 *
 * For example: to display a modal if the user's balance on initial login is zero
 *
 *
 * @method markTaskAsDone
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const markTaskAsDone = (payload) => ({
    type: ActionTypes.MARK_TASK_AS_DONE,
    payload,
});

/**
 * Dispatch to mark broadcast status of a failed transaction as pending
 *
 * During a transaction, after the inputs are signed, if there is a network error during broadcast
 * we need to store the signed trytes in state so a user could broadcast them afterwards
 *
 * @method markBundleBroadcastStatusPending
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const markBundleBroadcastStatusPending = (payload) => ({
    type: ActionTypes.MARK_BUNDLE_BROADCAST_STATUS_PENDING,
    payload,
});

/**
 * Dispatch to mark broadcast status of a failed transaction as complete
 *
 * When a failed transaction is successfully broadcast,
 * dispatching this action will remove locally stored signed trytes for the provided bundle hash
 *
 * @method markBundleBroadcastStatusPending
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const markBundleBroadcastStatusComplete = (payload) => ({
    type: ActionTypes.MARK_BUNDLE_BROADCAST_STATUS_COMPLETE,
    payload,
});

/**
 * Gets full account information for an additional seed added to the wallet.
 *
 * @method getFullAccountInfoAdditionalSeed
 * @param {string} seed
 * @param {string} accountName
 * @param {string} password
 * @param {function} storeInKeychainPromise
 * @param {object} [navigator=null]
 * @param {function} genFn
 *
 * @returns {function} dispatch
 */
export const getFullAccountInfoAdditionalSeed = (
    seed,
    accountName,
    password,
    storeInKeychainPromise,
    navigator = null,
    genFn,
) => (dispatch, getState) => {
    const onError = (err) => {
        if (navigator) {
            navigator.pop({ animated: false });
        }

        if (err.message === Errors.NODE_NOT_SYNCED) {
            dispatch(generateNodeOutOfSyncErrorAlert());
        } else {
            dispatch(generateAccountInfoErrorAlert(err));
        }

        dispatch(fullAccountInfoAdditionalSeedFetchError());
    };

    dispatch(fullAccountInfoAdditionalSeedFetchRequest());

    const existingAccountNames = getAccountNamesFromState(getState());
    const usedExistingSeed = getState().wallet.usedExistingSeed;

    getAccountData(seed, accountName, genFn)
        .then((data) => {
            dispatch(clearWalletData()); // Clean up partial state for reducer.
            storeInKeychainPromise(password, seed, accountName)
                .then(() => {
                    dispatch(setSeedIndex(existingAccountNames.length));
                    dispatch(setBasicAccountInfo({ accountName, usedExistingSeed }));
                    dispatch(fullAccountInfoAdditionalSeedFetchSuccess(data));
                })
                .catch((err) => onError(err));
        })
        .catch((err) => onError(err));
};

/**
 * Gets full account information for the first seed added to the wallet.
 *
 * @method getFullAccountInfoFirstSeed
 * @param  {string} seed
 * @param  {string} accountName
 * @param  {object} [navigator=null]
 * @param  {function} genFn
 *
 * @returns {function} dispatch
 */
export const getFullAccountInfoFirstSeed = (seed, accountName, navigator = null, genFn) => {
    return (dispatch) => {
        dispatch(fullAccountInfoFirstSeedFetchRequest());

        getAccountData(seed, accountName, genFn)
            .then((data) => dispatch(fullAccountInfoFirstSeedFetchSuccess(data)))
            .catch((err) => {
                pushScreen(navigator, 'login');
                dispatch(fullAccountInfoFirstSeedFetchError());

                const dispatchErrors = () => {
                    if (err.message === Errors.NODE_NOT_SYNCED) {
                        dispatch(generateNodeOutOfSyncErrorAlert());
                    } else {
                        dispatch(generateAccountInfoErrorAlert(err));
                    }
                };
                // Add a slight delay to allow Login component and
                // StatefulDropdownAlert component (mobile) to instantiate properly.
                navigator ? setTimeout(dispatchErrors, 500) : dispatchErrors();
            });
    };
};

/**
 * Performs a manual sync for an account. Syncs full account information with the ledger.
 *
 * @method manuallySyncAccount
 * @param {string} seed
 * @param {string} accountName
 * @param {function} genFn
 *
 * @returns {function} dispatch
 */
export const manuallySyncAccount = (seed, accountName, genFn) => {
    return (dispatch) => {
        dispatch(manualSyncRequest());

        getAccountData(seed, accountName, genFn)
            .then((data) => {
                dispatch(generateSyncingCompleteAlert());
                dispatch(manualSyncSuccess(data));
            })
            .catch((err) => {
                if (err.message === Errors.NODE_NOT_SYNCED) {
                    dispatch(generateNodeOutOfSyncErrorAlert());
                } else {
                    dispatch(generateSyncingErrorAlert(err));
                }

                dispatch(manualSyncError());
            });
    };
};

/**
 * Gets latest account information: including transfers, balance and spend status information.
 *
 * @method getAccountInfo
 * @param  {string} seed
 * @param  {string} accountName
 * @param  {object} [navigator=null]
 * @param  {function} genFn
 *
 * @returns {function} dispatch
 */
export const getAccountInfo = (seed, accountName, navigator = null, genFn) => {
    return (dispatch, getState) => {
        dispatch(accountInfoFetchRequest());

        const existingAccountState = selectedAccountStateFactory(accountName)(getState());

        return syncAccount(existingAccountState, seed, true, genFn, true)
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

/**
 * Deletes an account.
 *
 * @method deleteAccount
 * @param {string} accountName
 *
 * @returns {function} dispatch
 */
export const deleteAccount = (accountName) => (dispatch) => {
    dispatch(removeAccount(accountName));
    dispatch(generateAccountDeletedAlert());
};
