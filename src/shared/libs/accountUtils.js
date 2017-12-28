import each from 'lodash/each';
import get from 'lodash/get';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import isNull from 'lodash/isNull';
import { iota } from '../libs/iota';
import { getBundleTailsForSentTransfers } from './promoter';

export const formatAddressData = (addresses, balances, addressesSpendStatus) => {
    const addressData = Object.assign(
        {},
        ...addresses.map((n, index) => ({ [n]: { balance: balances[index], spent: addressesSpendStatus[index] } })),
    );
    return addressData;
};

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

export const groupTransfersByBundle = transfers => {
    const groupedTransfers = [];

    transfers.forEach(tx => {
        if (!groupedTransfers.length) {
            groupedTransfers.push([tx]);
        } else {
            const i = groupedTransfers.findIndex(bundle => bundle[0].bundle === tx.bundle);
            if (i !== -1) {
                groupedTransfers[i].push(tx);
            } else {
                groupedTransfers.push([tx]);
            }
        }
    });

    // Order arrays of transfer object(s) by currentIndex
    groupedTransfers.forEach(arr => {
        arr.sort((a, b) => {
            return a.currentIndex - b.currentIndex;
        });
    });

    return groupedTransfers;
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
        let balanceArray = Object.values(data).map(x => x.balance);
        balance = balanceArray.reduce((a, b) => a + b);
    }
    return balance;
};

export const getIndexesWithBalanceChange = (a, b) => {
    let indexes = [];
    for (var i = 0; i < a.length; i++) {
        if (a[i] != b[i]) {
            indexes.push(i);
        }
    }
    return indexes;
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

export const organizeAccountInfo = (accountName, data) => {
    const transfers = formatTransfers(data.transfers, data.addresses);

    const addressData = formatFullAddressData(data);
    const balance = calculateBalance(addressData);

    const unconfirmedTails = getBundleTailsForSentTransfers(transfers, data.addresses); // Should really be ordered.
    const addressDataWithSpentFlag = markAddressSpend(transfers, addressData);

    return {
        accountName,
        transfers,
        addresses: addressDataWithSpentFlag,
        balance,
        unconfirmedTails,
    };
};
