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
    SYNC_ACCOUNT_BEFORE_MANUAL_REBROADCAST: 'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_REBROADCAST',
    SET_BASIC_ACCOUNT_INFO: 'IOTA/ACCOUNTS/SET_BASIC_ACCOUNT_INFO',
    MARK_TASK_AS_DONE: 'IOTA/ACCOUNTS/MARK_TASK_AS_DONE',
    MARK_BUNDLE_BROADCAST_STATUS_AS_PENDING: 'IOTA/ACCOUNTS/MARK_BUNDLE_BROADCAST_STATUS_AS_PENDING',
    MARK_BUNDLE_BROADCAST_STATUS_AS_COMPLETED: 'IOTA/ACCOUNTS/MARK_BUNDLE_BROADCAST_STATUS_AS_COMPLETED',
};

export const syncAccountBeforeManualPromotion = (payload) => ({
    type: ActionTypes.SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION,
    payload,
});

export const syncAccountBeforeManualRebroadcast = (payload) => ({
    type: ActionTypes.SYNC_ACCOUNT_BEFORE_MANUAL_REBROADCAST,
    payload,
});

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

export const changeAccountName = (payload) => ({
    type: ActionTypes.CHANGE_ACCOUNT_NAME,
    payload,
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

export const setBasicAccountInfo = (payload) => ({
    type: ActionTypes.SET_BASIC_ACCOUNT_INFO,
    payload,
});

export const markTaskAsDone = (payload) => ({
    type: ActionTypes.MARK_TASK_AS_DONE,
    payload,
});

export const markBundleBroadcastStatusAsPending = (payload) => ({
    type: ActionTypes.MARK_BUNDLE_BROADCAST_STATUS_AS_PENDING,
    payload,
});

export const markBundleBroadcastStatusAsCompleted = (payload) => ({
    type: ActionTypes.MARK_BUNDLE_BROADCAST_STATUS_AS_COMPLETED,
    payload,
});

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
            if (storeInKeychainPromise) {
                storeInKeychainPromise(password, seed, accountName)
                    .then(() => {
                        dispatch(setSeedIndex(existingAccountNames.length));
                        dispatch(setBasicAccountInfo({ accountName, usedExistingSeed }));
                        dispatch(fullAccountInfoAdditionalSeedFetchSuccess(data));
                    })
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
                dispatch(fullAccountInfoFirstSeedFetchError());

                // Add a slight delay to allow Login component and
                // StatefulDropdownAlert component (mobile) to instantiate properly.
                setTimeout(() => {
                    if (err.message === Errors.NODE_NOT_SYNCED) {
                        dispatch(generateNodeOutOfSyncErrorAlert());
                    } else {
                        dispatch(generateAccountInfoErrorAlert(err));
                    }
                }, 500);
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
                if (err.message === Errors.NODE_NOT_SYNCED) {
                    dispatch(generateNodeOutOfSyncErrorAlert());
                } else {
                    dispatch(generateSyncingErrorAlert(err));
                }

                dispatch(manualSyncError());
            });
    };
};

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

export const deleteAccount = (accountName) => (dispatch) => {
    dispatch(removeAccount(accountName));
    dispatch(generateAccountDeletedAlert());
};
