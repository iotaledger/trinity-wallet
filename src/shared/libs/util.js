import isArray from 'lodash/isArray';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import isString from 'lodash/isString';
import keys from 'lodash/keys';
import merge from 'lodash/merge';
import filter from 'lodash/filter';
import cloneDeep from 'lodash/cloneDeep';
import URL from 'url-parse';

export const MAX_SEED_LENGTH = 81;

export const ADDRESS_LENGTH = 90;

export const VALID_SEED_REGEX = /^[A-Z9]+$/;

export const VALID_ADDRESS_WITH_CHECKSUM_REGEX = /^[A-Z9]{90}$/;

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
        case value < 1000000000000000:
            value /= 1000000000000;
            break;
    }
    if (negative === true) {
        return -value;
    } else {
        return value;
    }
};

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
        case value < 1000000000000000:
            return 'Ti';
    }
};

export function formatIota(value) {
    const iota = formatValue(value);
    const unit = formatUnit(value);
    const formatted = `${iota} ${unit}`;
    return formatted;
}

export function round(value, precision) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

export function roundDown(number, decimals) {
    decimals = decimals || 0;
    return Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export const isValidServerAddress = (server) => {
    if (!server.startsWith('http://') && !server.startsWith('https://')) {
        return false;
    }
    return true;
};

export const isValidSeed = (seed) => seed.length === MAX_SEED_LENGTH && seed.match(VALID_SEED_REGEX);

export const guid = () => {
    const s4 = () =>
        Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

export const createRandomSeed = (randomBytesFn, length = MAX_SEED_LENGTH) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
    const bytes = randomBytesFn(100);
    let seed = '';

    if (length > MAX_SEED_LENGTH || length < 1) {
        length = MAX_SEED_LENGTH;
    }

    Object.keys(bytes).forEach((key) => {
        if (bytes[key] < 243 && seed.length < length) {
            const randomNumber = bytes[key] % 27;
            const randomLetter = charset.charAt(randomNumber);
            seed += randomLetter;
        }
    });

    return seed;
};

export const isValidPassword = (password = '') => password.length >= 12;

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

const _renameArrayKeys = (list, keyMap) => map(list, (object) => _renameObjectKeys(object, keyMap));

export const renameKeys = (payload, keyMap) => {
    if (isArray(payload)) {
        return _renameArrayKeys(payload, keyMap);
    }

    return _renameObjectKeys(payload, keyMap);
};

export const serialize = (data, ...options) => {
    if (!isString(data)) {
        return JSON.stringify(data, ...options);
    }

    return data;
};

export const parse = (data) => {
    try {
        return JSON.parse(data);
    } catch (err) {
        return data;
    }
};

export const rearrangeObjectKeys = (obj, prop) => {
    const allKeys = keys(obj);
    const withoutProp = filter(allKeys, (k) => k !== prop);
    const withPropAsLastEl = withoutProp.concat([prop]);

    const order = (newObj, key) => {
        newObj[key] = obj[key];

        return newObj;
    };

    return reduce(withPropAsLastEl, order, {});
};

export const updatePersistedState = (incomingState, restoredState) => {
    const { app: { versions }, settings: { availablePoWNodes, theme } } = incomingState;
    const restoredCopy = cloneDeep(restoredState);

    if ('app' in restoredCopy) {
        restoredCopy.app.versions = versions;
    }

    if ('settings' in restoredCopy) {
        restoredCopy.settings.availablePoWNodes = availablePoWNodes;
        restoredCopy.settings.theme = theme;
    }

    return merge({}, incomingState, restoredCopy);
};

// Takes in the navigator object and pushes.
// FIXME: Unneeded method. Remove when routing is sorted.
export const pushScreen = (
    navigator,
    screen,
    props = {
        navigatorStyle: {
            navBarHidden: true,
            navBarTransparent: true,
            screenBackgroundColor: '#1a373e',
        },
        animated: false,
        overrideBackPress: true,
    },
) => {
    if (navigator) {
        navigator.push({
            ...props,
            screen,
        });
    }
};

/**
 * @typedef {Object} ParsedURL
 * @property {string} address The parsed address
 * @property {string} message The parsed message
 * @property {number} ammount The parsed ammount
 */

/** Parse an IOTA address input
 * @param {String} - Input value
 * @returns {ParsedURL} - The parsed address, message and/or ammmount values
 */
export const parseAddress = (input) => {
    const result = {
        address: null,
        message: null,
        ammount: null,
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
            ammount: null,
        };

        if (input.toLowerCase().indexOf('iota://') === 0) {
            const url = new URL(input, true);
            parsed.address = url.hostname.toUpperCase();
            parsed.message = url.query.message;
            parsed.ammount = url.query.ammount;
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
        if (parsed.ammount && parsed.ammount === parseInt(parsed.ammount, 10)) {
            result.ammount = parseInt(parsed.ammount, 10);
        }
    } catch (error) {
        return null;
    }

    return result;
};
