import get from 'lodash/get';
import keys from 'lodash/keys';
import each from 'lodash/each';
import map from 'lodash/map';
import filter from 'lodash/filter';
import isNull from 'lodash/isNull';
import isArray from 'lodash/isArray';
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
        const addresses = map(inputs, input => input.address);
        iota.api.wereAddressesSpentFrom(addresses, (err, wereSpent) => {
            if (err) {
                reject(err);
            } else {
                resolve(filter(addresses, (address, idx) => !wereSpent[idx]));
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

/**
 *   Finds the first address with balance from locally stored addresses related info.
 *   Returns index associated with the address
 *   Returns 0 if no address with balance is found.
 *
 *   @method getStartingSearchIndexForAddress
 *   @param {object} addressData - Addresses dictionary with balance and spend status
 *   @returns {number} index
 **/
export const getStartingSearchIndexForAddress = addressData => {
    const address = Object.keys(addressData).find(address => addressData[address].balance > 0);

    return address ? addressData[address].index : 0;
};

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
