import differenceBy from 'lodash/differenceBy';
import get from 'lodash/get';
import each from 'lodash/each';
import isNull from 'lodash/isNull';
import map from 'lodash/map';
import keys from 'lodash/keys';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import { filterSpentAddresses, filterAddressesWithIncomingTransfers } from './addresses';
import { DEFAULT_SECURITY } from '../../config';

/**
 *   Prepares inputs for sending transfer from locally stored address related information
 *   Starts from the search index (start) and stops when the threshold is reached
 *
 *   @method prepareInputs
 *   @param {object} addressData - Addresses dictionary with balance and spend status
 *   @param {number} start - Index to start the search from
 *   @param {number} threshold - Maximum value (balance) to stop the search
 *   @param {number} [security= 2]
 *   @returns {object} inputs, availableBalance
 **/
export const prepareInputs = (addressData, start, threshold, security = DEFAULT_SECURITY) => {
    const inputs = [];
    let availableBalance = 0;

    // Return prematurely in case threshold is zero
    // This check prevents adding input on the first iteration
    // if address data has addresses with balance.
    if (!threshold) {
        return { inputs, availableBalance };
    }

    const addresses = keys(addressData).slice(start);

    each(addresses, (address) => {
        const balance = get(addressData, `${address}.balance`);
        const keyIndex = get(addressData, `${address}.index`);

        if (balance > 0) {
            const input = { address, balance, keyIndex, security };

            inputs.push(input);
            availableBalance += balance;

            const hasReachedThreshold = availableBalance >= threshold;

            if (hasReachedThreshold) {
                return false;
            }
        }
    });

    return { inputs, availableBalance };
};

/**
 *   Prepares inputs from addresses related info and filters out addresses that are already spent.
 *   Returns an object with all inputs with addresses that are unspent, total computed balance and
 *   balance associated with all addresses.
 *
 *   @method getUnspentInputs
 *   @param {object} addressData - Addresses dictionary with balance and spend status
 *   @param {array} spentAddresses - Locally computed spent addresses from transactions
 *   @param {array}  pendingValueTransfers
 *   @param {number} start - Index to start the search from
 *   @param {number} threshold - Maximum value (balance) to stop the search
 *   @param {object} inputs - Could be initialised with null. In case its null default inputs would be defined.
 *
 *   @returns {Promise}
 **/
export const getUnspentInputs = (addressData, spentAddresses, pendingValueTransfers, start, threshold, inputs) => {
    if (isNull(inputs)) {
        inputs = {
            inputs: [],
            availableBalance: 0,
            totalBalance: 0,
            spentAddresses: [],
            addressesWithIncomingTransfers: [],
        };
    }

    const preparedInputs = prepareInputs(addressData, start, threshold);
    inputs.totalBalance += preparedInputs.inputs.reduce((sum, input) => sum + input.balance, 0);

    return filterSpentAddresses(preparedInputs.inputs, spentAddresses).then((unspentInputs) => {
        // Keep track of all spent addresses that are filtered
        inputs.spentAddresses = [
            ...inputs.spentAddresses,
            ...map(differenceBy(preparedInputs.inputs, unspentInputs, 'address'), (input) => input.address),
        ];

        const filtered = filterAddressesWithIncomingTransfers(unspentInputs, pendingValueTransfers);

        // Keep track of all addresses with incoming transfers
        inputs.addressesWithIncomingTransfers = [
            ...inputs.addressesWithIncomingTransfers,
            ...map(differenceBy(unspentInputs, filtered, 'address'), (input) => input.address),
        ];

        const collected = filtered.reduce((sum, input) => sum + input.balance, 0);

        const diff = threshold - collected;
        const hasInputs = size(preparedInputs.inputs);

        if (hasInputs && diff > 0) {
            const ordered = preparedInputs.inputs.sort((a, b) => a.keyIndex - b.keyIndex).reverse();
            const end = ordered[0].keyIndex;

            return getUnspentInputs(addressData, spentAddresses, pendingValueTransfers, end + 1, diff, {
                inputs: inputs.inputs.concat(filtered),
                availableBalance: inputs.availableBalance + collected,
                totalBalance: inputs.totalBalance,
                spentAddresses: inputs.spentAddresses,
                addressesWithIncomingTransfers: inputs.addressesWithIncomingTransfers,
            });
        }

        return {
            inputs: inputs.inputs.concat(filtered),
            availableBalance: inputs.availableBalance + collected,
            totalBalance: inputs.totalBalance,
            spentAddresses: inputs.spentAddresses,
            addressesWithIncomingTransfers: inputs.addressesWithIncomingTransfers,
        };
    });
};

/**
 *   Finds the first address with balance from locally stored addresses related info.
 *   Returns index associated with the address
 *   Returns 0 if no address with balance is found.
 *
 *   @method getStartingSearchIndexToPrepareInputs
 *   @param {object} addressData - Addresses dictionary with balance and spend status
 *
 *   @returns {number} index
 **/
export const getStartingSearchIndexToPrepareInputs = (addressData) => {
    const byIndex = (a, b) => get(addressData, `${a}.index`) - get(addressData, `${b}.index`);
    const address = keys(addressData)
        .sort(byIndex)
        .find((address) => addressData[address].balance > 0);

    return address ? addressData[address].index : 0;
};

/**
 *   Gets addresses used as inputs in transactions
 *
 *   @method getStartingSearchIndexToPrepareInputs
 *   @param {object | array} normalizedTransactions
 *
 *   @returns {array} - spent addresses
 **/
export const getSpentAddressesFromTransactions = (normalizedTransactions) => {
    return reduce(
        normalizedTransactions,
        (acc, transaction) => {
            acc.push(...map(transaction.inputs, (input) => input.address));

            return acc;
        },
        [],
    );
};
