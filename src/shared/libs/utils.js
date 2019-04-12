import get from 'lodash/get';
import size from 'lodash/size';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import isString from 'lodash/isString';
import keys from 'lodash/keys';
import filter from 'lodash/filter';
import transform from 'lodash/transform';
import validUrl from 'valid-url';
import { VERSIONS_URL } from '../config';

export const TWOFA_TOKEN_LENGTH = 6;

/**
 * Computes number rounded to precision
 *
 * @method round
 * @param {number} value
 * @param {number} precision
 *
 * @returns {number}
 */
export function round(value, precision) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

/**
 * Computes number rounded down to precision
 *
 * @method roundDown
 * @param {number} number
 * @param {number} decimals
 *
 * @returns {number}
 */
export function roundDown(number, decimals) {
    decimals = decimals || 0;
    return Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Renames object keys
 *
 * @method _renameObjectKeys
 * @param {object} object
 * @param {object} keyMap
 *
 * @returns {object}
 * @private
 */
const _renameObjectKeys = (object, keyMap) =>
    reduce(
        object,
        (result, value, key) => {
            const k = keyMap[key] || key;
            result[k] = value;
            return result;
        },
        {},
    );

/**
 * Renames object keys in an array
 *
 * @method _renameArrayKeys
 * @param {array} list
 * @param {object} keyMap
 *
 * @returns {object}
 * @private
 */
const _renameArrayKeys = (list, keyMap) => map(list, (object) => _renameObjectKeys(object, keyMap));

/**
 * Wrapper function to rename properties in an object or an array of objects
 *
 * @method renameKeys
 * @param {array|object} payload
 * @param {object} keyMap
 *
 * @returns {object}
 */
export const renameKeys = (payload, keyMap) => {
    if (isArray(payload)) {
        return _renameArrayKeys(payload, keyMap);
    }

    return _renameObjectKeys(payload, keyMap);
};

/**
 * Serialises payload if not already serialised
 *
 * @method serialise
 * @param {*} data
 * @param {array} options
 *
 * @returns {*}
 */
export const serialise = (data, ...options) => {
    if (!isString(data)) {
        return JSON.stringify(data, ...options);
    }

    return data;
};

/**
 * Parses serialised data
 *
 * @method parse
 *
 * @param {*} data
 * @returns {object}
 */
export const parse = (data) => {
    try {
        return JSON.parse(data);
    } catch (err) {
        return data;
    }
};

/**
 * Rearranges object keys
 * Put the key at first index at last
 *
 * @method rearrangeObjectKeys
 *
 * @param {object} obj
 * @param {string} prop
 *
 * @returns {object}
 */
export const rearrangeObjectKeys = (obj, prop) => {
    if (prop in obj) {
        const allKeys = keys(obj);
        const withoutProp = filter(allKeys, (k) => k !== prop);
        const withPropAsLastEl = withoutProp.concat([prop]);

        const order = (newObj, key) => {
            newObj[key] = obj[key];

            return newObj;
        };

        return reduce(withPropAsLastEl, order, {});
    }

    return obj;
};

/**
 * Used for setting correct CryptoCompare URL when fetching chart data
 *
 * @method getUrlTimeFormat
 *
 * @param {string} timeframe
 * @returns {string}
 */
export function getUrlTimeFormat(timeframe) {
    switch (timeframe) {
        case '24h':
            return 'hour';
        case '7d':
            return 'day';
        case '1m':
            return 'day';
        case '1h':
            return 'minute';
    }
}

/**
 * Used for setting correct CryptoCompare URL when fetching chart data
 *
 * @method getUrlNumberFormat
 * @param {string} timeframe
 *
 * @returns {string}
 */
export function getUrlNumberFormat(timeframe) {
    switch (timeframe) {
        case '24h':
            return '23';
        case '7d':
            return '6';
        case '1m':
            return '29';
        case '1h':
            return '59';
    }
}

/**
 * Formats data points for price chart
 *
 * @method formatChartData
 * @param {object} json
 * @param {string} timeframe
 *
 * @returns {array}
 */
export function formatChartData(json, timeframe) {
    const timeValue = getUrlNumberFormat(timeframe);
    const response = get(json, 'Data');
    const hasDataPoints = size(response);
    const failedData = [];

    if (response && isArray(response) && hasDataPoints) {
        const data = [];
        for (let i = 0; i <= timeValue; i++) {
            const y = get(response, `[${i}].close`);
            data[i] = {
                x: i,
                y: parseFloat(y),
                time: get(response, `[${i}].time`),
            };
        }

        return data;
    }

    return failedData;
}

/**
 * Checks if a URL is valid
 * @method isValidUrl
 *
 * @param  {string}  url
 * @returns {Boolean}
 */
export const isValidUrl = (url) => {
    if (validUrl.isWebUri(url)) {
        return true;
    }
    return false;
};

/**
 * Check if a URL uses HTTPS
 *
 * @method isValidHttpsUrl
 *
 * @param  {string}  url
 * @returns {Boolean}
 */
export const isValidHttpsUrl = (url) => {
    if (validUrl.isHttpsUri(url)) {
        return true;
    }
    return false;
};

/**
 *   Find most frequently occurring element in a list.
 *   NOTE: Only supports booleans, strings
 *
 *   @method findMostFrequent
 *   @param {array} list
 *   @returns {object} - Frequency and most frequent element
 **/
export const findMostFrequent = (list) =>
    transform(
        list,
        (acc, value) => {
            acc.frequency[value] = (acc.frequency[value] || 0) + 1;

            if (!acc.frequency[acc.mostFrequent] || acc.frequency[value] > acc.frequency[acc.mostFrequent]) {
                acc.mostFrequent = value;
            }
        },
        { frequency: {}, mostFrequent: '' },
    );

/* Converts RGB to Hex.
 *
 * @method rgbToHex
 * @param {string} Rgb as string
 *
 * @returns {String}
 */
export const rgbToHex = (c) => {
    const convert = (x) =>
        '#' +
        x
            .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            })
            .join('');
    c = c
        .split('(')[1]
        .split(')')[0]
        .split(', ')
        .map(Number);
    return convert(c);
};

/**
 * Replaces all non alpha numeric (plus _ and -) characters for an empty string
 *
 * @method removeNonAlphaNumeric
 * @param {string} source - String with non ASCII chars to be cleansed
 * @param {string} fallback - Optional string to be returned in the event of a falsy source
 *
 * @returns {string} Returns a new string without non ASCII characters
 */
export const removeNonAlphaNumeric = (source, fallback = '') => {
    let newStr = '';
    if (source) {
        newStr = source.replace(/[^a-zA-Z0-9_-]/g, '');
    }
    if (!newStr && fallback) {
        newStr = fallback.replace(/[^a-zA-Z0-9_-]/g, '');
    }
    return newStr;
};

/**
 * Fetches latest and blacklisted versions
 *
 * @method fetchVersions
 * @param {string} [url]
 *
 * @returns {Promise<*>}
 */
export const fetchVersions = (url = VERSIONS_URL) => {
    return fetch(url)
        .then((response) => response.json())
        .then((response) => {
            if (isObject(response)) {
                return response;
            }
            return {};
        })
        .catch(() => Promise.resolve({}));
};
