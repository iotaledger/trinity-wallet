import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import includes from 'lodash/includes';
import map from 'lodash/map';
import find from 'lodash/find';
import filter from 'lodash/filter';
import orderBy from 'lodash/orderBy';
import { findTransactionsAsync } from './extendedApi';
import { syncTransactions, getTransactionsDiff, mapNormalisedTransactions } from './transfers';
import { throwIfNodeNotHealthy } from './utils';
import {
    mapLatestAddressData,
    getFullAddressHistory,
    markAddressesAsSpentSync,
    syncAddresses,
    createAddressData,
    findSpendStatusesFromTransactions,
    mergeAddressData,
} from './addresses';

/**
 *   Gets information associated with a seed from the ledger.
 *   - Checks if the currently connected IRI node is healthy
 *   - Gets all used addresses and their transaction hashes from the ledger.
 *   - Gets all transaction objects associated with the addresses.
 *   - Gets confirmation states for all transactions from the ledger.
 *   - Normalises valid bundles.
 *
 *   @method getAccountData
 *
 *   @param {object} [settings]
 *   @param {boolean} withQuorum
 *   @param {boolean} withHealthCheck
 *
 *   @returns {function(object, string, [object]): Promise<{{accountName: {string}, transactions: {array}, addressData: {array} }}>}
 **/
export const getAccountData = (settings, withQuorum, withHealthCheck = false) => (
    seedStore,
    accountName,
    existingAccountState = {},
) => {
    let data = {
        addresses: [],
        balances: [],
        wereSpent: [],
    };

    const existingAddressData = get(existingAccountState, 'addressData') || [];
    const existingAddresses = map(existingAddressData, (addressObject) => addressObject.address);
    const existingTransactions = get(existingAccountState, 'transactions') || [];
    const existingTransactionsHashes = map(
        filter(existingTransactions, (transaction) => includes(existingAddresses, transaction.address)),
        (transaction) => transaction.hash,
    );

    return (withHealthCheck ? throwIfNodeNotHealthy(settings) : Promise.resolve())
        .then(() => getFullAddressHistory(settings, withQuorum)(seedStore, existingAccountState))
        .then((history) => {
            data = { ...data, ...history };

            return syncTransactions(settings)(
                getTransactionsDiff(existingTransactionsHashes, history.hashes),
                existingTransactions,
            );
        })
        .then((transactions) => {
            // Get spent statuses of addresses from transaction objects
            const spendStatuses = findSpendStatusesFromTransactions(
                data.addresses,
                // Use both new & old transactions for finding spend statuses
                transactions,
            );

            data.wereSpent = map(data.wereSpent, (status, idx) => ({
                ...status,
                local: spendStatuses[idx],
            }));

            const addressData = createAddressData(data.addresses, data.balances, data.wereSpent);

            return {
                accountName,
                transactions,
                addressData: mergeAddressData(existingAddressData, addressData),
            };
        });
};

/**
 *   Aims to sync local state with the ledger's.
 *   - Syncs addressData
 *   - Syncs transactions.
 *
 *   @method syncAccount
 *   @param {object} [settings]
 *   @param {boolean} withQuorum
 *   @param {boolean} withHealthCheck
 *
 *   @returns {function(object, object, function, object): Promise<object>}
 **/
export const syncAccount = (settings, withQuorum, withHealthCheck = false) => (
    existingAccountState,
    seedStore,
    notificationFn,
    stateSettings,
) => {
    const thisStateCopy = cloneDeep(existingAccountState);
    const rescanAddresses = typeof seedStore === 'object';

    return (withHealthCheck ? throwIfNodeNotHealthy(settings) : Promise.resolve())
        .then(() =>
            rescanAddresses
                ? syncAddresses(settings, withQuorum)(seedStore, thisStateCopy.addressData, thisStateCopy.transactions)
                : Promise.resolve(thisStateCopy.addressData),
        )
        .then((addressData) => {
            thisStateCopy.addressData = addressData;

            return findTransactionsAsync(settings)({
                addresses: map(thisStateCopy.addressData, (addressObject) => addressObject.address),
            });
        })
        .then((newHashes) => {
            const existingAddresses = map(thisStateCopy.addressData, (addressObject) => addressObject.address);

            return syncTransactions(settings)(
                getTransactionsDiff(
                    map(
                        filter(thisStateCopy.transactions, (transaction) =>
                            includes(existingAddresses, transaction.address),
                        ),
                        (transaction) => transaction.hash,
                    ),
                    newHashes,
                ),
                thisStateCopy.transactions,
            );
        })
        .then((transactions) => {
            if (notificationFn) {
                // Trigger notification callback with new incoming transactions and confirmed value transactions
                const existingNormalisedTransactions = mapNormalisedTransactions(
                    thisStateCopy.transactions,
                    thisStateCopy.addressData,
                );
                const latestTimestamp = Object.values(existingNormalisedTransactions).reduce(
                    (max, tx) => Math.max(max, tx.timestamp),
                    0,
                );

                const allNormalisedTransactions = mapNormalisedTransactions(transactions, thisStateCopy.addressData);

                notificationFn(
                    thisStateCopy.accountName,
                    filter(
                        allNormalisedTransactions,
                        (transfer) =>
                            transfer.incoming &&
                            !existingNormalisedTransactions[transfer.bundle] &&
                            transfer.timestamp > latestTimestamp,
                    ),
                    filter(
                        allNormalisedTransactions,
                        (transfer) =>
                            transfer.persistence &&
                            transfer.transferValue > 0 &&
                            existingNormalisedTransactions[transfer.bundle] &&
                            !existingNormalisedTransactions[transfer.bundle].persistence,
                    ),
                    stateSettings,
                );
            }

            thisStateCopy.transactions = transactions;

            return mapLatestAddressData(settings, withQuorum)(thisStateCopy.addressData, thisStateCopy.transactions);
        })
        .then((addressData) => {
            thisStateCopy.addressData = addressData;

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
 *   @method syncAccountAfterSpending
 *   @param {object} [settings]
 *   @param {boolean} withQuorum
 *
 *   @returns {function(string, string, array, object, boolean, function): Promise<object>}
 **/
export const syncAccountAfterSpending = (settings, withQuorum) => (seedStore, newTransactions, accountState) => {
    // Update transactions
    const updatedTransactions = [
        ...accountState.transactions,
        ...map(newTransactions, (transaction) => ({
            ...transaction,
            // Assign persistence as false
            persistence: false,
            // Since these transactions were successfully broadcasted, assign broadcast status as true
            broadcasted: true,
            fatalErrorOnRetry: false,
        })),
    ];
    // Update address data
    const updatedAddressData = markAddressesAsSpentSync([newTransactions], accountState.addressData);

    return (
        syncAddresses(settings, withQuorum)(seedStore, updatedAddressData, updatedTransactions)
            // Map latest address data (spend statuses & balances) to addresses
            .then((latestAddressData) =>
                mapLatestAddressData(settings, withQuorum)(latestAddressData, updatedTransactions),
            )
            .then((latestAddressData) => ({ addressData: latestAddressData, transactions: updatedTransactions }))
    );
};

/**
 *   Sync local account after a bundle is replayed.
 *   - Assign persistence to each tx object.
 *   - Update transfer object with tail transaction hash of new reattachment.
 *   - Add reattachment tail transaction to auto promotion queue.
 *   - Sync transaction hashes.
 *
 *   @method syncAccountAfterReattachment
 *   @param {array} reattachment
 *   @param {object} accountState
 *
 *   @returns {object}
 **/
export const syncAccountAfterReattachment = (reattachment, accountState) => ({
    ...accountState,
    transactions: [
        ...accountState.transactions,
        ...map(reattachment, (transaction) => ({
            ...transaction,
            persistence: false,
            broadcasted: true,
            fatalErrorOnRetry: false,
        })),
    ],
});

/**
 *  Sync local account in case signed inputs were exposed to the network (and a network call failed)
 *
 *   @method syncAccountOnErrorAfterSigning
 *   @param {array} newTransactionObjects
 *   @param {object} accountState
 *   @param {boolean} hasBroadcast
 *
 *   @returns {object}
 **/
export const syncAccountOnErrorAfterSigning = (newTransactionObjects, accountState, hasBroadcast = false) => {
    const failedTransactions = map(newTransactionObjects, (transaction) => ({
        ...transaction,
        persistence: false,
        broadcasted: hasBroadcast,
        fatalErrorOnRetry: false,
    }));
    const addressData = markAddressesAsSpentSync([failedTransactions], accountState.addressData);

    return {
        ...accountState,
        addressData,
        transactions: [...accountState.transactions, ...failedTransactions],
    };
};

/**
 *  Sync account when a failed transaction was successfully stored and broadcast to the network
 *
 *   @method syncAccountOnSuccessfulRetryAttempt
 *   @param {array} newTransactionObjects
 *   @param {object} accountState
 *
 *   @returns {object}
 **/
export const syncAccountOnSuccessfulRetryAttempt = (newTransactionObjects, accountState) => {
    const bundleHash = get(newTransactionObjects, '[0].bundle');

    const updatedTransactions = map(accountState.transactions, (transaction) => {
        if (transaction.bundle === bundleHash) {
            const currentIndex = transaction.currentIndex;
            return assign({}, transaction, {
                ...find(newTransactionObjects, { currentIndex }),
                broadcasted: true,
            });
        }

        return transaction;
    });

    return {
        ...accountState,
        transactions: updatedTransactions,
    };
};

/**
 *  Syncs account when auto-retry attempt (to broadcast) a failed transaction was unsuccessful
 *
 * @method syncAccountOnUnsuccessfulAutoRetryAttempt
 *
 * @param {object} accountState
 * @param {string} bundleHash
 *
 * @returns {object} accountState
 **/
export const syncAccountOnUnsuccessfulAutoRetryAttempt = (accountState, bundleHash) => {
    const updatedTransactions = map(accountState.transactions, (transaction) => {
        if (transaction.bundle === bundleHash) {
            return assign({}, transaction, {
                fatalErrorOnRetry: true,
            });
        }

        return transaction;
    });

    return {
        ...accountState,
        transactions: updatedTransactions,
    };
};

/**
 *  Sync local account in case signed inputs were exposed to the network (and the network call failed)
 *
 *   @method syncAccountOnValueTransactionFailure
 *   @param {array} attachedTransactions
 *   @param {object} attachedAddressObject
 *   @param {object} accountState
 *
 *   @returns {object}
 **/
export const syncAccountDuringSnapshotTransition = (attachedTransactions, attachedAddressObject, accountState) => {
    // Check if attached address is already part of existing address data
    const existingAddressObject = find(accountState.addressData, { address: attachedAddressObject.address });

    return {
        ...accountState,
        addressData: existingAddressObject
            ? // If address is already part of existing address data, then simply replace the existing address object with the attached one
              map(accountState.addressData, (addressObject) => {
                  if (addressObject.address === attachedAddressObject.address) {
                      return attachedAddressObject;
                  }

                  return addressObject;
              })
            : // If address is not part of existing address data, then add it to address data
              orderBy([...accountState.addressData, attachedAddressObject], 'index', ['asc']),
        transactions: [
            ...accountState.transactions,
            ...map(attachedTransactions, (transaction) => ({
                ...transaction,
                persistence: false,
                broadcasted: true,
                fatalErrorOnRetry: false,
            })),
        ],
    };
};
