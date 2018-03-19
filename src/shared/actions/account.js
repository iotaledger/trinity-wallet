import takeRight from 'lodash/takeRight';
import { iota } from '../libs/iota';
import { selectedAccountStateFactory } from '../selectors/account';
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
} from './tempAccount';
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
import i18next from '../i18next';

const { t } = i18next.t;

export const ActionTypes = {
    UPDATE_ACCOUNT_INFO_AFTER_SPENDING: 'IOTA/ACCOUNT/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
    SET_FIRST_USE: 'IOTA/ACCOUNT/SET_FIRST_USE',
    UPDATE_TRANSFERS: 'IOTA/ACCOUNT/UPDATE_TRANSFERS',
    UPDATE_ADDRESSES: 'IOTA/ACCOUNT/UPDATE_ADDRESSES',
    CHANGE_ACCOUNT_NAME: 'IOTA/ACCOUNT/CHANGE_ACCOUNT_NAME',
    REMOVE_ACCOUNT: 'IOTA/ACCOUNT/REMOVE_ACCOUNT',
    SET_ONBOARDING_COMPLETE: 'IOTA/ACCOUNT/SET_ONBOARDING_COMPLETE',
    INCREASE_SEED_COUNT: 'IOTA/ACCOUNT/INCREASE_SEED_COUNT',
    ADD_SEED_NAME: 'IOTA/ACCOUNT/ADD_SEED_NAME',
    ADD_ADDRESSES: 'IOTA/ACCOUNT/ADD_ADDRESSES',
    SET_BALANCE: 'IOTA/ACCOUNT/SET_BALANCE',
    UPDATE_ACCOUNT_AFTER_TRANSITION: 'IOTA/ACCOUNT/UPDATE_ACCOUNT_AFTER_TRANSITION',
    SET_NEW_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNT/SET_NEW_UNCONFIRMED_BUNDLE_TAILS',
    UPDATE_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNT/UPDATE_UNCONFIRMED_BUNDLE_TAILS',
    REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNT/REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS',
    FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_REQUEST: 'IOTA/ACCOUNT/FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_REQUEST',
    FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_SUCCESS: 'IOTA/ACCOUNT/FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_SUCCESS',
    FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_ERROR: 'IOTA/ACCOUNT/FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_ERROR',
    FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_REQUEST: 'IOTA/ACCOUNT/FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_REQUEST',
    FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_SUCCESS: 'IOTA/ACCOUNT/FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_SUCCESS',
    FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_ERROR: 'IOTA/ACCOUNT/FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_ERROR',
    MANUAL_SYNC_REQUEST: 'IOTA/ACCOUNT/MANUAL_SYNC_REQUEST',
    MANUAL_SYNC_SUCCESS: 'IOTA/ACCOUNT/MANUAL_SYNC_SUCCESS',
    MANUAL_SYNC_ERROR: 'IOTA/ACCOUNT/MANUAL_SYNC_ERROR',
    ACCOUNT_INFO_FETCH_REQUEST: 'IOTA/ACCOUNT/ACCOUNT_INFO_FETCH_REQUEST',
    ACCOUNT_INFO_FETCH_SUCCESS: 'IOTA/ACCOUNT/ACCOUNT_INFO_FETCH_SUCCESS',
    ACCOUNT_INFO_FETCH_ERROR: 'IOTA/ACCOUNT/ACCOUNT_INFO_FETCH_ERROR',
    SET_2FA_STATUS: 'IOTA/ACCOUNT/SET_2FA_STATUS',
    SET_FINGERPRINT_STATUS: 'IOTA/ACCOUNT/SET_FINGERPRINT_STATUS',
    UPDATE_ACCOUNT_AFTER_REATTACHMENT: 'IOTA/ACCOUNT/UPDATE_ACCOUNT_AFTER_REATTACHMENT',
};

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

export const setFirstUse = (payload) => ({
    type: ActionTypes.SET_FIRST_USE,
    payload,
});

export const updateTransfers = (accountName, transfers) => ({
    type: ActionTypes.UPDATE_TRANSFERS,
    accountName,
    transfers,
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

export const increaseSeedCount = () => ({
    type: ActionTypes.INCREASE_SEED_COUNT,
});

export const addAccountName = (accountName) => ({
    type: ActionTypes.ADD_SEED_NAME,
    accountName,
});

export const addAddresses = (accountName, addresses) => ({
    type: ActionTypes.ADD_ADDRESSES,
    accountName,
    addresses,
});

export const setBalance = (payload) => ({
    type: ActionTypes.SET_BALANCE,
    payload,
});

export const updateAccountAfterTransition = (accountName, addresses, balance) => ({
    type: ActionTypes.UPDATE_ACCOUNT_AFTER_TRANSITION,
    accountName,
    addresses,
    balance,
});

export const updateUnconfirmedBundleTails = (payload) => ({
    type: ActionTypes.UPDATE_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

export const setNewUnconfirmedBundleTails = (payload) => ({
    type: ActionTypes.SET_NEW_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

export const removeBundleFromUnconfirmedBundleTails = (payload) => ({
    type: ActionTypes.REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

const accountInfoFetchRequest = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_REQUEST,
});

export const accountInfoFetchSuccess = (payload) => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS,
    payload,
});

const accountInfoFetchError = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_ERROR,
});

export const updateAccountInfoAfterSpending = (payload) => ({
    type: ActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING,
    payload,
});

export const updateAccountAfterReattachment = (payload) => ({
    type: ActionTypes.UPDATE_ACCOUNT_AFTER_REATTACHMENT,
    payload,
});

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

// Aim to update local transfers, addresses, hashes in store after a new transaction is made.
export const updateAccountInfo = (accountName, newTransferBundle, value) => (dispatch, getState) => {
    const existingAccountState = selectedAccountStateFactory(accountName)(getState());

    return syncAccountAfterSpending(accountName, newTransferBundle, existingAccountState, value > 0)
        .then(({ newState }) => dispatch(updateAccountInfoAfterSpending(newState)))
        .catch((err) => {
            // Most probable reason for error here would be some network communication error
            // for finding transactions associated with new unspent addresses.
            // Account state update should always be atomic.
            // TODO: Alert user to manually sync account at this point.

            console.error(err); // eslint-disable-line no-console
        });
};

export const set2FAStatus = (payload) => ({
    type: ActionTypes.SET_2FA_STATUS,
    payload,
});

export const transitionForSnapshot = (seed, addresses, genFn) => {
    return (dispatch) => {
        dispatch(snapshotTransitionRequest());
        if (addresses.length > 0) {
            dispatch(getBalanceForCheck(addresses));
            dispatch(updateTransitionAddresses(addresses));
        } else {
            setTimeout(() => {
                dispatch(generateAddressesAndGetBalance(seed, 0, genFn));
            });
        }
    };
};

export const completeSnapshotTransition = (seed, accountName, addresses) => {
    return (dispatch) => {
        iota.api.getBalances(addresses, 1, (error, success) => {
            if (!error) {
                const allBalances = success.balances.map((a) => Number(a));
                const balance = allBalances.reduce((a, b) => a + b, 0);
                const lastAddressBalance = takeRight(allBalances.filter((balance) => balance > 0));
                const lastIndexWithBalance = allBalances.lastIndexOf(lastAddressBalance.pop());
                const relevantBalances = allBalances.slice(0, lastIndexWithBalance + 1);
                const relevantAddresses = addresses.slice(0, lastIndexWithBalance + 1);

                if (lastIndexWithBalance === -1) {
                    dispatch(snapshotTransitionError());
                    return dispatch(
                        generateAlert(
                            'error',
                            t('cannotCompleteTransition'),
                            t('cannotCompleteTransitionExplanation'),
                            10000,
                        ),
                    );
                }

                iota.api.wereAddressesSpentFrom(addresses, (error, addressSpendStatus) => {
                    if (!error) {
                        const formattedAddresses = formatAddresses(
                            relevantAddresses,
                            relevantBalances,
                            addressSpendStatus,
                        );
                        const attachToTangleBundle = createAttachToTangleBundle(seed, relevantAddresses);
                        const args = [seed, DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE, attachToTangleBundle];
                        dispatch(snapshotAttachToTangleRequest());
                        iota.api.sendTransfer(...args, (error) => {
                            if (!error) {
                                dispatch(updateAccountAfterTransition(accountName, formattedAddresses, balance));
                                dispatch(snapshotTransitionSuccess());
                                dispatch(snapshotAttachToTangleComplete());
                                dispatch(
                                    generateAlert(
                                        'success',
                                        t('transitionComplete'),
                                        t('transitionCompleteExplanation'),
                                        20000,
                                    ),
                                );
                            } else {
                                console.log(error);
                                dispatch(snapshotTransitionError());
                                dispatch(snapshotAttachToTangleComplete());
                                dispatch(generateTransitionErrorAlert());
                            }
                        });
                    } else {
                        console.log(error);
                    }
                });
            } else {
                dispatch(snapshotTransitionError());
                dispatch(generateTransitionErrorAlert());
                console.log(error);
            }
        });
    };
};

export const generateAddressesAndGetBalance = (seed, index, genFn) => {
    return (dispatch) => {
        const options = {
            index: index,
            total: 20,
            returnAll: true,
            security: 2,
        };
        getNewAddress(seed, options, genFn, (error, addresses) => {
            if (error) {
                dispatch(snapshotTransitionError());
                dispatch(generateTransitionErrorAlert());
            } else {
                dispatch(updateTransitionAddresses(addresses));
                dispatch(getBalanceForCheck(addresses));
            }
        });
    };
};

export const createAttachToTangleBundle = (seed, addresses) => {
    const transfers = [];
    for (let i = 0; i < addresses.length; i++) {
        transfers.push({
            address: addresses[i],
            value: 0,
        });
    }
    return transfers;
};

export const getBalanceForCheck = (addresses) => {
    return (dispatch) => {
        iota.api.getBalances(addresses, 1, (error, success) => {
            if (!error) {
                const balances = success.balances.map((a) => Number(a));
                const balance = balances.reduce((a, b) => a + b, 0);
                dispatch(updateTransitionBalance(balance));
                dispatch(switchBalanceCheckToggle());
            } else {
                dispatch(snapshotTransitionError());
                dispatch(generateTransitionErrorAlert());
                console.log(error);
            }
        });
    };
};

export const setFingerprintStatus = (payload) => ({
    type: ActionTypes.SET_FINGERPRINT_STATUS,
    payload,
});
