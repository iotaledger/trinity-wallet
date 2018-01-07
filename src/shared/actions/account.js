import assign from 'lodash/assign';
import includes from 'lodash/includes';
import map from 'lodash/map';
import get from 'lodash/get';
import filter from 'lodash/filter';
import size from 'lodash/size';
import reduce from 'lodash/reduce';
import has from 'lodash/has';
import omitBy from 'lodash/omitBy';
import difference from 'lodash/difference';
import find from 'lodash/find';
import each from 'lodash/each';
import isEmpty from 'lodash/isEmpty';
import union from 'lodash/union';
import merge from 'lodash/merge';
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
    getUnspentAddresses,
    getTotalBalance,
    getLatestAddresses,
    getTransactionHashes,
    getTransactionsObjects,
    getHashesWithPersistence,
    getBundlesWithPersistence,
    getConfirmedTxTailsHashes,
    markTransfersConfirmed,
    markAddressSpend,
    getPendingTxTailsHashes,
    getAccountData,
} from '../libs/accountUtils';
import { setReady, clearTempData } from './tempAccount';
import { generateAlert, generateAccountInfoErrorAlert, generateSyncingSuccessAlert } from '../actions/alerts';
import i18next from 'i18next';

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
    const onError = () => {
        if (navigator) {
            navigator.pop({ animated: false });
        }

        dispatch(generateAccountInfoErrorAlert());
        dispatch(fullAccountInfoForFirstUseFetchError());
    };

    dispatch(fullAccountInfoForFirstUseFetchRequest());
    getAccountData(seed, accountName)
        .then(data => {
            dispatch(clearTempData()); // Clean up partial state for reducer anyways.

            const unspentAddresses = getUnspentAddresses(data.addresses);
            if (!isEmpty(unspentAddresses)) {
                iota.api.findTransactions({ addresses: unspentAddresses }, (err, hashes) => {
                    if (err) {
                        onError();
                    } else {
                        storeInKeychainPromise(password, seed, accountName)
                            .then(() => {
                                const payloadWithHashes = assign({}, data, { hashes });
                                dispatch(fullAccountInfoForFirstUseFetchSuccess(payloadWithHashes));
                            })
                            .catch(() => {
                                onError();
                            });
                    }
                });
            } else {
                storeInKeychainPromise(password, seed, accountName)
                    .then(() => {
                        dispatch(fullAccountInfoForFirstUseFetchSuccess(assign({}, data, { hashes: [] })));
                    })
                    .catch(() => {
                        onError();
                    });
            }
        })
        .catch(() => onError());
};

export const getFullAccountInfo = (seed, accountName, navigator = null) => {
    return dispatch => {
        const onError = () => {
            if (navigator) {
                navigator.pop({ animated: false });
            }

            dispatch(generateAccountInfoErrorAlert());
            dispatch(fullAccountInfoFetchError());
        };

        dispatch(fullAccountInfoFetchRequest());
        getAccountData(seed, accountName)
            .then(data => {
                const unspentAddresses = getUnspentAddresses(data.addresses);

                if (!isEmpty(unspentAddresses)) {
                    iota.api.findTransactions({ addresses: unspentAddresses }, (err, hashes) => {
                        if (err) {
                            onError();
                        }
                        const payloadWithHashes = assign({}, data, { hashes });
                        dispatch(fullAccountInfoFetchSuccess(payloadWithHashes));
                    });
                } else {
                    dispatch(fullAccountInfoFetchSuccess(assign({}, data, { hashes: [] })));
                }
            })
            .catch(() => onError());
    };
};

export const manuallySyncAccount = (seed, accountName) => {
    return dispatch => {
        const onError = () => {
            dispatch(generateAccountInfoErrorAlert());
            return dispatch(fullAccountInfoFetchError());
        };

        dispatch(manualSyncRequest());
        getAccountData(seed, accountName)
            .then(data => {
                dispatch(clearTempData()); // Clean up partial state for reducer anyways.
                const unspentAddresses = getUnspentAddresses(data.addresses);
                if (!isEmpty(unspentAddresses)) {
                    iota.api.findTransactions({ addresses: unspentAddresses }, (err, hashes) => {
                        if (err) {
                            onError();
                        } else {
                            dispatch(generateSyncingSuccessAlert());
                            const payloadWithHashes = assign({}, data, { hashes });
                            dispatch(manualSyncSuccess(payloadWithHashes));
                        }
                    });
                } else {
                    dispatch(generateSyncingSuccessAlert());
                    dispatch(manualSyncSuccess(assign({}, data, { hashes: [] })));
                }
            })
            .catch(() => onError());
    };
};

export const getAccountInfo = (seed, accountName, navigator = null) => {
    return (dispatch, getState) => {
        dispatch(accountInfoFetchRequest());

        const selectedAccount = getSelectedAccount(accountName, getState().account.accountInfo);

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

        const checkConfirmationForPendingTxs = () => {
            if (isEmpty(pendingTxTailsHashes)) {
                return Promise.resolve(getTotalBalance(Object.keys(payload.addresses)));
            }

            return Promise.resolve(getHashesWithPersistence(pendingTxTailsHashes))
                .then(({ states, hashes }) => {
                    return getConfirmedTxTailsHashes(states, hashes);
                })
                .then(confirmedHashes => {
                    if (!isEmpty(confirmedHashes)) {
                        payload = assign({}, payload, {
                            transfers: markTransfersConfirmed(payload.transfers, confirmedHashes),
                            pendingTxTailsHashes: filter(
                                payload.pendingTxTailsHashes,
                                tx => !includes(confirmedHashes, tx),
                            ),
                        });
                    }

                    return Promise.resolve(getTotalBalance(Object.keys(payload.addresses)));
                });
        };

        return checkConfirmationForPendingTxs()
            .then(balance => {
                payload = assign({}, payload, { balance });

                const index = Object.keys(payload.addresses).length ? Object.keys(payload.addresses).length - 1 : 0;

                return getLatestAddresses(seed, index);
            })
            .then(addressData => {
                payload = merge({}, payload, { addresses: addressData });

                const unspentAddresses = getUnspentAddresses(payload.addresses);
                if (isEmpty(unspentAddresses)) {
                    throw new Error('intentionally break chain');
                }

                return getTransactionHashes(unspentAddresses);
            })
            .then(latestHashes => {
                const hasNewHashes = size(latestHashes) > size(existingHashes);

                if (hasNewHashes) {
                    const diff = difference(latestHashes, existingHashes);

                    payload = assign({}, payload, {
                        unspentAddressesHashes: union(existingHashes, latestHashes),
                    });
                    return getTransactionsObjects(diff);
                }

                throw new Error('intentionally break chain');
            })
            .then(txs => {
                const tailTxs = filter(txs, t => t.currentIndex === 0);

                return getHashesWithPersistence(map(tailTxs, t => t.hash));
            })
            .then(({ states, hashes }) => getBundlesWithPersistence(states, hashes))
            .then(bundles => {
                const updatedTransfers = [...payload.transfers, ...bundles];
                const updatedTransfersWithFormatting = formatTransfers(
                    updatedTransfers,
                    Object.keys(payload.addresses),
                );

                payload = assign({}, payload, {
                    transfers: updatedTransfersWithFormatting,
                    pendingTxTailsHashes: union(payload.pendingTxTailsHashes, getPendingTxTailsHashes(bundles)), // Update pending transfers copy with new transfers.
                });

                return dispatch(accountInfoFetchSuccess(payload));
            })
            .catch(err => {
                if (err && err.message === 'intentionally break chain') {
                    dispatch(accountInfoFetchSuccess(payload));
                } else {
                    if (navigator) {
                        navigator.pop({ animated: false });
                    }

                    dispatch(accountInfoFetchError());
                    dispatch(generateAccountInfoErrorAlert());
                }
            });
    };
};

export const deleteAccount = accountName => dispatch => {
    dispatch(removeAccount(accountName));
    dispatch(
        generateAlert('success', i18next.t('settings:accountDeleted'), i18next.t('settings:accountDeletedExplanation')),
    );
};

// Aim to update local transfers, addresses, hashes in store after a new transaction is made.
export const updateAccountInfo = (accountName, newTransferBundle, value) => (dispatch, getState) => {
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
