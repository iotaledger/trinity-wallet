import assign from 'lodash/assign';
import each from 'lodash/each';
import get from 'lodash/get';
import map from 'lodash/map';
import filter from 'lodash/filter';
import reduce from 'lodash/reduce';
import isNull from 'lodash/isNull';
import includes from 'lodash/includes';
import { iota } from '../libs/iota';
import { getBundleTailsForSentTransfers } from './promoter';

export const formatFullAddressData = data => {
    const addresses = data.addresses;
    const addressData = Object.assign({}, ...addresses.map(n => ({ [n]: { balance: 0, spent: false } })));
    for (let i = 0; i < data.inputs.length; i++) {
        addressData[data.inputs[i].address].balance = data.inputs[i].balance;
    }
    return addressData;
};

export const markAddressSpend = (transfers, addressData) => {
    const addresses = Object.keys(addressData);

    // Iterate over all bundles and sort them between incoming and outgoing transfers
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
                    addressData[bundleEntry.address].spent = true;
                }
            }
        });
    });

    return addressData;
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

export const getAddressesWithChangedBalance = (allAddresses, indicesWithChangedBalance) => {
    const addressesWithChangedBalance = [];

    each(indicesWithChangedBalance, idx => {
        if (allAddresses[idx]) {
            addressesWithChangedBalance.push(allAddresses[idx]);
        }
    });

    return addressesWithChangedBalance;
};

export const mergeLatestTransfersInOld = (oldTransfers, latestTransfers) => {
    // Transform both old and latest into dictionaries with bundle as prop
    const toDict = (res, transfer) => {
        const top = transfer[0];
        const bundle = top.bundle;

        if (bundle in res) {
            res[bundle] = [...res[bundle], transfer];
        } else {
            res[bundle] = [transfer];
        }

        return res;
    };

    const override = (res, bundleObject, key) => {
        if (key in transformedLatestTransfers) {
            each(transformedLatestTransfers[key], value => res.push(value)); // Just replace old bundle objects with latest
        } else {
            each(transformedOldTransfers[key], value => res.push(value)); // Otherwise just keep the old ones
        }

        return res;
    };

    const transformedOldTransfers = reduce(oldTransfers, toDict, {});
    const transformedLatestTransfers = reduce(latestTransfers, toDict, {});

    return reduce(transformedOldTransfers, override, []);
};

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

export const filterSpentAddresses = inputs => {
    return new Promise((resolve, reject) => {
        // Find transaction objects for addresses
        iota.api.findTransactionObjects({ addresses: inputs.map(input => input.address) }, (err, txs) => {
            if (err) {
                reject(err);
            }
            // Filter out receive transactions
            txs = txs.filter(tx => tx.value < 0);
            if (txs.length > 0) {
                // Get bundle hashes
                const bundles = txs.map(tx => tx.bundle);
                // Find transaction objects for bundle hashes
                iota.api.findTransactionObjects({ bundles: bundles }, (err, txs) => {
                    if (err) {
                        reject(err);
                    }
                    let hashes = txs.filter(tx => tx.currentIndex === 0);
                    hashes = hashes.map(tx => tx.hash);
                    iota.api.getLatestInclusion(hashes, (err, states) => {
                        if (err) {
                            reject(err);
                        }
                        // Filter confirmed hashes
                        const confirmedHashes = hashes.filter((hash, i) => states[i]);
                        // Filter unconfirmed hashes
                        const unconfirmedHashes = hashes
                            .filter(hash => confirmedHashes.indexOf(hash) === -1)
                            .map(hash => ({ hash, validate: true }));
                        const getBundles = confirmedHashes.concat(unconfirmedHashes).map(
                            hash =>
                                new Promise((resolve, reject) => {
                                    iota.api.traverseBundle(
                                        typeof hash == 'string' ? hash : hash.hash,
                                        null,
                                        [],
                                        (err, bundle) => {
                                            if (err) {
                                                reject(err);
                                            }
                                            resolve(typeof hash === 'string' ? bundle : { bundle, validate: true });
                                        },
                                    );
                                }),
                        );
                        resolve(
                            Promise.all(getBundles)
                                .then(bundles => {
                                    bundles = bundles
                                        .filter(bundle => {
                                            if (bundle.validate) {
                                                return iota.utils.isBundle(bundle.bundle);
                                            }
                                            return true;
                                        })
                                        .map(bundle => (bundle.hasOwnProperty('validate') ? bundle.bundle : bundle));
                                    const blacklist = bundles
                                        .reduce((a, b) => a.concat(b), [])
                                        .filter(tx => tx.value < 0)
                                        .map(tx => tx.address);
                                    return inputs.filter(input => blacklist.indexOf(input.address) === -1);
                                })
                                .catch(err => reject(err)),
                        );
                    });
                });
            } else {
                resolve(inputs);
            }
        });
    });
};

export const getUnspentInputs = (seed, start, threshold, inputs, callback) => {
    if (isNull(inputs)) {
        inputs = { inputs: [], totalBalance: 0, allBalance: 0 };
    }

    iota.api.getInputs(seed, { start: start, threshold: threshold }, (err, res) => {
        if (err) {
            callback(err);
            return;
        }
        inputs.allBalance += res.inputs.reduce((sum, input) => sum + input.balance, 0);
        filterSpentAddresses(res.inputs)
            .then(filtered => {
                const collected = filtered.reduce((sum, input) => sum + input.balance, 0);
                const diff = threshold - collected;
                if (diff > 0) {
                    const ordered = res.inputs.sort((a, b) => a.keyIndex - b.keyIndex).reverse();
                    const end = ordered[0].keyIndex;
                    getUnspentInputs(
                        seed,
                        end + 1,
                        diff,
                        {
                            inputs: inputs.inputs.concat(filtered),
                            totalBalance: inputs.totalBalance + collected,
                            allBalance: inputs.allBalance,
                        },
                        callback,
                    );
                } else {
                    callback(null, {
                        inputs: inputs.inputs.concat(filtered),
                        totalBalance: inputs.totalBalance + collected,
                        allBalance: inputs.allBalance,
                    });
                }
            })
            .catch(err => callback(err));
    });
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

    const unconfirmedBundleTails = getBundleTailsForSentTransfers(transfers, data.addresses); // Should really be ordered.
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

export const getTotalBalance = (addresses, threshold = 1) => {
    return new Promise((resolve, reject) => {
        iota.api.getBalances(addresses, threshold, (err, data) => {
            if (err) {
                reject(err);
            } else {
                const newBalances = map(data.balances, Number);
                const totalBalance = reduce(
                    newBalances,
                    (res, val) => {
                        res = res + val;
                        return res;
                    },
                    0,
                );

                resolve(totalBalance);
            }
        });
    });
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

export const getTransactionHashes = addresses => {
    return new Promise((resolve, reject) => {
        iota.api.findTransactions({ addresses }, (err, hashes) => {
            if (err) {
                reject(err);
            } else {
                resolve(hashes);
            }
        });
    });
};

export const getTransactionsObjects = hashes => {
    return new Promise((resolve, reject) => {
        iota.api.getTransactionsObjects(hashes, (err, txs) => {
            if (err) {
                reject(err);
            } else {
                console.log('Txssss', txs);
                resolve(txs);
            }
        });
    });
};

export const getInclusionWithHashes = hashes => {
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

export const getConfirmedTxTailsHashes = (states, hashes) => {
    const confirmedHashes = filter(hashes, (hash, idx) => states[idx]);

    return new Promise((resolve, reject) => resolve(confirmedHashes));
};
