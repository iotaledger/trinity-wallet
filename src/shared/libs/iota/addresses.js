import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import each from 'lodash/each';
import filter from 'lodash/filter';
import find from 'lodash/find';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import orderBy from 'lodash/orderBy';
import transform from 'lodash/transform';
import isNumber from 'lodash/isNumber';
import isObject from 'lodash/isObject';
import isBoolean from 'lodash/isBoolean';
import includes from 'lodash/includes';
import map from 'lodash/map';
import maxBy from 'lodash/maxBy';
import reduce from 'lodash/reduce';
import some from 'lodash/some';
import size from 'lodash/size';
import { iota } from './index';
import { getBalancesAsync, wereAddressesSpentFromAsync, findTransactionsAsync, sendTransferAsync } from './extendedApi';
import { prepareTransferArray } from './transfers';
import Errors from '../errors';
import { DEFAULT_SECURITY } from '../../config';
import { ADDRESS_LENGTH_WITHOUT_CHECKSUM, CHECKSUM_LENGTH, VALID_ADDRESS_WITHOUT_CHECKSUM_REGEX } from './utils';

/**
 * Validates address object - { address, index, checksum, balance, spent: { local, remote } }
 *
 * @method isValidAddressObject
 *
 * @param {object} addressObject
 *
 * @returns {boolean}
 */
export const isValidAddressObject = (addressObject) => {
    return (
        isObject(addressObject) &&
        VALID_ADDRESS_WITHOUT_CHECKSUM_REGEX.test(addressObject.address) &&
        size(addressObject.address) === ADDRESS_LENGTH_WITHOUT_CHECKSUM &&
        VALID_ADDRESS_WITHOUT_CHECKSUM_REGEX.test(addressObject.checksum) &&
        size(addressObject.checksum) === CHECKSUM_LENGTH &&
        isNumber(addressObject.balance) &&
        isObject(addressObject.spent) &&
        isBoolean(addressObject.spent.local) &&
        isBoolean(addressObject.spent.remote) &&
        isNumber(addressObject.index) &&
        addressObject.index >= 0
    );
};

/**
 * Stops overriding local spend status for a known address
 *
 * @method preserveAddressLocalSpendStatus
 *
 * @param existingAddressData
 * @param newAddressData
 *
 * @returns {array}
 */
export const preserveAddressLocalSpendStatus = (existingAddressData, newAddressData) =>
    map(newAddressData, (addressObject) => {
        const seenAddress = find(existingAddressData, { address: addressObject.address });
        const existingLocalSpendStatus = get(seenAddress, 'spent.local');

        if (seenAddress && isBoolean(existingLocalSpendStatus)) {
            const newLocalSpendStatus = addressObject.spent.local;

            return {
                ...addressObject,
                spent: { ...addressObject.spent, local: existingLocalSpendStatus || newLocalSpendStatus },
            };
        }

        return addressObject;
    });

/**
 * Merges latest address data into old
 *
 * @method mergeAddressData
 *
 * @param {array} existingAddressData
 * @param {array} newAddressData
 *
 * @returns {array}
 */
export const mergeAddressData = (existingAddressData, newAddressData) => {
    if (isEmpty(existingAddressData)) {
        return newAddressData;
    }

    // Filter address data with addresses that are not part of new address data.
    // Normally, when account information is synced new address data will contain previous addresses
    // But say a manual sync was performed after a snapshot
    // It's possible that some of the previous addresses are not generated and hence wouldn't be part of the new address data
    // That is why it is important that once an address is known to wallet, it should be kept unless removed deliberately (e.g., reset wallet)
    const missingAddressData = filter(existingAddressData, (addressObject) => {
        const { address } = addressObject;

        return some(newAddressData, { address }) === false;
    });

    const mergedAddressData = orderBy(
        [
            // Address data already known to wallet and is missing from new address data
            ...missingAddressData,
            // New address data
            ...newAddressData,
        ],
        ['index'],
    );

    // Lastly, make sure that (local) spend status is preserved for existing address data
    return preserveAddressLocalSpendStatus(existingAddressData, mergedAddressData);
};

/**
 * Checks if an address is used (Uses locally stored address data and transactions)
 *
 * @method isAddressUsedSync
 * @param {object} addressObject
 * @param {array} transactions
 *
 * @returns {boolean}
 */
export const isAddressUsedSync = (addressObject, transactions) => {
    if (!isValidAddressObject(addressObject)) {
        throw new Error(Errors.INVALID_ADDRESS_DATA);
    }

    const transactionAddresses = map(transactions, (tx) => tx.address);
    const { address, spent: { local }, balance } = addressObject;

    return local === true || balance > 0 || includes(transactionAddresses, address);
};

/**
 * Checks if an address is used i.e. has spent or has associated hashes
 *
 * @method isAddressUsedAsync
 *
 * @param {string} provider
 * @param {boolean} withQuorum
 *
 * @returns {function(string, object, array): Promise<boolean>}
 **/
export const isAddressUsedAsync = (provider, withQuorum) => (addressObject) => {
    if (!isValidAddressObject(addressObject)) {
        return Promise.reject(new Error(Errors.INVALID_ADDRESS_DATA));
    }

    const { address } = addressObject;

    return wereAddressesSpentFromAsync(provider, withQuorum)([address]).then((spent) => {
        const isSpent = head(spent) === true;

        return (
            isSpent ||
            findTransactionsAsync(provider)({ addresses: [address] }).then((hashes) => {
                const hasAssociatedHashes = size(hashes) > 0;

                return (
                    hasAssociatedHashes ||
                    getBalancesAsync(provider, withQuorum)([address]).then((balances) => {
                        return accumulateBalance(map(balances.balances, Number)) > 0;
                    })
                );
            })
        );
    });
};

/**
 * Sequentially generates addresses till latest unused address
 *
 * @method getAddressDataUptoLatestUnusedAddress
 *
 * @param {string} provider
 * @param {boolean} withQuorum
 *
 * @returns {function(object, array, object): Promise<array>}
 **/
export const getAddressDataUptoLatestUnusedAddress = (provider, withQuorum) => (seedStore, transactions, options) => {
    const generateAddressData = (currentKeyIndex, generatedAddressData) => {
        return seedStore
            .generateAddress({ index: currentKeyIndex, security })
            .then((address) => findAddressesData(provider, withQuorum)([address], transactions))
            .then(({ hashes, balances, wereSpent, addresses }) => {
                const updatedAddressData = [
                    ...generatedAddressData,
                    ...createAddressData(addresses, balances, wereSpent, [currentKeyIndex]),
                ];

                if (
                    // No transactions
                    size(hashes) === 0 &&
                    // Both local spend status (from transactions) & remote spend status (from wereAddressesSpentFrom) are false
                    some(wereSpent, (status) => status.local === false && status.remote === false) &&
                    // Balance should be zero
                    some(balances, (balance) => balance === 0)
                ) {
                    return updatedAddressData;
                }

                // If the newly generated address is used, generate a new address.
                const nextKeyIndex = currentKeyIndex + 1;

                return generateAddressData(nextKeyIndex, updatedAddressData);
            });
    };

    const { index, security } = options;

    return generateAddressData(index, []);
};

/**
 * Accepts addresses with indexes [{ address, index }] as an array.
 * Finds latest balances on those addresses.
 * Finds latest spent statuses on addresses.
 * Transforms addresses array to a dictionary. [{ address: { index: 0, spent: false, balance: 0, checksum: address-checksum }}]
 *
 * @method mapLatestAddressData
 *
 * @param {string} provider
 * @param {boolean} withQuorum
 *
 * @returns {function(array, array): Promise<object>}
 **/
export const mapLatestAddressData = (provider, withQuorum) => (addressData, transactions) => {
    const cached = {
        balances: [],
        wereSpent: [],
    };

    const addresses = map(addressData, (addressObject) => addressObject.address);

    if (isEmpty(addresses)) {
        return Promise.resolve([]);
    }

    return getBalancesAsync(provider, withQuorum)(addresses)
        .then((balances) => {
            cached.balances = map(balances.balances, Number);

            return wereAddressesSpentFromAsync(provider, withQuorum)(addresses);
        })
        .then((wereSpent) => {
            // Get spend statuses of addresses from transactions
            const spendStatuses = findSpendStatusesFromTransactions(addresses, transactions);

            cached.wereSpent = map(wereSpent, (status, idx) => {
                const existingLocalSpendStatus = get(find(addressData, { address: addresses[idx] }), 'spent.local');

                return {
                    remote: status,
                    // Preserve local spend status
                    local: existingLocalSpendStatus || spendStatuses[idx],
                };
            });

            return map(addressData, (addressObject, idx) => ({
                ...addressObject,
                balance: cached.balances[idx],
                spent: cached.wereSpent[idx],
            }));
        });
};

/**
 *  Returns all associated addresses with history for a seed
 *
 *  @method getFullAddressHistory
 *  @param {string} provider
 *  @param {boolean} withQuorum
 *
 *  @returns {function(object, object): Promise<object>}
 */
export const getFullAddressHistory = (provider, withQuorum) => (seedStore, existingAccountState = {}) => {
    let generatedAddresses = [];
    const addressData = { hashes: [], balances: [], wereSpent: [] };
    const { transactions } = existingAccountState;

    const generateAndStoreAddressesInBatch = (currentOptions) => {
        return seedStore
            .generateAddress(currentOptions)
            .then((addresses) => findAddressesData(provider, withQuorum)(addresses, transactions || []))
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

                return removeUnusedAddresses(provider, withQuorum)(
                    lastAddressIndex,
                    latestAddress,
                    generatedAddresses.slice(),
                    existingAccountState,
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
 *  @param {boolean} withQuorum
 *
 *  @returns {function(array, [array]): Promise<{object}>
 */
const findAddressesData = (provider, withQuorum) => (addresses, transactions = []) => {
    return Promise.all([
        findTransactionsAsync(provider)({ addresses }),
        getBalancesAsync(provider, withQuorum)(addresses),
        wereAddressesSpentFromAsync(provider, withQuorum)(addresses),
    ]).then((data) => {
        const [hashes, balances, wereSpent] = data;
        const spendStatusesFromTransactions = findSpendStatusesFromTransactions(addresses, transactions);

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
 *  @param {boolean} withQuorum
 *
 *  @returns {function(number, string, array, object): Promise<array>}
 */
export const removeUnusedAddresses = (provider, withQuorum) => (
    index,
    latestUnusedAddress,
    finalAddresses,
    existingAccountState = {},
) => {
    if (!finalAddresses[index]) {
        return Promise.resolve([...finalAddresses, latestUnusedAddress]);
    }

    const { transactions } = existingAccountState;

    return findAddressesData(provider, withQuorum)([finalAddresses[index]], transactions || []).then(
        ({ hashes, balances, wereSpent }) => {
            if (
                size(hashes) === 0 &&
                some(balances, (balance) => balance === 0) &&
                some(wereSpent, (status) => status.remote === false && status.local === false)
            ) {
                return removeUnusedAddresses(provider, withQuorum)(
                    index - 1,
                    finalAddresses[index],
                    finalAddresses.slice(0, index),
                    existingAccountState,
                );
            }

            return [...finalAddresses, latestUnusedAddress];
        },
    );
};

/**
 * Format address data - Assign corresponding balance, spend status and checksum
 * Note: If addresses does not start with key index 0, key indexes must be provided
 * Otherwise it can cause a key index mismatch
 *
 * @method createAddressData
 *
 * @param {array} addresses
 * @param {array} balances
 * @param {array} addressesSpendStatuses
 * @param {array} keyIndexes
 *
 * @returns {array}
 */
export const createAddressData = (addresses, balances, addressesSpendStatuses, keyIndexes = []) => {
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

            acc.push({
                address,
                index: sizeOfKeyIndexes ? keyIndexes[index] : index,
                spent: { local, remote },
                balance: balances[index],
                checksum: iota.utils.addChecksum(address).slice(address.length),
            });

            return acc;
        },
        [],
    );
};

/**
 *   Locally mark addresses as spent
 *
 *   @method markAddressesAsSpentSync
 *   @param {array} bundles
 *   @param {array} addressData
 *   @returns {array}
 **/
export const markAddressesAsSpentSync = (bundles, addressData) => {
    const addressDataClone = cloneDeep(addressData);
    const addresses = map(addressData, (addressObject) => addressObject.address);

    // Iterate over all bundles and sort them between incoming
    // and outgoing transfers
    bundles.forEach((bundle) => {
        // Iterate over every bundle entry
        bundle.forEach((transaction) => {
            // If bundle address in the list of addresses associated with the seed
            // mark the address as sent
            if (addresses.indexOf(transaction.address) > -1) {
                // Check if it's a remainder address
                const isRemainder = transaction.currentIndex === transaction.lastIndex && transaction.lastIndex !== 0;
                // check if sent transaction
                if (transaction.value < 0 && !isRemainder) {
                    // Mark address as spent
                    const addressObject = find(addressDataClone, { address: transaction.address });
                    addressObject.spent.local = true;
                }
            }
        });
    });

    return addressDataClone;
};

/**
 * Communicates with ledger and checks if the addresses are spent from.
 *
 * @method filterSpentAddressData
 *
 * @param {string} provider
 * @param {boolean} withQuorum
 *
 * @returns {function(array, array): Promise<object>}
 **/
export const filterSpentAddressData = (provider, withQuorum) => (addressData, transactions) => {
    const unspentAddresses = map(
        filter(addressData, (addressObject) => addressObject.spent.local === false),
        (addressObject) => addressObject.address,
    );

    // If all inputs are spent, avoid making the network call
    if (isEmpty(unspentAddresses)) {
        return Promise.resolve([]);
    }

    // Get latest spend statuses against unspent addresses from locally stored transactions
    const spendStatuses = findSpendStatusesFromTransactions(unspentAddresses, transactions);

    return wereAddressesSpentFromAsync(provider, withQuorum)(unspentAddresses).then((wereSpent) => {
        const filteredAddresses = filter(
            unspentAddresses,
            (_, idx) => wereSpent[idx] === false && spendStatuses[idx] === false,
        );

        return filter(addressData, (addressObject) => includes(filteredAddresses, addressObject.address));
    });
};

/**
 * Communicates with ledger and checks if the any address is spent.
 *
 * @method isAnyAddressSpent
 *
 * @param {string} provider
 * @param {boolean} withQuorum
 *
 * @returns {function(array): Promise<boolean>}
 **/
export const isAnyAddressSpent = (provider, withQuorum) => (addresses) => {
    return wereAddressesSpentFromAsync(provider, withQuorum)(addresses).then((spendStatuses) =>
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
 *   @param {array} addressData
 *   `
 *   @returns {string} - latest address
 **/
export const getLatestAddress = (addressData, withChecksum = false) => {
    const addressObjectWithHighestIndex = getLatestAddressObject(addressData);

    const address = get(addressObjectWithHighestIndex, 'address');

    return withChecksum ? `${address}${get(addressObjectWithHighestIndex, 'checksum')}` : address;
};

/**
 *   Takes address data and returns the address data object with highest index
 *
 *   @method getLatestAddressObject
 *   @param {array} addressData
 *   `
 *   @returns {string} - latest address
 **/
export const getLatestAddressObject = (addressData) => maxBy(addressData, 'index');

/**
 * Generate addresses till remainder (unused and also not blacklisted for being a remainder address)
 *
 * @method getAddressDataUptoRemainder
 *
 * @param {string} provider
 * @param {boolean} withQuorum
 *
 * @returns {function(array, array, object, array): Promise<object>}
 **/
export const getAddressDataUptoRemainder = (provider, withQuorum) => (
    addressData,
    transactions,
    seedStore,
    blacklistedRemainderAddresses = [],
) => {
    const latestAddress = getLatestAddress(addressData);
    const latestAddressData = getLatestAddressObject(addressData);

    const isBlacklisted = (address) => includes(blacklistedRemainderAddresses, address);

    if (isBlacklisted(latestAddress)) {
        const startIndex = latestAddressData.index + 1;

        return getAddressDataUptoLatestUnusedAddress(provider, withQuorum)(seedStore, transactions, {
            index: startIndex,
            security: DEFAULT_SECURITY,
        }).then((newAddressData) => {
            const remainderAddress = getLatestAddress(newAddressData);
            const remainderAddressData = getLatestAddressObject(newAddressData);

            const addressDataUptoRemainder = [...addressData, ...newAddressData];

            if (isBlacklisted(remainderAddress)) {
                return getAddressDataUptoRemainder(provider, withQuorum)(
                    addressDataUptoRemainder,
                    transactions,
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
 * Takes current address data as input and adds latest unused addresses
 *
 * @method syncAddresses
 *
 * @param {string} provider
 * @param {boolean} withQuorum
 *
 * @returns {function(string, array, array): Promise<object>}
 **/
export const syncAddresses = (provider, withQuorum) => (seedStore, addressData, transactions) => {
    // Find the address object with highest index from existing address data
    const latestAddressObject = getLatestAddressObject(addressData);

    const addLatestAddresses = () => {
        // Start index should be (highest index in existing address data + 1)
        const startIndex = latestAddressObject.index + 1;

        return getAddressDataUptoLatestUnusedAddress(provider, withQuorum)(seedStore, transactions, {
            index: startIndex,
            security: DEFAULT_SECURITY,
        }).then((newAddressObjects) => [...addressData, ...newAddressObjects]);
    };

    // Check if there are any transactions associated with the latest address or if the address is spent
    return isAddressUsedAsync(provider, withQuorum)(latestAddressObject).then((isUsed) => {
        if (!isUsed && !isAddressUsedSync(latestAddressObject, transactions)) {
            return addressData;
        }

        // Otherwise generate addresses till latest unused and add them in existing address objects
        return addLatestAddresses();
    });
};

/**
 *   Filters inputs with addresses that have pending incoming transfers or
 *   are change addresses.
 *
 *   @method filterAddressDataWithPendingIncomingTransactions
 *   @param {object} addressData
 *   @param {array} pendingValueTransactions
 *
 *   @returns {object}
 **/
export const filterAddressDataWithPendingIncomingTransactions = (addressData, transactions) => {
    if (isEmpty(transactions) || isEmpty(addressData)) {
        return addressData;
    }

    const addresses = map(addressData, (addressObject) => addressObject.address);

    const addressesWithIncomingTransactions = map(
        filter(
            transactions,
            (transaction) =>
                includes(addresses, transaction.address) && transaction.persistence === false && transaction.value > 0,
        ),
        (transaction) => transaction.address,
    );

    return filter(addressData, (addressObject) => !includes(addressesWithIncomingTransactions, addressObject.address));
};

/**
 * Attach address to tangle if its not already attached
 *
 * @method attachAndFormatAddress
 *
 * @param {string} provider
 * @param {boolean} withQuorum
 *
 * @returns {function(string, number, number, object, object): Promise<object>}
 **/
export const attachAndFormatAddress = (provider, withQuorum) => (address, index, balance, seedStore, accountState) => {
    let attachedTransactions = [];

    return findTransactionsAsync(provider)({ addresses: [address] })
        .then((hashes) => {
            if (size(hashes)) {
                throw new Error(Errors.ADDRESS_ALREADY_ATTACHED);
            }

            return sendTransferAsync(provider)(
                seedStore,
                prepareTransferArray(address, 0, '', accountState.addressData),
            );
        })
        .then((transactionObjects) => {
            attachedTransactions = transactionObjects;

            return wereAddressesSpentFromAsync(provider, withQuorum)([address]);
        })
        .then((wereSpent) => {
            const spendStatuses = findSpendStatusesFromTransactions([address], accountState.transactions);
            const attachedAddressObject = head(
                createAddressData(
                    [address],
                    [balance],
                    map(wereSpent, (status, idx) => ({
                        remote: status,
                        // Do not override local spend status
                        local: get(find(accountState.addressData, { address }), 'spent.local') || spendStatuses[idx],
                    })),
                    [index],
                ),
            );

            return {
                attachedAddressObject,
                attachedTransactions,
            };
        });
};

/**
 * Categorise addresses as spent/unspent
 *
 * @method categoriseAddressesBySpentStatus
 *
 * @param {string} provider
 * @param {boolean} withQuorum
 *
 * @returns {function(array): object}
 */
export const categoriseAddressesBySpentStatus = (provider, withQuorum) => (addresses) => {
    return wereAddressesSpentFromAsync(provider, withQuorum)(addresses).then((spentStatuses) => {
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
 * @method findSpendStatusesFromTransactions
 * @param {array} addresses
 * @param {array} transactions
 *
 * @returns {array<boolean>}
 */
export const findSpendStatusesFromTransactions = (addresses, transactions) => {
    const inputAddresses = map(filter(transactions, (tx) => tx.value < 0), (tx) => tx.address);

    return map(addresses, (address) => includes(inputAddresses, address));
};

/**
 * Transforms address data object to inputs list
 *
 * @method transformAddressDataToInputs
 * @param {array} addressData
 * @param {number} security
 *
 * @returns {array}
 */
export const transformAddressDataToInputs = (addressData, security = DEFAULT_SECURITY) =>
    map(addressData, (addressObject) => ({
        address: addressObject.address,
        security,
        balance: addressObject.balance,
        keyIndex: addressObject.index,
    }));

/**
 * Filters address data with pending outgoing transactions
 *
 * @method filterAddressDataWithPendingOutgoingTransactions
 * @param {array} addressData
 * @param {array} transactions
 *
 * @returns {object}
 */
export const filterAddressDataWithPendingOutgoingTransactions = (addressData, transactions) => {
    const pendingTransactions = filter(transactions, (tx) => tx.persistence === false);

    // Get all input addresses from transactions
    const inputAddressesFromTransactions = map(
        filter(pendingTransactions, (transaction) => transaction.value < 0),
        (transaction) => transaction.address,
    );

    return filter(addressData, (addressObject) => !includes(inputAddressesFromTransactions, addressObject.address));
};
