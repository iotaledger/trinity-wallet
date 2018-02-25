import cloneDeep from 'lodash/cloneDeep';
import assign from 'lodash/assign';
import each from 'lodash/each';
import size from 'lodash/size';
import get from 'lodash/get';
import map from 'lodash/map';
import keys from 'lodash/keys';
import filter from 'lodash/filter';
import isObject from 'lodash/isObject';
import merge from 'lodash/merge';
import find from 'lodash/find';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import unionBy from 'lodash/unionBy';
import { iota } from './index';
import {
    findTransactionsAsync,
    getNodeInfoAsync,
    findTransactionObjectsAsync,
    getLatestInclusionAsync,
} from './extendedApi';
import {
    formatTransfers,
    getBundleTailsForPendingValidTransfers,
    categorizeTransactionsByPersistence,
    removeIrrelevantUnconfirmedTransfers,
    constructBundle,
    syncTransfers,
    getPendingTxTailsHashes,
    getConfirmedTransactionHashes,
    markTransfersConfirmed,
    getBundleHashesForTailTransactionHashes,
    filterConfirmedTransfers,
    getHashesDiff,
} from './transfers';
import {
    getAllAddresses,
    formatAddressesAndBalance,
    getUnspentAddressesSync,
    markAddressesAsSpentSync,
    getSpentAddressesWithPendingTransfersSync,
} from './addresses';

/**
 *   Takes in account data fetched from ledger.
 *   Formats transfers - Sort by latest to old.
 *   Formats addresses by assigning spent status and balance with each address (formatAddressesAndBalance).
 *   Accumulates total balance (formatAddressesAndBalance).
 *   Categorise valid transfers by bundle hashes and tail transactions (getBundleTailsForPendingValidTransfers).
 *
 *   @method organizeAccountInfo
 *   @param {string} accountName
 *   @param {data} [ addresses: <array>, transfers: <array> ]
 *
 *   @returns {Promise<object>}
 **/
const organizeAccountInfo = (accountName, data) => {
    const organizedData = {
        accountName,
        transfers: formatTransfers(data.transfers),
        balance: 0,
        addresses: {},
        unconfirmedBundleTails: {},
    };

    return formatAddressesAndBalance(data.addresses)
        .then(({ addresses, balance }) => {
            organizedData.addresses = addresses;
            organizedData.balance = balance;

            return getBundleTailsForPendingValidTransfers(
                organizedData.transfers,
                organizedData.addresses,
                accountName,
            );
        })
        .then((unconfirmedBundleTails) => {
            organizedData.unconfirmedBundleTails = unconfirmedBundleTails;

            return organizedData;
        });
};

/**
 *   Takes in account object, get unspent addresses from all addresses, fetch transaction hashes associated with those
 *   and assigns them to the account object under a prop name txHashesForUnspentAddresses.
 *
 *   IMPORTANT: This function should always be utilized after the account is synced.
 *
 *   @method mapTransactionHashesForUnspentAddressesToState
 *   @param {object} account
 *
 *   @returns {Promise} - Resolves account object.
 **/
export const mapTransactionHashesForUnspentAddressesToState = (account) => {
    const unspentAddresses = getUnspentAddressesSync(account.addresses);

    if (isEmpty(unspentAddresses)) {
        return Promise.resolve(assign({}, account, { txHashesForUnspentAddresses: [] }));
    }

    return findTransactionsAsync({ addresses: unspentAddresses }).then((hashes) => {
        return assign({}, account, { txHashesForUnspentAddresses: hashes });
    });
};

/**
 *   Takes in account object, get spent addresses with pending transfers,
 *   fetch transaction hashes associated with those
 *   and assigns them to the account object under a prop name pendingTxHashesForSpentAddresses.
 *
 *   IMPORTANT: This function should always be utilized after the account is sycnced.
 *
 *   @method mapPendingTransactionHashesForSpentAddressesToState
 *   @param {object} account
 *
 *   @returns {Promise} - Resolves account object.
 **/
export const mapPendingTransactionHashesForSpentAddressesToState = (account) => {
    const pendingTransfers = filterConfirmedTransfers(account.transfers);

    const spentAddressesWithPendingTransfers = getSpentAddressesWithPendingTransfersSync(
        pendingTransfers,
        account.addresses,
    );

    if (isEmpty(spentAddressesWithPendingTransfers)) {
        return Promise.resolve(assign({}, account, { pendingTxHashesForSpentAddresses: [] }));
    }

    return findTransactionsAsync({ addresses: spentAddressesWithPendingTransfers }).then((hashes) => {
        return assign({}, account, { pendingTxHashesForSpentAddresses: hashes });
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
 *   @returns {Promise} - Account object
 **/
export const getAccountData = (seed, accountName) => {
    const tailTransactions = [];
    const allBundleHashes = [];

    let allBundleObjects = [];

    const data = {
        addresses: [],
        transfers: [],
    };

    const pushIfNew = (pushTo, value) => {
        const isTrue = isObject(value) ? find(pushTo, { hash: value.hash }) : includes(pushTo, value);

        if (!isTrue) {
            pushTo.push(value);
        }
    };

    return getNodeInfoAsync()
        .then(() => getAllAddresses(seed))
        .then((addresses) => {
            data.addresses = addresses;

            return findTransactionObjectsAsync({ addresses: data.addresses });
        })
        .then((txObjects) => {
            each(txObjects, (tx) => pushIfNew(allBundleHashes, tx.bundle)); // Grab all bundle hashes

            return findTransactionObjectsAsync({ bundles: allBundleHashes });
        })
        .then((bundleObjects) => {
            allBundleObjects = bundleObjects;

            each(allBundleObjects, (tx) => {
                if (tx.currentIndex === 0) {
                    pushIfNew(tailTransactions, tx); // Keep a copy of all tail transactions to check confirmations
                }
            });

            return getLatestInclusionAsync(map(tailTransactions, (t) => t.hash));
        })
        .then((states) => {
            const allTxsAsObjects = categorizeTransactionsByPersistence(tailTransactions, states);
            const relevantUnconfirmedTransfers = removeIrrelevantUnconfirmedTransfers(allTxsAsObjects);

            const finalTailTxs = [
                ...map(allTxsAsObjects.confirmed, (t) => ({ ...t, persistence: true })),
                ...map(relevantUnconfirmedTransfers, (t) => ({ ...t, persistence: false })),
            ];

            each(finalTailTxs, (tx) => {
                const bundle = constructBundle(tx, allBundleObjects);

                if (iota.utils.isBundle(bundle)) {
                    // Map persistence from tail transaction object to all transfer objects in the bundle
                    data.transfers.push(map(bundle, (transfer) => ({ ...transfer, persistence: tx.persistence })));
                }
            });

            return organizeAccountInfo(accountName, data);
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
export const syncAccount = (seed, existingAccountState) => {
    const thisStateCopy = cloneDeep(existingAccountState);

    return Promise.all([
        mapTransactionHashesForUnspentAddressesToState(thisStateCopy),
        mapPendingTransactionHashesForSpentAddressesToState(thisStateCopy),
    ])
        .then((newStates) => {
            const [
                stateWithLatestTxHashesForUnspentAddresses,
                stateWithLatestPendingTxHashesForSpentAddresses,
            ] = newStates;

            const diff = getHashesDiff(
                thisStateCopy.txHashesForUnspentAddresses,
                stateWithLatestTxHashesForUnspentAddresses.txHashesForUnspentAddresses,
                thisStateCopy.pendingTxHashesForSpentAddresses,
                stateWithLatestPendingTxHashesForSpentAddresses.pendingTxHashesForSpentAddresses,
            );

            thisStateCopy.txHashesForUnspentAddresses =
                stateWithLatestTxHashesForUnspentAddresses.txHashesForUnspentAddresses;
            thisStateCopy.pendingTxHashesForSpentAddresses =
                stateWithLatestPendingTxHashesForSpentAddresses.pendingTxHashesForSpentAddresses;

            return size(diff)
                ? syncTransfers(diff, thisStateCopy)
                : Promise.resolve({
                      transfers: thisStateCopy.transfers,
                      newTransfers: [],
                  });
        })
        .then(({ transfers, newTransfers }) => {
            thisStateCopy.transfers = transfers;

            // Transform new transfers by bundle for promotion.
            return getBundleTailsForPendingValidTransfers(
                newTransfers,
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

            // Grab all hashes for pending transactions
            const pendingTxTailsHashes = getPendingTxTailsHashes(thisStateCopy.transfers);

            return getConfirmedTransactionHashes(pendingTxTailsHashes);
        })
        .then((confirmedTransactionHashes) => {
            if (!isEmpty(confirmedTransactionHashes)) {
                thisStateCopy.transfers = markTransfersConfirmed(thisStateCopy.transfers, confirmedTransactionHashes);

                // Grab all bundle hashes for confirmed transaction hashes
                // At this point unconfirmedBundleTails (for promotion) should be updated
                const confirmedBundleHashes = getBundleHashesForTailTransactionHashes(
                    thisStateCopy.unconfirmedBundleTails,
                    confirmedTransactionHashes,
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
 *   Aims to update local account information after a spend.
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
    // Assign persistence to the newly sent transfer.
    const newTransferBundleWithPersistence = map(newTransfer, (bundle) => ({
        ...bundle,
        persistence: false,
    }));

    // Append new transfer to existing transfers
    const transfers = [...[newTransferBundleWithPersistence], ...accountState.transfers];

    // Turn on spent flag for addresses that were used in this transfer
    const addresses = markAddressesAsSpentSync([newTransfer], accountState.addresses);

    let unconfirmedBundleTails = accountState.unconfirmedBundleTails;

    // Keep track of this transfer in unconfirmed tails so that it can be picked up for promotion
    // Also check if it was a value transfer
    // Only update unconfirmedBundleTails for promotion/reattachment if its a value transfer
    if (isValueTransfer) {
        const bundle = get(newTransfer, `[${0}].bundle`);
        const tailTxs = filter(newTransfer, (tx) => tx.currentIndex === 0);

        unconfirmedBundleTails = merge({}, unconfirmedBundleTails, {
            [bundle]: map(tailTxs, (t) => ({ ...t, account: name })), // Assign account name to each tx
        });
    }

    return mapTransactionHashesForUnspentAddressesToState({
        ...accountState,
        transfers,
        addresses,
        unconfirmedBundleTails,
    }).then((newState) => mapPendingTransactionHashesForSpentAddressesToState(newState));
};

export const syncAccountAfterReattachment = (accountName, reattachment, accountState) => {
    // Append new reattachment to existing transfers
    const transfers = [...[map(reattachment, (tx) => ({ ...tx, persistence: false }))], ...accountState.transfers];

    const tailTransaction = find(reattachment, { currentIndex: 0 });
    const normalizedTailTransaction = assign({}, tailTransaction, { account: accountName });
    const bundle = tailTransaction.bundle;

    // This check would is very redundant but to make sure state is never messed up,
    // We make sure we check if bundle hash exists.
    // Also the usage of unionBy is to have a safety check that we do not end up storing duplicate hashes
    // https://github.com/iotaledger/iri/issues/463
    const updatedUnconfirmedBundleTails = assign({}, accountState.unconfirmedBundleTails, {
        [bundle]:
            bundle in accountState.unconfirmedBundleTails
                ? unionBy([normalizedTailTransaction], accountState.unconfirmedBundleTails[bundle], 'hash')
                : [normalizedTailTransaction],
    });

    return mapTransactionHashesForUnspentAddressesToState({
        ...accountState,
        transfers,
        unconfirmedBundleTails: updatedUnconfirmedBundleTails,
    })
        .then((newState) => mapPendingTransactionHashesForSpentAddressesToState(newState))
        .then((newState) => ({ newState, reattachment }));
};
