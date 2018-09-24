import differenceBy from 'lodash/differenceBy';
import get from 'lodash/get';
import head from 'lodash/head';
import each from 'lodash/each';
import isNumber from 'lodash/isNumber';
import includes from 'lodash/includes';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import minBy from 'lodash/minBy';
import uniqBy from 'lodash/uniqBy';
import map from 'lodash/map';
import keys from 'lodash/keys';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import {
    pickUnspentAddressData,
    omitAddressesDataWithIncomingTransfers,
    transformAddressDataToInputs
} from './addresses';
import { DEFAULT_SECURITY } from '../../config';

/**
 *   Prepares inputs for sending transfer from locally stored address related information
 *   Starts from the search index (start) and stops when the threshold is reached
 *
 *   @method prepareInputs
 *   @param {object} addressData - Addresses dictionary with balance and spend status
 *   @param {number} limit - Inputs limit
 *   @param {number} threshold - Maximum value (balance) to stop the search
 *   @param {number} [security= 2]
 *
 *   @returns {object} inputs, balance
 **/
export const prepareInputs = (addressData, threshold, limit = 2, security = DEFAULT_SECURITY) => {
    let availableBalance = 0;
    const _throw = (error) => { throw new Error(error); };

    // Return prematurely in case threshold is zero
    // This check prevents adding input on the first iteration
    // if address data has addresses with balance.
    if (!threshold) {
        _throw('Threshold cannot be zero!');
    }

    const inputs = transformAddressDataToInputs(addressData, security);
    const selectedInputsByOptimalValue = [];

    while (availableBalance < threshold) {
        const sortedInputs = sortInputsByOptimalValue(
            differenceBy(inputs, selectedInputsByOptimalValue, 'address'),
            threshold - availableBalance
        );

        const input = head(sortedInputs);

        selectedInputsByOptimalValue.push(input);

        availableBalance += input.balance;
    }

    if (isNumber(limit) && size(selectedInputsByOptimalValue) > limit) {
        const inputsWithUniqueBalances = uniqBy(inputs, 'balance');
        const { exactMatches, exceeded } = subsetSumWithLimit()(
            map(inputs, (input) => input.balance), threshold
        );

        if (size(exactMatches)) {
            const match = head(exactMatches);
            const inputsWithExactMatch = filter(inputsWithUniqueBalances, (input) => includes(match, input.balance));
            const balance = reduce(inputsWithExactMatch, (acc, input) => acc + input.balance, 0);

            if (balance !== threshold) {
                _throw('Something went wrong man!');
            }

            // Verify total balance === threshold, otherwise throw
            return {
                inputs: inputsWithExactMatch,
                balance
            };
        }

        const findSetWithMinSize = () => {
            // Also check pair size
            const minSizeInputs = minBy(exceeded, size);
            const finalInputs = filter(inputsWithUniqueBalances, (input) => includes(minSizeInputs, input.balance));
            const balance = reduce(finalInputs, (acc, input) => acc + input.balance, 0);

            if (balance <= threshold) {
                _throw('Something went wrong man!');
            }
        };

        return size(exceeded) ? findSetWithMinSize() : _throw('Oopsie cannot select inputs!');
    }

    return {
      inputs: selectedInputsByOptimalValue,
      balance: availableBalance
    };
};

const sortInputsByOptimalValue = (inputs, diff) => inputs.slice().sort((a, b) => Math.abs(diff - a.balance) - Math.abs(diff - b.balance));

const subsetSumWithLimit = (limit = 2) => {
    let hasFoundAnExactMatch = false;
    let hasFoundNoMatches = false;

    const exactMatches = [];
    const exceeded = [];
    const MAX_CALL_TIMES = 100000;

    let callTimes = 0;
    let sizeOfBalances = 0;

    const calculate = (balances, threshold, partial = []) => {
        callTimes += 1;

        if (callTimes === 1) {
            sizeOfBalances = balances.length;
        }

        // sum partial
        const sum = reduce(partial, (acc, value) => acc + value, 0);

        // check if the partial sum is equals to threshold
        if (sum === threshold && partial.length <= limit) {
            exactMatches.push(partial);
            hasFoundAnExactMatch = true;
        }

        if (sum > threshold && partial.length <= limit) {
            exceeded.push(partial);
        }

        // If some has reached the threshold why bother continuing
        if (sum >= threshold) {
            return;
        }

        each(balances, (balance, index) => {
            if (hasFoundAnExactMatch) {
                return false;
            }

            if (index === sizeOfBalances - 1) {
                hasFoundNoMatches = true;
            }

            calculate(
                // Remaining
                balances.slice(index + 1),
                threshold,
                [...partial, balance]
            );
        });

        if (
            hasFoundAnExactMatch ||
            hasFoundNoMatches ||
            callTimes === MAX_CALL_TIMES
        ) {
            return {
                exactMatches,
                exceeded
            };
        }
    };

    return calculate;
};

/**
 *   Prepares inputs from addresses related info and filters out addresses that are already spent.
 *   Returns an object with all inputs with addresses that are unspent, total computed balance and
 *   balance associated with all addresses.
 *
 *   @method getUnspentInputs
 *   @param {string} [provider]
 *
 *   @returns {function(object, array, array, number, number, *): Promise<object>}
 **/
export const getUnspentInputs = (provider) => (
    addressData,
    normalisedTransactions,
    pendingValueTransfers,
    threshold,
) => {
    // First check if there is sufficient balance
    if (reduce(addressData, (acc, data) => acc + data.balance, 0) < threshold) {
        return Promise.reject('Insufficient balance.');
    }

    // Filter all spent addresses
    return pickUnspentAddressData(provider)(
        addressData,
        normalisedTransactions
    )
        .then((unspentAddressData) => {
            if (reduce(unspentAddressData, (acc, data) => acc + data.balance, 0) < threshold) {
                throw new Error('Funds at spent addresses.');
            }

            if (
                reduce(
                    omitAddressesDataWithIncomingTransfers(unspentAddressData, pendingValueTransfers),
                (acc, data) => acc + data.balance, 0) < threshold
            ) {
                throw new Error('Incoming transactions.');
            }

            return prepareInputs(addressData, threshold);
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
