import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import each from 'lodash/each';
import find from 'lodash/find';
import filter from 'lodash/filter';
import head from 'lodash/head';
import last from 'lodash/last';
import isEmpty from 'lodash/isEmpty';
import transform from 'lodash/transform';
import isNumber from 'lodash/isNumber';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import findKey from 'lodash/findKey';
import some from 'lodash/some';
import size from 'lodash/size';
import pickBy from 'lodash/pickBy';
import omitBy from 'lodash/omitBy';
import flatMap from 'lodash/flatMap';
import union from 'lodash/union';
import { iota } from './index';
import { getBalancesAsync, wereAddressesSpentFromAsync, findTransactionsAsync, sendTransferAsync } from './extendedApi';
import Errors from '../errors';

const errors = require('iota.lib.js/lib/errors/inputErrors');
const async = require('async');

/**
 *   Accepts addresses as an array.
 *   Finds latest balances on those addresses.
 *   Finds latest spent statuses on addresses.
 *   Transforms addresses array to a dictionary. [{ address: { index: 0, spent: false, balance: 0, checksum: address-checksum }}]
 *
 *   @method getAddressDataAndFormatBalance
 *   @param {array} addresses
 *   @returns {Promise}
 **/
export const getAddressDataAndFormatBalance = (addresses) => {
    if (isEmpty(addresses)) {
        return Promise.resolve({ addresses: {}, balance: 0 });
    }

    const cached = {
        balances: [],
        wereSpent: [],
    };

    return getBalancesAsync(addresses)
        .then((balances) => {
            cached.balances = map(balances.balances, Number);

            return wereAddressesSpentFromAsync(addresses);
        })
        .then((wereSpent) => {
            cached.wereSpent = wereSpent;

            return reduce(
                addresses,
                (acc, address, index) => {
                    acc.addresses[address] = {
                        index,
                        spent: cached.wereSpent[index],
                        balance: cached.balances[index],
                        checksum: iota.utils.addChecksum(address).slice(address.length),
                    };

                    acc.balance = acc.balance + cached.balances[index];

                    return acc;
                },
                { addresses: {}, balance: 0 },
            );
        });
};

/**
 *   Returns a promise meant for returning all associated addresses with a seed
 *
 *   @method getFullAddressHistory
 *   @param {string} seed
 *   @param {function} genFn
 *   @returns {Promise}
 **/
export const getFullAddressHistory = (seed, genFn) => {
    return getAddressesUptoLatestUnused(seed, genFn, { index: 0, total: 10, returnAll: true, security: 2 });
};

const findAddressesData = (addresses) => {
    return Promise.all([
        findTransactionsAsync({ addresses }),
        getBalancesAsync(addresses),
        wereAddressesSpentFromAsync(addresses),
    ]).then((data) => {
        const [hashes, balances, wereSpent] = data;

        return {
            hashes,
            balances: map(balances.balances, Number),
            wereSpent,
        };
    });
};

/**
 *   Starts traversing from specified index backwards
 *   Keeps on calling findTransactions to see if there's any associated tx with address
 *   Stops at the point where it finds an address with hash
 *   Basically just removes the unused addresses
 *
 *   @method removeUnusedAddresses
 *   @param {number} index
 *   @param {string} latestAddress
 *   @param {array} finalAddresses
 **/
const removeUnusedAddresses = (index, latestAddress, finalAddresses) => {
    if (!finalAddresses[index]) {
        return Promise.resolve([...finalAddresses, latestAddress]);
    }

    return findAddressesData([finalAddresses[index]]).then(({ hashes, balances, wereSpent }) => {
        if (size(hashes) === 0 && some(balances, (balance) => balance === 0) && some(wereSpent, (spent) => !spent)) {
            return removeUnusedAddresses(index - 1, finalAddresses[index], finalAddresses.slice(0, index));
        }

        return [...finalAddresses, latestAddress];
    });
};

/**
 *   Returns associated addresses with a seed
 *   Generates addresses in batches and upon each execution increase the index to fetch the next batch
 *   Stops at the point where there are no transaction hashes associated with last (total defaults to --> 10) addresses
 *
 *   @method getAddressesUptoLatestUnused
 *   @param {string} seed
 *   @param {function} genFn
 *   @param {object} [options={index: 0, total: 10, returnAll: true, security: 2}]
 *   @param {function} genFn
 *   @param {array} addressesUptoLatestUnused
 *   @param {object} addressData
 *
 **/
const getAddressesUptoLatestUnused = (
    seed,
    genFn,
    options,
    addressesUptoLatestUnused = [],
    addressData = { hashes: [], balances: [], wereSpent: [] },
) => {
    let thisBatchOfAddresses = [];

    const callback = (err, addresses) => {
        if (err) {
            throw new Error(err);
        }

        thisBatchOfAddresses = addresses;
        return findAddressesData(addresses);
    };

    return getNewAddress(seed, options, genFn, callback).then(({ hashes, balances, wereSpent }) => {
        const shouldGenerateNextBatch =
            size(hashes) || some(balances, (balance) => balance > 0) || some(wereSpent, (spent) => spent);

        if (shouldGenerateNextBatch) {
            addressesUptoLatestUnused = [...addressesUptoLatestUnused, ...thisBatchOfAddresses];

            const newOptions = assign({}, options, { index: options.total + options.index });

            return getAddressesUptoLatestUnused(
                seed,
                genFn,
                newOptions,
                addressesUptoLatestUnused,
                assign({}, addressData, {
                    hashes: union(addressData.hashes, hashes),
                    balances: [...addressData.balances, ...balances],
                    wereSpent: [...addressData.wereSpent, ...wereSpent],
                }),
            );
        }

        const lastAddressIndex = size(addressesUptoLatestUnused) - 1;

        // Before traversing backwards to remove the unused addresses,
        // Set the first address from the newly fetched addresses as the latest address.
        const latestAddress = head(thisBatchOfAddresses);

        return removeUnusedAddresses(lastAddressIndex, latestAddress, addressesUptoLatestUnused.slice()).then(
            (addresses) => {
                return {
                    addresses,
                    ...addressData,
                    // Append 0 balance to the latest unused address
                    balances: [...addressData.balances, 0],
                    // Append false as spent status to the latest unused address
                    wereSpent: [...addressData.wereSpent, false],
                };
            },
        );
    });
};

export const formatAddressData = (addresses, balances, addressesSpendStatus) => {
    return reduce(
        addresses,
        (acc, address, index) => {
            acc[address] = {
                index,
                spent: addressesSpendStatus[index],
                balance: balances[index],
                checksum: iota.utils.addChecksum(address).slice(address.length),
            };

            return acc;
        },
        {},
    );
};

/**
 *   Locally mark addresses as spent
 *
 *   @method markAddressesAsSpentSync
 *   @param {array} transfers
 *   @param {object} addressData
 *   @returns {object}
 **/
export const markAddressesAsSpentSync = (transfers, addressData) => {
    const addressDataClone = cloneDeep(addressData);
    const addresses = keys(addressDataClone);

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

/**
 *   Accepts address data.
 *   Finds all unspent addresses.
 *
 *   IMPORTANT: This function should always be utilized after the account is synced.
 *
 *   @method getUnspentAddressesSync
 *   @param {object} addressData
 *   @returns {array} - Array of unspent addresses
 **/
export const getUnspentAddressesSync = (addressData) => {
    return map(pickBy(addressData, (addressObject) => !addressObject.spent), (addressObject, address) => address);
};

/**
 *   Accepts pending transfers and address data.
 *   Finds all spent addresses with pending transfers.
 *
 *   IMPORTANT: This function should always be utilized after the account is synced.
 *
 *   @method getSpentAddressesWithPendingTransfersSync
 *   @param {array} pendingTransactions - Unconfirmed transfers
 *   @param {object} addressData
 *   @returns {array} - Array of spent addresses with pending transfers
 **/
export const getSpentAddressesWithPendingTransfersSync = (pendingTransactions, addressData) => {
    const spentAddresses = pickBy(addressData, (addressObject) => addressObject.spent);
    const spentAddressesWithPendingTransfers = new Set();

    each(pendingTransactions, (transaction) => {
        each(transaction.inputs, (input) => {
            if (input.address in spentAddresses) {
                spentAddressesWithPendingTransfers.add(input.address);
            }
        });
    });

    return Array.from(spentAddressesWithPendingTransfers);
};

/**
 *   Communicates with ledger and checks if the addresses are spent from.
 *
 *   @method filterSpentAddresses
 *   @param {array} inputs - Array or objects containing balance, keyIndex and address props.
 *   @param {array} spentAddresses - Array of spent addresses
 *   @returns {Promise} - A promise that resolves all inputs with unspent addresses.
 **/
export const filterSpentAddresses = (inputs, spentAddresses) => {
    const addresses = map(inputs, (input) => input.address);

    return wereAddressesSpentFromAsync(addresses).then((wereSpent) =>
        filter(inputs, (input, idx) => !wereSpent[idx] && !includes(spentAddresses, input.address)),
    );
};

/**
 *   Find the last address index from address data.
 *
 *   @method getStartingSearchIndexToFetchLatestAddresses
 *   @param {object} addressData - Addresses dictionary with balance and spend status
 *   @returns {number} index
 **/
export const getStartingSearchIndexToFetchLatestAddresses = (addressData) => {
    const addresses = keys(addressData);
    return size(addresses) ? addresses.length - 1 : 0;
};

/**
 *   Communicates with ledger and checks if the addresses are spent from.
 *
 *   @method shouldAllowSendingToAddress
 *   @param {array} addresses - Could also accept an address as string since wereAddressesSpentFrom casts it internally
 *   @param {function} callback
 **/
export const shouldAllowSendingToAddress = (addresses) => {
    return wereAddressesSpentFromAsync(addresses).then((wereSpent) => {
        const spentAddresses = filter(addresses, (address, idx) => wereSpent[idx]);

        return !spentAddresses.length;
    });
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
 *   Takes in transfer bundles and grab hashes for transfer objects that are unconfirmed.
 *
 *   @method getBalancesSync
 *   @param {array} addresses
 *   @param {object} addressData
 *
 *   @returns {array} - array of balances
 **/
export const getBalancesSync = (addresses, addressData) => {
    const balances = [];

    each(addresses, (address) => {
        // Just a safety check.
        if (address in addressData) {
            const balance = addressData[address].balance;
            balances.push(balance);
        }
    });

    return balances;
};

/**
 *   Gets the latest used addresses from the specified index onwards
 *
 *   @method getLatestAddresses
 *   @param {string} seed - Seed string
 *   @param {number} index - Index to start generating addresses from
 *   @param {function} genFn
 *
 *   @returns {Promise}
 **/

export const getLatestAddresses = (seed, index, genFn) => {
    return new Promise((resolve, reject) => {
        const options = { index, returnAll: true };
        return getNewAddress(seed, options, genFn, (err, addresses) => {
            if (err) {
                reject(err);
            } else {
                resolve(addresses);
            }
        });
    });
};

/**
 *   Takes address data and returns the latest address
 *
 *   @method getLatestAddress
 *   @param {object} addressData
 *   `
 *   @returns {string} - latest address
 **/
export const getLatestAddress = (addressData) => {
    return findKey(addressData, (addressObject) => addressObject.index === keys(addressData).length - 1);
};

/**
 *   Generate addresses till remainder (unused and also not blacklisted for being a remainder address)
 *
 *   @method getAddressesUptoRemainder
 *   @param {object} addressData
 *   @param {string} seed
 *   @param {function} genFn
 *   @param {array} blacklistedRemainderAddresses
 *   @returns {Promise}
 **/
export const getAddressesUptoRemainder = (addressData, seed, genFn, blacklistedRemainderAddresses = []) => {
    const latestAddress = getLatestAddress(addressData);
    const addressDataClone = cloneDeep(addressData);

    const isBlacklisted = (address) => includes(blacklistedRemainderAddresses, address);

    if (isBlacklisted(latestAddress)) {
        const latestAddressData = find(addressData, (data, address) => address === latestAddress);
        const startIndex = latestAddressData.index + 1;

        return getLatestAddresses(seed, startIndex, genFn).then((newAddresses) => {
            const remainderAddress = last(newAddresses);

            const addressDataUptoRemainder = transform(
                newAddresses,
                (acc, address, index) => {
                    acc[address] = {
                        index: index ? startIndex + 1 : startIndex,
                        balance: 0,
                        spent: false,
                        checksum: iota.utils.addChecksum(address).slice(address.length),
                    };
                },
                addressDataClone,
            );

            if (isBlacklisted(remainderAddress)) {
                return getAddressesUptoRemainder(addressDataUptoRemainder, seed, genFn, blacklistedRemainderAddresses);
            }

            return {
                remainderAddress,
                addressDataUptoRemainder,
            };
        });
    }

    return Promise.resolve({ remainderAddress: latestAddress, addressDataUptoRemainder: addressDataClone });
};

/**
 *   Takes current address data as input and adds latest used addresses
 *
 *   @method syncAddresses
 *   @param {string} seed - Seed string
 *   @param {string} existingAddressData
 *   @param {function} genFn
 *   @param {boolean} addNewAddress
 *
 *   @returns {Promise}
 **/

export const syncAddresses = (seed, existingAddressData, genFn, addNewAddress = false) => {
    const addressData = cloneDeep(existingAddressData);
    let index = getStartingSearchIndexToFetchLatestAddresses(addressData);

    return getLatestAddresses(seed, index, genFn).then((newAddresses) => {
        // Remove unused address
        if (!addNewAddress) {
            newAddresses.pop();
        }
        // If no new addresses return
        if (newAddresses.length === 0) {
            return addressData;
        }

        newAddresses.forEach((newAddress) => {
            // In case the newly created address is not part of the addresses object
            // Add that as a key with a 0 balance.
            if (size(addressData) === 0) {
                addressData[newAddress] = {
                    index,
                    balance: 0,
                    spent: false,
                    checksum: iota.utils.addChecksum(newAddress).slice(newAddress.length),
                };

                index += 1;
            } else if (!(newAddress in addressData)) {
                index += 1;
                addressData[newAddress] = {
                    index,
                    balance: 0,
                    spent: false,
                    checksum: iota.utils.addChecksum(newAddress).slice(newAddress.length),
                };
            }
        });

        return addressData;
    });
};

/**
 *   Filters inputs with addresses that have pending incoming transfers or
 *   are change addresses.
 *
 *   @method filterAddressesWithIncomingTransfers
 *   @param {array} inputs
 *   @param {array} pendingValueTransfers
 *   @returns {array}
 **/
export const filterAddressesWithIncomingTransfers = (inputs, pendingValueTransfers) => {
    if (isEmpty(pendingValueTransfers) || isEmpty(inputs)) {
        return inputs;
    }

    const inputsByAddress = transform(
        inputs,
        (acc, input) => {
            acc[input.address] = input;
        },
        {},
    );

    const addressesWithIncomingTransfers = new Set();

    // Check outputs of incoming transfers i.e. If there is an incoming value transfer
    // Checks outputs of sent transfers to check if there is an incoming transfer (change address)

    // Note: Inputs for outgoing transfers should not be checked since filterSpentAddresses already removes spent inputs
    const outputsToCheck = flatMap(pendingValueTransfers, (transfer) => transfer.outputs);

    each(outputsToCheck, (output) => {
        if (output.address in inputsByAddress && output.value > 0) {
            addressesWithIncomingTransfers.add(output.address);
        }
    });

    return map(
        omitBy(inputsByAddress, (input, address) => addressesWithIncomingTransfers.has(address)),
        (input) => input,
    );
};

/**
 * The same as iota.api.getNewAddress, but rewritten to support native address generation
 * See https://github.com/iotaledger/iota.lib.js/blob/a1b2e9e05d7cab3ef394900e5ca75fb46464e608/lib/api/api.js#L772
 *   @param {string} seed
 *   @param {object} options
 *       @property   {int} index         Key index to start search from
 *       @property   {int} total         Total number of addresses to return
 *       @property   {int} security      Security level to be used for the private key / address. Can be 1, 2 or 3
 *       @property   {bool} returnAll    return all searched addresses
 *   @param {function} genFn Native address function
 *   @param {function} callback
 *   @returns {string | array} address List of addresses
 **/
/*eslint-disable no-var*/
/*eslint-disable prefer-const*/
/*eslint-disable brace-style*/
/*eslint-disable no-else-return*/
/*eslint-disable no-loop-func*/

export const getNewAddress = (seed, options, genFn = null, callback) => {
    // If desktop, use iota lib js API call
    if (genFn === null) {
        return iota.api.getNewAddress(seed, options, callback);
    }

    // If no options provided, switch arguments
    if (arguments.length === 2 && Object.prototype.toString.call(options) === '[object Function]') {
        callback = options;
        options = {};
    }

    // validate the seed
    if (!iota.valid.isTrytes(seed)) {
        return callback(errors.invalidSeed());
    }

    // default index value
    var index = 0;

    if ('index' in options) {
        index = options.index;

        // validate the index option
        if (!iota.valid.isValue(index) || index < 0) {
            return callback(errors.invalidIndex());
        }
    }

    var total = options.total || null;
    // If no user defined security, use the standard value of 2
    var security = 2;

    if ('security' in options) {
        security = options.security;

        // validate the security option
        if (!iota.valid.isValue(security) || security < 1 || security > 3) {
            return callback(errors.invalidSecurity());
        }
    }

    let allAddresses = [];

    // Case 1: total
    //
    // If total number of addresses to generate is supplied, simply generate
    // and return the list of all addresses
    if (total) {
        // Increase index with each iteration
        return genFn(seed, index, security, total).then((addresses) => {
            allAddresses = addresses;
            return callback(null, allAddresses);
        });
    } else {
        //  Case 2: no total provided
        //
        //  Continue calling wasAddressSpenFrom & findTransactions to see if address was already created
        //  if null, return list of addresses
        //
        async.doWhilst(
            (callback) => {
                // Iteratee function
                var newAddress = '';
                return genFn(seed, index, security).then((address) => {
                    newAddress = address;
                    if (options.returnAll) {
                        allAddresses.push(newAddress);
                    }
                    // Increase the index
                    index += 1;
                    iota.api.wereAddressesSpentFrom(newAddress, (err, res) => {
                        if (err) {
                            return callback(err);
                        }

                        // Validity check
                        if (res[0]) {
                            callback(null, newAddress, true);
                        } else {
                            // Check for txs if address isn't spent
                            iota.api.findTransactions({ addresses: [newAddress] }, (err, transactions) => {
                                if (err) {
                                    return callback(err);
                                }

                                callback(err, newAddress, transactions.length > 0);
                            });
                        }
                    });
                });
            },
            (address, isUsed) => {
                return isUsed;
            },
            (err, address) => {
                // Final callback

                if (err) {
                    return callback(err);
                } else {
                    // If returnAll, return list of allAddresses
                    // else return the last address that was generated
                    var addressToReturn = options.returnAll ? allAddresses : address;

                    return callback(null, addressToReturn);
                }
            },
        );
    }
};

/*eslint-enable no-var*/
/*eslint-enable prefer-const*/
/*eslint-enable brace-style*/
/*eslint-enable no-else-return*/
/*eslint-enable no-loop-func*/

export const attachAndFormatAddress = (address, balance, seed, powFn) => {
    const transfers = [
        {
            address,
            value: 0,
        },
    ];

    let transfer = [];

    return findTransactionsAsync({ addresses: [address] })
        .then((hashes) => {
            if (size(hashes)) {
                throw new Error(Errors.ADDRESS_ALREADY_ATTACHED);
            }

            return sendTransferAsync(seed, transfers, powFn);
        })
        .then((transactionObjects) => {
            transfer = transactionObjects;

            return wereAddressesSpentFromAsync([address]);
        })
        .then((wereSpent) => {
            const addressData = formatAddressData([address], [balance], wereSpent);

            return {
                addressData,
                transfer,
            };
        });
};
