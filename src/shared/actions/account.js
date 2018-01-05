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
} from '../libs/accountUtils';
import { setReady, clearTempData } from './tempAccount';
import { generateAlert, generateAccountInfoErrorAlert } from '../actions/alerts';
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

export const getBundle = (tailTx, allBundleObjects) => {
    const bundle = [tailTx];
    const bundleHash = tailTx.bundle;

    let trunk = tailTx.trunkTransaction;
    const nextTx = () => find(allBundleObjects, { hash: trunk });

    while (nextTx() && nextTx().bundle === bundleHash) {
        bundle.push(nextTx());
        trunk = nextTx().trunkTransaction;
    }

    return bundle;
};

export const fetchFullAccountInfoForFirstUse = (
    seed,
    accountName,
    password,
    storeInKeychainPromise,
    navigator = null,
) => dispatch => {
    dispatch(fullAccountInfoForFirstUseFetchRequest());
    iota.api.getNodeInfo(error => {
        if (error) {
            onError();
        } else {
            return iota.api.getAccountData(seed, (error, data) => {
                if (!error) {
                    dispatch(clearTempData()); // Clean up partial state for reducer anyways.
                    const payload = organizeAccountInfo(accountName, data);
                    const unspentAddresses = getUnspentAddresses(payload.addresses);
                    if (!isEmpty(unspentAddresses)) {
                        return iota.api.findTransactions({ addresses: unspentAddresses }, (err, hashes) => {
                            if (err) {
                                onError();
                            }
                            return storeInKeychainPromise(password, seed, accountName)
                                .then(() => {
                                    const payloadWithHashes = assign({}, payload, { hashes });
                                    return dispatch(fullAccountInfoForFirstUseFetchSuccess(payloadWithHashes));
                                })
                                .catch(() => {
                                    onError();
                                });
                        });
                    }
                    return storeInKeychainPromise(password, seed, accountName)
                        .then(() => {
                            dispatch(fullAccountInfoForFirstUseFetchSuccess(payload));
                        })
                        .catch(() => {
                            onError();
                        });
                }
                onError();
            });
        }
    });
    function onError() {
        if (navigator) {
            navigator.pop({ animated: false });
        }
        dispatch(generateAccountInfoErrorAlert());
        return dispatch(fullAccountInfoForFirstUseFetchError());
    }
};

export const getFullAccountInfo = (seed, accountName, navigator = null) => {
    return dispatch => {
        dispatch(fullAccountInfoFetchRequest());
        iota.api.getNodeInfo(error => {
            if (error) {
                onError();
            } else {
                const addressesOpts = {
                    index: 0,
                    total: null,
                    returnAll: true,
                    security: 2,
                };

                const valuesToReturn = {
                    latestAddress: '',
                    addresses: [],
                    transfers: [],
                    inputs: [],
                    balance: 0,
                };

                return iota.api.getNewAddress(seed, addressesOpts, (err, addresses) => {
                    if (err) {
                        console.error(err);
                    } else {
                        valuesToReturn.latestAddress = addresses[addresses.length - 1];
                        valuesToReturn.addresses = addresses.slice(0, -1);

                        const tailTransactions = [];
                        const nonTailBundleHashes = [];
                        const bundles = [];

                        const pushIfNotExists = (pushTo, value) => {
                            if (!includes(pushTo, value)) {
                                pushTo.push(value);
                            }
                        };

                        const pushTxIfNotFound = (pushTo, tx) => {
                            const existingValue = find(pushTo, { hash: tx.hash });

                            if (!existingValue) {
                                pushTo.push(tx);
                            }
                        };

                        return iota.api.findTransactionObjects({ addresses }, (err, txObjects) => {
                            if (err) {
                                console.error(err);
                            } else {
                                each(txObjects, tx => {
                                    if (tx.currentIndex === 0) {
                                        pushTxIfNotFound(tailTransactions, tx);
                                    } else {
                                        pushIfNotExists(nonTailBundleHashes, tx.bundle);
                                    }
                                });

                                // Check inclusion
                                iota.api.findTransactionObjects(
                                    { bundles: nonTailBundleHashes },
                                    (err, bundleObjects) => {
                                        if (err) {
                                            console.error(err);
                                        } else {
                                            each(bundleObjects, tx => {
                                                if (tx.currentIndex === 0) {
                                                    pushTxIfNotFound(tailTransactions, tx);
                                                }
                                            });

                                            console.log('Length before', tailTransactions.length);
                                            iota.api.getLatestInclusion(
                                                map(tailTransactions, t => t.hash),
                                                (err, states) => {
                                                    if (err) {
                                                        console.error(err);
                                                    } else {
                                                        const allTxsAsObjects = reduce(
                                                            tailTransactions,
                                                            (res, v, i) => {
                                                                if (i === 0) {
                                                                    res.confirmed = {};
                                                                    res.unconfirmed = {};
                                                                }
                                                                if (states[i]) {
                                                                    res.confirmed[v.bundle] = Object.assign({}, v, {
                                                                        persistence: true,
                                                                    });
                                                                } else {
                                                                    res.unconfirmed[v.bundle] = Object.assign({}, v, {
                                                                        persistence: false,
                                                                    });
                                                                }

                                                                return res;
                                                            },
                                                            {},
                                                        );

                                                        const filteredUnconfirmed = omitBy(
                                                            allTxsAsObjects.unconfirmed,
                                                            (value, key) => {
                                                                return has(allTxsAsObjects.confirmed, key);
                                                            },
                                                        );

                                                        const allTxs = [
                                                            ...map(allTxsAsObjects.confirmed, t => t),
                                                            ...map(filteredUnconfirmed, t => t),
                                                        ];
                                                        console.log('Length after', allTxs.length);

                                                        const transfers = [];

                                                        allTxs.forEach(tx =>
                                                            transfers.push(getBundle(tx, bundleObjects)),
                                                        );
                                                        valuesToReturn.transfers = transfers;

                                                        iota.api.getBalances(
                                                            valuesToReturn.addresses,
                                                            100,
                                                            (err, balances) => {
                                                                balances.balances.forEach((balance, index) => {
                                                                    valuesToReturn.balance += parseInt(balance);

                                                                    if (balance > 0) {
                                                                        const newInput = {
                                                                            address: valuesToReturn.addresses[index],
                                                                            keyIndex: index,
                                                                            security: 2,
                                                                            balance: valuesToReturn.balance,
                                                                        };

                                                                        valuesToReturn.inputs.push(newInput);
                                                                    }
                                                                });

                                                                const payload = organizeAccountInfo(
                                                                    accountName,
                                                                    valuesToReturn,
                                                                );
                                                                const payloadWithHashes = assign({}, payload, {
                                                                    hashes: [],
                                                                });
                                                                return dispatch(
                                                                    fullAccountInfoFetchSuccess(payloadWithHashes),
                                                                );
                                                            },
                                                        );
                                                    }
                                                },
                                            );
                                        }
                                    },
                                );
                            }
                        });
                    }
                });
            }
        });
        function onError() {
            if (navigator) {
                navigator.pop({ animated: false });
            }
            dispatch(generateAccountInfoErrorAlert());
            return dispatch(fullAccountInfoFetchError());
        }
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

                    return dispatch(manualSyncSuccess(payloadWithHashes));
                });
            }

            dispatch(
                generateAlert(
                    'success',
                    i18next.t('settings:syncingComplete'),
                    i18next.t('settings:syncingCompleteExplanation'),
                ),
            );
            return dispatch(manualSyncSuccess(assign({}, payload, { hashes: [] })));
        }

        dispatch(
            generateAlert('error', i18next.t('global:invalidResponse'), i18next.t('global:invalidResponseExplanation')),
        );
        return dispatch(manualSyncError());
    });
};

const getBundleWithPersistence = tailTxHash => {
    return new Promise((resolve, reject) => {
        iota.api.getBundle(tailTxHash.hash, (err, bundle) => {
            if (err) {
                reject(err);
            } else {
                resolve(map(bundle, tx => Object.assign({}, tx, { persistence: tailTxHash.persistence })));
            }
        });
    });
};

const getBundles = hashes => {
    return reduce(
        hashes,
        (promise, hash, idx) => {
            return promise
                .then(result => {
                    return getBundleWithPersistence(hash).then(bundle => {
                        result.push(bundle);

                        return result;
                    });
                })
                .catch(console.error);
        },
        Promise.resolve([]),
    );
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
