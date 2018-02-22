import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import each from 'lodash/each';
import get from 'lodash/get';
import filter from 'lodash/filter';
import isNumber from 'lodash/isNumber';
import keys from 'lodash/keys';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import merge from 'lodash/merge';
import { iota } from './index';
import { getBalancesAsync, wereAddressesSpentFromAsync } from './extendedApi';
import { DEFAULT_BALANCES_THRESHOLD } from '../../config';

/**
 *   Starts traversing from specified index backwards
 *   Keeps on calling findTransactions to see if there's any associated tx with address
 *   Stops at the point where it finds an address with hash
 *   Basically just removes the unused addresses
 *
 *   @method removeUnusedAddresses
 *   @param {function} resolve
 *   @param {function} reject
 *   @param {number} index
 *   @param {array} finalAddresses
 **/
const removeUnusedAddresses = (resolve, reject, index, finalAddresses) => {
    if (!finalAddresses[index]) {
        resolve(finalAddresses);
        return;
    }

    iota.api.findTransactions({ addresses: [finalAddresses[index]] }, (err, hashes) => {
        if (err) {
            reject(err);
        } else {
            // If address has affiliated txs
            if (size(hashes)) {
                resolve(finalAddresses);
            } else {
                removeUnusedAddresses(resolve, reject, index - 1, finalAddresses.slice(0, index));
            }
        }
    });
};

/**
 *   Returns associated addresses with a seed
 *   Generates addresses in batches and upon each execution increase the index to fetch the next batch
 *   Stops at the point where there are no transaction hashes associated with last (total defaults to --> 10) addresses
 *
 *   @method getRelevantAddresses
 *   @param {function} resolve
 *   @param {function} reject
 *   @param {string} seed
 *   @param {object} [opts={index: 0, total: 10, returnAll: true, security: 2}]
 *   @param {array} allAddresses
 *   @returns {array} All addresses
 **/

const getRelevantAddresses = (resolve, reject, seed, opts, allAddresses) => {
    iota.api.getNewAddress(seed, opts, (err, addresses) => {
        if (err) {
            reject(err);
        } else {
            iota.api.findTransactions({ addresses }, (err, hashes) => {
                if (size(hashes)) {
                    allAddresses = [...allAddresses, ...addresses];
                    const newOpts = assign({}, opts, { index: opts.total + opts.index });
                    getRelevantAddresses(resolve, reject, seed, newOpts, allAddresses);
                } else {
                    // Traverse backwards to remove all unused addresses
                    new Promise((res, rej) => {
                        const lastAddressIndex = size(allAddresses) - 1;
                        removeUnusedAddresses(res, rej, lastAddressIndex, allAddresses.slice());
                    })
                        .then((finalAddresses) => {
                            resolve(finalAddresses);
                        })
                        .catch((err) => reject(err));
                }
            });
        }
    });
};

/**
 *   Returns a promise meant for returning all associated addresses with a seed
 *
 *   @method getAllAddresses
 *   @param {string} seed
 *   @param {object} [addressesOpts={index: 0, total: 10, returnAll: true, security: 2}] - Default options for address generation
 *   @returns {promise}
 **/

export const getAllAddresses = (
    seed,
    addressesOpts = {
        index: 0,
        total: 10,
        returnAll: true,
        security: 2,
    },
) => new Promise((res, rej) => getRelevantAddresses(res, rej, seed, addressesOpts, []));

export const formatAddressesAndBalance = (addresses) => {
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
                        wereSpent: cached.wereSpent[index],
                        balance: cached.balances[index],
                    };

                    acc.balance = acc.balance + cached.balances[index];
                },
                { addresses: {}, balance: 0 },
            );
        });
};

export const formatAddresses = (addresses, balances, addressesSpendStatus) => {
    const addressData = assign({}, ...addresses.map((n, index) => ({ [n]: { index, balance: 0, spent: false } })));

    for (let i = 0; i < addresses.length; i++) {
        addressData[addresses[i]].index = i;
        addressData[addresses[i]].balance = balances[i];
        addressData[addresses[i]].spent = addressesSpendStatus[i];
    }

    return addressData;
};

export const markAddressSpend = (transfers, addressData) => {
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

export const getUnspentAddresses = (addressData) => {
    const addresses = keys(addressData);
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
 *   Communicates with ledger and checks if the addresses are spent from.
 *
 *   @method filterSpentAddresses
 *   @param {array} inputs - Array or objects containing balance, keyIndex and address props.
 *   @returns {Promise} - A promise that resolves all inputs with unspent addresses.
 **/
export const filterSpentAddresses = (inputs) => {
    const addresses = map(inputs, (input) => input.address);

    return wereAddressesSpentFromAsync(addresses).then((wereSpent) => filter(inputs, (input, idx) => !wereSpent[idx]));
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
    return addresses.length ? addresses.length : 0;
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

/**
 *   Gets the latest used address from the specified index onwards
 *
 *   @method getLatestAddresses
 *   @param {string} seed - Seed string
 *   @param {string} index - Index to start generating addresses from
 *   @returns {array} - Array of latest used addresses
 **/

export const getLatestAddresses = (seed, index) => {
    return new Promise((resolve, reject) => {
        const options = { checksum: false, index, returnAll: true };
        iota.api.getNewAddress(seed, options, (err, addresses) => {
            if (err) {
                reject(err);
            } else {
                resolve(addresses);
            }
        });
    });
};

/**
 *   Takes current address data as input and adds latest used addresses
 *
 *   @method syncAddresses
 *   @param {string} seed - Seed string
 *   @param {string} currentAddressData - currentAddressData from store
 *   @returns {object} - Updated address data including latest used addresses
 **/

export const syncAddresses = (seed, existingAccountData) => {
    const thisAccountDataCopy = cloneDeep(existingAccountData);
    const addressSearchIndex = getStartingSearchIndexToFetchLatestAddresses(thisAccountDataCopy.addresses);
    return getLatestAddresses(seed, addressSearchIndex).then((newAddresses) => {
        // Remove unused address
        newAddresses.pop();
        const newAddressesFormatted = reduce(
            newAddresses,
            (acc, address, index) => {
                const i = index + addressSearchIndex;
                acc[address] = { index: i, balance: 0, spent: false };
                return acc;
            },
            {},
        );
        thisAccountDataCopy.addresses = merge(thisAccountDataCopy.addresses, newAddressesFormatted);
        return thisAccountDataCopy;
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
