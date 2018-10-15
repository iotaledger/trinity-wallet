import {
    selectedAccountStateFactory,
    getAccountNamesFromState,
    getNodesFromState,
    getSelectedNodeFromState,
} from '../selectors/accounts';
import { syncAccount, getAccountData } from '../libs/iota/accounts';
import { setSeedIndex } from './wallet';
import {
    generateAccountInfoErrorAlert,
    generateSyncingCompleteAlert,
    generateSyncingErrorAlert,
    generateAccountDeletedAlert,
    generateNodeOutOfSyncErrorAlert,
    generateAccountSyncRetryAlert,
} from '../actions/alerts';
import { changeNode } from '../actions/settings';
import { withRetriesOnDifferentNodes, getRandomNodes } from '../libs/iota/utils';
import Errors from '../libs/errors';
import { DEFAULT_RETRIES } from '../config';

export const ActionTypes = {
    UPDATE_ACCOUNT_INFO_AFTER_SPENDING: 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
    UPDATE_ACCOUNT_AFTER_REATTACHMENT: 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_REATTACHMENT',
    UPDATE_ADDRESSES: 'IOTA/ACCOUNTS/UPDATE_ADDRESSES',
    CHANGE_ACCOUNT_NAME: 'IOTA/ACCOUNTS/CHANGE_ACCOUNT_NAME',
    REMOVE_ACCOUNT: 'IOTA/ACCOUNTS/REMOVE_ACCOUNT',
    SET_ONBOARDING_COMPLETE: 'IOTA/ACCOUNTS/SET_ONBOARDING_COMPLETE',
    UPDATE_ACCOUNT_AFTER_TRANSITION: 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_TRANSITION',
    SET_NEW_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNTS/SET_NEW_UNCONFIRMED_BUNDLE_TAILS',
    UPDATE_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNTS/UPDATE_UNCONFIRMED_BUNDLE_TAILS',
    REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNTS/REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS',
    FULL_ACCOUNT_INFO_FETCH_REQUEST: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_REQUEST',
    FULL_ACCOUNT_INFO_FETCH_SUCCESS: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_SUCCESS',
    FULL_ACCOUNT_INFO_FETCH_ERROR: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_ERROR',
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
    SYNC_ACCOUNT_BEFORE_SWEEPING: 'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_SWEEPING',
    OVERRIDE_ACCOUNT_INFO: 'IOTA/ACCOUNTS/OVERRIDE_ACCOUNT_INFO',
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
 * @method fullAccountInfoFetchRequest
 *
 * @returns {{type: {string} }}
 */
export const fullAccountInfoFetchRequest = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FETCH_REQUEST,
});

/**
 * Dispatch when account information for an additional account is successfully fetched
 *
 * @method fullAccountInfoFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const fullAccountInfoFetchSuccess = (payload) => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS,
    payload,
});

/**
 * Dispatch when an error occurs during the process of fetching information for an additional account
 *
 * @method fullAccountInfoFetchError
 *
 * @returns {{type: {string} }}
 */
export const fullAccountInfoFetchError = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FETCH_ERROR,
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
 * Dispatch to update account state before recovering/sweeping
 *
 * @method syncAccountBeforeSweeping
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const syncAccountBeforeSweeping = (payload) => ({
    type: ActionTypes.SYNC_ACCOUNT_BEFORE_SWEEPING,
    payload,
});

/**
 * Dispatch to override account state
 *
 * @method overrideAccountInfo
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const overrideAccountInfo = (payload) => ({
    type: ActionTypes.OVERRIDE_ACCOUNT_INFO,
    payload,
});

/**
 * Gets full account information for the first seed added to the wallet.
 *
 * @method getFullAccountInfo
 * @param  {object} seedStore - SeedStore class object
 * @param  {string} accountName
 *
 * @returns {function} dispatch
 */
export const getFullAccountInfo = (seedStore, accountName) => {
    return (dispatch, getState) => {
        dispatch(fullAccountInfoFetchRequest());

        const selectedNode = getSelectedNodeFromState(getState());
        const existingAccountNames = getAccountNamesFromState(getState());
        const usedExistingSeed = getState().wallet.usedExistingSeed;

        withRetriesOnDifferentNodes(
            [selectedNode, ...getRandomNodes(getNodesFromState(getState()), DEFAULT_RETRIES, [selectedNode])],
            () => dispatch(generateAccountSyncRetryAlert()),
        )(getAccountData)(seedStore, accountName)
            .then(({ node, result }) => {
                dispatch(changeNode(node));

                dispatch(setSeedIndex(existingAccountNames.length));
                dispatch(setBasicAccountInfo({ accountName, usedExistingSeed }));

                result.accountType = getState().wallet.additionalAccountType;

                dispatch(fullAccountInfoFetchSuccess(result));
            })
            .catch((err) => {
                const dispatchErrors = () => {
                    if (err.message === Errors.NODE_NOT_SYNCED) {
                        dispatch(generateNodeOutOfSyncErrorAlert());
                    } else {
                        dispatch(generateAccountInfoErrorAlert(err));
                    }
                };
                dispatch(fullAccountInfoFetchError());
                if (existingAccountNames.length === 0) {
                    setTimeout(dispatchErrors, 500);
                } else {
                    dispatchErrors();
                    seedStore.removeAccount(accountName);
                }
            });
    };
};

/**
 * Performs a manual sync for an account. Syncs full account information with the ledger.
 *
 * @method manuallySyncAccount
 * @param {object} seedStore - SeedStore class object
 * @param {string} accountName
 * @param {function} genFn
 *
 * @returns {function} dispatch
 */
export const manuallySyncAccount = (seedStore, accountName) => {
    return (dispatch, getState) => {
        dispatch(manualSyncRequest());

        const selectedNode = getSelectedNodeFromState(getState());

        withRetriesOnDifferentNodes(
            [selectedNode, ...getRandomNodes(getNodesFromState(getState()), DEFAULT_RETRIES, [selectedNode])],
            () => dispatch(generateAccountSyncRetryAlert()),
        )(getAccountData)(seedStore, accountName)
            .then(({ node, result }) => {
                dispatch(changeNode(node));
                dispatch(generateSyncingCompleteAlert());
                dispatch(manualSyncSuccess(result));
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
 * @param  {object} seedStore - SeedStore class object
 * @param  {string} accountName
 * @param  {function} notificationFn - New transaction callback function
 *
 * @returns {function} dispatch
 */
export const getAccountInfo = (seedStore, accountName, notificationFn) => {
    return (dispatch, getState) => {
        dispatch(accountInfoFetchRequest());
        const existingAccountState = selectedAccountStateFactory(accountName)(getState());
        const selectedNode = getSelectedNodeFromState(getState());

        return withRetriesOnDifferentNodes(
            [selectedNode, ...getRandomNodes(getNodesFromState(getState()), DEFAULT_RETRIES, [selectedNode])],
            () => dispatch(generateAccountSyncRetryAlert()),
        )(syncAccount)(existingAccountState, seedStore, notificationFn)
            .then(({ node, result }) => {
                dispatch(changeNode(node));
                dispatch(accountInfoFetchSuccess(result));
            })
            .catch((err) => {
                dispatch(accountInfoFetchError());
                setTimeout(() => dispatch(generateAccountInfoErrorAlert(err)), 500);
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

/**
 * Gets latest account information for provided account and override existing account state
 *
 * @method cleanUpAccountState
 * @param {object} seedStore
 * @param {string} accountName
 * @param {function} genFn
 *
 * @returns {function(*, *): Promise<object>}
 */
export const cleanUpAccountState = (seedStore, accountName) => (dispatch, getState) => {
    const selectedNode = getSelectedNodeFromState(getState());

    return withRetriesOnDifferentNodes(
        [selectedNode, ...getRandomNodes(getNodesFromState(getState()), DEFAULT_RETRIES, [selectedNode])],
        () => dispatch(generateAccountSyncRetryAlert()),
    )(getAccountData)(seedStore, accountName).then(({ node, result }) => {
        dispatch(changeNode(node));
        dispatch(overrideAccountInfo(result));

        // Resolve new account state
        return result;
    });
};
