import get from 'lodash/get';
import each from 'lodash/each';
import some from 'lodash/some';
import transform from 'lodash/transform';
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
import {
    setReady,
    getTransfersRequest,
    getTransfersSuccess,
    setPromotionStatus,
    setReattachmentStatus,
} from './tempAccount';
import { generateAlert } from '../actions/alerts';
import { isMinutesAgo, convertUnixTimeToJSDate } from '../libs/dateUtils';
import { rearrangeObjectKeys } from '../libs/util';

export const ActionTypes = {
    SET_NEW_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNT/SET_NEW_UNCONFIRMED_BUNDLE_TAILS',
    SET_NEW_LAST_PROMOTED_BUNDLE_TAILS: 'IOTA/ACCOUNT/SET_NEW_LAST_PROMOTED_BUNDLE_TAILS',
    UPDATE_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNT/UPDATE_UNCONFIRMED_BUNDLE_TAILS',
    UPDATE_LAST_PROMOTED_BUNDLE_TAILS: 'IOTA/ACCOUNT/UPDATE_LAST_PROMOTED_BUNDLE_TAILS',
    REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS: 'IOTA/ACCOUNT/REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS',
    REMOVE_BUNDLE_FROM_LAST_PROMOTED_BUNDLE_TAILS: 'IOTA/ACCOUNT/REMOVE_BUNDLE_FROM_LAST_PROMOTED_BUNDLE_TAILS',
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

export const isAboveMaxDepth = timestamp => {
    return timestamp < Date.now() && Math.floor(Date.now()) - parseInt(timestamp) < 14 * 2 * 60 * 1000;
};

export const getFirstConsistentTail = (tails, idx) => {
    if (!tails[idx]) {
        return Promise.resolve(false);
    }

    return iota.api.isPromotable(get(tails[idx], 'hash')).then(state => {
        if (state && isAboveMaxDepth(get(tails[idx], 'attachmentTimestamp'))) {
            return tails[idx];
        }

        return getFirstConsistentTail(tails, idx++);
    });
};

const isWithinADay = timestamp =>
    isMinutesAgo(convertUnixTimeToJSDate(timestamp), 10) && !isMinutesAgo(convertUnixTimeToJSDate(timestamp), 1440);

export const getBundleTailsForSentTransfers = (transfers, addresses) => {
    const categorizedTransfers = iota.utils.categorizeTransfers(transfers, addresses);
    const sentTransfers = get(categorizedTransfers, 'sent');

    const grabTails = (payload, val) => {
        each(val, v => {
            const hasMadeTransactionWithinADay = isWithinADay(v.timestamp);
            const hasTriedReattachmentWithinADay = isWithinADay(v.attachmentTimestamp);

            const doesFallInRelevantTimeSpan = hasMadeTransactionWithinADay || hasTriedReattachmentWithinADay;

            if (v.persistence && v.currentIndex === 0 && v.value > 0) {
                const bundle = v.bundle;

                if (bundle in payload) {
                    payload[bundle] = [...payload[bundle], v];
                } else {
                    payload[bundle] = [v];
                }
            }
        });
    };

    return transform(sentTransfers, grabTails, {});
};

export const updateUnconfirmedBundleTails = payload => ({
    type: ActionTypes.UPDATE_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

export const updateLastPromotedBundleTails = payload => ({
    type: ActionTypes.UPDATE_LAST_PROMOTED_BUNDLE_TAILS,
    payload,
});

export const setNewUnconfirmedBundleTails = payload => ({
    type: ActionTypes.SET_NEW_UNCONFIRMED_BUNDLE_TAILS,
    payload,
});

export const setNewLastPromotedBundleTails = payload => ({
    type: ActionTypes.SET_NEW_LAST_PROMOTED_BUNDLE_TAILS,
    payload,
});

export const removeBundleFromLastPromotedBundleTails = payload => ({
    type: ActionTypes.REMOVE_BUNDLE_FROM_LAST_PROMOTED_BUNDLE_TAILS,
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

export const initializeTxPromotion = (bundle, tails, isPromotingLast) => (dispatch, getState) => {
    // Set flag to true so that the service should wait for this promotion to get completed.
    dispatch(setPromotionStatus(true));

    // Create a copy so you can mutate easily
    let consistentTails = map(tails, clone);
    let allTails = map(tails, clone);

    const dispatchers = {
        update: isPromotingLast ? updateLastPromotedBundleTails : updateUnconfirmedBundleTails,
        updateLastPromoted: updateLastPromotedBundleTails,
        remove: isPromotingLast ? removeBundleFromLastPromotedBundleTails : removeBundleFromUnconfirmedBundleTails,
        set: isPromotingLast ? setNewLastPromotedBundleTails : setNewUnconfirmedBundleTails,
    };

    return iota.api.findTransactionObjects({ bundles: [bundle] }, (err, txs) => {
        if (err) {
            return console.error(err); // eslint-disable-line no-console
        }

        const tailsFromLatestTransactionObjects = filter(txs, t => {
            const hasMadeTransactionWithinADay = isWithinADay(t.timestamp);
            const hasTriedReattachmentWithinADay = isWithinADay(t.attachmentTimestamp);

            const doesFallInRelevantTimeSpan = hasMadeTransactionWithinADay || hasTriedReattachmentWithinADay;

            return t.persistence && t.currentIndex === 0 && t.value > 0;
        });

        if (size(tailsFromLatestTransactionObjects) > size(allTails)) {
            dispatchers.update({ [bundle]: tailsFromLatestTransactionObjects });

            // Assign updated tails to the local copy
            allTails = tailsFromLatestTransactionObjects;
        }

        return iota.api.getLatestInclusion(map(allTails, t => t.hash), (err, states) => {
            if (err) {
                return console.error(err); // eslint-disable-line no-console
            }

            if (some(states, state => state)) {
                return dispatchers.remove(bundle);
            }

            getFirstConsistentTail(consistentTails, 0).then(consistentTail => {
                if (!consistentTail) {
                    // Grab any hash from tail to replay
                    const topTx = head(allTails);
                    const txHash = get(topTx, 'hash');

                    return iota.api.replayBundle(txHash, 3, 14, (err, newTxs) => {
                        if (err) {
                            return console.error(err); // eslint-disable-line no-console
                        }

                        const newTail = filter(newTxs, t => t.currentIndex === 0);
                        // Update local copy for all tails
                        allTails = concat([], newTail, allTails);

                        // Probably unnecessary at this point
                        consistentTails = concat([], newTail, consistentTails);

                        const existingTailsInStore = isPromotingLast
                            ? getState().account.lastPromotedBundleTails
                            : getState().account.unconfirmedBundleTails;
                        const updatedTails = merge({}, existingTailsInStore, { [bundle]: allTails });

                        return dispatchers.set(rearrangeObjectKeys(updatedTails, bundle));
                    });
                }

                return promote(consistentTail);
            });

            const promote = tail => {
                if (!isAboveMaxDepth(get(tail, 'attachmentTimestamp'))) {
                    consistentTails = filter(consistentTails, t => t.hash !== tail.hash);

                    return getFirstConsistentTail(consistentTails, 0).then(consistentTail => {
                        if (!consistentTail) {
                            const topTx = head(allTails);
                            const txHash = get(topTx, 'hash');

                            return iota.api.replayBundle(txHash, 3, 14, (err, newTxs) => {
                                if (err) {
                                    return console.error(err); // eslint-disable-line no-console
                                }

                                const newTail = filter(newTxs, t => t.currentIndex === 0);
                                // Update local copy for all tails
                                allTails = concat([], newTail, allTails);

                                // Probably unnecessary at this point
                                consistentTails = concat([], newTail, consistentTails);

                                const existingTailsInStore = isPromotingLast
                                    ? getState().account.lastPromotedBundleTails
                                    : getState().account.unconfirmedBundleTails;
                                const updatedTails = merge({}, existingTailsInStore, { [bundle]: allTails });

                                return dispatchers.set(rearrangeObjectKeys(updatedTails, bundle));
                            });
                        }

                        return promote(consistentTail);
                    });
                }

                const spamTransfer = [{ address: 'U'.repeat(81), value: 0, message: '', tag: '' }];

                return iota.api.promoteTransaction(
                    tail.hash,
                    3,
                    14,
                    spamTransfer,
                    { interrupt: false, delay: 0 },
                    (err, res) => {
                        if (err && err.message.indexOf('Inconsistent subtangle') > -1) {
                            consistentTails = filter(consistentTails, t => t.hash !== tail.hash);

                            return getFirstConsistentTail(consistentTails, 0).then(consistentTail => {
                                if (!consistentTail) {
                                    // TODO: Generate an alert
                                    return console.log('Something went wrong');
                                }

                                return promote(consistentTail);
                            });
                        }

                        const newBundle = get(res, `[${0}].bundle`);
                        dispatchers.remove(bundle);

                        if (isPromotingLast) {
                            return dispatchers.update({ [newBundle]: res });
                        }

                        return dispatchers.updateLastPromoted({ [newBundle]: res });
                    },
                );
            };
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
