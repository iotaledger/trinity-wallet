import flatMap from 'lodash/flatMap';
import isObject from 'lodash/isObject';
import differenceBy from 'lodash/differenceBy';
import head from 'lodash/head';
import each from 'lodash/each';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import filter from 'lodash/filter';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import {
    filterSpentAddressData,
    filterAddressDataWithPendingIncomingTransactions,
    transformAddressDataToInputs,
    filterAddressDataWithPendingOutgoingTransactions,
} from './addresses';
import { VALID_ADDRESS_WITHOUT_CHECKSUM_REGEX } from './utils';
import { DEFAULT_SECURITY } from '../../config';
import Errors from '../errors';
import { filterNonFundedBundles, constructBundlesFromTransactions } from './transfers';

/**
 *   Prepares inputs for sending transfer from locally stored address related information
 *   Starts from the search index (start) and stops when the threshold is reached
 *
 *   @method prepareInputs
 *   @param {array} addressData
 *   @param {number} maxInputs - Inputs limit
 *   @param {number} threshold - Maximum value (balance) to stop the search
 *   @param {number} [security= 2]
 *
 *   @returns {object} inputs, balance
 **/
export const prepareInputs = (addressData, threshold, maxInputs = 2, security = DEFAULT_SECURITY) => {
    const _throw = (error) => {
        throw new Error(error);
    };

    if (reduce(addressData, (acc, addressObject) => acc + addressObject.balance, 0) < threshold) {
        _throw(Errors.INSUFFICIENT_BALANCE);
    }

    // Throw if threshold is zero
    if (!threshold) {
        _throw(Errors.INPUTS_THRESHOLD_CANNOT_BE_ZERO);
    }

    // Throw if provided maxInputs param is not a number
    if (!isNumber(maxInputs)) {
        _throw(Errors.INVALID_MAX_INPUTS_PROVIDED);
    }

    const availableInputs = filter(
        transformAddressDataToInputs(addressData, security),
        // Also filter addresses with zero balance
        (input) => input.balance > 0,
    );

    // First try to select inputs by optimal value i.e., select less inputs as possible
    const selectedInputs = [];
    let availableBalance = 0;

    while (availableBalance < threshold) {
        const sortedInputs = sortInputsByOptimalValue(
            differenceBy(availableInputs, selectedInputs, 'address'),
            threshold - availableBalance,
        );

        const input = head(sortedInputs);

        selectedInputs.push(input);

        availableBalance += input.balance;
    }

    if (maxInputs > 0 && size(selectedInputs) > maxInputs) {
        _throw(Errors.CANNOT_FIND_INPUTS_WITH_PROVIDED_LIMIT);
    }

    return {
        inputs: selectedInputs,
        balance: availableBalance,
    };
};

/**
 * Sorts inputs by optimal value
 *
 * @method sortInputsByOptimalValue
 * @param {array} inputs
 * @param {number} diff
 *
 * @returns {array}
 */
const sortInputsByOptimalValue = (inputs, diff) =>
    inputs.slice().sort((a, b) => Math.abs(diff - a.balance) - Math.abs(diff - b.balance));

/**
 * Given a list of balances and a threshold
 * attempts to find a subset (within provided limit) with an exact match.
 *
 * @method subsetSumWithLimit
 * @param {number} [limit]
 * @param {number} [MAX_CALL_TIMES]
 *
 * @returns {function(array, number, [array]): {object}}
 */
export const subsetSumWithLimit = (limit = 2, MAX_CALL_TIMES = 100000) => {
    let hasFoundAnExactMatch = false;
    let hasFoundNoMatches = false;

    const exactMatches = [];
    const exceeded = [];

    let callTimes = 0;
    let sizeOfBalances = 0;

    const calculate = (balances, threshold, partial = []) => {
        callTimes += 1;

        // Keep track of the initial size of balances
        if (callTimes === 1) {
            sizeOfBalances = size(balances);
        }

        const sizeOfPartial = size(partial);

        // Sum partial
        const sum = reduce(partial, (acc, value) => acc + value, 0);

        // Check if the partial sum equals threshold
        if (sum === threshold && sizeOfPartial <= limit) {
            exactMatches.push(partial);
            hasFoundAnExactMatch = true;
        }

        if (sum > threshold && sizeOfPartial <= limit) {
            exceeded.push(partial);
        }

        // If sum has reached the threshold why bother continuing
        if (sum >= threshold) {
            return;
        }

        each(balances, (balance, index) => {
            // When finds an exact match, break the iteration
            if (hasFoundAnExactMatch) {
                return false;
            }

            if (index === sizeOfBalances - 1) {
                hasFoundNoMatches = true;
            }

            calculate(
                // Remaining balances
                balances.slice(index + 1),
                threshold,
                [...partial, balance],
            );
        });

        if (hasFoundAnExactMatch || hasFoundNoMatches || callTimes === MAX_CALL_TIMES) {
            return {
                exactMatches,
                exceeded,
            };
        }
    };

    return calculate;
};

/**
 * Prepares inputs from addresses related info and filters out addresses that are already spent.
 * Returns an object with all inputs with addresses that are unspent, total computed balance and
 * balance associated with all addresses.
 *
 * @method getInputs
 *
 * @param {string} provider
 * @param {boolean} withQuorum
 *
 * @returns {function(array, array, number, *): Promise<object>}
 **/
export const getInputs = (provider, withQuorum) => (addressData, transactions, threshold, maxInputs = 0) => {
    // TODO: Validate address data & transactions
    // Check if there is sufficient balance
    if (reduce(addressData, (acc, addressObject) => acc + addressObject.balance, 0) < threshold) {
        return Promise.reject(new Error(Errors.INSUFFICIENT_BALANCE));
    }

    if (!isNumber(maxInputs)) {
        return Promise.reject(new Error(Errors.INVALID_MAX_INPUTS_PROVIDED));
    }

    const pendingTransactions = filter(transactions, (transaction) => transaction.persistence === false);

    // Filter pending transactions with non-funded inputs
    return (isEmpty(pendingTransactions)
        ? Promise.resolve([])
        : filterNonFundedBundles(provider, withQuorum)(constructBundlesFromTransactions(pendingTransactions))
    )
        .then((fundedBundles) => {
            // Remove addresses from addressData with (still funded) pending incoming transactions
            // This mitigates an attack where an adversary could broadcast a fake transaction to block spending from this input address.
            let addressDataForInputs = filterAddressDataWithPendingIncomingTransactions(
                addressData,
                flatMap(fundedBundles),
            );

            if (reduce(addressDataForInputs, (acc, addressObject) => acc + addressObject.balance, 0) < threshold) {
                throw new Error(Errors.INCOMING_TRANSFERS);
            }

            // Filter addresses with pending outgoing transactions
            addressDataForInputs = filterAddressDataWithPendingOutgoingTransactions(addressDataForInputs, transactions);

            if (reduce(addressDataForInputs, (acc, addressObject) => acc + addressObject.balance, 0) < threshold) {
                throw new Error(Errors.ADDRESS_HAS_PENDING_TRANSFERS);
            }

            // Filter all spent addresses
            return filterSpentAddressData(provider, withQuorum)(addressDataForInputs, transactions);
        })
        .then((unspentAddressData) => {
            if (reduce(unspentAddressData, (acc, addressObject) => acc + addressObject.balance, 0) < threshold) {
                throw new Error(Errors.FUNDS_AT_SPENT_ADDRESSES);
            }

            return prepareInputs(unspentAddressData, threshold, maxInputs);
        });
};

/**
 *   Checks if an input object is valid
 *
 *   @method isValidInput
 *   @param {object} input
 *
 *   @returns {boolean}
 **/
export const isValidInput = (input) => {
    return (
        isObject(input) &&
        VALID_ADDRESS_WITHOUT_CHECKSUM_REGEX.test(input.address) &&
        isNumber(input.balance) &&
        isNumber(input.security) &&
        isNumber(input.keyIndex) &&
        input.keyIndex >= 0
    );
};
