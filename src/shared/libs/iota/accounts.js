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
    getAddressDataAndFormatBalance,
    getFullAddressHistory,
    markAddressesAsSpentSync,
    syncAddresses,
    accumulateBalance,
    formatAddressData,
    findSpendStatusesFromTransactionObjects,
} from './addresses';
import { EMPTY_HASH_TRYTES, throwIfNodeNotHealthy } from './utils';

/**
 *   Takes in account data fetched from ledger.
 *   Formats addresses as an object { index, spent, checksum, balance }.
 *   Accumulates total balance.
 *   Prepares transactions for auto promotion.
 *
 *   @method organiseAccountState
 *
 *   @returns {function(string, object): Promise<object>}
 **/
const organiseAccountState = (provider) => (accountName, partialAccountData) => {
    const organisedState = {
        accountName,
        transfers: partialAccountData.transfers,
        balance: 0,
        addresses: {},
        unconfirmedBundleTails: {},
        hashes: partialAccountData.hashes,
    };

    const { addresses, balances, wereSpent } = partialAccountData;

    organisedState.addresses = formatAddressData(addresses, balances, wereSpent);

    organisedState.balance = accumulateBalance(partialAccountData.balances);

    const normalisedTransactionsList = map(organisedState.transfers, (tx) => tx);

    return prepareForAutoPromotion(provider)(normalisedTransactionsList, organisedState.addresses, accountName).then(
        (unconfirmedBundleTails) => {
            organisedState.unconfirmedBundleTails = unconfirmedBundleTails;

            return organisedState;
        },
    );
};

/**
 *   Gets information associated with a seed from the ledger.
 *   - Checks if the currently connected IRI node is healthy
 *   - Gets all used addresses and their transaction hashes from the ledger.
 *   - Gets all transaction objects associated with the addresses.
 *   - Grabs all bundle hashes and get transaction objects associated with those.
 *   - Gets confirmation states for all transactions from the ledger.
 *   - Normalises valid bundles.
 *   - Organises account info.
 *
 *   @method getAccountData
 *
 *   @param {string} provider
 *   @returns {function(object, string, function): Promise<object>}
 **/
export const getAccountData = (provider) => (seedStore, accountName) => {
    const bundleHashes = new Set();

    const cached = {
        tailTransactions: [],
        transactionObjects: [],
    };

    let data = {
        addresses: [],
        transfers: [],
        balances: [],
        wereSpent: [],
        hashes: [],
    };

    return throwIfNodeNotHealthy(provider)
        .then(() => getFullAddressHistory(provider)(seedStore))
        .then((history) => {
            data = { ...data, ...history };

            return getTransactionsObjectsAsync(provider)(history.hashes);
        })
        .then((transactionObjects) => {
            each(transactionObjects, (tx) => {
                if (tx.bundle !== EMPTY_HASH_TRYTES) {
                    bundleHashes.add(tx.bundle);
                }
            });

            return findTransactionObjectsAsync(provider)({ bundles: Array.from(bundleHashes) });
        })
        .then((transactionObjects) => {
            cached.transactionObjects = transactionObjects;

            // Get spent statuses of addresses from transaction objects
            const spendStatuses = findSpendStatusesFromTransactionObjects(data.addresses, cached.transactionObjects);

            data.wereSpent = map(data.wereSpent, (status, idx) => ({ ...status, local: spendStatuses[idx] }));

            each(transactionObjects, (tx) => {
                if (tx.currentIndex === 0) {
                    // Keep track of all tail transactions to check confirmations
                    cached.tailTransactions = unionBy(cached.tailTransactions, [tx], 'hash');
                }
            });

            return getLatestInclusionAsync(provider)(map(cached.tailTransactions, (tx) => tx.hash));
        })
        .then((states) => {
            data.transfers = constructNormalisedBundles(
                cached.tailTransactions,
                cached.transactionObjects,
                states,
                data.addresses,
            );

            return organiseAccountState(provider)(accountName, data);
        });
};

/**
 *   Aims to sync local state with the ledger's.
 *   - Updates balances and spent statuses for all seen addresses in local state.
 *   - Checks for new transfers on addresses.
 *   - Syncs new transfers if found on the ledger.
 *   - Updates addresses used in newly found transfers, by marking them as spent.
 *   - Adds newly found (valid and pending) transfers for promotion.
 *   - Checks confirmation states for pending tail transaction hashes.
 *   - Removes bundle hashes for confirmed transfers from auto promotion queue.
 *
 *   @method syncAccount
 *   @param {string} [provider]
 *
 *   @returns {function(object, object, function): Promise<object>}
 **/
export const syncAccount = (provider) => (existingAccountState, seedStore, notificationFn) => {
    const thisStateCopy = cloneDeep(existingAccountState);
    const rescanAddresses = typeof seedStore === 'object';

    return throwIfNodeNotHealthy(provider)
        .then(
            () =>
                rescanAddresses
                    ? syncAddresses(provider)(
                          seedStore,
                          thisStateCopy.addresses,
                          map(thisStateCopy.transfers, (tx) => tx),
                      )
                    : Promise.resolve(thisStateCopy.addresses),
        )
        .then((latestAddressData) => {
            thisStateCopy.addresses = latestAddressData;

            return findTransactionsAsync(provider)({ addresses: keys(thisStateCopy.addresses) });
        })
        .then((newHashes) => {
            // Get difference of transaction hashes from local state and ledger state
            const diff = getTransactionsDiff(thisStateCopy.hashes, newHashes);

            // Set new latest transaction hashes against current state copy.
            thisStateCopy.hashes = newHashes;

            return size(diff)
                ? syncTransfers(provider)(diff, thisStateCopy)
                : Promise.resolve({
                      transfers: thisStateCopy.transfers,
                      newNormalisedTransfers: {},
                      outOfSyncTransactionHashes: [],
                  });
        })
        .then(({ transfers, newNormalisedTransfers, outOfSyncTransactionHashes }) => {
            //Trigger notification callback with new incoming transactions and confirmed value transactions
            if (notificationFn) {
                notificationFn(
                    thisStateCopy.accountName,
                    filter(transfers, (transfer) => transfer.incoming && !thisStateCopy.transfers[transfer.bundle]),
                    filter(
                        transfers,
                        (transfer) =>
                            transfer.persistence &&
                            transfer.transferValue > 0 &&
                            thisStateCopy.transfers[transfer.bundle] &&
                            !thisStateCopy.transfers[transfer.bundle].persistence,
                    ),
                );
            }

            thisStateCopy.transfers = transfers;

            // Keep only synced transaction hashes so that the next cycle tries to re-sync
            thisStateCopy.hashes = filter(thisStateCopy.hashes, (hash) => !includes(outOfSyncTransactionHashes, hash));

            // Transform new transfers by bundle for promotion.
            return prepareForAutoPromotion(provider)(
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

            return getConfirmedTransactionHashes(provider)(pendingTxTailsHashes);
        })
        .then((confirmedTransactionsHashes) => {
            if (!isEmpty(confirmedTransactionsHashes)) {
                thisStateCopy.transfers = markTransfersConfirmed(thisStateCopy.transfers, confirmedTransactionsHashes);

                // Grab all bundle hashes for confirmed transaction hashes
                const confirmedBundleHashes = getBundleHashesForNewlyConfirmedTransactions(
                    thisStateCopy.unconfirmedBundleTails,
                    confirmedTransactionsHashes,
                );

                // All bundle hashes that are now confirmed should be removed from auto promotion queue.
                thisStateCopy.unconfirmedBundleTails = omit(
                    thisStateCopy.unconfirmedBundleTails,
                    confirmedBundleHashes,
                );
            }

            const addresses = keys(thisStateCopy.addresses);
            const keyIndexes = map(addresses, (address) => thisStateCopy.addresses[address].index);

            return getAddressDataAndFormatBalance(provider)(
                addresses,
                map(thisStateCopy.transfers, (tx) => tx),
                keyIndexes,
            );
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
 *   - If value transfer, add it to auto promotion queue.
 *   - Sync transaction hashes.
 *
 *   @method updateAccountAfterSpending
 *   @param {string} [provider]
 *
 *   @returns {function(string, string, array, object, boolean, function): Promise<object>}
 **/
export const syncAccountAfterSpending = (provider) => (seedStore, name, newTransfer, accountState, isValueTransfer) => {
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

    // Add transfer for auto promotion
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

    return syncAddresses(provider)(seedStore, addressData, map(transfers, (tx) => tx)).then((newAddressData) => {
        const newState = {
            ...accountState,
            transfers,
            addresses: newAddressData,
            unconfirmedBundleTails,
            hashes: [...accountState.hashes, ...ownTransactionHashesForThisTransfer],
        };

        return {
            newState,
            normalisedTransfer,
            transfer: newTransfer,
        };
    });
};

/**
 *   Sync local account after a bundle is replayed.
 *   - Assign persistence to each tx object.
 *   - Update transfer object with tail transaction hash of new reattachment.
 *   - Add reattachment tail transaction to auto promotion queue.
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
        hashes: [...accountState.hashes, ...ownTransactionHashesForThisTransfer],
    };

    return {
        newState,
        normalisedTransfer: newNormalisedTransfer,
        transfer: transaction,
    };
};

/**
 *  Sync local account in case signed inputs were exposed to the network (and the network call failed)
 *
 *   @method syncAccountOnValueTransactionFailure
 *   @param {array} newTransfer
 *   @param {object} addressData
 *   @param {object} accountState
 *
 *   @returns {object}
 **/
export const syncAccountDuringSnapshotTransition = (newTransfer, addressData, accountState) => {
    const tailTransaction = find(newTransfer, { currentIndex: 0 });
    const latestAddressData = merge({}, accountState.addresses, addressData);

    const normalisedTransfer = normaliseBundle(newTransfer, keys(latestAddressData), [tailTransaction], false);

    // Assign normalised transfer to existing transfers
    const transfers = mergeNewTransfers(
        {
            [normalisedTransfer.bundle]: normalisedTransfer,
        },
        accountState.transfers,
    );

    const newState = {
        ...accountState,
        balance: accumulateBalance(map(latestAddressData, (data) => data.balance)),
        transfers,
        addresses: latestAddressData,
        hashes: [...accountState.hashes, ...map(newTransfer, (tx) => tx.hash)],
    };

    return {
        newState,
        normalisedTransfer,
    };
};
