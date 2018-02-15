import cloneDeep from 'lodash/cloneDeep';
import assign from 'lodash/assign';
import each from 'lodash/each';
import isArray from 'lodash/isArray';
import difference from 'lodash/difference';
import get from 'lodash/get';
import map from 'lodash/map';
import filter from 'lodash/filter';
import reduce from 'lodash/reduce';
import isObject from 'lodash/isObject';
import merge from 'lodash/merge';
import find from 'lodash/find';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import isEmpty from 'lodash/isEmpty';
import size from 'lodash/size';
import isNumber from 'lodash/isNumber';
import { iota } from '../libs/iota';
import { getBundleTailsForSentTransfers } from './promoter';
import { getAllAddresses } from './addresses';
import {
    getStartingSearchIndexToFetchLatestAddresses,
    categorizeTransactionsByPersistence,
    removeIrrelevantUnconfirmedTransfers,
} from './transfers';
import { DEFAULT_BALANCES_THRESHOLD } from '../config';

export const formatFullAddressData = (data) => {
    const addresses = data.addresses;
    const addressData = Object.assign(
        {},
        ...addresses.map((n, index) => ({ [n]: { index, balance: 0, spent: false } })),
    );

    for (let i = 0; i < data.inputs.length; i++) {
        addressData[data.inputs[i].address].balance = data.inputs[i].balance;
    }
    return addressData;
};

export const formatAddresses = (addresses, balances, addressesSpendStatus) => {
    const addressData = Object.assign(
        {},
        ...addresses.map((n, index) => ({ [n]: { index, balance: 0, spent: false } })),
    );
    for (let i = 0; i < addresses.length; i++) {
        addressData[addresses[i]].index = i;
        addressData[addresses[i]].balance = balances[i];
        addressData[addresses[i]].spent = addressesSpendStatus[i];
    }
    return addressData;
};

export const markAddressSpend = (transfers, addressData) => {
    const addressDataClone = cloneDeep(addressData);
    const addresses = Object.keys(addressDataClone);

    // Iterate over all bundles and sort them between incoming
    // and outgoing transfers
    transfers.forEach((bundle) => {
        // Iterate over every bundle entry
        bundle.forEach((bundleEntry) => {
            // If bundle address in the list of addresses associated with the seed
            // mark the address as sent
            if (addresses.indexOf(bundleEntry.address) > -1) {
                // Check if it's a remainder address
                const isRemainder = bundleEntry.currentIndex === bundleEntry.lastIndex && bundleEntry.lastIndex !== 0;
                // check if sent transaction
                if (bundleEntry.value < 0 && !isRemainder) {
                    // Mark address as spent
                    addressDataClone[bundleEntry.address].spent = true;
                }
            }
        });
    });

    return addressDataClone;
};

export const sortWithProp = (array, prop) => {
    return array.sort((left, right) => {
        if (left[prop] > right[prop]) {
            return -1;
        }

        if (left[prop] < right[prop]) {
            return 1;
        }

        return 0;
    });
};

export const formatTransfers = (transfers, addresses) => {
    // Order transfers from oldest to newest

    let sortedTransfers = transfers.sort((a, b) => {
        if (a[0].timestamp > b[0].timestamp) {
            return -1;
        }
        if (a[0].timestamp < b[0].timestamp) {
            return 1;
        }
        return 0;
    });

    // add transaction values to transactions
    sortedTransfers = addTransferValues(sortedTransfers, addresses);

    return sortedTransfers;
};

export const addTransferValues = (transfers, addresses) => {
    // Add transaction value property to each transaction object
    return transfers.map((arr) => {
        /* eslint-disable no-param-reassign */
        arr[0].transferValue = 0;
        arr.map((obj) => {
            if (addresses.includes(obj.address)) {
                arr[0].transferValue += obj.value;
            }

            /* eslint-enable no-param-reassign */
            return obj;
        });

        return arr;
    });
};

export const calculateBalance = (data) => {
    let balance = 0;
    if (Object.keys(data).length > 0) {
        const balanceArray = Object.values(data).map((x) => x.balance);
        balance = balanceArray.reduce((a, b) => a + b);
    }
    return balance;
};

/**
 *   Takes in an array of balances (numbers) and calculates the total balance
 *
 *   @method accumulateBalance
 *   @param {array} balances - Array of integers
 *
 *   @returns {number} - Total balance
 **/
export const accumulateBalance = (balances) =>
    reduce(
        balances,
        (res, val) => {
            if (isNumber(val)) {
                res = res + val;
            }

            return res;
        },
        0,
    );

/**
 *   Takes in transfer bundles and only keep a single copy
 *
 *   @method deduplicateTransferBundles
 *   @param {array} transfers - transfers array
 *
 *   @returns {array} - filtered transfers array
 **/
export const deduplicateTransferBundles = (transfers) => {
    const deduplicate = (res, transfer) => {
        const tail = find(transfer, (tx) => tx.currentIndex === 0);
        const bundle = tail.bundle;
        const persistence = tail.persistence;

        if (bundle in res) {
            if (persistence) {
                res[bundle] = transfer;
            }
        } else {
            res = { ...res, ...{ [bundle]: transfer } };
        }

        return res;
    };

    const aggregated = reduce(transfers, deduplicate, {});
    return map(aggregated, (v) => v);
};

export const getUnspentAddresses = (addressData) => {
    const addresses = Object.keys(addressData);
    const addressesSpendStatus = Object.values(addressData).map((x) => x.spent);

    const unspentAddresses = [];

    for (let i = 0; i < addresses.length; i++) {
        if (addressesSpendStatus[i] === false) {
            unspentAddresses.push(addresses[i]);
        }
    }

    return unspentAddresses;
};

/**
 *   Takes in transfer bundles and grab hashes for transfer objects that are unconfirmed.
 *
 *   @method getPendingTxTailsHashes
 *   @param {array} bundles - Transfer bundles
 *
 *   @returns {array} - array of transfer hashes
 **/
export const getPendingTxTailsHashes = (bundles) => {
    const grabHashesFromTails = (acc, transfers) => {
        each(transfers, (tx) => {
            if (tx.currentIndex === 0 && !tx.persistence) {
                acc.push(tx.hash);
            }
        });

        return acc;
    };

    return reduce(bundles, grabHashesFromTails, []);
};

/**
 *   Takes in transfer bundles and confirmed tail transaction hashes
 *   Assigns persistence true to all transfers that are confirmed
 *
 *   @method markTransfersConfirmed
 *   @param {array} bundles - Transfer bundles
 *   @param {array} confirmedTransfersTailsHashes - Array of transaction hashes
 *
 *   @returns {array} - bundles
 **/
export const markTransfersConfirmed = (bundles, confirmedTransfersTailsHashes) => {
    return map(bundles, (transfers) => {
        const tailTransaction = find(transfers, { currentIndex: 0 });

        // Safety check to see if tail transaction was actually found.
        // Very unlikely to happen unless and until state is messed up.
        // If tail transaction was found, check if its hash includes in the confirmed trasfers tails hashes list.
        const isConfirmedTailTransaction =
            tailTransaction && includes(confirmedTransfersTailsHashes, tailTransaction.hash);

        // Invert persistence on all transfer objects if transaction is confirmed.
        if (isConfirmedTailTransaction) {
            return map(transfers, (transfer) => ({ ...transfer, persistence: true }));
        }

        return transfers;
    });
};

export const organizeAccountInfo = (accountName, data) => {
    const transfers = formatTransfers(data.transfers, data.addresses);

    const addressData = formatFullAddressData(data);
    const balance = calculateBalance(addressData);

    const unconfirmedBundleTails = getBundleTailsForSentTransfers(transfers, data.addresses, accountName); // Should really be ordered.
    const addressDataWithSpentFlag = markAddressSpend(transfers, addressData);

    return {
        accountName,
        transfers,
        addresses: addressDataWithSpentFlag,
        balance,
        unconfirmedBundleTails,
    };
};

const getBalancesAsync = (addresses, threshold) => {
    return new Promise((resolve, reject) => {
        iota.api.getBalances(addresses, threshold, (err, balances) => {
            if (err) {
                reject(err);
            } else {
                resolve(balances);
            }
        });
    });
};

const getNodeInfoAsync = () => {
    return new Promise((resolve, reject) => {
        iota.api.getNodeInfo((err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
};

const getTransactionsObjectsAsync = (hashes) => {
    return new Promise((resolve, reject) => {
        iota.api.getTransactionsObjects(hashes, (err, txs) => {
            if (err) {
                reject(err);
            } else {
                resolve(txs);
            }
        });
    });
};

const findTransactionObjectsAsync = (args) => {
    return new Promise((resolve, reject) => {
        iota.api.findTransactionObjects(args, (err, txs) => {
            if (err) {
                reject(err);
            } else {
                resolve(txs);
            }
        });
    });
};

const findTransactionsAsync = (args) => {
    return new Promise((resolve, reject) => {
        iota.api.findTransactions(args, (err, txs) => {
            if (err) {
                reject(err);
            } else {
                resolve(txs);
            }
        });
    });
};

const getLatestInclusionAsync = (hashes) => {
    return new Promise((resolve, reject) => {
        iota.api.getLatestInclusion(hashes, (err, states) => {
            if (err) {
                reject(err);
            } else {
                resolve(states);
            }
        });
    });
};

/**
 *   Get state partials for addressData and assigns balances to those
 *
 *   @method mapBalancesToAddresses
 *   @param {object} addressData - Addresses dictionary with balance and spend status
 *   @param {array} balances - Array of integers
 *   @param {array} addresses - Array of strings (addresses)
 *
 *   @returns {object} - A new copy of the addressData object after assigning each nested object its updated balance.
 **/
export const mapBalancesToAddresses = (addressData, balances, addresses) => {
    const addressesDataClone = cloneDeep(addressData);
    const addressesLength = size(addresses);

    // Return prematurely if balances length are not equal to addresses length
    // Or address data keys length is not equal to addresses length
    // A strict check to make sure everything is up-to-date when new balances are assigned.
    if (size(balances) !== addressesLength || size(keys(addressesDataClone)) !== addressesLength) {
        return addressesDataClone;
    }

    each(addresses, (address, idx) => {
        addressesDataClone[address] = { ...get(addressesDataClone, `${address}`), balance: balances[idx] };
    });

    return addressesDataClone;
};

/**
 *   A wrapper over getBalances.
 *   Main purpose of this wrapper is to keep addresses and balances indexes intact.
 *
 *   @method mapBalancesToAddresses
 *   @param {object} addressData - Addresses dictionary with balance and spend status
 *
 *   @returns {Promise|<object>} - Resolves { balances: [], addresses: [] } after getting latest balances against addresses
 **/
export const getBalancesWithAddresses = (addressData) => {
    const addresses = keys(addressData);

    return getBalancesAsync(addresses, DEFAULT_BALANCES_THRESHOLD).then((balances) => ({
        balances: get(balances, 'balances'),
        addresses,
    }));
};

export const getLatestAddresses = (seed, index) => {
    return new Promise((resolve, reject) => {
        iota.api.getInputs(seed, { start: index }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                const addresses = reduce(
                    data.inputs,
                    (obj, x) => {
                        obj[x.address] = { index: x.keyIndex, balance: x.balance, spent: false };
                        return obj;
                    },
                    {},
                );

                resolve(addresses);
            }
        });
    });
};

export const getHashesWithPersistence = (hashes) => {
    return new Promise((resolve, reject) => {
        iota.api.getLatestInclusion(hashes, (err, states) => {
            if (err) {
                reject(err);
            } else {
                resolve({ states, hashes });
            }
        });
    });
};

export const getBundleWithPersistence = (tailTxHash, persistence) => {
    return new Promise((resolve, reject) => {
        iota.api.getBundle(tailTxHash, (err, bundle) => {
            if (err) {
                reject(err);
            } else {
                resolve(map(bundle, (tx) => assign({}, tx, { persistence })));
            }
        });
    });
};

export const getBundlesWithPersistence = (inclusionStates, hashes) => {
    return reduce(
        hashes,
        (promise, hash, idx) => {
            return promise
                .then((result) => {
                    return getBundleWithPersistence(hash, inclusionStates[idx]).then((bundle) => {
                        result.push(bundle);

                        return result;
                    });
                })
                .catch(console.error);
        },
        Promise.resolve([]),
    );
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
export const mapUnspentAddressesHashesToAccount = (account) => {
    const unspentAddresses = getUnspentAddresses(account.addresses);

    if (isEmpty(unspentAddresses)) {
        return Promise.resolve(assign({}, account, { unspentAddressesHashes: [] }));
    }

    return findTransactionsAsync({ addresses: unspentAddresses }).then((hashes) => {
        return assign({}, account, { unspentAddressesHashes: hashes });
    });
};

export const getBundle = (tailTx, allBundleObjects) => {
    if (tailTx.currentIndex === tailTx.lastIndex) {
        return [tailTx];
    }

    const bundle = [tailTx];
    const bundleHash = tailTx.bundle;

    let trunk = tailTx.trunkTransaction;
    let stop = false;
    const nextTx = () => find(allBundleObjects, { hash: trunk });

    while (nextTx() && nextTx().bundle === bundleHash && !stop) {
        bundle.push(nextTx());

        if (nextTx().currentIndex === nextTx().lastIndex) {
            stop = true;
        }

        trunk = nextTx().trunkTransaction;
    }

    return bundle;
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

    const pushIfNotExists = (pushTo, value) => {
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
            each(txObjects, (tx) => pushIfNotExists(allBundleHashes, tx.bundle)); // Grab all bundle hashes

            return findTransactionObjectsAsync({ bundles: allBundleHashes });
        })
        .then((bundleObjects) => {
            allBundleObjects = bundleObjects;

            each(allBundleObjects, (tx) => {
                if (tx.currentIndex === 0) {
                    pushIfNotExists(tailTransactions, tx); // Keep a copy of all tail transactions to check confirmations
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
                const bundle = getBundle(tx, allBundleObjects);

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
        });
};

/**
 *   Checks if there is a difference between local transaction hashes and ledger's transaction hashes.
 *
 *   @method hasNewTransfers
 *   @param {array} existingHashes
 *   @param {array} newHashes
 *
 *   @returns {boolean}
 **/
export const hasNewTransfers = (existingHashes, newHashes) =>
    isArray(existingHashes) && isArray(newHashes) && size(newHashes) > size(existingHashes);

/**
 *   Calls getHashesWithPersistence to get latest inclusion states with hashes.
 *   Filter confirmed hashes.
 *
 *   @method getConfirmedTransactionHashes
 *   @param {array} pendingTxTailHashes
 *
 *   @returns {Promise<array>}
 **/
export const getConfirmedTransactionHashes = (pendingTxTailHashes) => {
    return getHashesWithPersistence(pendingTxTailHashes).then(({ states, hashes }) =>
        filter(hashes, (hash, idx) => states[idx]),
    );
};

/**
 *   Get transaction objects associated with hashes, assign persistence by calling inclusion states
 *   Resolves formatted transfers.
 *
 *   @method syncTransfers
 *   @param {array} diff
 *   @param {object} existingAccountState - Account object
 *
 *   @returns {Promise<array>} - Resolves updated transfers
 **/
export const syncTransfers = (diff, accountState) => {
    return getTransactionsObjectsAsync(diff)
        .then((txs) => {
            const tailTxs = filter(txs, (t) => t.currentIndex === 0);
            const tailTxsHashes = (tx) => tx.hash;

            return getHashesWithPersistence(map(tailTxs, tailTxsHashes));
        })
        .then(({ states, hashes }) => getBundlesWithPersistence(states, hashes))
        .then((bundles) => {
            const updatedTransfers = [...accountState.transfers, ...bundles];

            return formatTransfers(updatedTransfers, keys(accountState.addresses));
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

            return mapUnspentAddressesHashesToAccount(thisStateCopy);
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
        .then((updatedTransfers) => {
            thisStateCopy.transfers = updatedTransfers;
            thisStateCopy.addresses = markAddressSpend(thisStateCopy.transfers, thisStateCopy.addresses);

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

    return mapUnspentAddressesHashesToAccount({ ...accountState, transfers, addresses, unconfirmedBundleTails });
};
