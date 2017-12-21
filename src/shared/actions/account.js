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
    formatAddressData,
    formatFullAddressData,
    calculateBalance,
    getIndexesWithBalanceChange,
    groupTransfersByBundle,
    getAddressesWithChangedBalance,
    mergeLatestTransfersInOld,
    deduplicateBundles,
    markAddressSpend,
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

export function setBalance(balance) {
    return {
        type: 'SET_BALANCE',
        payload: balance,
    };
}

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

export function getFullAccountInfo(seed, seedName, cb) {
    return dispatch => {
        iota.api.getAccountData(seed, (error, success) => {
            if (!error) {
                // Combine addresses and balances
                let addressData = formatFullAddressData(success);
                const transfers = formatTransfers(success.transfers, success.addresses);
                const balance = calculateBalance(addressData);

                addressData = markAddressSpend(transfers, addressData);
                const unconfirmedTails = getBundleTailsForSentTransfers(transfers, success.addresses); // Should really be ordered.
                // Dispatch setAccountInfo action, set first use to false, and set ready to end loading
                dispatch(setAccountInfo(seedName, addressData, transfers, balance));
                dispatch(updateUnconfirmedBundleTails(unconfirmedTails));
                cb(null, success);
            } else {
                cb(error);
                console.log(error);
            }
        });
    };
}

export function getAccountInfo(seedName, seedIndex, accountInfo, cb) {
    return dispatch => {
        let addressData = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
        const addresses = Object.keys(addressData);

        if (addresses.length < 1) {
            dispatch(setReady());
            return;
        }

        const addressesSpendStatus = Object.values(addressData).map(x => x.spent);
        // Get unspent addresses
        let unspentAddresses = [];
        for (var i = 0; i < addresses.length; i++) {
            if (addressesSpendStatus[i] === false) {
                unspentAddresses.push(addresses[i]);
            }
        }
        // Get updated balances for current addresses

        iota.api.getBalances(addresses, 1, (error, success) => {
            if (!error) {
                // Get updated balances for each address
                let newBalances = success.balances;
                newBalances = newBalances.map(Number);
                // Calculate total balance
                const totalBalance = newBalances.reduce((a, b) => a + b);
                dispatch(setBalance(totalBalance));
                dispatch(getTransfersRequest());

                dispatch(getTransfers(seedName, unspentAddresses, cb));
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

// Old getAccountInfo function. Pulls new transfers on balance change
{
    /*export function getAccountInfo(seedName, seedIndex, accountInfo, cb) {
    return dispatch => {
        // Current addresses and their balances
        let addressData = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
        // Current transfers
        const transfers = accountInfo[Object.keys(accountInfo)[seedIndex]].transfers;
        // Array of old balances
        const oldBalances = Object.values(addressData).map(x => x.balance);
        // Array of address spend status
        const addressesSpendStatus = Object.values(addressData).map(x => x.spent);
        // Array of current addresses
        const addresses = Object.keys(addressData);
        // Get updated balances for current addresses
        iota.api.getBalances(addresses, 1, (error, success) => {
            if (!error) {
                // Array of updated balances
                let newBalances = success.balances;
                newBalances = newBalances.map(Number);
                // Get address indexes where balance has changed
                const indexesWithBalanceChange = getIndexesWithBalanceChange(newBalances, oldBalances);
                // Pair new balances to addresses to add to store
                addressData = formatAddressData(addresses, newBalances, addressesSpendStatus);
                // Calculate balance
                const balance = calculateBalance(addressData);

                dispatch(getTransfersRequest());
                dispatch(getTransfers(seedName, unspentAddresses));

                if (indexesWithBalanceChange.length > 0) {
                    // Grab addresses where balance was updated.
                    // Use these addresses to fetch latest transactions objects.
                    const addressesWithChangedBalance = getAddressesWithChangedBalance(
                        addresses,
                        indexesWithBalanceChange,
                    );
                    dispatch(getTransfersRequest());
                    Promise.resolve(dispatch(setAccountInfo(seedName, addressData, transfers, balance))).then(
                        dispatch(getTransfers(seedName, addressesWithChangedBalance)),
                    );
                } else {
                    cb(null, success);
                    // Set account info, then finish loading
                    dispatch(setAccountInfo(seedName, addressData, transfers, balance));
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
}*/
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

export function getNewTransfersAndAddresses(seed, index, accountName, addressData, oldTransfers, callback) {
    return dispatch => {
        iota.api.getAccountData(seed, { start: index, end: index + 1 }, (error, success) => {
            if (!error) {
                const oldAddressData = addressData;
                let newAddressData = formatFullAddressData(success);
                const addresses = Object.keys(newAddressData);
                const newTransfers = formatTransfers(success.transfers, addresses);
                newAddressData = markAddressSpend(newTransfers, newAddressData);
                let fullAddressData = Object.assign(oldAddressData, newAddressData);
                const fullTransfers = newTransfers.concat(oldTransfers);
                const balance = calculateBalance(addressData);
                dispatch(setAccountInfo(accountName, fullAddressData, fullTransfers, balance));
                callback(null, success);
            } else {
                callback(error);
                console.log(error);
            }
        });
    };
}

export function getTransfers(seedName, addresses, cb) {
    return (dispatch, getState) => {
        iota.api.findTransactionObjects({ addresses }, (error, success) => {
            if (!error) {
                // Get full bundles
                const bundles = [...new Set(success.map(tx => tx.bundle))];
                iota.api.findTransactionObjects({ bundles }, (error, success) => {
                    if (!error) {
                        // If no transfers, exit
                        if (success.length < 1) {
                            dispatch(setReady());
                            dispatch(getTransfersSuccess());
                            return;
                        }
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
                                let oldTransfers = selectedAccount.transfers;
                                //transfers = mergeLatestTransfersInOld(oldTransfers, transfers);
                                transfers = formatTransfers(transfers, addresses);
                                // Update transfers then set ready
                                dispatch(updateTransfers(seedName, transfers));
                                dispatch(setReady());
                                dispatch(getTransfersSuccess());
                                cb(null, success);
                            } else {
                                cb(error);
                                console.log(error);
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
                        cb(error);
                        console.log(error);
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
                cb(error);
                console.log(error);
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
