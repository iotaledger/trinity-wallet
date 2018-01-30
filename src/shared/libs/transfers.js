import get from 'lodash/get';
import keys from 'lodash/keys';
import each from 'lodash/each';
import isNull from 'lodash/isNull';
import { DEFAULT_TAG, DEFAULT_SECURITY } from '../config';
import { iota } from './iota';

/**
 *   Returns a single transfer array
 *   Converts message and tag to trytes. Basically preparing an array of transfer objects before making a transfer.
 *
 *   @method prepareTransferArray
 *   @param {string} address
 *   @param {number} value
 *   @param {string} message
 *   @param {string} [tag='IOTA']
 *   @returns {array} Transfer object
 **/
export const prepareTransferArray = (address, value, message, tag = DEFAULT_TAG) => {
    return [
        {
            address,
            value,
            message: iota.utils.toTrytes(message),
            tag: iota.utils.toTrytes(tag),
        },
    ];
};

/**
 *   Returns associated addresses with a seed
 *   Generates addresses in batches and upon each execution increase the index to fetch the next batch
 *   Stops at the point where there are no transaction hashes associated with last (total defaults to --> 10) addresses
 *
 *   @method prepareTransferArray
 *   @param {string} address
 *   @param {number} value
 *   @param {string} message
 *   @param {string} [tag='IOTA']
 *   @returns {array} Transfer object
 **/
const prepareInputs = (addressData, start, threshold, security = DEFAULT_SECURITY) => {
    const addresses = keys(addressData).slice(start);
    const inputs = [];
    let totalBalance = 0;

    each(addresses, address => {
        const balance = get(addressData, `${address}.balance`);
        const keyIndex = get(addressData, `${address}.index`);

        if (balance > 0) {
            const input = { address, balance, keyIndex, security };

            inputs.push(input);
            totalBalance += balance;

            const hasReachedThreshold = totalBalance >= threshold;

            if (hasReachedThreshold) {
                return false;
            }
        }
    });

    return { inputs, totalBalance };
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

export const getUnspentInputs = (addressData, start, threshold, inputs, callback) => {
    if (isNull(inputs)) {
        inputs = { inputs: [], totalBalance: 0, allBalance: 0 };
    }

    const preparedInputs = prepareInputs(addressData, start, threshold);

    inputs.allBalance += preparedInputs.inputs.reduce((sum, input) => sum + input.balance, 0);
    filterSpentAddresses(preparedInputs.inputs)
        .then(filtered => {
            const collected = filtered.reduce((sum, input) => sum + input.balance, 0);
            const diff = threshold - collected;

            if (diff > 0) {
                const ordered = preparedInputs.inputs.sort((a, b) => a.keyIndex - b.keyIndex).reverse();
                const end = ordered[0].keyIndex;

                getUnspentInputs(
                    addressData,
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
};

export const getStartingSearchIndexForAddress = addressData => {
    const address = Object.keys(addressData).find(address => addressData[address].balance > 0);

    return address ? addressData[address].index : 0;
};
