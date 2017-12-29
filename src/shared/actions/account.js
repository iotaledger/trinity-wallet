import assign from 'lodash/assign';
import each from 'lodash/each';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import { iota } from '../libs/iota';
import { getSelectedAccount } from '../selectors/account';
import {
    organizeAccountInfo,
    formatTransfers,
    formatFullAddressData,
    calculateBalance,
    mergeLatestTransfersInOld,
    getUnspentAddresses,
} from '../libs/accountUtils';
import {
    setReady,
    getTransfersRequest,
    getTransfersSuccess,
    getTransfersError,
    setPromotionStatus,
    clearTempData,
} from './tempAccount';
import { generateAlert, generateAccountInfoErrorAlert } from '../actions/alerts';

export const ActionTypes = {
    SET_FIRST_USE: 'IOTA/ACCOUNT/SET_FIRST_USE',
    UPDATE_TRANSFERS: 'IOTA/ACCOUNT/UPDATE_TRANSFERS',
    UPDATE_ADDRESSES: 'IOTA/ACCOUNT/UPDATE_ADDRESSES',
    SET_ACCOUNT_INFO: 'IOTA/ACCOUNT/SET_ACCOUNT_INFO',
    CHANGE_ACCOUNT_NAME: 'IOTA/ACCOUNT/CHANGE_ACCOUNT_NAME',
    REMOVE_ACCOUNT: 'IOTA/ACCOUNT/REMOVE_ACCOUNT',
    SET_ONBOARDING_COMPLETE: 'IOTA/ACCOUNT/SET_ONBOARDING_COMPLETE',
    INCREASE_SEED_COUNT: 'IOTA/ACCOUNT/INCREASE_SEED_COUNT',
    ADD_SEED_NAME: 'IOTA/ACCOUNT/ADD_SEED_NAME',
    ADD_ADDRESSES: 'IOTA/ACCOUNT/ADD_ADDRESSES',
    SET_BALANCE: 'IOTA/ACCOUNT/SET_BALANCE',
    SET_NEW_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNT/SET_NEW_UNCONFIRMED_BUNDLE_TAILS',
    UPDATE_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNT/UPDATE_UNCONFIRMED_BUNDLE_TAILS',
    REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNT/REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS',
    FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_REQUEST: 'IOTA/ACCOUNT/FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_REQUEST',
    FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_SUCCESS: 'IOTA/ACCOUNT/FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_SUCCESS',
    FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_ERROR: 'IOTA/ACCOUNT/FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_ERROR',
    FULL_ACCOUNT_INFO_FETCH_REQUEST: 'IOTA/ACCOUNT/FULL_ACCOUNT_INFO_FETCH_REQUEST',
    FULL_ACCOUNT_INFO_FETCH_SUCCESS: 'IOTA/ACCOUNT/FULL_ACCOUNT_INFO_FETCH_SUCCESS',
    FULL_ACCOUNT_INFO_FETCH_ERROR: 'IOTA/ACCOUNT/FULL_ACCOUNT_INFO_FETCH_ERROR',
    MANUAL_SYNC_REQUEST: 'IOTA/ACCOUNT/MANUAL_SYNC_REQUEST',
    MANUAL_SYNC_SUCCESS: 'IOTA/ACCOUNT/MANUAL_SYNC_SUCCESS',
    MANUAL_SYNC_ERROR: 'IOTA/ACCOUNT/MANUAL_SYNC_ERROR',
};

export const manualSyncRequest = () => ({
    type: ActionTypes.MANUAL_SYNC_REQUEST,
});

export const manualSyncSuccess = payload => ({
    type: ActionTypes.MANUAL_SYNC_SUCCESS,
    payload,
});

export const manualSyncError = () => ({
    type: ActionTypes.MANUAL_SYNC_ERROR,
});

export const fullAccountInfoForFirstUseFetchRequest = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_REQUEST,
});

export const fullAccountInfoForFirstUseFetchSuccess = payload => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_SUCCESS,
    payload,
});

export const fullAccountInfoForFirstUseFetchError = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_ERROR,
});

export const fullAccountInfoFetchRequest = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FETCH_REQUEST,
});

export const fullAccountInfoFetchSuccess = payload => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS,
    payload,
});

export const fullAccountInfoFetchError = () => ({
    type: ActionTypes.FULL_ACCOUNT_INFO_FETCH_ERROR,
});

export const setFirstUse = payload => ({
    type: ActionTypes.SET_FIRST_USE,
    payload,
});

export const updateTransfers = (seedName, transfers) => ({
    type: ActionTypes.UPDATE_TRANSFERS,
    seedName,
    transfers,
});

export const updateAddresses = (seedName, addresses) => ({
    type: ActionTypes.UPDATE_ADDRESSES,
    seedName,
    addresses,
});

export const setAccountInfo = (seedName, addresses, transfers, balance) => ({
    type: ActionTypes.SET_ACCOUNT_INFO,
    seedName,
    addresses,
    transfers,
    balance,
});

export const changeAccountName = (accountInfo, accountNames) => ({
    type: ActionTypes.CHANGE_ACCOUNT_NAME,
    accountInfo,
    accountNames,
});

export const removeAccount = payload => ({
    type: ActionTypes.REMOVE_ACCOUNT,
    payload,
});

export const setOnboardingComplete = payload => ({
    type: ActionTypes.SET_ONBOARDING_COMPLETE,
    payload,
});

export const increaseSeedCount = () => ({
    type: ActionTypes.INCREASE_SEED_COUNT,
});

export const addAccountName = seedName => ({
    type: ActionTypes.ADD_SEED_NAME,
    seedName,
});

export const addAddresses = (seedName, addresses) => ({
    type: ActionTypes.ADD_ADDRESSES,
    seedName,
    addresses,
});

export const setBalance = payload => ({
    type: ActionTypes.SET_BALANCE,
    payload,
});

export const updateUnconfirmedBundleTails = payload => ({
    type: ActionTypes.UPDATE_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

export const setNewUnconfirmedBundleTails = payload => ({
    type: ActionTypes.SET_NEW_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

export const removeBundleFromUnconfirmedBundleTails = payload => ({
    type: ActionTypes.REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

export const getAccountInfoNewSeedAsync = (seed, seedName) => {
    return async dispatch => {
        const address = await iota.api.getNewAddressAsync(seed);
        //console.log('ADDRESS:', address);
        const accountData = await iota.api.getAccountDataAsync(seed);
        //console.log('ACCOUNT', accountData);
        const addressData = formatFullAddressData(accountData);
        const balance = calculateBalance(addressData);
        const transfers = formatTransfers(accountData.transfers, accountData.addresses);
        dispatch(setAccountInfo(seedName, addressData, transfers, balance));
        dispatch(setReady());
    };
};

export const fetchFullAccountInfoForFirstUse = (
    seed,
    accountName,
    password,
    storeInKeychainPromise,
    navigator = null,
) => dispatch => {
    dispatch(fullAccountInfoForFirstUseFetchRequest());

    return iota.api.getAccountData(seed, (error, data) => {
        if (!error) {
            dispatch(clearTempData()); // Clean up partial state for reducer anyways.
            const payload = organizeAccountInfo(accountName, data);
            const unspentAddresses = getUnspentAddresses(payload.addresses);

            if (!isEmpty(unspentAddresses)) {
                return iota.api.findTransactions({ addresses: unspentAddresses }, (err, hashes) => {
                    if (err) {
                        dispatch(fullAccountInfoForFirstUseFetchError());
                        return dispatch(generateAccountInfoErrorAlert());
                    }

                    return storeInKeychainPromise(password, seed, accountName)
                        .then(() => {
                            const payloadWithHashes = assign({}, payload, { hashes });
                            return dispatch(fullAccountInfoForFirstUseFetchSuccess(payloadWithHashes));
                        })
                        .catch(() => {
                            dispatch(generateAccountInfoErrorAlert());
                            return dispatch(fullAccountInfoForFirstUseFetchError());
                        });
                });
            }

            return storeInKeychainPromise(password, seed, accountName)
                .then(() => {
                    dispatch(fullAccountInfoForFirstUseFetchSuccess(payload));
                })
                .catch(() => {
                    dispatch(generateAccountInfoErrorAlert());
                    return dispatch(fullAccountInfoForFirstUseFetchError());
                });
        }

        if (navigator) {
            navigator.pop({ animated: false });
        }

        dispatch(generateAccountInfoErrorAlert());
        return dispatch(fullAccountInfoForFirstUseFetchError());
    });
};

export const getFullAccountInfo = (seed, accountName, navigator = null) => {
    return dispatch => {
        dispatch(fullAccountInfoFetchRequest());

        return iota.api.getAccountData(seed, (error, data) => {
            if (!error) {
                const payload = organizeAccountInfo(accountName, data);
                const unspentAddresses = getUnspentAddresses(payload.addresses);

                if (!isEmpty(unspentAddresses)) {
                    return iota.api.findTransactions({ addresses: unspentAddresses }, (err, hashes) => {
                        if (err) {
                            dispatch(generateAccountInfoErrorAlert());
                            return dispatch(fullAccountInfoFetchError());
                        }

                        const payloadWithHashes = assign({}, payload, { hashes });
                        return dispatch(fullAccountInfoFetchSuccess(payloadWithHashes));
                    });
                }

                return dispatch(fullAccountInfoFetchSuccess(assign({}, payload, { hashes: [] })));
            }

            if (navigator) {
                navigator.pop({ animated: false });
            }

            dispatch(generateAccountInfoErrorAlert());
            return dispatch(fullAccountInfoFetchError());
        });
    };
};

export const manuallySyncAccount = (seed, accountName) => dispatch => {
    dispatch(manualSyncRequest());

    iota.api.getAccountData(seed, (error, data) => {
        if (!error) {
            const payload = organizeAccountInfo(accountName, data);
            const unspentAddresses = getUnspentAddresses(payload.addresses);

            if (!isEmpty(unspentAddresses)) {
                return iota.api.findTransactions({ addresses: unspentAddresses }, (err, hashes) => {
                    if (err) {
                        dispatch(generateAccountInfoErrorAlert());
                        return dispatch(fullAccountInfoFetchError());
                    }

                    const payloadWithHashes = assign({}, payload, { hashes });

                    dispatch(generateAlert('success', 'syncing complete', 'Account sync is complete.'));
                    return dispatch(manualSyncSuccess(payloadWithHashes));
                });
            }

            return dispatch(manualSyncSuccess(assign({}, payload, { hashes: [] })));
        }

        dispatch(generateAlert('error', 'invalid response', 'Received an invalid response from node.'));
        return dispatch(manualSyncError());
    });
};

const getTotalBalance = (addresses, threshold = 1) => {
    const promise = new Promise((resolve, reject) => {
        iota.api.getBalances(addresses, threshold, (err, data) => {
            if (err) {
                reject(err);
            } else {
                const newBalances = data.balances.map(Number);
                resolve(newBalances);
            }
        });
    });

    return promise.then(balances => balances.reduce((a, b) => a + b));
};

const getLatestAddresses = (seed, index) => {
    const promise = new Promise((resolve, reject) => {
        iota.api.getInputs(seed, { start: index }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.inputs);
            }
        });

        return promise.then(inputs => {
            return inputs.reduce((obj, x) => {
                obj[x.address] = { balance: x.balance, spent: false };
                return obj;
            }, {});
        });
    });
};

export const getAccountInfo = (seed, accountName, navigator = null) => {
    return (dispatch, getState) => {
        const selectedAccount = getSelectedAccount(accountName, getState().account.accountInfo);
        const addresses = Object.keys(selectedAccount.addresses);
        getTotalBalance(addresses)
            .then(balance => {
                dispatch(setBalance({ accountName, balance }));

                const index = Object.keys(addresses).length - 1;

                return getLatestAddresses(seed, index);
            })
            .then(addresses => {
                console.log('Addresses', addresses);
            })
            .catch(() => {
                if (navigator) {
                    navigator.pop({ animated: false });
                }

                dispatch(generateAccountInfoErrorAlert());
            });
    };
};

export const getTransfers = (accountName, addresses) => {
    return (dispatch, getState) => {
        // Set flag to true so that polling waits for these network calls to complete.
        dispatch(getTransfersRequest());

        const errorCallback = () => {
            dispatch(getTransfersError());
            dispatch(
                generateAlert(
                    'error',
                    'Invalid Response',
                    'The node returned an invalid response while getting transfers.',
                ),
            );
        };

        iota.api.findTransactionObjects({ addresses }, (error, txObjects) => {
            if (!error) {
                const tailTransactionHashes = [];
                const nonTailBundleHashes = [];
                const bundles = [];

                const selectedAccount = getSelectedAccount(accountName, getState().account.accountInfo);
                const existingTransfers = selectedAccount.transfers;

                const pushIfNotExists = (pushTo, value) => {
                    if (!includes(pushTo, value)) {
                        pushTo.push(value);
                    }
                };

                each(txObjects, tx => {
                    if (tx.currentIndex === 0) {
                        pushIfNotExists(tailTransactionHashes, tx.hash);
                    } else {
                        pushIfNotExists(nonTailBundleHashes, tx.bundle);
                    }
                });

                iota.api.findTransactionObjects({ bundles: nonTailBundleHashes }, (err, fullTxObjects) => {
                    if (!err) {
                        // If no transfers, exit
                        if (fullTxObjects.length < 1) {
                            dispatch(getTransfersSuccess({ accountName, transfers: existingTransfers })); // Just send an empty payload
                            return;
                        }

                        each(fullTxObjects, tx => {
                            if (tx.currentIndex === 0) {
                                pushIfNotExists(tailTransactionHashes, tx.hash);
                            }
                        });

                        const next = () => {
                            const updatedTransfers = mergeLatestTransfersInOld(existingTransfers, bundles);
                            const updatedTransfersWithFormatting = formatTransfers(updatedTransfers, addresses);

                            dispatch(getTransfersSuccess({ accountName, transfers: updatedTransfersWithFormatting }));
                        };

                        iota.api.getLatestInclusion(tailTransactionHashes, (e, inclusionStates) => {
                            if (!e) {
                                const getBundle = (tailTxHashes, idx) => {
                                    iota.api.getBundle(tailTxHashes[idx], (getBundleErr, bundle) => {
                                        idx += 1;
                                        if (!getBundleErr) {
                                            each(bundle, bundleTx => {
                                                bundleTx.persistence = inclusionStates[idx];
                                            });

                                            bundles.push(bundle);
                                            if (idx === tailTxHashes.length) {
                                                setTimeout(next);
                                            } else {
                                                setTimeout(() => getBundle(tailTxHashes, idx));
                                            }
                                        }
                                    });
                                };

                                getBundle(tailTransactionHashes, 0);
                            } else {
                                errorCallback();
                            }
                        });
                    } else {
                        errorCallback();
                    }
                });
            } else {
                errorCallback();
            }
        });
    };
};

export const addPendingTransfer = (seedName, transfers, success) => {
    return dispatch => {
        success[0].transferValue = -success[0].value;
        success[0].persistence = false;
        // Add pending transfer at front of transfers array
        transfers.unshift(success);
        dispatch(updateTransfers(seedName, transfers));
    };
};

export const deleteAccount = accountName => dispatch => {
    dispatch(removeAccount(accountName));
    dispatch(generateAlert('success', 'Account Deleted', 'Successfully deleted account')); // TODO: Need to verify exact translated message
};
