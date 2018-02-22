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
    filterInvalidTransfersSync,
    getHashesDiff,
} from './transfers';
import {
    getAllAddresses,
    formatAddressesAndBalance,
    markAddressSpend,
    getUnspentAddresses,
    markAddressesAsSpentSync,
    getSpentAddressesWithPendingTransfersSync,
} from './addresses';

/**
 *   Takes in account data fetched from ledger.
 *   Formats transfers - Sort by latest to old.
 *   Formats addresses by assigning spent and balance with each address (formatAddressesAndBalance).
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
        transfers: formatTransfers(data.transfers, data.addresses),
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
 *   Takes in account object, filter unspent addresses from all addresses, fetch transaction hashes associated with those and
 *   assigns them to the account object.
 *
 *   @method mapUnspentAddressesHashesToAccount
 *   @param {object} account [
 *     addresses: {},
 *     transfers: [],
 *     balance: 0,
 *     unconfirmedBundleTails: {} // (optional),
 *     accountName; 'foo' // (optional)
 *   ]
 *
 *   @returns {Promise} - Resolves account argument by assigning unspentAddressesHashes (Transaction hashes associated with unspent addresses)
 **/
export const mapTransactionHashesForUnspentAddressesToState = (account) => {
    const unspentAddresses = getUnspentAddresses(account.addresses);

    if (isEmpty(unspentAddresses)) {
        return Promise.resolve(assign({}, account, { txHashesForUnspentAddresses: [] }));
    }

    return findTransactionsAsync({ addresses: unspentAddresses }).then((hashes) => {
        return assign({}, account, { txHashesForUnspentAddresses: hashes });
    });
};

/**
 *   Takes in account object, filter unspent addresses from all addresses, fetch transaction hashes associated with those and
 *   assigns them to the account object.
 *
 *   @method mapUnspentAddressesHashesToAccount
 *   @param {object} account [
 *     addresses: {},
 *     transfers: [],
 *     balance: 0,
 *     unconfirmedBundleTails: {} // (optional),
 *     accountName; 'foo' // (optional)
 *   ]
 *
 *   @returns {Promise} - Resolves account argument by assigning unspentAddressesHashes (Transaction hashes associated with unspent addresses)
 **/
export const mapPendingTransactionHashesForSpentAddressesToState = (account) => {
    const pendingTransfers = filterConfirmedTransfers(account.transfers);
    const validPendingTransfers = filterInvalidTransfersSync(pendingTransfers, account.addresses);

    const spentAddressesWithPendingTransfers = getSpentAddressesWithPendingTransfersSync(
        validPendingTransfers,
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
 *   Gets seed associated information from the ledger.
 *   - Communicates with node by checking its information. (getNodeInfoAsync)
 *   - Get all used addresses (addresses with transactions) from the ledger. (getAllAddresses)
 *   - Get all transaction objects associated with the addresses. (findTransactionObjectsAsync({ addresses }))
 *   - Grab all bundle hashes and get transaction objects associated with those. (findTransactionObjectsAsync({ bundles }))
 *   - Get confirmation states from all transactions from the ledger. (getLatestInclusionAsync)
 *   - Map confirmations on transaction objects.
 *   - Remove duplicates (reattachments) for confirmed transfers - A neat trick to avoid expensive bundle creation for reattachments.
 *   - Get balances associated with addresses. (getBalancesAsync)
 *   - Set balance
 *   - Prepare inputs from balances and all addresses.
 *   - Organize account info - Formats and transform account objects.
 *
 *   @method getAccountData
 *   @param {string} seed
 *   @param {string} accountName - Account name selected by the user.
 *   @returns {Promise} - Account object [addresses: {}, transfers: [], balance: 0, pendingTxTailsHashes: {}, unconfirmedBundleTails: {} ]
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
 *   Aims to update cached state with the ledger's.
 *   - Grab search index for checking latest addresses and update address data dictionary.
 *   - Grab balances against latest addresses.
 *   - Assign new balances to latest addresses.
 *   - Grab unspentAddressesHashes by filtering unspent addresses and checking for their hashes.
 *   - Checks for new transfers by comparing old unspentAddressesHashes with newUnspentAddressesHashes.
 *   - Sync transfers by calling syncTransfers.
 *   - Update transfers, addresses by marking addresses as spent.
 *   - Recompute, filter latest pending tail hashes from latest transfer objects and update pendingTxTailHashes in state.
 *   - Check confirmation states for pending tail hashes.
 *   - Update those transfer objects with persistence true.
 *
 *   @method syncAccount
 *   @param {string} seed
 *   @param {object} existingAccountState - Account object
 *
 *   @returns {Promise<object>} - Resolved a new updated account state object.
 **/
export const syncAccount = (seed, existingAccountState) => {
    const thisStateCopy = cloneDeep(existingAccountState);

    return formatAddressesAndBalance(keys(thisStateCopy.addresses))
        .then(({ addresses, balance }) => {
            thisStateCopy.addresses = addresses;
            thisStateCopy.balance = balance;

            return Promise.all([
                mapTransactionHashesForUnspentAddressesToState(thisStateCopy),
                mapPendingTransactionHashesForSpentAddressesToState(thisStateCopy),
            ]);
        })
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

            return size(diff)
                ? syncTransfers(diff, thisStateCopy)
                : Promise.resolve({
                      transfers: thisStateCopy.transfers,
                      newTransfers: [],
                  });
        })
        .then(({ transfers, newTransfers }) => {
            thisStateCopy.transfers = transfers;

            // Mark spent flag to true for addresses used in the newly discovered transfers
            thisStateCopy.addresses = markAddressesAsSpentSync(thisStateCopy.transfers, thisStateCopy.addresses);

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

                return thisStateCopy;
            }

            return thisStateCopy;
        });
};

/**
 *   Aims to update local account information after a spend.
 *
 *   @method syncAccount
 *   @param {string} name
 *   @param {array} newTransfer
 *   @param {object} existingAccountState - Account object
 *   @param {boolean} isValueTransfer
 *
 *   @returns {Promise<object>} - Resolved a new updated account state object.
 **/
export const updateAccount = (name, newTransfer, accountState, isValueTransfer) => {
    // Assign persistence to the newly sent transfer.
    const newTransferBundleWithPersistence = map(newTransfer, (bundle) => ({
        ...bundle,
        persistence: false,
    }));

    // Append new transfer to existing transfers
    const transfers = [...[newTransferBundleWithPersistence], ...accountState.transfers];

    // Turn on spent flag for addresses that were used in this transfer
    const addresses = markAddressSpend([newTransfer], accountState.addresses);

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
