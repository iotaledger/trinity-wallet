import get from 'lodash/get';
import some from 'lodash/some';
import map from 'lodash/map';
import head from 'lodash/head';
import concat from 'lodash/concat';
import clone from 'lodash/clone';
import size from 'lodash/size';
import merge from 'lodash/merge';
import filter from 'lodash/filter';
import { iota } from '../libs/iota';
import { getSelectedAccount } from '../selectors/account';
import {
    addTransferValues,
    formatTransfers,
    formatAddressBalances,
    formatAddressBalancesNewSeed,
    calculateBalance,
    getIndexesWithBalanceChange,
    groupTransfersByBundle,
    getAddressesWithChangedBalance,
    mergeLatestTransfersInOld,
} from '../libs/accountUtils';
import { setReady, getTransfersRequest, getTransfersSuccess, setPromotionStatus } from './tempAccount';
import { getFirstConsistentTail, isWithinAnHour, getBundleTailsForSentTransfers } from '../libs/promoter';
import { generateAlert } from '../actions/alerts';
import { rearrangeObjectKeys } from '../libs/util';

export const ActionTypes = {
    SET_NEW_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNT/SET_NEW_UNCONFIRMED_BUNDLE_TAILS',
    UPDATE_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNT/UPDATE_UNCONFIRMED_BUNDLE_TAILS',
    REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNT/REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS',
};

export function setFirstUse(boolean) {
    return {
        type: 'SET_FIRST_USE',
        payload: boolean,
    };
}

export function setOnboardingComplete(boolean) {
    return {
        type: 'SET_ONBOARDING_COMPLETE',
        payload: boolean,
    };
}

export function increaseSeedCount() {
    return {
        type: 'INCREASE_SEED_COUNT',
    };
}

export function addAccountName(seedName) {
    return {
        type: 'ADD_SEED_NAME',
        seedName: seedName,
    };
}

export function addAddresses(seedName, addresses) {
    return {
        type: 'ADD_ADDRESSES',
        seedName: seedName,
        addresses: addresses,
    };
}

export const getAccountInfoNewSeedAsync = (seed, seedName) => {
    return async dispatch => {
        const address = await iota.api.getNewAddressAsync(seed);
        console.log('ADDRESS:', address);
        const accountData = await iota.api.getAccountDataAsync(seed);
        console.log('ACCOUNT', accountData);
        const addressesWithBalance = formatAddressBalancesNewSeed(accountData);
        const balance = calculateBalance(addressesWithBalance);
        const transfers = formatTransfers(accountData.transfers, accountData.addresses);
        dispatch(setAccountInfo(seedName, addressesWithBalance, transfers, balance));
        dispatch(setReady());
    };
};

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

export function getFullAccountInfo(seed, seedName, cb) {
    return dispatch => {
        iota.api.getAccountData(seed, (error, success) => {
            if (!error) {
                // Combine addresses and balances
                const addressesWithBalance = formatAddressBalancesNewSeed(success);

                const transfers = formatTransfers(success.transfers, success.addresses);

                const unconfirmedTails = getBundleTailsForSentTransfers(transfers, success.addresses); // Should really be ordered.

                const balance = calculateBalance(addressesWithBalance);
                // Dispatch setAccountInfo action, set first use to false, and set ready to end loading
                dispatch(setAccountInfo(seedName, addressesWithBalance, transfers, balance));
                dispatch(updateUnconfirmedBundleTails(unconfirmedTails));
                cb(null, success);
            } else {
                cb(error);
                console.log(error);
            }
        });
    };
}

export const initializeTxPromotion = (bundle, tails) => (dispatch, getState) => {
    // Set flag to true so that the service should wait for this promotion to get completed.
    dispatch(setPromotionStatus(true));

    // Create a copy so you can mutate easily
    let consistentTails = map(tails, clone);
    let allTails = map(tails, clone);

    const alertArguments = (title, message, status = 'success') => [status, title, message];

    const promote = tail => {
        const spamTransfer = [{ address: 'U'.repeat(81), value: 0, message: '', tag: '' }];

        return iota.api.promoteTransaction(tail.hash, 3, 14, spamTransfer, { interrupt: false, delay: 0 }, err => {
            if (err) {
                if (err.message.indexOf('Inconsistent subtangle') > -1) {
                    consistentTails = filter(consistentTails, t => t.hash !== tail.hash);

                    return getFirstConsistentTail(consistentTails, 0).then(consistentTail => {
                        if (!consistentTail) {
                            // TODO: Generate an alert
                            return dispatch(setPromotionStatus(false));
                        }

                        return promote(consistentTail);
                    });
                }

                return console.error(err); // eslint-disable-line no-console
            }

            dispatch(
                generateAlert(...alertArguments('Promoting transfer', `Promoting transaction with hash ${tail.hash}`)),
            );

            const existingBundlesInStore = getState().account.unconfirmedBundleTails;
            const updatedBundles = merge({}, existingBundlesInStore, { [bundle]: allTails });

            dispatch(setNewUnconfirmedBundleTails(rearrangeObjectKeys(updatedBundles, bundle)));
            return dispatch(setPromotionStatus(false));
        });
    };

    return iota.api.findTransactionObjects({ bundles: [bundle] }, (err, txs) => {
        if (err) {
            console.error(err); // eslint-disable-line no-console
            return dispatch(setPromotionStatus(false));
        }

        const tailsFromLatestTransactionObjects = filter(txs, t => {
            const attachmentTimestamp = get(t, 'attachmentTimestamp');
            const hasMadeReattachmentWithinAnHour = isWithinAnHour(attachmentTimestamp);

            return !t.persistence && t.currentIndex === 0 && t.value > 0 && hasMadeReattachmentWithinAnHour;
        });

        if (size(tailsFromLatestTransactionObjects) > size(allTails)) {
            dispatch(updateUnconfirmedBundleTails({ [bundle]: tailsFromLatestTransactionObjects }));

            // Assign updated tails to the local copy
            allTails = tailsFromLatestTransactionObjects;
        }

        return iota.api.getLatestInclusion(map(allTails, t => t.hash), (err, states) => {
            if (err) {
                console.error(err); // eslint-disable-line no-console
                return dispatch(setPromotionStatus(false));
            }

            if (some(states, state => state)) {
                dispatch(removeBundleFromUnconfirmedBundleTails(bundle));

                return dispatch(setPromotionStatus(false));
            }

            return getFirstConsistentTail(consistentTails, 0).then(consistentTail => {
                if (!consistentTail) {
                    // Grab hash from the top tail to replay
                    const topTx = head(allTails);
                    const txHash = get(topTx, 'hash');

                    return iota.api.replayBundle(txHash, 3, 14, (err, newTxs) => {
                        if (err) {
                            console.error(err); // eslint-disable-line no-console
                            return dispatch(setPromotionStatus(false));
                        }

                        dispatch(
                            generateAlert(
                                ...alertArguments(
                                    'Autoreattaching to Tangle',
                                    `Reattaching transaction with hash ${txHash}`,
                                ),
                            ),
                        );

                        const newTail = filter(newTxs, t => t.currentIndex === 0);
                        // Update local copy for all tails
                        allTails = concat([], newTail, allTails);

                        // Probably unnecessary at this point
                        consistentTails = concat([], newTail, consistentTails);
                        const existingBundlesInStore = getState().account.unconfirmedBundleTails;

                        const updateBundles = merge({}, existingBundlesInStore, { [bundle]: allTails });
                        dispatch(setNewUnconfirmedBundleTails(rearrangeObjectKeys(updateBundles, bundle)));

                        return dispatch(setPromotionStatus(false));
                    });
                }

                return promote(consistentTail);
            });
        });
    });
};

export function setBalance(addressesWithBalance) {
    const balance = calculateBalance(addressesWithBalance);
    return {
        type: 'SET_BALANCE',
        payload: balance,
    };
}

export function getAccountInfo(seedName, seedIndex, accountInfo, cb) {
    return dispatch => {
        // Current addresses and their balances
        let addressesWithBalance = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
        // Current transfers
        const transfers = accountInfo[Object.keys(accountInfo)[seedIndex]].transfers;
        // Array of old balances
        const oldBalances = Object.values(addressesWithBalance);
        // Array of current addresses
        const addresses = Object.keys(addressesWithBalance);
        // Get updated balances for current addresses
        iota.api.getBalances(addresses, 1, (error, success) => {
            if (!error) {
                // Array of updated balances
                let newBalances = success.balances;
                newBalances = newBalances.map(Number);
                // Get address indexes where balance has changed
                const indexesWithBalanceChange = getIndexesWithBalanceChange(newBalances, oldBalances);
                // Pair new balances to addresses to add to store
                addressesWithBalance = formatAddressBalances(addresses, newBalances);
                // Calculate balance
                const balance = calculateBalance(addressesWithBalance);

                if (indexesWithBalanceChange.length > 0) {
                    // Grab addresses where balance was updated.
                    // Use these addresses to fetch latest transactions objects.
                    const addressesWithChangedBalance = getAddressesWithChangedBalance(
                        addresses,
                        indexesWithBalanceChange,
                    );
                    dispatch(getTransfersRequest());
                    Promise.resolve(dispatch(setAccountInfo(seedName, addressesWithBalance, transfers, balance))).then(
                        dispatch(getTransfers(seedName, addressesWithChangedBalance)),
                    );
                } else {
                    cb(null, success);
                    // Set account info, then finish loading
                    dispatch(setAccountInfo(seedName, addressesWithBalance, transfers, balance));
                }
            } else {
                cb(error);
                console.log(error);
                dispatch(
                    generateAlert(
                        'error',
                        'Invalid Response',
                        'The node returned an invalid response while getting balance.',
                    ),
                );
            }
        });
    };
}

export function getTransfers(seedName, addresses) {
    return (dispatch, getState) => {
        iota.api.findTransactionObjects({ addresses }, (error, success) => {
            if (!error) {
                // Get full bundles
                const bundles = [...new Set(success.map(tx => tx.bundle))];
                iota.api.findTransactionObjects({ bundles }, (error, success) => {
                    if (!error) {
                        // Add persistence to transaction objects
                        iota.api.getLatestInclusion(success.map(tx => tx.hash), (error, inclusionStates) => {
                            if (!error) {
                                success.map((tx, i) => {
                                    tx.persistence = inclusionStates[i];
                                    return tx;
                                });
                                // Group transfers into bundles
                                let transfers = groupTransfersByBundle(success);
                                // Sort transfers and add transfer value
                                const selectedAccount = getSelectedAccount(seedName, getState().account.accountInfo);
                                const oldTransfers = selectedAccount.transfers;

                                transfers = mergeLatestTransfersInOld(oldTransfers, transfers);
                                transfers = formatTransfers(transfers, addresses);
                                // Update transfers then set ready
                                Promise.resolve(dispatch(updateTransfers(seedName, transfers))).then(
                                    dispatch(setReady()),
                                );
                                dispatch(getTransfersSuccess());
                            } else {
                                console.log('SOMETHING WENT WRONG: ', error);
                                dispatch(
                                    generateAlert(
                                        'error',
                                        'Invalid Response',
                                        'The node returned an invalid response while getting transfers.',
                                    ),
                                );
                            }
                        });
                    } else {
                        console.log('SOMETHING WENT WRONG: ', error);
                        dispatch(
                            generateAlert(
                                'error',
                                'Invalid Response',
                                'The node returned an invalid response while getting transfers.',
                            ),
                        );
                    }
                });
            } else {
                console.log('SOMETHING WENT WRONG: ', error);
                dispatch(
                    generateAlert(
                        'error',
                        'Invalid Response',
                        'The node returned an invalid response while getting transfers.',
                    ),
                );
            }
        });
    };
}

export function addPendingTransfer(seedName, transfers, success) {
    return dispatch => {
        success[0].transferValue = -success[0].value;
        success[0].persistence = false;
        // Add pending transfer at front of transfers array
        transfers.unshift(success);
        dispatch(updateTransfers(seedName, transfers));
    };
}

export function updateTransfers(seedName, transfers) {
    return {
        type: 'UPDATE_TRANSFERS',
        seedName,
        transfers,
    };
}

export function updateAddresses(seedName, addresses) {
    return {
        type: 'UPDATE_ADDRESSES',
        seedName,
        addresses,
    };
}

export function setAccountInfo(seedName, addresses, transfers, balance) {
    return {
        type: 'SET_ACCOUNT_INFO',
        seedName,
        addresses,
        transfers,
        balance,
    };
}

export function changeAccountName(accountInfo, accountNames) {
    return {
        type: 'CHANGE_ACCOUNT_NAME',
        accountInfo,
        accountNames,
    };
}

export function removeAccount(accountInfo, accountNames) {
    return {
        type: 'REMOVE_ACCOUNT',
        accountInfo,
        accountNames,
    };
}
