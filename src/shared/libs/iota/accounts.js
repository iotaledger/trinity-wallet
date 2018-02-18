import cloneDeep from 'lodash/cloneDeep';
import assign from 'lodash/assign';
import each from 'lodash/each';
import difference from 'lodash/difference';
import get from 'lodash/get';
import map from 'lodash/map';
import filter from 'lodash/filter';
import isObject from 'lodash/isObject';
import merge from 'lodash/merge';
import find from 'lodash/find';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import { iota } from './index';
import { DEFAULT_BALANCES_THRESHOLD } from '../../config';
import {
    findTransactionsAsync,
    getNodeInfoAsync,
    findTransactionObjectsAsync,
    getLatestInclusionAsync,
    getBalancesAsync,
} from './extendedApi';
import {
    formatTransfers,
    getBundleTailsForValidTransfers,
    categorizeTransactionsByPersistence,
    removeIrrelevantUnconfirmedTransfers,
    constructBundle,
    hasNewTransfers,
    syncTransfers,
    getPendingTxTailsHashes,
    getConfirmedTransactionHashes,
    markTransfersConfirmed,
} from './transfers';
import {
    getAllAddresses,
    getLatestAddresses,
    formatFullAddressData,
    calculateBalance,
    markAddressSpend,
    getUnspentAddresses,
    getBalancesWithAddresses,
    mapBalancesToAddresses,
    accumulateBalance,
    getStartingSearchIndexToFetchLatestAddresses,
} from './addresses';

const organizeAccountInfo = (accountName, data) => {
    const transfers = formatTransfers(data.transfers, data.addresses);
    const addressData = formatFullAddressData(data);

    const balance = calculateBalance(addressData);
    const addressDataWithSpentFlag = markAddressSpend(transfers, addressData);

    return getBundleTailsForValidTransfers(transfers, addressData, accountName).then((unconfirmedBundleTails) => {
        return {
            accountName,
            transfers,
            addresses: addressDataWithSpentFlag,
            balance,
            unconfirmedBundleTails,
        };
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
 *     pendingTxTailsHashes: {},
 *     inputs: [], // (optional)
 *     unconfirmedBundleTails: {} // (optional),
 *     accountName; 'foo' // (optional)
 *   ]
 *
 *   @returns {Promise} - Resolves account argument by assigning unspentAddressesHashes (Transaction hashes associated with unspent addresses)
 **/
export const mapUnspentAddressesHashesToState = (account) => {
    const unspentAddresses = getUnspentAddresses(account.addresses);

    if (isEmpty(unspentAddresses)) {
        return Promise.resolve(assign({}, account, { unspentAddressesHashes: [] }));
    }

    return findTransactionsAsync({ addresses: unspentAddresses }).then((hashes) => {
        return assign({}, account, { unspentAddressesHashes: hashes });
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

    const transfers = [];

    const data = {
        addresses: [],
        transfers: [],
        inputs: [],
        balance: 0,
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
                    transfers.push(map(bundle, (transfer) => ({ ...transfer, persistence: tx.persistence })));
                }
            });

            data.transfers = transfers;

            return getBalancesAsync(data.addresses, DEFAULT_BALANCES_THRESHOLD);
        })
        .then((balances) => {
            each(balances.balances, (balance, idx) => {
                const balanceAsNumber = parseInt(balance);
                data.balance += balanceAsNumber;

                if (balanceAsNumber > 0) {
                    data.inputs.push({
                        address: data.addresses[idx],
                        keyIndex: idx,
                        security: 2,
                        balance: balanceAsNumber,
                    });
                }
            });

            return organizeAccountInfo(accountName, data);
        })
        .then((organizedData) => organizedData);
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

    const addressSearchIndex = getStartingSearchIndexToFetchLatestAddresses(thisStateCopy.addresses);

    return getLatestAddresses(seed, addressSearchIndex)
        .then((newAddressesObjects) => {
            // Assign latest addresses to addresses dictionary
            thisStateCopy.addresses = { ...thisStateCopy.addresses, ...newAddressesObjects };

            // Grab latest balances with addresses transformed as array.
            return getBalancesWithAddresses(thisStateCopy.addresses);
        })
        .then(({ balances, addresses }) => {
            const newBalances = map(balances, Number);

            thisStateCopy.addresses = mapBalancesToAddresses(thisStateCopy.addresses, newBalances, addresses);

            thisStateCopy.balance = accumulateBalance(newBalances);

            return mapUnspentAddressesHashesToState(thisStateCopy);
        })
        .then((newStateCopy) => {
            if (hasNewTransfers(thisStateCopy.unspentAddressesHashes, newStateCopy.unspentAddressesHashes)) {
                const diff = difference(newStateCopy.unspentAddressesHashes, thisStateCopy.unspentAddressesHashes);

                // Update unspentAddressesHashes for this copy
                thisStateCopy.unspentAddressesHashes = newStateCopy.unspentAddressesHashes;

                return syncTransfers(diff, thisStateCopy);
            }

            return Promise.resolve(thisStateCopy.transfers);
        })
        .then(({ transfers, newTransfers }) => {
            thisStateCopy.transfers = transfers;
            thisStateCopy.addresses = markAddressSpend(thisStateCopy.transfers, thisStateCopy.addresses);

            // Transform new transfers by bundle for promotion.
            return getBundleTailsForValidTransfers(newTransfers, thisStateCopy.addresses, thisStateCopy.accountName);
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
    // Assign persistence and transferValue props to the newly sent transfer
    const newTransferBundleWithPersistenceAndTransferValue = map(newTransfer, (bundle) => ({
        ...bundle,
        ...{ transferValue: -bundle.value, persistence: false },
    }));

    // Append new transfer to existing transfers
    const transfers = [...[newTransferBundleWithPersistenceAndTransferValue], ...accountState.transfers];

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

    return mapUnspentAddressesHashesToState({ ...accountState, transfers, addresses, unconfirmedBundleTails });
};
