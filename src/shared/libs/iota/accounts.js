import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import map from 'lodash/map';
import find from 'lodash/find';
import filter from 'lodash/filter';
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
 *   @param {string} provider
 *   @returns {function(object, string, [object]): Promise<{{accountName: {string}, transactions: {array}, addressData: {array} }}>}
 **/
export const getAccountData = (provider) => (seedStore, accountName, existingAccountState = {}) => {
    let data = {
        addresses: [],
        balances: [],
        wereSpent: [],
    };

    const existingAddressData = get(existingAccountState, 'addressData') || [];
    const existingTransactions = get(existingAccountState, 'transactions') || [];
    const existingTransactionsHashes = map(existingTransactions, (transaction) => transaction.hash);

    return throwIfNodeNotHealthy(provider)
        .then(() => getFullAddressHistory(provider)(seedStore, existingAccountState))
        .then((history) => {
            data = { ...data, ...history };

            return syncTransactions(provider)(
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
                    ? syncAddresses(provider)(seedStore, thisStateCopy.addressData, thisStateCopy.transactions)
                    : Promise.resolve(thisStateCopy.addressData),
        )
        .then((addressData) => {
            thisStateCopy.addressData = addressData;

            return findTransactionsAsync(provider)({
                addresses: map(thisStateCopy.addressData, (addressObject) => addressObject.address),
            });
        })
        .then((newHashes) =>
            syncTransactions(provider)(
                getTransactionsDiff(map(thisStateCopy.transactions, (transaction) => transaction.hash), newHashes),
                thisStateCopy.transactions,
            ),
        )
        .then((transactions) => {
            // Trigger notification callback with new incoming transactions and confirmed value transactions
            // TODO: New incoming transactions & confirmed value transactions should be detected within selectors or component update lifecycle methods.
            const existingNormalisedTransactions = mapNormalisedTransactions(
                thisStateCopy.transactions,
                thisStateCopy.addressData,
            );
            const allNormalisedTransactions = mapNormalisedTransactions(transactions, thisStateCopy.addressData);

            if (notificationFn) {
                notificationFn(
                    thisStateCopy.accountName,
                    filter(
                        allNormalisedTransactions,
                        (transfer) => transfer.incoming && !existingNormalisedTransactions.transfers[transfer.bundle],
                    ),
                    filter(
                        allNormalisedTransactions,
                        (transfer) =>
                            transfer.persistence &&
                            transfer.transferValue > 0 &&
                            existingNormalisedTransactions.transfers[transfer.bundle] &&
                            !existingNormalisedTransactions.transfers[transfer.bundle].persistence,
                    ),
                );
            }

            thisStateCopy.transactions = transactions;

            return mapLatestAddressData(provider)(thisStateCopy.addressData, thisStateCopy.transactions);
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
 *   @method updateAccountAfterSpending
 *   @param {string} [provider]
 *
 *   @returns {function(string, string, array, object, boolean, function): Promise<object>}
 **/
export const syncAccountAfterSpending = (provider) => (seedStore, newTransactions, accountState) => {
    // Update transactions
    const updatedTransactions = [
        ...accountState.transactions,
        ...map(newTransactions, (transaction) => ({
            ...transaction,
            // Assign persistence as false
            persistence: false,
            // Since these transactions were successfully broadcasted, assign broadcast status as true
            broadcasted: true,
        })),
    ];
    // Update address data
    const updatedAddressData = markAddressesAsSpentSync([newTransactions], accountState.addressData);

    return (
        syncAddresses(provider)(seedStore, updatedAddressData, updatedTransactions)
            // Map latest address data (spend statuses & balances) to addresses
            .then((latestAddressData) => mapLatestAddressData(provider)(latestAddressData, updatedTransactions))
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
        ...map(reattachment, (transaction) => ({ ...transaction, persistence: false, broadcasted: true })),
    ],
});

/**
 *  Sync local account in case signed inputs were exposed to the network (and the network call failed)
 *
 *   @method syncAccountOnValueTransactionFailure
 *   @param {array} newTransactionObjects
 *   @param {object} accountState
 *
 *   @returns {object}
 **/
export const syncAccountOnValueTransactionFailure = (newTransactionObjects, accountState) => {
    const failedTransactions = map(newTransactionObjects, (transaction) => ({
        ...transaction,
        persistence: false,
        broadcasted: false,
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
 *  Sync local account in case signed inputs were exposed to the network (and the network call failed)
 *
 *   @method syncAccountOnValueTransactionFailure
 *   @param {array} newTransactionObjects
 *   @param {array} latestAddressData
 *   @param {object} accountState
 *
 *   @returns {object}
 **/
export const syncAccountDuringSnapshotTransition = (newTransactionObjects, latestAddressData, accountState) => {
    return {
        ...accountState,
        addressData: latestAddressData,
        transactions: [...accountState.transactions, ...newTransactionObjects],
    };
};
