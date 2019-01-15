import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import each from 'lodash/each';
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
import omitBy from 'lodash/omitBy';
import flatMap from 'lodash/flatMap';
import { iota } from './index';
import { getBalancesAsync, wereAddressesSpentFromAsync, findTransactionsAsync, sendTransferAsync } from './extendedApi';
import { prepareTransferArray } from './transfers';
import Errors from '../errors';
import { DEFAULT_SECURITY } from '../../config';

/**
 * Checks if an address is used (Uses locally stored address data and transactions)
 *
 * @method isAddressUsedSync
 * @param {string} address
 * @param {object} addressData
 * @param {array} normalisedTransactions
 *
 * @returns {boolean}
 */
export const isAddressUsedSync = (address, addressData, normalisedTransactions) => {
    const transactionAddresses = [
        ...map(flatMap(normalisedTransactions, (tx) => tx.inputs), (tx) => tx.address),
        ...map(flatMap(normalisedTransactions, (tx) => tx.outputs), (tx) => tx.address),
    ];

    return get(addressData, `${address}.spent.local`) === true || includes(transactionAddresses, address);
};

/**
 * Checks if an address is used i.e. has spent or has associated hashes
 *
 *   @method isAddressUsed
 *   @param {string} provider
 *
 *   @returns {function(string, object, array): Promise<boolean>}
 **/
export const isAddressUsed = (provider) => (address, addressData, normalisedTransactions) => {
    if (isAddressUsedSync(address, addressData, normalisedTransactions)) {
        return Promise.resolve(true);
    }

    return wereAddressesSpentFromAsync(provider)([address]).then((spent) => {
        const isSpent = head(spent) === true;

        return isSpent || findTransactionsAsync(provider)({ addresses: [address] }).then((hashes) => size(hashes) > 0);
    });
};

/**
 * Sequentially generate addresses till latest unused address
 *
 *   @method getAddressesDataUptoLatestUnusedAddress
 *   @param {string} provider
 *
 *   @returns {function(object, array, object): Promise<object>}
 **/
export const getAddressesDataUptoLatestUnusedAddress = (provider) => (seedStore, normalisedTransactions, options) => {
    const { index, security } = options;

    const generateAddressData = (currentKeyIndex, generatedAddressData) => {
        return seedStore
            .generateAddress({ index: currentKeyIndex, security })
            .then((address) => {
                return findAddressesData(provider)([address], normalisedTransactions);
            })
            .then(({ hashes, balances, wereSpent, addresses }) => {
                const updatedAddressData = {
                    ...generatedAddressData,
                    ...formatAddressData(addresses, balances, wereSpent, [currentKeyIndex]),
                };

                // Check if the newly generated address is unused (no transactions, zero balance and unspent).
                if (
                    size(hashes) === 0 &&
                    some(balances, (balance) => balance === 0) &&
                    some(wereSpent, (status) => status.local === false && status.remote === false)
                ) {
                    return updatedAddressData;
                }

                // If the newly generated address is used, generate a new address.
                const nextKeyIndex = currentKeyIndex + 1;

                return generateAddressData(nextKeyIndex, updatedAddressData);
            });
    };

    return generateAddressData(index, {});
};

/**
 *   Accepts addresses with indexes [{ address, index }] as an array.
 *   Finds latest balances on those addresses.
 *   Finds latest spent statuses on addresses.
 *   Transforms addresses array to a dictionary. [{ address: { index: 0, spent: false, balance: 0, checksum: address-checksum }}]
 *
 *   @method getAddressDataAndFormatBalance
 *   @param {string} provider
 *
 *   @returns {function(array, array, array): Promise<object>}
 **/
export const getAddressDataAndFormatBalance = (provider) => (addresses, normalisedTransactions, keyIndexes = []) => {
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

    return getBalancesAsync(provider)(addresses)
        .then((balances) => {
            cached.balances = map(balances.balances, Number);

            return wereAddressesSpentFromAsync(provider)(addresses);
        })
        .then((wereSpent) => {
            // Get spend statuses of addresses from normalised transactions
            const spendStatuses = findSpendStatusesFromNormalisedTransactions(addresses, normalisedTransactions);

            cached.wereSpent = map(wereSpent, (status, idx) => ({
                remote: status,
                local: spendStatuses[idx],
            }));

            return {
                addresses: formatAddressData(addresses, cached.balances, cached.wereSpent, keyIndexes),
                balance: accumulateBalance(cached.balances),
            };
        });
};

/**
 *  Returns all associated addresses with history for a seed
 *
 *  @method getFullAddressHistory
 *  @param {string} provider
 *
 *  @returns {function(object): Promise<object>}
 */
export const getFullAddressHistory = (provider) => (seedStore) => {
    let generatedAddresses = [];
    const addressData = { hashes: [], balances: [], wereSpent: [] };

    const generateAndStoreAddressesInBatch = (currentOptions) => {
        return seedStore
            .generateAddress(currentOptions)
            .then((addresses) => {
                return findAddressesData(provider)(addresses);
            })
            .then(({ hashes, balances, wereSpent, addresses }) => {
                const shouldGenerateNextBatch =
                    size(hashes) ||
                    some(balances, (balance) => balance > 0) ||
                    some(wereSpent, (status) => status.remote || status.local);

                if (shouldGenerateNextBatch) {
                    generatedAddresses = [...generatedAddresses, ...addresses];
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
                const latestAddress = head(addresses);

                return removeUnusedAddresses(provider)(
                    lastAddressIndex,
                    latestAddress,
                    generatedAddresses.slice(),
                ).then((addresses) => {
                    const sizeOfAddressesTillOneUnused = size(addresses);

                    return {
                        addresses,
                        ...addressData,
                        // Append 0 balance to the latest unused address
                        balances: [...addressData.balances.slice(0, sizeOfAddressesTillOneUnused - 1), 0],
                        // Append false as spent status to the latest unused address
                        wereSpent: [
                            ...addressData.wereSpent.slice(0, sizeOfAddressesTillOneUnused - 1),
                            { local: false, remote: false },
                        ],
                    };
                });
            });
    };

    const options = { index: 0, total: 10, security: DEFAULT_SECURITY };

    return generateAndStoreAddressesInBatch(options);
};

/**
 *  Finds hashes, balances and spent statuses for an address
 *
 *  @method findAddressesData
 *  @param {string} provider
 *
 *  @returns {function(array): Promise<{
 *      addresses: {array},
 *      hashes: {array},
 *      balances: {array},
 *      wereSpent: {array}
 *      }}
 */
const findAddressesData = (provider) => (addresses, normalisedTransactions = []) => {
    return Promise.all([
        findTransactionsAsync(provider)({ addresses }),
        getBalancesAsync(provider)(addresses),
        wereAddressesSpentFromAsync(provider)(addresses),
    ]).then((data) => {
        const [hashes, balances, wereSpent] = data;
        const spendStatusesFromTransactions = findSpendStatusesFromNormalisedTransactions(
            addresses,
            normalisedTransactions,
        );

        return {
            addresses,
            hashes,
            balances: map(balances.balances, Number),
            wereSpent: map(wereSpent, (status, idx) => ({ remote: status, local: spendStatusesFromTransactions[idx] })),
        };
    });
};

/**
 *  Starts traversing from specified index backwards
 *  Keeps on calling findTransactions to see if there's any associated tx with address
 *  Stops at the point where it finds an address with hash
 *  Basically just removes the unused addresses
 *
 *  @method removeUnusedAddresses
 *  @param {string} provider
 *
 *  @returns {function(number, string, array): Promise<array>}
 */
export const removeUnusedAddresses = (provider) => (index, latestUnusedAddress, finalAddresses) => {
    if (!finalAddresses[index]) {
        return Promise.resolve([...finalAddresses, latestUnusedAddress]);
    }

    return findAddressesData(provider)([finalAddresses[index]]).then(({ hashes, balances, wereSpent }) => {
        if (
            size(hashes) === 0 &&
            some(balances, (balance) => balance === 0) &&
            some(wereSpent, (status) => status.remote === false && status.local === false)
        ) {
            return removeUnusedAddresses(provider)(index - 1, finalAddresses[index], finalAddresses.slice(0, index));
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
 * @param {array} addressesSpendStatuses
 * @param {array} keyIndexes
 *
 * @returns {object}
 */
export const formatAddressData = (addresses, balances, addressesSpendStatuses, keyIndexes = []) => {
    const sizeOfAddresses = size(addresses);
    const sizeOfBalances = size(balances);
    const sizeOfSpendStatuses = size(addressesSpendStatuses);
    const sizeOfKeyIndexes = size(keyIndexes);

    if (
        sizeOfAddresses !== sizeOfBalances ||
        sizeOfAddresses !== sizeOfSpendStatuses ||
        (sizeOfKeyIndexes ? sizeOfKeyIndexes !== sizeOfAddresses : false)
    ) {
        throw new Error(Errors.ADDRESS_METADATA_LENGTH_MISMATCH);
    }

    return reduce(
        addresses,
        (acc, address, index) => {
            const spendStatusOfThisAddress = addressesSpendStatuses[index];
            const { local, remote } = spendStatusOfThisAddress;

            acc[address] = {
                index: sizeOfKeyIndexes ? keyIndexes[index] : index,
                spent: { local, remote },
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
                    addressDataClone[bundleEntry.address].spent.local = true;
                }
            }
        });
    });

    return addressDataClone;
};

/**
 * Filters spent addresses from locally stored address data
 *
 * @method filterSpentAddressesSync
 * @param {array} addresses
 * @param {object} addressData
 *
 * @returns {array}
 */
export const filterSpentAddressesSync = (addresses, addressData) =>
    filter(addresses, (address) => !get(addressData, `${address}.spent.local`));

/**
 *   Communicates with ledger and checks if the addresses are spent from.
 *
 *   @method filterSpentAddresses
 *   @param {string} provider
 *
 *   @returns {function(array, object, array): Promise<array>}
 **/
export const filterSpentAddresses = (provider) => (inputs, addressData, normalisedTransactions) => {
    const addresses = filterSpentAddressesSync(map(inputs, (input) => input.address), addressData);
    const filteredInputs = filter(inputs, (input) => includes(addresses, input.address));

    // If all inputs are spent, avoid making the network call
    if (isEmpty(addresses)) {
        return Promise.resolve([]);
    }

    const spendStatuses = findSpendStatusesFromNormalisedTransactions(addresses, normalisedTransactions);

    return wereAddressesSpentFromAsync(provider)(addresses).then((wereSpent) =>
        filter(filteredInputs, (input, idx) => !wereSpent[idx] && !spendStatuses[idx]),
    );
};

/**
 *   Communicates with ledger and checks if the any address is spent.
 *
 *   @method isAnyAddressSpent
 *   @param {string} [provider]
 *
 *   @returns {function(array): Promise<boolean>}
 **/
export const isAnyAddressSpent = (provider) => (addresses) => {
    return wereAddressesSpentFromAsync(provider)(addresses).then((spendStatuses) =>
        some(spendStatuses, (spendStatus) => spendStatus === true),
    );
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
    const addressObjectWithHighestIndex = getLatestAddressData(addressData);

    return findKey(addressData, (data) => data.index === addressObjectWithHighestIndex.index);
};

/**
 *   Takes address data and returns the address data object with highest index
 *
 *   @method getLatestAddressData
 *   @param {object} addressData
 *   `
 *   @returns {string} - latest address
 **/
export const getLatestAddressData = (addressData) => maxBy(map(addressData, (data) => data), 'index');

/**
 *   Generate addresses till remainder (unused and also not blacklisted for being a remainder address)
 *
 *   @method getAddressesUptoRemainder
 *   @param {string} [provider]
 *
 *   @returns {function(object, array, string, function, array): Promise<object>}
 **/
export const getAddressesUptoRemainder = (provider) => (
    addressData,
    normalisedTransactions,
    seedStore,
    blacklistedRemainderAddresses = [],
) => {
    const latestAddress = getLatestAddress(addressData);
    const latestAddressData = getLatestAddressData(addressData);

    const isBlacklisted = (address) => includes(blacklistedRemainderAddresses, address);

    if (isBlacklisted(latestAddress)) {
        const latestAddressData = getLatestAddressData(addressData);
        const startIndex = latestAddressData.index + 1;

        return getAddressesDataUptoLatestUnusedAddress(provider)(seedStore, normalisedTransactions, {
            index: startIndex,
            security: DEFAULT_SECURITY,
        }).then((newAddressData) => {
            const remainderAddress = getLatestAddress(newAddressData);
            const remainderAddressData = getLatestAddressData(newAddressData);

            const addressDataUptoRemainder = { ...addressData, ...newAddressData };

            if (isBlacklisted(remainderAddress)) {
                return getAddressesUptoRemainder(provider)(
                    addressDataUptoRemainder,
                    normalisedTransactions,
                    seedStore,
                    blacklistedRemainderAddresses,
                );
            }

            return {
                remainderAddress,
                remainderIndex: remainderAddressData.index,
                addressDataUptoRemainder,
            };
        });
    }

    return Promise.resolve({
        remainderAddress: latestAddress,
        remainderIndex: latestAddressData.index,
        addressDataUptoRemainder: addressData,
    });
};

/**
 *   Takes current address data as input and adds latest unused addresses
 *
 *   @method syncAddresses
 *   @param {string} [provider]
 *
 *   @returns {function(string, object, array, function): Promise<object>}
 **/
export const syncAddresses = (provider) => (seedStore, existingAddressData, normalisedTransactions) => {
    const addressData = cloneDeep(existingAddressData);
    // Find the address object with highest index from existing address data
    const latestAddressData = getLatestAddressData(addressData);
    const latestAddress = getLatestAddress(addressData);

    const mergeLatestAddresses = () => {
        // Start index should be (highest index in existing address data + 1)
        const startIndex = latestAddressData.index + 1;

        return getAddressesDataUptoLatestUnusedAddress(provider)(seedStore, normalisedTransactions, {
            index: startIndex,
            security: DEFAULT_SECURITY,
        }).then((newAddressData) => {
            const mergeInExistingAddressData = (data, newAddress) => {
                addressData[newAddress] = data;
            };

            each(newAddressData, mergeInExistingAddressData);

            return addressData;
        });
    };

    // First check if there are any transactions associated with the latest address or if the address is spent
    return isAddressUsed(provider)(latestAddress, latestAddressData, normalisedTransactions).then((isUsed) => {
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
 *   Attach address to tangle if its not already attached
 *
 *   @method attachAndFormatAddress
 *   @param {string} [provider]
 *
 *   @returns {function(string, number, number, string, array, object, function): Promise<object>}
 **/
export const attachAndFormatAddress = (provider) => (
    address,
    index,
    balance,
    seedStore,
    normalisedTransactions,
    addressData,
    powFn,
) => {
    const transfers = prepareTransferArray(address, 0, '', addressData);

    let transfer = [];

    return findTransactionsAsync(provider)({ addresses: [address] })
        .then((hashes) => {
            if (size(hashes)) {
                throw new Error(Errors.ADDRESS_ALREADY_ATTACHED);
            }

            return sendTransferAsync(provider, powFn)(seedStore, transfers);
        })
        .then((transactionObjects) => {
            transfer = transactionObjects;

            return wereAddressesSpentFromAsync(provider)([address]);
        })
        .then((wereSpent) => {
            const spendStatuses = findSpendStatusesFromNormalisedTransactions([address], normalisedTransactions);
            const addressData = formatAddressData(
                [address],
                [balance],
                map(wereSpent, (status, idx) => ({ remote: status, local: spendStatuses[idx] })),
                [index],
            );

            return {
                addressData,
                transfer,
            };
        });
};

/**
 * Categorise addresses as spent/unspent
 *
 * @method categoriseAddressesBySpentStatus
 * @param {string} [provider]
 *
 * @returns {function(array): object}
 */
export const categoriseAddressesBySpentStatus = (provider) => (addresses) => {
    return wereAddressesSpentFromAsync(provider)(addresses).then((spentStatuses) => {
        const categorise = (acc, address, idx) => {
            if (spentStatuses[idx]) {
                acc.spent.push(address);
            } else {
                acc.unspent.push(address);
            }
        };

        return transform(addresses, categorise, { spent: [], unspent: [] });
    });
};

/**
 * Mimic wereAddressesSpentFrom IRI api call response, by checking spent status of addresses from transaction objects
 *
 * @method findSpendStatusesFromTransactionObjects
 * @param {array} addresses
 * @param {array} transactions
 *
 * @returns {array<boolean>}
 */
export const findSpendStatusesFromTransactionObjects = (addresses, transactions) => {
    const inputAddresses = map(filter(transactions, (tx) => tx.value < 0), (tx) => tx.address);

    return map(addresses, (address) => includes(inputAddresses, address));
};

/**
 * Mimic wereAddressesSpentFrom IRI api call response, by checking spent status of addresses from transaction objects
 *
 * @method findSpendStatusesFromNormalisedTransactions
 * @param {array} addresses
 * @param {array} normalisedTransactions
 *
 * @returns {array<boolean>}
 */
export const findSpendStatusesFromNormalisedTransactions = (addresses, normalisedTransactions) => {
    const inputAddresses = map(flatMap(normalisedTransactions, (tx) => tx.inputs), (tx) => tx.address);

    return map(addresses, (address) => includes(inputAddresses, address));
};
