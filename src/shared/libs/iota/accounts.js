import cloneDeep from 'lodash/cloneDeep';
import each from 'lodash/each';
import size from 'lodash/size';
import get from 'lodash/get';
import map from 'lodash/map';
import keys from 'lodash/keys';
import merge from 'lodash/merge';
import find from 'lodash/find';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import unionBy from 'lodash/unionBy';
import {
    isNodeSynced,
    findTransactionObjectsAsync,
    getLatestInclusionAsync,
    getTransactionsObjectsAsync,
    findTransactionsAsync,
} from './extendedApi';
import {
    prepareForAutoPromotion,
    syncTransfers,
    getPendingTxTailsHashes,
    getConfirmedTransactionHashes,
    markTransfersConfirmed,
    getBundleHashesForNewlyConfirmedTransactions,
    getTransactionsDiff,
    constructNormalisedBundles,
    normaliseBundle,
    mergeNewTransfers,
    getOwnTransactionHashes,
} from './transfers';
import {
    getFullAddressHistory,
    getAddressDataAndFormatBalance,
    markAddressesAsSpentSync,
    syncAddresses,
} from './addresses';
import Errors from '../errors';

/**
 *   Takes in account data fetched from ledger.
 *   Formats addresses.
 *   Accumulates total balance (getAddressDataAndFormatBalance).
 *   Prepare transactions for auto promotion.
 *
 *   @method organiseAccountState
 *   @param {string} accountName
 *   @param {object} partialAccountData
 *
 *   @returns {Promise<object>}
 **/
const organiseAccountState = (accountName, partialAccountData) => {
    const organisedState = {
        accountName,
        transfers: partialAccountData.transfers,
        balance: 0,
        addresses: {},
        unconfirmedBundleTails: {},
        hashes: [],
    };

    const normalisedTransactionsList = map(organisedState.transfers, (tx) => tx);

    return getAddressDataAndFormatBalance(partialAccountData.addresses)
        .then(({ addresses, balance }) => {
            organisedState.addresses = addresses;
            organisedState.balance = balance;

            return prepareForAutoPromotion(normalisedTransactionsList, organisedState.addresses, accountName);
        })
        .then((unconfirmedBundleTails) => {
            organisedState.unconfirmedBundleTails = unconfirmedBundleTails;

            return findTransactionsAsync({ addresses: keys(organisedState.addresses) });
        })
        .then((hashes) => {
            organisedState.hashes = hashes;

            return organisedState;
        });
};

/**
 *   Gets information associated with a seed from the ledger.
 *   - Checks if the currently connected IRI node is healthy
 *   - Gets all used addresses and their transaction hashes from the ledger. (getFullAddressHistory)
 *   - Gets all transaction objects associated with the addresses. (getTransactionObjectsAsync(hashes))
 *   - Grabs all bundle hashes and get transaction objects associated with those. (findTransactionObjectsAsync({ bundles }))
 *   - Gets confirmation states from all transactions from the ledger. (getLatestInclusionAsync)
 *   - Normalise bundles
 *   - Organises account info. (organiseAccountInfo({ transfers: {}, addresses: [] }))
 *
 *   @method getAccountData
 *   @param {string} seed
 *   @param {string} accountName - Account name selected by the user.
 *   @param {function} genFn
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

    return isNodeSynced()
        .then((isSynced) => {
            if (!isSynced) {
                throw new Error(Errors.NODE_NOT_SYNCED);
            }

            return getFullAddressHistory(seed, genFn);
        })
        .then(({ addresses, hashes }) => {
            data.addresses = addresses;

            return getTransactionsObjectsAsync(hashes);
        })
        .then((transactionObjects) => {
            each(transactionObjects, (tx) => {
                if (tx.bundle !== '9'.repeat(81)) {
                    bundleHashes.add(tx.bundle);
                }
            });

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
            data.transfers = constructNormalisedBundles(
                cached.tailTransactions,
                cached.transactionObjects,
                states,
                data.addresses,
            );

            return organiseAccountState(accountName, data);
        });
};

/**
 *   Aims to sync cached state with the ledger's.
 *   - Updates balances and spent statuses for all seen addresses in local state. (getAddressDataAndFormatBalance)
 *   - Checks for new transfers on unspent addresses.
 *   - Checks for new transfers on spent addresses with pending transfers.
 *   - Syncs new transfers if found on the ledger.
 *   - Updates addresses used in newly found transfers, by marking them as spent.
 *   - Adds newly found (valid and pending) transfers for promotion.
 *   - Checks confirmation states for pending tail transaction hashes.
 *   - Removes bundle hashes for confirmed transfers for (unconfirmedBundleTails) to avoid promotion.
 *
 *   @method syncAccount
 *   @param {*} seed
 *   @param {object} existingAccountState - Account object
 *   @param {boolean} rescanAddresses
 *   @param {function} genFn - Entangled addresses generation method
 *   @param {boolean} withNewAddresses
 *
 *   @returns {Promise<object>}
 **/
export const syncAccount = (
    existingAccountState,
    seed = null,
    rescanAddresses = false,
    genFn = null,
    withNewAddresses = false,
) => {
    const thisStateCopy = cloneDeep(existingAccountState);

    return (rescanAddresses
        ? syncAddresses(seed, thisStateCopy.addresses, genFn, withNewAddresses)
        : Promise.resolve(thisStateCopy.addresses)
    )
        .then((latestAddressData) => {
            thisStateCopy.addresses = latestAddressData;

            return findTransactionsAsync({ addresses: keys(thisStateCopy.addresses) });
        })
        .then((newHashes) => {
            // Get difference of transaction hashes from local state and ledger state
            const diff = getTransactionsDiff(thisStateCopy.hashes, newHashes);

            // Set new latest transaction hashes against current state copy.
            thisStateCopy.hashes = newHashes;

            return size(diff)
                ? syncTransfers(diff, thisStateCopy)
                : Promise.resolve({
                      transfers: thisStateCopy.transfers,
                      newNormalisedTransfers: {},
                      outOfSyncTransactionHashes: [],
                  });
        })
        .then(({ transfers, newNormalisedTransfers, outOfSyncTransactionHashes }) => {
            thisStateCopy.transfers = transfers;

            // Keep only synced transaction hashes so that the next cycle tries to re-sync
            thisStateCopy.hashes = filter(thisStateCopy.hashes, (hash) => !includes(outOfSyncTransactionHashes, hash));

            // Transform new transfers by bundle for promotion.
            return prepareForAutoPromotion(
                map(newNormalisedTransfers, (tx) => tx),
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

            return getAddressDataAndFormatBalance(keys(thisStateCopy.addresses));
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
 *   - Merge new transfer to existing transfers.
 *   - Mark used addresses as spent locally.
 *   - Keep a copy of tail transaction categorised by bundle hash for promotion in case its a value transfer.
 *   - Sync transaction hashes.
 *
 *   @method updateAccountAfterSpending
 *   @param {string} name
 *   @param {array} newTransfer
 *   @param {object} accountState
 *   @param {boolean} isValueTransfer
 *
 *   @returns {object}
 **/
export const syncAccountAfterSpending = (name, newTransfer, accountState, isValueTransfer) => {
    const tailTransaction = find(newTransfer, { currentIndex: 0 });
    const normalisedTransfer = normaliseBundle(newTransfer, keys(accountState.addresses), [tailTransaction], false);

    // Assign normalised transfer to existing transfers
    const transfers = mergeNewTransfers(
        {
            [normalisedTransfer.bundle]: normalisedTransfer,
        },
        accountState.transfers,
    );

    let unconfirmedBundleTails = accountState.unconfirmedBundleTails;

    // Keep track of this transfer in unconfirmed tails so that it can be picked up for promotion
    // Also check if it was a value transfer
    // Only update unconfirmedBundleTails for promotion/reattachment if its a value transfer
    if (isValueTransfer) {
        const bundle = get(newTransfer, '[0].bundle');

        unconfirmedBundleTails = merge({}, unconfirmedBundleTails, {
            [bundle]: [
                {
                    hash: tailTransaction.hash,
                    attachmentTimestamp: tailTransaction.attachmentTimestamp,
                    account: name, // Assign account name to each tx
                },
            ],
        });
    }

    // Turn on spent flag for addresses that were used in this transfer
    const addressData = markAddressesAsSpentSync([newTransfer], accountState.addresses);
    const ownTransactionHashesForThisTransfer = getOwnTransactionHashes(normalisedTransfer, accountState.addresses);

    const newState = {
        ...accountState,
        transfers,
        addresses: addressData,
        unconfirmedBundleTails,
        hashes: [...accountState.hashes, ...ownTransactionHashesForThisTransfer],
    };

    return {
        newState,
        normalisedTransfer,
        transfer: newTransfer,
    };
};

/**
 *   Sync local account after a bundle is replayed.
 *   - Assign persistence to each tx object.
 *   - Append new reattachment to existing transfers.
 *   - Add reattachment tail transaction to unconfirmedBundleTails for auto promotion.
 *   - Sync transaction hashes.
 *
 *   @method syncAccountAfterReattachment
 *   @param {string} accountName
 *   @param {array} reattachment
 *   @param {object} accountState
 *
 *   @returns {object}
 **/
export const syncAccountAfterReattachment = (accountName, reattachment, accountState) => {
    const tailTransaction = find(reattachment, { currentIndex: 0 });

    const normalisedReattachment = normaliseBundle(
        reattachment,
        keys(accountState.addresses),
        [tailTransaction],
        false,
    );

    // Merge into existing transfers
    const transfers = mergeNewTransfers(
        {
            [normalisedReattachment.bundle]: normalisedReattachment,
        },
        accountState.transfers,
    );
    const bundle = get(reattachment, '[0].bundle');

    // This check would is very redundant but to make sure state is never messed up,
    // We make sure we check if bundle hash exists.
    // Also the usage of unionBy is to have a safety check that we do not end up storing duplicate hashes
    // https://github.com/iotaledger/iri/issues/463
    const updatedUnconfirmedBundleTails = merge({}, accountState.unconfirmedBundleTails, {
        [bundle]:
            bundle in accountState.unconfirmedBundleTails
                ? unionBy(
                      [
                          {
                              hash: tailTransaction.hash,
                              attachmentTimestamp: tailTransaction.attachmentTimestamp,
                              account: accountName,
                          },
                      ],
                      accountState.unconfirmedBundleTails[bundle],
                      'hash',
                  )
                : [
                      {
                          hash: tailTransaction.hash,
                          attachmentTimestamp: tailTransaction.attachmentTimestamp,
                          account: accountName,
                      },
                  ],
    });

    const ownTransactionHashesForThisReattachment = getOwnTransactionHashes(
        normalisedReattachment,
        accountState.addresses,
    );

    const newState = {
        ...accountState,
        transfers,
        unconfirmedBundleTails: updatedUnconfirmedBundleTails,
        hashes: [...accountState.hashes, ...ownTransactionHashesForThisReattachment],
    };

    return {
        newState,
        reattachment,
        normalisedReattachment,
    };
};

/**
 *  Sync local account in case signed inputs were exposed to the network (and the network call failed)
 *
 *   @method syncAccountOnValueTransactionFailure
 *   @param {array} newTransfer
 *   @param {object} accountState
 *
 *   @returns {object}
 **/
export const syncAccountOnValueTransactionFailure = (newTransfer, accountState) => {
    const tailTransaction = find(newTransfer, { currentIndex: 0 });
    const normalisedTransfer = normaliseBundle(newTransfer, keys(accountState.addresses), [tailTransaction], false);

    // Assign normalised transfer to existing transfers
    const transfers = mergeNewTransfers(
        {
            [normalisedTransfer.bundle]: normalisedTransfer,
        },
        accountState.transfers,
    );

    const addressData = markAddressesAsSpentSync([newTransfer], accountState.addresses);

    const newState = {
        ...accountState,
        transfers,
        addresses: addressData,
    };

    return {
        newState,
        normalisedTransfer,
        transfer: newTransfer,
    };
};

/**
 *  Sync account when a failed transaction was successfully stored and broadcast to the network
 *
 *   @method syncAccountOnSuccessfulRetryAttempt
 *   @param {string} accountName
 *   @param {array} transaction
 *   @param {object} accountState
 *
 *   @returns {object}
 **/
export const syncAccountOnSuccessfulRetryAttempt = (accountName, transaction, accountState) => {
    const tailTransaction = find(transaction, { currentIndex: 0 });
    const newNormalisedTransfer = normaliseBundle(transaction, keys(accountState.addresses), [tailTransaction], false);
    const bundle = get(transaction, '[0].bundle');

    const transfers = merge({}, accountState.transfers, { [bundle]: newNormalisedTransfer });

    // Currently we solely rely on wereAddressesSpentFrom and since this failed transaction
    // was never broadcast, the addresses would be marked false
    // The transaction would still stop spending from these addresses because during input
    // selection, local transaction history is also checked.
    // FIXME: After using a permanent local address status, this would be unnecessary
    const addressData = markAddressesAsSpentSync([transaction], accountState.addresses);
    const ownTransactionHashesForThisTransfer = getOwnTransactionHashes(newNormalisedTransfer, accountState.addresses);

    const unconfirmedBundleTails = merge({}, accountState.unconfirmedBundleTails, {
        [bundle]: [
            {
                hash: tailTransaction.hash,
                attachmentTimestamp: tailTransaction.attachmentTimestamp,
                account: accountName,
            },
        ],
    });

    const newState = {
        ...accountState,
        unconfirmedBundleTails,
        transfers,
        addresses: addressData,
        hashes: [...accountState.hashes, ...ownTransactionHashesForThisTransfer],
    };

    return {
        newState,
        normalisedTransfer: newNormalisedTransfer,
        transfer: transaction,
    };
};
