import cloneDeep from 'lodash/cloneDeep';
import assign from 'lodash/assign';
import each from 'lodash/each';
import difference from 'lodash/difference';
import get from 'lodash/get';
import map from 'lodash/map';
import filter from 'lodash/filter';
import reduce from 'lodash/reduce';
import isObject from 'lodash/isObject';
import has from 'lodash/has';
import omitBy from 'lodash/omitBy';
import merge from 'lodash/merge';
import find from 'lodash/find';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import isEmpty from 'lodash/isEmpty';
import size from 'lodash/size';
import { iota } from '../libs/iota';
import { getBundleTailsForSentTransfers } from './promoter';
import { getAllAddresses } from './addresses';
import { getStartingSearchIndexToFetchLatestAddresses } from './transfers';
import { DEFAULT_BALANCES_THRESHOLD } from '../config';

export const formatFullAddressData = data => {
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

export const markAddressSpend = (transfers, addressData) => {
    const addressDataClone = cloneDeep(addressData);
    const addresses = Object.keys(addressDataClone);

    // Iterate over all bundles and sort them between incoming
    // and outgoing transfers
    transfers.forEach(bundle => {
        // Iterate over every bundle entry
        bundle.forEach(bundleEntry => {
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
    return transfers.map(arr => {
        /* eslint-disable no-param-reassign */
        arr[0].transferValue = 0;
        arr.map(obj => {
            if (addresses.includes(obj.address)) {
                arr[0].transferValue += obj.value;
            }

            /* eslint-enable no-param-reassign */
            return obj;
        });

        return arr;
    });
};

export const calculateBalance = data => {
    let balance = 0;
    if (Object.keys(data).length > 0) {
        const balanceArray = Object.values(data).map(x => x.balance);
        balance = balanceArray.reduce((a, b) => a + b);
    }
    return balance;
};

export const accumulateBalance = balances =>
    reduce(
        balances,
        (res, val) => {
            res = res + val;
            return res;
        },
        0,
    );

export const deduplicateTransferBundles = transfers => {
    const deduplicate = (res, transfer) => {
        const top = transfer[0];
        const bundle = top.bundle;
        const attachmentTimestampOnCurrentTx = top.attachmentTimestamp;
        const persistenceOnCurrentTx = top.persistence;

        if (bundle in res) {
            const timestampOnExistingTx = get(res[bundle], '[0].attachmentTimestamp');
            const persistenceOnExistingTx = get(res[bundle], '[0].persistence');

            // In case a tx is still unconfirmed.
            if (!persistenceOnExistingTx && persistenceOnCurrentTx) {
                res[bundle] = transfer;
            } else if (!persistenceOnCurrentTx && !persistenceOnCurrentTx) {
                if (attachmentTimestampOnCurrentTx < timestampOnExistingTx) {
                    res[bundle] = transfer;
                }
            }
        } else {
            res = { ...res, ...{ [bundle]: transfer } };
        }

        return res;
    };

    const aggregated = reduce(transfers, deduplicate, {});
    return map(aggregated, v => v);
};

export const getUnspentAddresses = addressData => {
    const addresses = Object.keys(addressData);
    const addressesSpendStatus = Object.values(addressData).map(x => x.spent);

    const unspentAddresses = [];

    for (let i = 0; i < addresses.length; i++) {
        if (addressesSpendStatus[i] === false) {
            unspentAddresses.push(addresses[i]);
        }
    }

    return unspentAddresses;
};

export const getPendingTxTailsHashes = transfers => {
    const grabTails = (res, val) => {
        each(val, v => {
            if (!v.persistence && v.currentIndex === 0) {
                res.push(v.hash);
            }
        });

        return res;
    };

    return reduce(transfers, grabTails, []);
};

export const markTransfersConfirmed = (transfers, tailHashes) => {
    return map(transfers, txObjects =>
        map(txObjects, tx => {
            const isTail = tx.currentIndex === 0;
            const hash = tx.hash;
            const isUnconfirmed = !tx.persistence;

            if (isTail && includes(tailHashes, hash) && isUnconfirmed) {
                return assign({}, tx, { persistence: true });
            }

            return tx;
        }),
    );
};

export const organizeAccountInfo = (accountName, data) => {
    const transfers = formatTransfers(data.transfers, data.addresses);

    const addressData = formatFullAddressData(data);
    const balance = calculateBalance(addressData);

    const unconfirmedBundleTails = getBundleTailsForSentTransfers(transfers, data.addresses, accountName); // Should really be ordered.
    const addressDataWithSpentFlag = markAddressSpend(transfers, addressData);
    const pendingTxTailsHashes = getPendingTxTailsHashes(transfers);

    return {
        accountName,
        transfers,
        addresses: addressDataWithSpentFlag,
        balance,
        unconfirmedBundleTails,
        pendingTxTailsHashes,
    };
};

export const mapBalancesToAddresses = (addressData, balances) => {
    const addressesDataClone = cloneDeep(addressData);

    each(keys(addressData), (address, idx) => {
        addressesDataClone[address] = { ...get(addressesDataClone, `${address}`), ...{ balance: balances[idx] } };
    });

    return addressesDataClone;
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
                        obj[x.address] = { balance: x.balance, spent: false };
                        return obj;
                    },
                    {},
                );

                resolve(addresses);
            }
        });
    });
};

export const getHashesWithPersistence = hashes => {
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
                resolve(map(bundle, tx => assign({}, tx, { persistence })));
            }
        });
    });
};

export const getBundlesWithPersistence = (inclusionStates, hashes) => {
    return reduce(
        hashes,
        (promise, hash, idx) => {
            return promise
                .then(result => {
                    return getBundleWithPersistence(hash, inclusionStates[idx]).then(bundle => {
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
export const mapUnspentAddressesHashesToAccount = account => {
    const accountClone = cloneDeep(account);
    const unspentAddresses = getUnspentAddresses(accountClone.addresses);

    if (isEmpty(unspentAddresses)) {
        accountClone.unspentAddressesHashes = [];
        return Promise.resolve(accountClone);
    }

    return iota.api.findTransactionsAsync({ addresses: unspentAddresses }).then(hashes => {
        accountClone.unspentAddressesHashes = hashes;

        return accountClone;
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

    return iota.api
        .getNodeInfoAsync()
        .then(() => getAllAddresses(seed))
        .then(addresses => {
            data.addresses = addresses;

            return iota.api.findTransactionObjectsAsync({ addresses: data.addresses });
        })
        .then(txObjects => {
            each(txObjects, tx => pushIfNotExists(allBundleHashes, tx.bundle)); // Grab all bundle hashes

            return iota.api.findTransactionObjectsAsync({ bundles: allBundleHashes });
        })
        .then(bundleObjects => {
            allBundleObjects = bundleObjects;

            each(allBundleObjects, tx => {
                if (tx.currentIndex === 0) {
                    pushIfNotExists(tailTransactions, tx); // Keep a copy of all tail transactions to check confirmations
                }
            });

            return iota.api.getLatestInclusionAsync(map(tailTransactions, t => t.hash));
        })
        .then(states => {
            const allTxsAsObjects = reduce(
                tailTransactions,
                (res, v, i) => {
                    if (i === 0) {
                        res.confirmed = {};
                        res.unconfirmed = {};
                    }

                    if (states[i]) {
                        res.confirmed[v.bundle] = Object.assign({}, v, {
                            persistence: true,
                        });
                    } else {
                        res.unconfirmed[v.bundle] = Object.assign({}, v, {
                            persistence: false,
                        });
                    }

                    return res;
                },
                {},
            );

            // Get rid of transactions duplicates that are already confirmed
            const deduplicatedUnconfirmedTxs = omitBy(allTxsAsObjects.unconfirmed, (value, key) => {
                return has(allTxsAsObjects.confirmed, key);
            });

            const finalTailTxs = [
                ...map(allTxsAsObjects.confirmed, t => t),
                ...map(deduplicatedUnconfirmedTxs, t => t),
            ];

            each(finalTailTxs, tx => {
                const bundle = getBundle(tx, allBundleObjects);

                if (iota.utils.isBundle(bundle)) {
                    transfers.push(bundle);
                }
            });

            data.transfers = transfers;

            return iota.api.getBalancesAsync(data.addresses, DEFAULT_BALANCES_THRESHOLD);
        })
        .then(balances => {
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

export const hasNewTransfers = (existingHashes, newHashes) => size(newHashes) > size(existingHashes);

export const getConfirmedTransactionHashes = pendingTxTailHashes => {
    return getHashesWithPersistence(pendingTxTailHashes).then(({ states, hashes }) =>
        filter(hashes, (hash, idx) => states[idx]),
    );
};

export const syncTransfers = (diff, existingAccountState) => {
    const existingAccountStateCopy = cloneDeep(existingAccountState);

    return iota.api
        .getTransactionsObjectsAsync(diff)
        .then(txs => {
            const tailTxs = filter(txs, t => t.currentIndex === 0);
            const tailTxsHashes = tx => tx.hash;

            return getHashesWithPersistence(map(tailTxs, tailTxsHashes));
        })
        .then(({ states, hashes }) => getBundlesWithPersistence(states, hashes))
        .then(bundles => {
            const updatedTransfers = [...existingAccountStateCopy.transfers, ...bundles];

            return formatTransfers(updatedTransfers, keys(existingAccountStateCopy.addresses));
        });
};

export const syncAccount = (seed, existingAccountState) => {
    const thisStateCopy = cloneDeep(existingAccountState);

    const addressSearchIndex = getStartingSearchIndexToFetchLatestAddresses(thisStateCopy.addresses);

    return getLatestAddresses(seed, addressSearchIndex)
        .then(newAddressesObjects => {
            thisStateCopy.addresses = { ...thisStateCopy.addresses, ...newAddressesObjects };

            return iota.api.getBalancesAsync(keys(thisStateCopy.addresses), DEFAULT_BALANCES_THRESHOLD);
        })
        .then(({ balances }) => {
            const newBalances = map(balances, Number);

            thisStateCopy.addresses = mapBalancesToAddresses(thisStateCopy.addresses, newBalances);

            thisStateCopy.balance = accumulateBalance(newBalances);

            return mapUnspentAddressesHashesToAccount(thisStateCopy);
        })
        .then(newStateCopy => {
            if (hasNewTransfers(thisStateCopy.unspentAddressesHashes, newStateCopy.unspentAddressesHashes)) {
                const diff = difference(newStateCopy.unspentAddressesHashes, thisStateCopy.unspentAddressesHashes);

                // Update unspentAddressesHashes for this copy
                thisStateCopy.unspentAddressesHashes = newStateCopy.unspentAddressesHashes;

                return syncTransfers(diff, thisStateCopy);
            }

            return Promise.resolve(thisStateCopy.transfers);
        })
        .then(updatedTransfers => {
            thisStateCopy.transfers = updatedTransfers;
            thisStateCopy.addresses = markAddressSpend(thisStateCopy.transfers, thisStateCopy.addresses);

            // Set new pendingTxTailHashes
            thisStateCopy.pendingTxTailsHashes = getPendingTxTailsHashes(thisStateCopy.transfers);

            return getConfirmedTransactionHashes(thisStateCopy.pendingTxTailsHashes);
        })
        .then(confirmedTransactionHashes => {
            if (!isEmpty(confirmedTransactionHashes)) {
                const alreadyConfirmed = tx => !includes(confirmedTransactionHashes, tx);

                thisStateCopy.transfers = markTransfersConfirmed(thisStateCopy.transfers, confirmedTransactionHashes);
                thisStateCopy.pendingTxTailsHashes = filter(thisStateCopy.pendingTxTailsHashes, alreadyConfirmed);

                return thisStateCopy;
            }

            return thisStateCopy;
        });
};

export const updateAccount = (name, newTransfer, existingAccountState, isValueTransfer) => {
    const thisStateCopy = cloneDeep(existingAccountState);

    // Assign persistence and transferValue props to the newly sent transfer
    const newTransferBundleWithPersistenceAndTransferValue = map(newTransfer, bundle => ({
        ...bundle,
        ...{ transferValue: -bundle.value, persistence: false },
    }));

    // Append new transfer to cached transfers list
    thisStateCopy.transfers = [...[newTransferBundleWithPersistenceAndTransferValue], ...thisStateCopy.transfers];

    // Turn on spent flag for addresses that were used in this transfer
    thisStateCopy.addresses = markAddressSpend([newTransfer], thisStateCopy.addresses);

    // Keep track of this transfer in unconfirmed tails so that it can be picked up for promotion
    // Also check if it was a value transfer
    // Only update unconfirmedBundleTails for promotion/reattachment if its a value transfer
    const bundle = get(newTransfer, `[${0}].bundle`);
    const tailTxs = filter(newTransfer, tx => tx.currentIndex === 0);

    if (isValueTransfer) {
        thisStateCopy.unconfirmedBundleTails = merge({}, thisStateCopy.unconfirmedBundleTails, {
            [bundle]: map(tailTxs, t => ({ ...t, account: name })), // Assign account name to each tx
        });
    }

    // Append new tail transaction hash to pendingTxTailHashes
    thisStateCopy.pendingTxTailsHashes = [...thisStateCopy.pendingTxTailsHashes, ...map(tailTxs, t => t.hash)];

    return mapUnspentAddressesHashesToAccount(thisStateCopy);
};
