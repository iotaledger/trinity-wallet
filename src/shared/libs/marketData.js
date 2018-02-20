import get from 'lodash/get';
import isArray from 'lodash/isArray';
import size from 'lodash/size';

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
