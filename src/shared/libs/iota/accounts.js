import cloneDeep from 'lodash/cloneDeep';
import assign from 'lodash/assign';
import each from 'lodash/each';
import size from 'lodash/size';
import get from 'lodash/get';
import map from 'lodash/map';
import keys from 'lodash/keys';
import merge from 'lodash/merge';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import unionBy from 'lodash/unionBy';
import { getNodeInfoAsync, findTransactionObjectsAsync, getLatestInclusionAsync } from './extendedApi';
import {
    prepareForAutoPromotion,
    syncTransfers,
    getPendingTxTailsHashes,
    getConfirmedTransactionHashes,
    markTransfersConfirmed,
    getBundleHashesForNewlyConfirmedTransactions,
    getHashesDiff,
    getLatestTransactionHashes,
    normalizedBundlesFromTransactionObjects,
    normalizeBundle,
    mergeNewTransfers
} from './transfers';
import { getAllAddresses, formatAddressesAndBalance, markAddressesAsSpentSync } from './addresses';

/**
 *   Takes in account data fetched from ledger.
 *   Formats addresses.
 *   Accumulates total balance (formatAddressesAndBalance).
 *   Prepare transactions for auto promotion.
 *
 *   @method organizeAccountState
 *   @param {string} accountName
 *   @param {data} [ addresses: <array>, transfers: <array> ]
 *
 *   @returns {Promise<object>}
 **/
const organizeAccountState = (accountName, data) => {
    const organizedState = {
        accountName,
        transfers: data.transfers,
        balance: 0,
        addresses: {},
        unconfirmedBundleTails: {},
        txHashesForUnspentAddresses: [],
        pendingTxHashesForSpentAddresses: [],
    };

    const normalizedTransactionsList = map(organizedState.transfers, (tx) => tx);

    return formatAddressesAndBalance(data.addresses)
        .then(({ addresses, balance }) => {
            organizedState.addresses = addresses;
            organizedState.balance = balance;

            return prepareForAutoPromotion(
                normalizedTransactionsList,
                organizedState.addresses,
                accountName,
            );
        })
        .then((unconfirmedBundleTails) => {
            organizedState.unconfirmedBundleTails = unconfirmedBundleTails;

            return getLatestTransactionHashes(normalizedTransactionsList, organizedState.addresses);
        })
        .then(({ txHashesForUnspentAddresses, pendingTxHashesForSpentAddresses }) => {
            organizedState.txHashesForUnspentAddresses = txHashesForUnspentAddresses;
            organizedState.pendingTxHashesForSpentAddresses = pendingTxHashesForSpentAddresses;

            console.log('Organized state', organizedState);
            return organizedState;
        });
};

/**
 *   Gets information associated with a seed from the ledger.
 *   - Communicates with node by checking its information. (getNodeInfoAsync)
 *   - Gets all used addresses (addresses with transactions) from the ledger. (getAllAddresses)
 *   - Gets all transaction objects associated with the addresses. (findTransactionObjectsAsync({ addresses }))
 *   - Grabs all bundle hashes and get transaction objects associated with those. (findTransactionObjectsAsync({ bundles }))
 *   - Gets confirmation states from all transactions from the ledger. (getLatestInclusionAsync)
 *   - Maps confirmations on transaction objects.
 *   - Removes duplicates (reattachments) for confirmed transfers - A neat trick to avoid expensive bundle creation for reattachments.
 *   - Organizes account info. (organizeAccountInfo({ transfers: [], addresses: [] }))
 *
 *   @method getAccountData
 *   @param {string} seed
 *   @param {string} accountName - Account name selected by the user.
 *   @returns {Promise}
 **/
export const getAccountData = (seed, accountName, genFn) => {
    const bundleHashes = new Set();

    const cached = {
        tailTransactions: [],
        transactionObjects: [],
    };

    const data = {
        addresses: [],
        transfers: [],
    };

    return getNodeInfoAsync()
        .then(() => getAllAddresses(seed, genFn))
        .then((addresses) => {
            data.addresses = addresses;

            return findTransactionObjectsAsync({ addresses: data.addresses });
        })
        .then((transactionObjects) => {
            each(transactionObjects, (tx) => bundleHashes.add(tx.bundle)); // Grab all bundle hashes

            return findTransactionObjectsAsync({ bundles: Array.from(bundleHashes) });
        })
        .then((transactionObjects) => {
            cached.transactionObjects = transactionObjects;

            each(transactionObjects, (tx) => {
                if (tx.currentIndex === 0) {
                    // Keep track of all tail transactions to check confirmations
                    cached.tailTransactions = unionBy(cached.tailTransactions, [tx], 'hash');
                }
            });

            return getLatestInclusionAsync(map(cached.tailTransactions, (tx) => tx.hash));
        })
        .then((states) => {
            data.transfers = normalizedBundlesFromTransactionObjects(
                cached.tailTransactions,
                cached.transactionObjects,
                states,
                data.addresses,
            );

            return organizeAccountState(accountName, data);
        });
};

/**
 *   Aims to sync cached state with the ledger's.
 *   - Updates balances and spent statuses for all seen addresses in local state. (formatAddressesAndBalance)
 *   - Checks for new transfers on unspent addresses.
 *   - Checks for new transfers on spent addresses with pending transfers.
 *   - Syncs new transfers if found on the ledger.
 *   - Updates addresses used in newly found transfers, by marking them as spent.
 *   - Adds newly found (valid and pending) transfers for promotion.
 *   - Checks confirmation states for pending tail transaction hashes.
 *   - Removes bundle hashes for confirmed transfers for (unconfirmedBundleTails) to avoid promotion.
 *
 *   @method syncAccount
 *   @param {string} seed
 *   @param {object} existingAccountState - Account object
 *
 *   @returns {Promise<object>}
 **/
export const syncAccount = (existingAccountState) => {
    const thisStateCopy = cloneDeep(existingAccountState);
    const normalizedTransactionsList = map(thisStateCopy.transfers, (tx) => tx);

    return getLatestTransactionHashes(normalizedTransactionsList, thisStateCopy.addresses)
        .then(({ txHashesForUnspentAddresses, pendingTxHashesForSpentAddresses }) => {
            // Get difference of transaction hashes from local state and ledger state
            const diff = getHashesDiff(
                thisStateCopy.txHashesForUnspentAddresses,
                txHashesForUnspentAddresses,
                thisStateCopy.pendingTxHashesForSpentAddresses,
                pendingTxHashesForSpentAddresses,
            );

            // Set new latest transaction hashes against current state copy.
            thisStateCopy.txHashesForUnspentAddresses = txHashesForUnspentAddresses;
            thisStateCopy.pendingTxHashesForSpentAddresses = pendingTxHashesForSpentAddresses;

            return size(diff)
                ? syncTransfers(diff, thisStateCopy)
                : Promise.resolve({
                    transfers: thisStateCopy.transfers,
                    newNormalizedTransfers: {},
                });
        })
        .then(({ transfers, newNormalizedTransfers }) => {
            thisStateCopy.transfers = transfers;

            // Transform new transfers by bundle for promotion.
            return prepareForAutoPromotion(
                map(newNormalizedTransfers, (tx) => tx),
                thisStateCopy.addresses,
                thisStateCopy.accountName,
            );
        })
        .then((newUnconfirmedBundleTails) => {
            thisStateCopy.unconfirmedBundleTails = merge(
                {},
                thisStateCopy.unconfirmedBundleTails,
                newUnconfirmedBundleTails,
            );

            // Grab all tail transactions hashes for pending transactions
            const pendingTxTailsHashes = getPendingTxTailsHashes(thisStateCopy.transfers);

            return getConfirmedTransactionHashes(pendingTxTailsHashes);
        })
        .then((confirmedTransactionsHashes) => {
            if (!isEmpty(confirmedTransactionsHashes)) {
                thisStateCopy.transfers = markTransfersConfirmed(thisStateCopy.transfers, confirmedTransactionsHashes);

                // Grab all bundle hashes for confirmed transaction hashes
                // At this point unconfirmedBundleTails (for promotion) should be updated
                const confirmedBundleHashes = getBundleHashesForNewlyConfirmedTransactions(
                    thisStateCopy.unconfirmedBundleTails,
                    confirmedTransactionsHashes,
                );

                // All bundle hashes that are now confirmed should be removed from the dictionary.
                thisStateCopy.unconfirmedBundleTails = omit(
                    thisStateCopy.unconfirmedBundleTails,
                    confirmedBundleHashes,
                );
            }

            return formatAddressesAndBalance(keys(thisStateCopy.addresses));
        })
        .then(({ addresses, balance }) => {
            thisStateCopy.addresses = addresses;
            thisStateCopy.balance = balance;

            return thisStateCopy;
        });
};

/**
 *   Sync local account after a new transfer is made.
 *   - Assign persistence to each tx object.
 *   - Append new transfer to existing transfers.
 *   - Mark used addresses as spent from local account state.
 *   - Keep a copy of tail transaction categorized by bundle hash for promotion in case its a value transfer.
 *   - Sync transaction hashes for unspent addresses.
 *   - Sync pending transaction hashes for spent addresses.
 *
 *   @method updateAccountAfterSpending
 *   @param {string} name
 *   @param {array} newTransfer
 *   @param {object} accountState
 *   @param {boolean} isValueTransfer
 *
 *   @returns {Promise<object>}
 **/
export const syncAccountAfterSpending = (name, newTransfer, accountState, isValueTransfer) => {
    const tailTransaction = find(newTransfer, { currentIndex: 0 });
    const normalizedTransfer = normalizeBundle(
        [newTransfer],
        keys(accountState.addresses),
        [tailTransaction],
        false
    );

    // Assign normalized transfer to existing transfers
    const transfers = mergeNewTransfers(normalizedTransfer, accountState.transfers);

    // Turn on spent flag for addresses that were used in this transfer
    const addresses = markAddressesAsSpentSync([newTransfer], accountState.addresses);

    let unconfirmedBundleTails = accountState.unconfirmedBundleTails;

    // Keep track of this transfer in unconfirmed tails so that it can be picked up for promotion
    // Also check if it was a value transfer
    // Only update unconfirmedBundleTails for promotion/reattachment if its a value transfer
    if (isValueTransfer) {
        const bundle = get(newTransfer, '[0].bundle');

        unconfirmedBundleTails = merge({}, unconfirmedBundleTails, {
            [bundle]: {
                hash: tailTransaction.hash,
                attachmentTimestamp: tailTransaction.attachmentTimestamp,
                account: name // Assign account name to each tx
            }
        });
    }

    return getLatestTransactionHashes(map(transfers, (tx) => tx), addresses).then(
        ({ txHashesForUnspentAddresses, pendingTxHashesForSpentAddresses }) => {
            const newState = {
                ...accountState,
                transfers,
                addresses,
                unconfirmedBundleTails,
                txHashesForUnspentAddresses,
                pendingTxHashesForSpentAddresses,
            };

            return {
                newState,
                normalizedTransfer,
                transfer: newTransfer,
            };
        },
    );
};

/**
 *   Sync local account after a bundle is replayed.
 *   - Assign persistence to each tx object.
 *   - Append new reattachment to existing transfers.
 *   - Assign account name to tail transaction of reattachment and appends it to the list of tail transactions categorized by bundle hashes.
 *   - Sync transaction hashes for unspent addresses.
 *   - Sync pending transaction hashes for spent addresses.
 *
 *   @method syncAccountAfterReattachment
 *   @param {string} accountName
 *   @param {array} reattachment
 *   @param {object} accountState
 *
 *   @returns {Promise<object>} - Resolves an object with new account state and the new reattachment.
 **/
export const syncAccountAfterReattachment = (accountName, reattachment, accountState) => {
    const tailTransaction = find(reattachment, { currentIndex: 0 });

    const normalizedReattachment = normalizeBundle(
        [reattachment],
        keys(accountState.addresses),
        [tailTransaction],
        false
    );

    // Merge into existing transfers
    const transfers = mergeNewTransfers(normalizedReattachment, accountState.transfers);
    const bundle = get(reattachment, '[0].bundle');

    // This check would is very redundant but to make sure state is never messed up,
    // We make sure we check if bundle hash exists.
    // Also the usage of unionBy is to have a safety check that we do not end up storing duplicate hashes
    // https://github.com/iotaledger/iri/issues/463
    const updatedUnconfirmedBundleTails = assign({}, accountState.unconfirmedBundleTails, {
        [bundle]:
            bundle in accountState.unconfirmedBundleTails
                ? unionBy(
                    [{
                        hash: tailTransaction.hash,
                        attachmentTimestamp: tailTransaction.attachmentTimestamp,
                        account: accountName
                    }],
                    accountState.unconfirmedBundleTails[bundle],
                    'hash'
                )
                : [{
                    hash: tailTransaction.hash,
                    attachmentTimestamp: tailTransaction.attachmentTimestamp,
                    account: accountName
                }],
    });

    const addresses = accountState.addresses;
    
    return getLatestTransactionHashes(map(transfers, (tx) => tx), addresses).then(
        ({ txHashesForUnspentAddresses, pendingTxHashesForSpentAddresses }) => {
            const newState = {
                ...accountState,
                transfers,
                addresses,
                unconfirmedBundleTails: updatedUnconfirmedBundleTails,
                txHashesForUnspentAddresses,
                pendingTxHashesForSpentAddresses,
            };

            return {
                newState,
                reattachment,
                normalizedReattachment
            };
        },
    );
};
