import isArray from 'lodash/isArray';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import isString from 'lodash/isString';
import keys from 'lodash/keys';
import merge from 'lodash/merge';
import filter from 'lodash/filter';
import cloneDeep from 'lodash/cloneDeep';

export const MAX_SEED_LENGTH = 81;

export const ADDRESS_LENGTH = 90;

export const VALID_SEED_REGEX = /^[A-Z9]+$/;

export const VALID_ADDRESS_WITH_CHECKSUM_REGEX = /^[A-Z9]{90}$/;

export const formatValue = value => {
    var negative = false;
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
    if (negative == true) {
        return -value;
    } else {
        return value;
    }
};

export const formatUnit = value => {
    if (value < 0) {
        value = -value;
    }
    const unit = '';
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

export const isValidServerAddress = server => {
    if (!server.startsWith('http://') && !server.startsWith('https://')) {
        return false;
    }
    return true;
};

export const isValidSeed = seed => seed.length === MAX_SEED_LENGTH && seed.match(VALID_SEED_REGEX);

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

    Object.keys(bytes).forEach(key => {
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

const _renameArrayKeys = (list, keyMap) => map(list, object => _renameObjectKeys(object, keyMap));

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

export const parse = data => {
    try {
        return JSON.parse(data);
    } catch (err) {
        return data;
    }
};

export const rearrangeObjectKeys = (obj, prop) => {
    const allKeys = keys(obj);
    const withoutProp = filter(allKeys, k => k !== prop);
    const withPropAsLastEl = withoutProp.concat([prop]);

    const order = (newObj, key) => {
        newObj[key] = obj[key];

        return newObj;
    };

    return reduce(withPropAsLastEl, order, {});
};

export const updatePersistedState = (incomingState, restoredState) => {
    const { app: { versions }, settings: { availablePoWNodes } } = incomingState;
    const restoredCopy = cloneDeep(restoredState);

    if ('app' in restoredCopy) {
        restoredCopy.app.versions = versions;
    }

    if ('settings' in restoredCopy) {
        restoredCopy.settings.availablePoWNodes = availablePoWNodes;
    }

    return merge({}, incomingState, restoredCopy);
};
