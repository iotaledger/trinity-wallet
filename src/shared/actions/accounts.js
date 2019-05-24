import assign from 'lodash/assign';
import some from 'lodash/some';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import {
    selectedAccountTasksFactory,
    selectedAccountSetupInfoFactory,
    getAccountNamesFromState,
    getAccountInfoDuringSetup,
    selectedAccountStateFactory,
} from '../selectors/accounts';
import { nodesConfigurationFactory } from '../selectors/global';
import { syncAccount, getAccountData } from '../libs/iota/accounts';
import { setSeedIndex } from './wallet';
import {
    generateAccountInfoErrorAlert,
    generateSyncingCompleteAlert,
    generateSyncingErrorAlert,
    generateAccountDeletedAlert,
    generateAccountSyncRetryAlert,
    generateErrorAlert,
} from '../actions/alerts';
import { Account, Wallet } from '../storage';
import NodesManager from '../libs/iota/NodesManager';
import { AccountsActionTypes } from '../types';

/**
 * Dispatch to update account state before manually promoting a transaction
 *
 * @method syncAccountBeforeManualPromotion
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const syncAccountBeforeManualPromotion = (payload) => ({
    type: AccountsActionTypes.SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION,
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
    type: AccountsActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING,
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
    type: AccountsActionTypes.UPDATE_ACCOUNT_AFTER_REATTACHMENT,
    payload,
});

/**
 * Dispatch to update address data for provided account
 *
 * @method updateAddressData
 * @param {string} accountName
 * @param {object} addresses
 * @returns {{type: string, accountName: string, addresses: object }}
 */
export const updateAddressData = (accountName, addressData) => ({
    type: AccountsActionTypes.UPDATE_ADDRESS_DATA,
    accountName,
    addressData,
});

/**
 * Dispatch to update account name in state
 *
 * @method changeAccountName
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const changeAccountName = (payload) => {
    const { oldAccountName, newAccountName } = payload;
    Account.migrate(oldAccountName, newAccountName);

    return {
        type: AccountsActionTypes.CHANGE_ACCOUNT_NAME,
        payload,
    };
};

/**
 * Dispatch to remove an account and its associated data from state
 *
 * @method removeAccount
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const removeAccount = (payload) => {
    Account.delete(payload);

    return {
        type: AccountsActionTypes.REMOVE_ACCOUNT,
        payload,
    };
};

/**
 * Dispatch to set onboarding as completed
 *
 * @method setOnboardingComplete
 * @param {boolean} payload
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setOnboardingComplete = (payload) => {
    Wallet.setOnboardingComplete();

    return {
        type: AccountsActionTypes.SET_ONBOARDING_COMPLETE,
        payload,
    };
};

/**
 * Dispatch to update account state after snapshot transition
 *
 * @method updateAccountAfterTransition
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateAccountAfterTransition = (payload) => ({
    type: AccountsActionTypes.UPDATE_ACCOUNT_AFTER_TRANSITION,
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
    type: AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_REQUEST,
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
    type: AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS,
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
    type: AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_ERROR,
});

/**
 * Dispatch when account is about to be manually synced
 *
 * @method manualSyncRequest
 *
 * @returns {{type: {string} }}
 */
export const manualSyncRequest = () => ({
    type: AccountsActionTypes.MANUAL_SYNC_REQUEST,
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
    type: AccountsActionTypes.MANUAL_SYNC_SUCCESS,
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
    type: AccountsActionTypes.MANUAL_SYNC_ERROR,
});

/**
 * Dispatch when account information is about to be fetched on login
 *
 * @method accountInfoFetchRequest
 *
 * @returns {{type: {string} }}
 */
export const accountInfoFetchRequest = () => ({
    type: AccountsActionTypes.ACCOUNT_INFO_FETCH_REQUEST,
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
    type: AccountsActionTypes.ACCOUNT_INFO_FETCH_SUCCESS,
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
    type: AccountsActionTypes.ACCOUNT_INFO_FETCH_ERROR,
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
    type: AccountsActionTypes.SET_BASIC_ACCOUNT_INFO,
    payload,
});

/**
 * Dispatch to store account information during setup
 *
 * @method setAccountInfoDuringSetup
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setAccountInfoDuringSetup = (payload) => {
    Wallet.updateAccountInfoDuringSetup(payload);

    return {
        type: AccountsActionTypes.SET_ACCOUNT_INFO_DURING_SETUP,
        payload,
    };
};

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
export const markTaskAsDone = (payload) => {
    const { accountName, task } = payload;
    Account.update(accountName, { [task]: true });

    return {
        type: AccountsActionTypes.MARK_TASK_AS_DONE,
        payload,
    };
};

/**
 * Dispatch to update account state before recovering/sweeping
 *
 * @method syncAccountBeforeSweeping
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const syncAccountBeforeSweeping = (payload) => ({
    type: AccountsActionTypes.SYNC_ACCOUNT_BEFORE_SWEEPING,
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
    type: AccountsActionTypes.OVERRIDE_ACCOUNT_INFO,
    payload,
});

/**
 * Dispatch to (automatically) assign accountIndex to every account in state
 *
 * @method assignAccountIndex
 *
 * @returns {{type: {string} }}
 */
export const assignAccountIndex = () => ({
    type: AccountsActionTypes.ASSIGN_ACCOUNT_INDEX,
});

/**
 * Gets full account information for the first seed added to the wallet.
 *
 * @method getFullAccountInfo
 * @param {object} seedStore - SeedStore class object
 * @param {string} accountName
 * @param {boolean} [quorum]
 *
 * @returns {function} dispatch
 */
export const getFullAccountInfo = (seedStore, accountName, quorum = false) => {
    return (dispatch, getState) => {
        dispatch(fullAccountInfoFetchRequest());

        const existingAccountNames = getAccountNamesFromState(getState());
        const usedExistingSeed = getAccountInfoDuringSetup(getState()).usedExistingSeed;

        return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
            .withRetries(() => dispatch(generateAccountSyncRetryAlert()))(getAccountData)(seedStore, accountName)
            .then((result) => {
                const seedIndex = existingAccountNames.length;

                dispatch(setSeedIndex(seedIndex));
                dispatch(setBasicAccountInfo({ accountName, usedExistingSeed }));

                const resultWithAccountMeta = assign({}, result, {
                    meta: getAccountInfoDuringSetup(getState()).meta,
                    index: seedIndex,
                    name: result.accountName,
                    ...selectedAccountTasksFactory(accountName)(getState()),
                    ...selectedAccountSetupInfoFactory(accountName)(getState()),
                });

                // Create account in storage (realm)
                Wallet.addAccount(resultWithAccountMeta);

                // Update redux store with newly fetched account info
                dispatch(fullAccountInfoFetchSuccess(resultWithAccountMeta));
            })
            .catch((err) => {
                const dispatchErrors = () => dispatch(generateErrorAlert(generateAccountInfoErrorAlert, err));
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
 * @param {boolean} [quorum]
 *
 * @returns {function} dispatch
 */
export const manuallySyncAccount = (seedStore, accountName, quorum = false) => {
    return (dispatch, getState) => {
        dispatch(manualSyncRequest());

        const existingAccountState = selectedAccountStateFactory(accountName)(getState());

        return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
            .withRetries(() => dispatch(generateAccountSyncRetryAlert()))(getAccountData)(
                seedStore,
                accountName,
                existingAccountState,
            )
            .then((result) => {
                dispatch(generateSyncingCompleteAlert());

                // Update account in storage (realm)
                Account.update(accountName, result);
                dispatch(manualSyncSuccess(result));
            })
            .catch((err) => {
                dispatch(generateErrorAlert(generateSyncingErrorAlert, err));
                dispatch(manualSyncError());
            });
    };
};

/**
 * Gets latest account information: including transfers, balance and spend status information.
 *
 * @method getAccountInfo
 * @param {object} seedStore - SeedStore class object
 * @param {string} accountName
 * @param {function} notificationFn - New transaction callback function
 * @param {boolean} [withQuorum]
 *
 * @returns {function} dispatch
 */
export const getAccountInfo = (seedStore, accountName, notificationFn, quorum = false) => {
    return (dispatch, getState) => {
        dispatch(accountInfoFetchRequest());

        const existingAccountState = selectedAccountStateFactory(accountName)(getState());
        const settings = getState().settings;

        return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
            .withRetries(() => dispatch(generateAccountSyncRetryAlert()))(syncAccount)(
                existingAccountState,
                seedStore,
                notificationFn,
                settings,
            )
            .then((result) => {
                // Update account in storage (realm)
                Account.update(accountName, result);

                dispatch(accountInfoFetchSuccess(result));
            })
            .catch((err) => {
                dispatch(generateErrorAlert(generateAccountInfoErrorAlert, err));
                dispatch(accountInfoFetchError());
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
 *
 * @param {object} seedStore
 * @param {string} accountName
 * @param {boolean} [quorum]
 *
 * @returns {function(*, *): Promise<object>}
 */
export const cleanUpAccountState = (seedStore, accountName, quorum = true) => (dispatch, getState) => {
    return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
        .withRetries(() => dispatch(generateAccountSyncRetryAlert()))(getAccountData)(
            seedStore,
            accountName,
            // Do not pass existing account state
            // Empty account state will lead to fresh address data & transactions
        )
        .then((result) => {
            // Update storage (realm)
            Account.update(accountName, result);

            dispatch(overrideAccountInfo(result));

            // Resolve new account state
            return result;
        });
};

/**
 * Assign account index to each account if not already assigned
 *
 * @method assignAccountIndexIfNecessary
 * @param {object} accountInfo
 *
 * @returns {function(*)}
 */
export const assignAccountIndexIfNecessary = (accountInfo) => (dispatch) => {
    if (!isEmpty(accountInfo) && some(accountInfo, ({ index }) => !isNumber(index))) {
        dispatch(assignAccountIndex());
    }
};
