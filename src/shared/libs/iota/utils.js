import isNull from 'lodash/isNull';
import size from 'lodash/size';
import URL from 'url-parse';
import { BigNumber } from 'bignumber.js';
import { iota } from './index';

export const MAX_SEED_LENGTH = 81;

export const ADDRESS_LENGTH = 90;

export const VALID_SEED_REGEX = /^[A-Z9]+$/;

export const VALID_ADDRESS_WITH_CHECKSUM_REGEX = /^[A-Z9]{90}$/;

export const TOTAL_IOTA_SUPPLY = 2779530283277761;

/**
 * Converts trytes to bytes
 *
 * @method convertFromTrytes
 * @param {string} trytes
 *
 * @returns {string}
 */
export const convertFromTrytes = (trytes) => {
    const trytesWithoutNines = trytes.replace(/9+$/, '');
    const message = iota.utils.fromTrytes(trytesWithoutNines);

    if (trytesWithoutNines && message) {
        return message;
    }

    return 'Empty';
};

/**
 * Gets checksum for seed
 *
 * @method getChecksum
 * @param {string} seed
 *
 * @returns {string}
 */
export const getChecksum = (seed) => {
    return iota.utils.addChecksum(seed, 3, false).substr(-3);
};

/**
 * Checks if a seed is valid
 *
 * @method isValidSeed
 * @param {string} seed
 *
 * @returns {boolean}
 */
export const isValidSeed = (seed) => seed.length === MAX_SEED_LENGTH && seed.match(VALID_SEED_REGEX);

/**
 * Formats IOTA value
 *
 * @method formatValue
 * @param {number} value
 *
 * @returns {number}
 */
export const formatValue = (value) => {
    let negative = false;
    if (value < 0) {
        negative = true;
        value = -value;
    }
    switch (true) {
        case value < 1000:
            break;
        case value < 1000000:
            value /= 1000;
            break;
        case value < 1000000000:
            value /= 1000000;
            break;
        case value < 1000000000000:
            value /= 1000000000;
            break;
        default:
            value /= 1000000000000;
            break;
    }

    if (negative === true) {
        return -value;
    }

    return value;
};

/**
 * Gets relevant denomination for provided IOTA value
 *
 * @method formatUnit
 * @param {number} value
 *
 * @returns {string}
 */
export const formatUnit = (value) => {
    if (value < 0) {
        value = -value;
    }

    switch (true) {
        case value < 1000:
            return 'i';
        case value < 1000000:
            return 'Ki';
        case value < 1000000000:
            return 'Mi';
        case value < 1000000000000:
            return 'Gi';
        default:
            return 'Ti';
    }
};

/**
 * Formats IOTA value and assign appropriate unit
 *
 * @method formatIota
 * @param {number} value
 *
 * @returns {string}
 */
export function formatIota(value) {
    const iota = formatValue(value);
    const unit = formatUnit(value);

    return `${iota} ${unit}`;
}

/**
 * Checks if provided server address is valid
 *
 * @method isValidServerAddress
 * @param {string} server
 *
 * @returns {boolean}
 */
export const isValidServerAddress = (server) => {
    if (!server.startsWith('http://') && !server.startsWith('https://')) {
        return false;
    }

    return true;
};

/**
 * Checks if provided IOTA address is valid
 *
 * @method isValidAddress
 * @param {string} address
 *
 * @returns {boolean}
 */
export const isValidAddress = (address) => {
    if (!isNull(address.match(VALID_SEED_REGEX))) {
        return size(address) === 90 && iota.utils.isValidChecksum(address);
    }

    return false;
};

/**
 * Checks if provided IOTA message is valid
 *
 * @method isValidMessage
 * @param {string} message
 *
 * @returns {boolean}
 */
export const isValidMessage = (message) => {
    return iota.utils.fromTrytes(iota.utils.toTrytes(message)) === message;
};

/**
 * Checks if provided amount is valid
 *
 * @method isValidAmount
 * @param {string|number} amount
 * @param {number} multiplier
 * @param {boolean} isFiat
 *
 * @returns {boolean}
 */
export const isValidAmount = (amount, multiplier, isFiat = false) => {
    const value = new BigNumber(parseFloat(amount)).times(new BigNumber(multiplier)).toNumber();
    // For sending a message
    if (amount === '') {
        return true;
    }

    // Ensure iota value is an integer
    if (!isFiat) {
        if (value % 1 !== 0) {
            return false;
        }
    }

    if (value < 0) {
        return false;
    }

    return !isNaN(amount);
};

/**
 * @typedef {Object} ParsedURL
 * @property {string} address The parsed address
 * @property {string} message The parsed message
 * @property {number} amount The parsed amount
 */

/** Parse an IOTA address input
 * @param {string} input
 * @returns {ParsedURL} - The parsed address, message and/or amount values
 */
export const parseAddress = (input) => {
    const result = {
        address: null,
        message: null,
        amount: null,
    };

    if (!input || typeof input !== 'string') {
        return null;
    }

    if (input.match(VALID_ADDRESS_WITH_CHECKSUM_REGEX)) {
        result.address = input;
        return result;
    }

    try {
        let parsed = {
            address: null,
            message: null,
            amount: null,
        };

        if (input.toLowerCase().indexOf('iota:') === 0) {
            const url = new URL(input, true);
            parsed.address = url.hostname.toUpperCase();
            parsed.message = url.query.message;
            parsed.amount = url.query.amount;
        } else {
            parsed = JSON.parse(input);
        }

        if (parsed.address.match(VALID_ADDRESS_WITH_CHECKSUM_REGEX)) {
            result.address = parsed.address;
        } else {
            return null;
        }
        if (parsed.message && typeof parsed.message === 'string') {
            result.message = parsed.message;
        }
        if (parsed.amount && String(parsed.amount) === String(parseInt(parsed.amount, 10))) {
            result.amount = Math.abs(parseInt(parsed.amount, 10));
        }
    } catch (error) {
        return null;
    }

    return result;
};
