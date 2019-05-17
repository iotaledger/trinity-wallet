import get from 'lodash/get';
import filter from 'lodash/filter';
import isArray from 'lodash/isArray';
import isFunction from 'lodash/isFunction';
import isUndefined from 'lodash/isUndefined';
import includes from 'lodash/includes';
import isNull from 'lodash/isNull';
import sampleSize from 'lodash/sampleSize';
import size from 'lodash/size';
import URL from 'url-parse';
import { BigNumber } from 'bignumber.js';
import { iota } from './index';
import { isNodeHealthy } from './extendedApi';
import { NODELIST_URL, MAX_REQUEST_TIMEOUT } from '../../config';
import Errors from '../errors';

export const MAX_SEED_LENGTH = 81;

export const MAX_SEED_TRITS = MAX_SEED_LENGTH * 3;

export const SEED_CHECKSUM_LENGTH = 3;

export const ADDRESS_LENGTH_WITHOUT_CHECKSUM = MAX_SEED_LENGTH;

export const ADDRESS_LENGTH = 90;

export const CHECKSUM_LENGTH = ADDRESS_LENGTH - ADDRESS_LENGTH_WITHOUT_CHECKSUM;

export const VALID_SEED_REGEX = /^[A-Z9]+$/;

export const VALID_ADDRESS_WITHOUT_CHECKSUM_REGEX = VALID_SEED_REGEX;

export const VALID_ADDRESS_WITH_CHECKSUM_REGEX = /^[A-Z9]{90}$/;

export const TOTAL_IOTA_SUPPLY = 2779530283277761;

export const HASH_SIZE = 81;

export const TRANSACTION_TRYTES_SIZE = 2673;

export const EMPTY_HASH_TRYTES = '9'.repeat(HASH_SIZE);

export const EMPTY_TRANSACTION_TRYTES = '9'.repeat(TRANSACTION_TRYTES_SIZE);

export const EMPTY_TRANSACTION_MESSAGE = 'Empty';

export const IOTA_DENOMINATIONS = ['i', 'Ki', 'Mi', 'Gi', 'Ti'];

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

    /* eslint-disable no-control-regex */
    if (trytesWithoutNines && message && /^[\x00-\xFF]*$/.test(message)) {
        return message;
    }
    /* eslint-enable no-control-regex */
    return EMPTY_TRANSACTION_MESSAGE;
};

/**
 * Gets checksum.
 *
 * @method getChecksum
 *
 * @param {string | array} input - seed trytes | seed trits
 * @param {number} [length]
 *
 * @returns {string | array}
 */
export const getChecksum = (
    input,
    // Trinity trytes to trits conversion creates Int8Array
    length = isArray(input) || input instanceof Int8Array ? SEED_CHECKSUM_LENGTH * 3 : SEED_CHECKSUM_LENGTH,
) => {
    return iota.utils
        .addChecksum(
            // https://github.com/iotaledger/iota.js/blob/develop/lib/utils/utils.js#L64
            // iota.lib.js throws an exception for typed arrays
            input instanceof Int8Array ? Array.from(input) : input,
            length,
            false,
        )
        .slice(-length);
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
 * Converts iota value-unit string to int value
 *
 * @method unitStringToValue
 * @param {string}
 *
 * @returns {number}
 */
export const unitStringToValue = (str) => {
    const value = parseInt(str);
    const unit = str.substr(value.toString().length).toLowerCase();

    switch (unit) {
        case 'ki':
            return value * 1000;
        case 'mi':
            return value * 1000000;
        case 'gi':
            return value * 1000000000;
        case 'ti':
            return value * 1000000000000;
        case 'pi':
            return value * 1000000000000000;
        default:
            return value;
    }
};

/**
 * Formats IOTA value and assigns appropriate unit
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
 * Checks if the last trit is 0
 *
 * @method isLastTritZero
 * @param {string} address
 *
 * @returns {boolean}
 */
export const isLastTritZero = (address) => !/[E-V]/.test(address.slice(80, 81));

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

/**
 * Retry IOTA api calls on different nodes
 *
 * @method withRetriesOnDifferentNodes
 *
 * @param {array} nodes
 * @param {array|function} [failureCallbacks]
 *
 * @returns {function(function): function(...[*]): Promise}
 */
export const withRetriesOnDifferentNodes = (nodes, failureCallbacks) => {
    let attempt = 0;
    let executedCallback = false;
    const retries = size(nodes);

    return (promiseFunc) => {
        const execute = (...args) => {
            if (isUndefined(nodes[attempt])) {
                return Promise.reject(new Error(Errors.NO_NODE_TO_RETRY));
            }

            return promiseFunc(nodes[attempt])(...args)
                .then((result) => ({ node: nodes[attempt], result }))
                .catch((err) => {
                    if (get(err, 'message') === Errors.LEDGER_INVALID_INDEX) {
                        throw new Error(Errors.LEDGER_INVALID_INDEX);
                    }
                    // Abort retries on user cancelled Ledger action
                    if (get(err, 'message') === Errors.LEDGER_CANCELLED) {
                        throw new Error(Errors.LEDGER_CANCELLED);
                    }
                    // If a function is passed as failure callback
                    // Just trigger it once.
                    if (isFunction(failureCallbacks)) {
                        if (!executedCallback) {
                            executedCallback = true;
                            failureCallbacks();
                        }
                        // If an array of functions is passed
                        // Execute callback on each failure
                    } else if (isArray(failureCallbacks)) {
                        if (isFunction(failureCallbacks[attempt])) {
                            failureCallbacks[attempt]();
                        }
                    }

                    attempt += 1;

                    if (attempt < retries) {
                        return execute(...args);
                    }

                    throw err;
                });
        };

        return execute;
    };
};

/**
 * Fetches list of IRI nodes from a server
 *
 * @method fetchRemoteNodes
 * @param {string} [url]
 * @param {object} [options]
 *
 * @returns {Promise<*>}
 */
export const fetchRemoteNodes = (
    url = NODELIST_URL,
    options = {
        headers: {
            Accept: 'application/json',
        },
    },
) =>
    fetch(url, options)
        .then((response) => response.json())
        .then((response) => {
            if (isArray(response)) {
                return response.filter((node) => typeof node.node === 'string' && node.node.indexOf('https://') === 0);
            }

            return [];
        });

/**
 * Gets random nodes.
 *
 * @method getRandomNodes
 * @param {array} nodes
 * @param {number} [size]
 * @param {array} [blacklisted]
 *
 * @returns {Array}
 */
export const getRandomNodes = (nodes, size = 5, blacklisted = []) => {
    return sampleSize(filter(nodes, (node) => !includes(blacklisted, node)), size);
};

/**
 * Throws an error if a node is not synced.
 *
 * @method throwIfNodeNotHealthy
 * @param {string} provider
 *
 * @returns {Promise<boolean>}
 */
export const throwIfNodeNotHealthy = (provider) => {
    return isNodeHealthy(provider).then((isSynced) => {
        if (!isSynced) {
            throw new Error(Errors.NODE_NOT_SYNCED_BY_TIMESTAMP);
        }

        return isSynced;
    });
};

/**
 * Handles timeouts for network requests made to IRI nodes
 * Catches "request timeout" exceptions and retries network request with increased timeout
 * See (https://github.com/iotaledger/iota.js/blob/master/lib/utils/makeRequest.js#L115)
 *
 * @method withRequestTimeoutsHandler
 *
 * @param {number} timeout
 *
 * @returns {function}
 */
export const withRequestTimeoutsHandler = (timeout) => {
    let attempt = 1;

    const getNextTimeout = () => attempt * timeout;

    const handleTimeout = (promiseFunc) => {
        return promiseFunc(getNextTimeout()).catch((error) => {
            attempt += 1;

            if (
                (includes(error.message, Errors.REQUEST_TIMED_OUT) ||
                    includes(error.message, Errors.REQUEST_TIMED_OUT.toLowerCase())) &&
                getNextTimeout() < MAX_REQUEST_TIMEOUT
            ) {
                return handleTimeout(promiseFunc);
            }

            throw error;
        });
    };

    return handleTimeout;
};
