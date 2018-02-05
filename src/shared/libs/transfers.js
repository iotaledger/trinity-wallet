import get from 'lodash/get';
import keys from 'lodash/keys';
import each from 'lodash/each';
import map from 'lodash/map';
import filter from 'lodash/filter';
import isNull from 'lodash/isNull';
import size from 'lodash/size';
import reduce from 'lodash/reduce';
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
 *   @param {string} [tag='TRINITY']
 *   @returns {array} Transfer object
 **/
export const prepareTransferArray = (address, value, message, tag = DEFAULT_TAG) => {
    return [
        {
            address,
            value,
            message: iota.utils.toTrytes(message),
            tag,
        },
    ];
};

/**
 *   Prepares inputs for sending transfer from locally stored address related information
 *   Starts from the search index (start) and stops when the threshold is reached
 *
 *   @method prepareInputs
 *   @param {object} addressData - Addresses dictionary with balance and spend status
 *   @param {number} start - Index to start the search from
 *   @param {number} threshold - Maximum value (balance) to stop the search
 *   @param {number} [security= 2]
 *   @returns {object} inputs, totalBalance
 **/
export const prepareInputs = (addressData, start, threshold, security = DEFAULT_SECURITY) => {
    const inputs = [];
    let totalBalance = 0;

    // Return prematurely in case threshold is zero
    // This check prevents adding input on the first iteration
    // if address data has addresses with balance.
    if (!threshold) {
        return { inputs, totalBalance };
    }

    const addresses = keys(addressData).slice(start);

    each(addresses, (address) => {
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

/**
 *   Communicates with ledger and checks if the addresses are spent from.
 *
 *   @method filterSpentAddresses
 *   @param {array} inputs - Array or objects containing balance, keyIndex and address props.
 *   @returns {Promise} - A promise that resolves all inputs with unspent addresses.
 **/
export const filterSpentAddresses = (inputs) => {
    return new Promise((resolve, reject) => {
        const addresses = map(inputs, (input) => input.address);
        iota.api.wereAddressesSpentFrom(addresses, (err, wereSpent) => {
            if (err) {
                reject(err);
            } else {
                resolve(filter(inputs, (input, idx) => !wereSpent[idx]));
            }
        });
    });
};

/**
 *   Prepares inputs from addresses related info and filters out addresses that are already spent.
 *   Returns an object with all inputs with addresses that are unspent, total computed balance and
 *   balance associated with all addresses.
 *
 *   @method getUnspentInputs
 *   @param {object} addressData - Addresses dictionary with balance and spend status
 *   @param {number} start - Index to start the search from
 *   @param {number} threshold - Maximum value (balance) to stop the search
 *   @param {object} inputs - Could be initialized with null. In case its null default inputs would be defined.
 *   @param {function} callback
 **/
export const getUnspentInputs = (addressData, start, threshold, inputs, callback) => {
    if (isNull(inputs)) {
        inputs = { inputs: [], totalBalance: 0, allBalance: 0 };
    }

    const preparedInputs = prepareInputs(addressData, start, threshold);
    inputs.allBalance += preparedInputs.inputs.reduce((sum, input) => sum + input.balance, 0);

    filterSpentAddresses(preparedInputs.inputs)
        .then((filtered) => {
            const collected = filtered.reduce((sum, input) => sum + input.balance, 0);

            const diff = threshold - collected;
            const hasInputs = size(preparedInputs.inputs);

            if (hasInputs && diff > 0) {
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
        .catch((err) => callback(err));
};

/**
 *   Finds the first address with balance from locally stored addresses related info.
 *   Returns index associated with the address
 *   Returns 0 if no address with balance is found.
 *
 *   @method getStartingSearchIndexToPrepareInputs
 *   @param {object} addressData - Addresses dictionary with balance and spend status
 *   @returns {number} index
 **/
export const getStartingSearchIndexToPrepareInputs = (addressData) => {
    const byIndex = (a, b) => get(addressData, `${a}.index`) - get(addressData, `${b}.index`);
    const address = Object.keys(addressData)
        .sort(byIndex)
        .find((address) => addressData[address].balance > 0);

    return address ? addressData[address].index : 0;
};

/**
 *   Find the last address index from address data.
 *
 *   @method getStartingSearchIndexToFetchLatestAddresses
 *   @param {object} addressData - Addresses dictionary with balance and spend status
 *   @returns {number} index
 **/
export const getStartingSearchIndexToFetchLatestAddresses = (addressData) => {
    const addresses = Object.keys(addressData);
    return addresses.length ? addresses.length - 1 : 0;
};

/**
 *   Communicates with ledger and checks if the addresses are spent from.
 *
 *   @method shouldAllowSendingToAddress
 *   @param {array} addresses - Could also accept an address as string since wereAddressesSpentFrom casts it internally
 *   @param {function} callback
 **/
export const shouldAllowSendingToAddress = (addresses, callback) => {
    iota.api.wereAddressesSpentFrom(addresses, (err, wereSpent) => {
        if (err) {
            callback(err);
        } else {
            const spentAddresses = filter(addresses, (address, idx) => wereSpent[idx]);
            callback(null, !spentAddresses.length);
        }
    });
};

/**
 *   Accepts a transfer bundle and returns the tail object
 *
 *   @method extractTailTransferFromBundle
 *   @param {array} bundle - Array of transfer objects
 *   @returns {object} transfer object
 **/
export const extractTailTransferFromBundle = (bundle) => {
    const extractTail = (res, tx) => {
        if (tx.currentIndex === 0) {
            res = tx;
        }

        return res;
    };

    return reduce(bundle, extractTail, {});
};
