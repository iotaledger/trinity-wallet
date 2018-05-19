import get from 'lodash/get';
import omitBy from 'lodash/omitBy';
import each from 'lodash/each';
import size from 'lodash/size';
import isArray from 'lodash/isArray';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import includes from 'lodash/includes';
import isString from 'lodash/isString';
import keys from 'lodash/keys';
import merge from 'lodash/merge';
import filter from 'lodash/filter';
import cloneDeep from 'lodash/cloneDeep';
import unset from 'lodash/unset';

export function round(value, precision) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

export function roundDown(number, decimals) {
    decimals = decimals || 0;
    return Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

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
    const blacklistedStateProps = ['app', 'keychain', 'polling', 'ui', 'progress', 'deepLinks', 'wallet'];

    const incomingStateWithWhitelistedProps = omitBy(incomingState, (value, key) =>
        includes(blacklistedStateProps, key),
    );

    const { settings: { theme, versions } } = incomingStateWithWhitelistedProps;
    const restoredCopy = cloneDeep(restoredState);

    if ('settings' in restoredCopy) {
        restoredCopy.settings.theme = theme;
        restoredCopy.settings.versions = versions;
    }

    if ('accounts' in restoredCopy) {
        const accountNames = keys(restoredCopy.accounts.accountInfo);

        each(accountNames, (accountName) => {
            restoredCopy.accounts.accountInfo[accountName].hashes = [];
        });

        unset(restoredCopy.accounts, ['txHashesForUnspentAddresses', 'pendingTxHashesForSpentAddresses']);
    }

    return merge({}, incomingStateWithWhitelistedProps, restoredCopy);
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

export function getUrlTimeFormat(timeframe) {
    // Used for setting correct CryptoCompare URL when fetching chart data
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

export function getUrlNumberFormat(timeframe) {
    // Used for setting correct CryptoCompare URL when fetching chart data
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

export function formatChartData(json, currency, timeframe) {
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
            };
        }
        return data;
    }
    return failedData;
}
