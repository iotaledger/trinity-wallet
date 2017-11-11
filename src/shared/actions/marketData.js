import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import size from 'lodash/size';

// FIXME: Hacking no-console linting.
// FIXME: Get rid of the unnecessary break statements.
// FIXME: Add a default case for all the switch statements
// Should rather be dispatching an action.

/* eslint-disable no-console */

export const ActionTypes = {
    SET_TIME_FRAME: 'IOTA/MARKET_DATA/SET_TIME_FRAME',
    SET_CHART_DATA: 'IOTA/MARKET_DATA/SET_CHART_DATA',
    SET_STATISTICS: 'IOTA/MARKET_DATA/SET_STATISTICS',
    SET_CURRENCY: 'IOTA/MARKET_DATA/SET_CURRENCY',
    SET_PRICE: 'IOTA/MARKET_DATA/SET_PRICE',
};

export function setTimeFrame(timeFrame) {
    return {
        type: ActionTypes.SET_TIME_FRAME,
        payload: timeFrame,
    };
}

function setChartData(json, timeValue) {
    const response = get(json, 'Data');
    const hasDataPoints = size(response);

    if (response && isArray(response) && hasDataPoints) {
        const data = [];
        for (let i = 0; i <= timeValue; i++) {
            const y = get(response, `[${i}].close`);
            data[i] = {
                x: i,
                y: parseFloat(y),
            };
        }

        return {
            type: ActionTypes.SET_CHART_DATA,
            payload: data,
        };
    }

    return {
        type: ActionTypes.SET_CHART_DATA,
        payload: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    };
}

export function setMarketData(data) {
    const usdPrice = get(data, 'RAW.IOT.USD.PRICE') || 0;
    const volume24Hours = get(data, 'RAW.IOT.USD.VOLUME24HOUR') || 0;
    const changePct24Hours = get(data, 'RAW.IOT.USD.CHANGEPCT24HOUR') || 0;
    const mcap = Math.round(usdPrice * 2779530283)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const volume = Math.round(volume24Hours)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const change24h = parseFloat(Math.round(changePct24Hours * 100) / 100).toFixed(2);

    return {
        type: ActionTypes.SET_STATISTICS,
        usdPrice,
        mcap,
        volume,
        change24h,
    };
}

export function setCurrency(currency) {
    return {
        type: ActionTypes.SET_CURRENCY,
        payload: currency,
    };
}

export function setPrice(currency, data) {
    switch (currency) {
        case 'USD':
            return {
                type: ActionTypes.SET_PRICE,
                payload: data.RAW.IOT[currency].PRICE,
            };
        case 'BTC':
            return {
                type: ActionTypes.SET_PRICE,
                payload: parseFloat(data.RAW.IOT[currency].PRICE).toFixed(6),
            };
        case 'ETH':
            return {
                type: ActionTypes.SET_PRICE,
                payload: parseFloat(data.RAW.IOT[currency].PRICE).toFixed(5),
            };
    }
}

function getUrlTimeFormat(timeFrame) {
    // Used for setting correct CryptoCompare URL when fetching chart data
    switch (timeFrame) {
        case '24h':
            return 'hour';
            break;
        case '7d':
            return 'day';
            break;
        case '1m':
            return 'day';
            break;
        case '1h':
            return 'minute';
            break;
        case '6h':
            return 'hour';
            break;
    }
}

function getUrlNumberFormat(timeFrame) {
    // Used for setting correct CryptoCompare URL when fetching chart data
    switch (timeFrame) {
        case '24h':
            return '23';
            break;
        case '7d':
            return '6';
            break;
        case '1m':
            return '29';
            break;
        case '1h':
            return '59';
            break;
        case '6h':
            return '5';
            break;
    }
}

export function getPrice(currency) {
    return dispatch =>
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD,BTC,ETH')
            .then(response => response.json(), error => console.log('SOMETHING WENT WRONG: ', error))
            .then(json => dispatch(setPrice(currency, json)));
}

export function getChartData(currency, timeFrame) {
    return dispatch => {
        const url = `https://min-api.cryptocompare.com/data/histo${getUrlTimeFormat(
            timeFrame,
        )}?fsym=IOT&tsym=${currency}&limit=${getUrlNumberFormat(timeFrame)}`;
        return fetch(url)
            .then(response => response.json(), error => console.log('SOMETHING WENT WRONG: ', error))
            .then(json => dispatch(setChartData(json, getUrlNumberFormat(timeFrame))));
    };
}

export function getMarketData() {
    return dispatch =>
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD')
            .then(response => response.json(), error => console.log('SOMETHING WENT WRONG: ', error))
            .then(json => dispatch(setMarketData(json)));
}

export function changeCurrency(currency, timeFrame) {
    return dispatch => {
        dispatch(setCurrency(currency));
        dispatch(getPrice(currency));
        dispatch(getChartData(currency, timeFrame));
    };
}
export function changeTimeFrame(currency, timeFrame) {
    return dispatch => {
        dispatch(setTimeFrame(timeFrame));
        dispatch(getPrice(currency));
        dispatch(getChartData(currency, timeFrame));
    };
}
