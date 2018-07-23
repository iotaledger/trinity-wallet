import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import each from 'lodash/each';
import find from 'lodash/find';
import filter from 'lodash/filter';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import transform from 'lodash/transform';
import isNumber from 'lodash/isNumber';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import map from 'lodash/map';
import maxBy from 'lodash/maxBy';
import reduce from 'lodash/reduce';
import findKey from 'lodash/findKey';
import some from 'lodash/some';
import size from 'lodash/size';
import pickBy from 'lodash/pickBy';
import omitBy from 'lodash/omitBy';
import flatMap from 'lodash/flatMap';
import { iota } from './index';
import {
    getBalancesAsync,
    wereAddressesSpentFromAsync,
    findTransactionsAsync,
    sendTransferAsync,
    generateAddressAsync,
    generateAddressesAsync,
} from './extendedApi';
import Errors from '../errors';
import { DEFAULT_SECURITY } from '../../config';

export const isAddressUsed = (address) => {
    return wereAddressesSpentFromAsync([address]).then((spent) => {
        const isSpent = head(spent) === true;

        return isSpent || findTransactionsAsync({ addresses: [address] }).then((hashes) => size(hashes) > 0);
    });
};

export const getAddressesDataUptoLatestUnusedAddress = (seed, options, addressGenFn) => {
    const { index, security } = options;

    let addressData = {};

    const generateAddressData = (currentKeyIndex) => {
        let thisAddress = null;

        return generateAddressAsync(seed, currentKeyIndex, security, addressGenFn)
            .then((address) => {
                thisAddress = address;

                return findAddressesData([address]);
            })
            .then(({ hashes, balances, wereSpent }) => {
                addressData = {
                    ...addressData,
                    ...formatAddressData([thisAddress], balances, wereSpent, [currentKeyIndex]),
                };

                if (size(hashes) === 0 && some(wereSpent, (spent) => !spent)) {
                    return addressData;
                }

                const nextKeyIndex = currentKeyIndex + 1;

                return generateAddressData(nextKeyIndex);
            });
    };

    return generateAddressData(index);
};

/**
 *   Accepts addresses as an array.
 *   Finds latest balances on those addresses.
 *   Finds latest spent statuses on addresses.
 *   Transforms addresses array to a dictionary. [{ address: { index: 0, spent: false, balance: 0, checksum: address-checksum }}]
 *
 *   @method getAddressDataAndFormatBalance
 *   @param {array} addresses
 *   @param {array} keyIndexes
 *
 *   @returns {Promise}
 **/
export const getAddressDataAndFormatBalance = (addresses, keyIndexes = []) => {
    const sizeOfAddresses = size(addresses);
    const sizeOfKeyIndexes = size(keyIndexes);

    if (!sizeOfAddresses) {
        return Promise.resolve({ addresses: {}, balance: 0 });
    }

    if (sizeOfAddresses && sizeOfKeyIndexes && sizeOfAddresses !== sizeOfKeyIndexes) {
        throw new Error(Errors.ADDRESS_METADATA_LENGTH_MISMATCH);
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
                        index: sizeOfKeyIndexes ? keyIndexes[index] : index,
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
 *   @param {function} addressGenFn
 *   @returns {Promise}
 **/
export const getFullAddressHistory = (seed, addressGenFn) => {
    let generatedAddresses = [];
    const addressData = { hashes: [], balances: [], wereSpent: [] };

    const generateAndStoreAddressesInBatch = (currentOptions) => {
        let thisBatchOfAddresses = [];

        return generateAddressesAsync(seed, currentOptions, addressGenFn)
            .then((addresses) => {
                thisBatchOfAddresses = addresses;

                return findAddressesData(thisBatchOfAddresses);
            })
            .then(({ hashes, balances, wereSpent }) => {
                const shouldGenerateNextBatch =
                    size(hashes) || some(balances, (balance) => balance > 0) || some(wereSpent, (spent) => spent);

                if (shouldGenerateNextBatch) {
                    generatedAddresses = [...generatedAddresses, ...thisBatchOfAddresses];
                    addressData.hashes = [...addressData.hashes, ...hashes];
                    addressData.balances = [...addressData.balances, ...balances];
                    addressData.wereSpent = [...addressData.wereSpent, ...wereSpent];

                    const newOptions = assign({}, currentOptions, {
                        index: currentOptions.total + currentOptions.index,
                    });

                    return generateAndStoreAddressesInBatch(newOptions);
                }

                const lastAddressIndex = size(generatedAddresses) - 1;

                // Before traversing backwards to remove the unused addresses,
                // Set the first address from the newly fetched addresses as the latest address.
                const latestAddress = head(thisBatchOfAddresses);

                return removeUnusedAddresses(lastAddressIndex, latestAddress, generatedAddresses.slice()).then(
                    (addresses) => {
                        const sizeOfAddressesTillOneUnused = size(addresses);

                        return {
                            addresses,
                            ...addressData,
                            // Append 0 balance to the latest unused address
                            balances: [...addressData.balances.slice(0, sizeOfAddressesTillOneUnused - 1), 0],
                            // Append false as spent status to the latest unused address
                            wereSpent: [...addressData.wereSpent.slice(0, sizeOfAddressesTillOneUnused - 1), false],
                        };
                    },
                );
            });
    };

    const options = { index: 0, total: 10, security: DEFAULT_SECURITY };

    return generateAndStoreAddressesInBatch(options);
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
 *   @param {string} latestUnusedAddress
 *   @param {array} finalAddresses
 **/
export const removeUnusedAddresses = (index, latestUnusedAddress, finalAddresses) => {
    if (!finalAddresses[index]) {
        return Promise.resolve([...finalAddresses, latestUnusedAddress]);
    }

    return findAddressesData([finalAddresses[index]]).then(({ hashes, balances, wereSpent }) => {
        if (size(hashes) === 0 && some(balances, (balance) => balance === 0) && some(wereSpent, (spent) => !spent)) {
            return removeUnusedAddresses(index - 1, finalAddresses[index], finalAddresses.slice(0, index));
        }

        return [...finalAddresses, latestUnusedAddress];
    });
};

/**
 * Format address data - Assign corresponding balance, spend status and checksum
 * Note: If addresses does not start with key index 0, key indexes must be provided
 * Otherwise it can cause a key index mismatch
 *
 * @method formatAddressData
 *
 * @param {array} addresses
 * @param {array} balances
 * @param {array} addressesSpendStatus
 * @param {array} keyIndexes
 *
 * @returns {object}
 */
export const formatAddressData = (addresses, balances, addressesSpendStatus, keyIndexes = []) => {
    const sizeOfAddresses = size(addresses);
    const sizeOfBalances = size(balances);
    const sizeOfSpentStatuses = size(addressesSpendStatus);
    const sizeOfKeyIndexes = size(keyIndexes);

    if (
        sizeOfAddresses !== sizeOfBalances ||
        sizeOfAddresses !== sizeOfSpentStatuses ||
        (sizeOfKeyIndexes ? sizeOfKeyIndexes !== sizeOfAddresses : false)
    ) {
        throw new Error(Errors.ADDRESS_METADATA_LENGTH_MISMATCH);
    }

    return reduce(
        addresses,
        (acc, address, index) => {
            acc[address] = {
                index: sizeOfKeyIndexes ? keyIndexes[index] : index,
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

    const isBlacklisted = (address) => includes(blacklistedRemainderAddresses, address);

    if (isBlacklisted(latestAddress)) {
        const latestAddressData = find(addressData, (data, address) => address === latestAddress);
        const startIndex = latestAddressData.index + 1;

        return getAddressesDataUptoLatestUnusedAddress(
            seed,
            { index: startIndex, security: DEFAULT_SECURITY },
            genFn,
        ).then((newAddressData) => {
            const addressObjectWithHighestIndex = maxBy(map(newAddressData, (data) => data), 'index');

            const remainderAddress = findKey(
                newAddressData,
                (data) => data.index === addressObjectWithHighestIndex.index,
            );

            const addressDataUptoRemainder = { ...addressData, ...newAddressData };

            if (isBlacklisted(remainderAddress)) {
                return getAddressesUptoRemainder(addressDataUptoRemainder, seed, genFn, blacklistedRemainderAddresses);
            }

            return {
                remainderAddress,
                addressDataUptoRemainder,
            };
        });
    }

    return Promise.resolve({ remainderAddress: latestAddress, addressDataUptoRemainder: addressData });
};

/**
 *   Takes current address data as input and adds latest unused addresses
 *
 *   @method syncAddresses
 *   @param {string} seed - Seed string
 *   @param {object} existingAddressData
 *   @param {function} genFn
 *
 *   @returns {Promise}
 **/

export const syncAddresses = (seed, existingAddressData, genFn) => {
    const addressData = cloneDeep(existingAddressData);

    const mergeLatestAddresses = () => {
        const latestAddressData = find(addressData, (data, address) => address === latestAddress);
        // Start index should be (highest index in existing address data + 1)
        const startIndex = latestAddressData.index + 1;

        return getAddressesDataUptoLatestUnusedAddress(
            seed,
            { index: startIndex, security: DEFAULT_SECURITY },
            genFn,
        ).then((newAddressData) => {
            const mergeInExistingAddressData = (data, newAddress) => {
                addressData[newAddress] = data;
            };

            each(newAddressData, mergeInExistingAddressData);

            return addressData;
        });
    };

    // Find the address with highest index from existing address data
    const latestAddress = getLatestAddress(addressData);

    // First check if there are any transactions associated with the latest address or if the address is spent
    return isAddressUsed(latestAddress).then((isUsed) => {
        if (!isUsed) {
            return addressData;
        }

        // Otherwise generate addresses till latest unused and merge them in existing address data
        return mergeLatestAddresses();
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
 *  Checks if any of the addresses used in a transaction is spent
 *
 *   @method isAnyAddressSpent
 *   @param {array} transactionObjects

 *   @returns {Promise<boolean>}
 **/
export const isAnyAddressSpent = (transactionObjects) => {
    const addresses = map(transactionObjects, (tx) => tx.address);

    return wereAddressesSpentFromAsync(addresses).then((wereSpent) => some(wereSpent, (spent) => spent));
};

/**
 *   Attach address to tangle if its not already attached
 *
 *   @method attachAndFormatAddress
 *
 *   @param {string} address
 *   @param {number} index
 *   @param {number} balance
 *   @param {string} seed
 *   @param {function} powFn
 *
 *   @returns {array}
 **/
export const attachAndFormatAddress = (address, index, balance, seed, powFn) => {
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
            const addressData = formatAddressData([address], [balance], wereSpent, [index]);

            return {
                addressData,
                transfer,
            };
        });
};
