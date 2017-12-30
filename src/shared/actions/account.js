import assign from 'lodash/assign';
import includes from 'lodash/includes';
import map from 'lodash/map';
import get from 'lodash/get';
import filter from 'lodash/filter';
import size from 'lodash/size';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';
import { iota } from '../libs/iota';
import {
    getSelectedAccount,
    getExistingUnspentAddressesHashes,
    getPendingTxTailsHashesForSelectedAccount,
} from '../selectors/account';
import {
    organizeAccountInfo,
    formatTransfers,
    formatFullAddressData,
    calculateBalance,
    mergeLatestTransfersInOld,
    getUnspentAddresses,
    getTotalBalance,
    getLatestAddresses,
    getTransactionHashes,
    getTransactionsObjects,
    getInclusionWithHashes,
    getBundlesWithPersistence,
    getConfirmedTxTailsHashes,
    markTransfersConfirmed,
    markAddressSpend,
} from '../libs/accountUtils';
import { setReady, clearTempData } from './tempAccount';
import { generateAlert, generateAccountInfoErrorAlert } from '../actions/alerts';

export const ActionTypes = {
    UPDATE_ACCOUNT_INFO_AFTER_SPENDING: 'IOTA/ACCOUNT/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
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
    ACCOUNT_INFO_FETCH_REQUEST: 'IOTA/ACCOUNT/ACCOUNT_INFO_FETCH_REQUEST',
    ACCOUNT_INFO_FETCH_SUCCESS: 'IOTA/ACCOUNT/ACCOUNT_INFO_FETCH_SUCCESS',
    ACCOUNT_INFO_FETCH_ERROR: 'IOTA/ACCOUNT/ACCOUNT_INFO_FETCH_ERROR',
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

const accountInfoFetchRequest = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_REQUEST,
});

const accountInfoFetchSuccess = payload => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS,
    payload,
});

const accountInfoFetchError = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_ERROR,
});

const updateAccountInfoAfterSpending = payload => ({
    type: ActionTypes.UPDATE_ACCOUNT_INFO_AFTER_SPENDING,
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

export const getAccountInfo = (seed, accountName, navigator = null) => {
    return (dispatch, getState) => {
        dispatch(accountInfoFetchRequest());

        const selectedAccount = getSelectedAccount(accountName, getState().account.accountInfo);
        const addresses = Object.keys(selectedAccount.addresses);

        const existingHashes = getExistingUnspentAddressesHashes(
            accountName,
            getState().account.unspentAddressesHashes,
        );

        const pendingTxTailsHashes = getPendingTxTailsHashesForSelectedAccount(
            accountName,
            getState().account.pendingTxTailsHashes,
        );

        let payload = {
            accountName,
            balance: selectedAccount.balance,
            addresses: selectedAccount.addresses,
            unspentAddressesHashes: existingHashes,
            pendingTxTailsHashes,
            transfers: selectedAccount.transfers,
        };

        return getTotalBalance(addresses)
            .then(balance => {
                payload = assign({}, payload, { balance });

                const index = addresses.length ? addresses.length - 1 : 0;

                return getLatestAddresses(seed, index);
            })
            .then(addressData => {
                const unspentAddresses = getUnspentAddresses(selectedAccount.addresses);

                if (isEmpty(unspentAddresses)) {
                    payload = assign({}, payload, { addresses: addressData });

                    throw new Error('intentionally break chain');
                }

                return getTransactionHashes(unspentAddresses);
            })
            .then(latestHashes => {
                const hasNewHashes = size(latestHashes) > size(existingHashes);

                if (hasNewHashes) {
                    const diff = difference(existingHashes, latestHashes);

                    return getTransactionsObjects(diff);
                }

                throw new Error('intentionally break chain');
            })
            .then(txs => {
                const tailTxs = filter(txs, t => t.currentIndex === 0);

                return getInclusionWithHashes(map(tailTxs, t => t.hash));
            })
            .then(({ states, hashes }) => getBundlesWithPersistence(states, hashes))
            .then(bundles => {
                const updatedTransfers = mergeLatestTransfersInOld(selectedAccount.transfers, bundles);
                const updatedTransfersWithFormatting = formatTransfers(updatedTransfers, addresses);

                payload = assign({}, payload, { transfers: updatedTransfersWithFormatting });

                if (isEmpty(pendingTxTailsHashes)) {
                    throw new Error('intentionally break chain');
                }

                return getInclusionWithHashes(pendingTxTailsHashes);
            })
            .then(({ states, hashes }) => getConfirmedTxTailsHashes(states, hashes))
            .then(confirmedHashes => {
                if (isEmpty(confirmedHashes)) {
                    throw new Error('intentionally break chain');
                }

                payload = assign({}, payload, {
                    transfers: markTransfersConfirmed(payload.transfers, confirmedHashes),
                    pendingTxTailsHashes: filter(payload.pendingTxTailsHashes, tx => !includes(confirmedHashes, tx)),
                });

                return dispatch(accountInfoFetchSuccess(payload));
            })
            .catch(err => {
                if (err && err.message === 'intentionally break chain') {
                    dispatch(accountInfoFetchSuccess(payload));
                } else if (!err && navigator) {
                    dispatch(accountInfoFetchError());
                    dispatch(generateAccountInfoErrorAlert());
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

// Aim to update local transfers, addresses, hashes in store after a new transaction is made.
export const updateAccountInfo = (accountName, newTransferBundle, value) => (dispatch, getState) => {
    console.log('New Transfers Bundle', newTransferBundle);

    const selectedAccount = getSelectedAccount(accountName, getState().account.accountInfo);
    const existingAddressData = selectedAccount.addresses;
    const existingTransfers = selectedAccount.transfers;
    const existingUnspentAddressesHashes = getExistingUnspentAddressesHashes(
        accountName,
        getState().account.unspentAddressesHashes,
    );
    const pendingTxTailsHashes = getPendingTxTailsHashesForSelectedAccount(
        accountName,
        getState().account.pendingTxTailsHashes,
    );
    const existingUnconfirmedBundleTails = getState().account.unconfirmedBundleTails;

    const newTransferBundleWithPersistenceAndTransferValue = map(newTransferBundle, bundle => ({
        ...bundle,
        ...{ transferValue: -bundle.value, persistence: false },
    }));
    const updatedTransfers = [...[newTransferBundleWithPersistenceAndTransferValue], ...existingTransfers];
    const updatedAddressData = markAddressSpend([newTransferBundle], existingAddressData);
    const updatedUnspentAddresses = getUnspentAddresses(updatedAddressData);
    const bundle = get(newTransferBundle, `[${0}].bundle`);

    // Keep track of this transfer in unconfirmed tails so that it can be picked up for promotion
    // Also check if it was a value transfer
    const tail = filter(newTransferBundle, tx => tx.currentIndex === 0);
    const updatedUnconfirmedBundleTails = value ? { [bundle]: tail } : existingUnconfirmedBundleTails;
    const updatedPendingTxTailsHashes = [...pendingTxTailsHashes, ...map(tail, t => t.hash)];

    if (!isEmpty(updatedUnspentAddresses)) {
        iota.api.findTransactions({ addresses: updatedUnspentAddresses }, (err, hashes) => {
            if (err) {
                console.error(err);
            } else {
                dispatch(
                    updateAccountInfoAfterSpending({
                        accountName,
                        transfers: updatedTransfers,
                        addresses: updatedAddressData,
                        unspentAddressesHashes: hashes,
                        unconfirmedBundleTails: updatedUnconfirmedBundleTails,
                        pendingTxTailsHashes: updatedPendingTxTailsHashes,
                    }),
                );
            }
        });
    } else {
        dispatch(
            updateAccountInfoAfterSpending({
                accountName,
                transfers: updatedTransfers,
                addresses: updatedAddressData,
                unspentAddressesHashes: existingUnspentAddressesHashes,
                unconfirmedBundleTails: updatedUnconfirmedBundleTails,
                pendingTxTailsHashes: updatedPendingTxTailsHashes,
            }),
        );
    }
};
