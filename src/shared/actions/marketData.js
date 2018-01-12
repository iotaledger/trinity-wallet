import get from 'lodash/get';
import isArray from 'lodash/isArray';
import size from 'lodash/size';

// FIXME: Hacking no-console linting.
// FIXME: Get rid of the unnecessary break statements.
// FIXME: Add a default case for all the switch statements
// Should rather be dispatching an action.

/* eslint-disable no-console */

export const ActionTypes = {
    SET_TIMEFRAME: 'IOTA/MARKET_DATA/SET_TIMEFRAME',
    SET_CHART_DATA: 'IOTA/MARKET_DATA/SET_CHART_DATA',
    SET_STATISTICS: 'IOTA/MARKET_DATA/SET_STATISTICS',
    SET_CURRENCY: 'IOTA/MARKET_DATA/SET_CURRENCY',
    SET_PRICE: 'IOTA/MARKET_DATA/SET_PRICE',
};

export function setTimeframe(timeframe) {
    return {
        type: ActionTypes.SET_TIMEFRAME,
        payload: timeframe,
    };
}

export function setMarketData(data) {
    const usdPrice = get(data, 'RAW.IOT.USD.PRICE') || 0;
    const volume24Hours = get(data, 'RAW.IOT.USD.TOTALVOLUME24HTO') || 0;
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

export function setPrice(data) {
    const priceData = get(data, 'RAW.IOT');
    const usdPrice = get(priceData, 'USD.PRICE') || 0;
    const eurPrice = get(priceData, 'EUR.PRICE') || 0;
    const btcPrice = get(priceData, 'BTC.PRICE') || 0;
    const ethPrice = get(priceData, 'ETH.PRICE') || 0;

    return {
        type: ActionTypes.SET_PRICE,
        usd: usdPrice,
        eur: eurPrice,
        btc: btcPrice,
        eth: ethPrice,
    };
}

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

export function getPrice() {
    return dispatch =>
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD,EUR,BTC,ETH')
            .then(response => response.json(), error => console.log('SOMETHING WENT WRONG: ', error))
            .then(json => dispatch(setPrice(json)));
}

export function getChartData() {
    return dispatch => {
        const currencies = ['USD', 'EUR', 'BTC', 'ETH'];
        const timeframes = ['24h', '7d', '1m', '1h'];

        currencies.forEach(currency => {
            timeframes.forEach(timeframe => {
                const url = `https://min-api.cryptocompare.com/data/histo${getUrlTimeFormat(
                    timeframe,
                )}?fsym=IOT&tsym=${currency}&limit=${getUrlNumberFormat(timeframe)}`;
                return fetch(url)
                    .then(response => response.json(), error => console.log('SOMETHING WENT WRONG: ', error))
                    .then(json => {
                        if (json) {
                            dispatch(setChartData(json, currency, timeframe));
                        }
                    });
            });
        });
    };
}

export function setChartData(json, currency, timeframe) {
    const timeValue = getUrlNumberFormat(timeframe);
    const response = get(json, 'Data');
    const hasDataPoints = size(response);

    if (response && isArray(response) && hasDataPoints) {
        const data = [];
        for (let i = 0; i <= timeValue; i++) {
            const y = get(response, `[${i}].close`);
            if (currency === 'BTC') {
                data[i] = {
                    x: i,
                    y: parseFloat(y.toFixed(5)),
                };
            } else {
                data[i] = {
                    x: i,
                    y: parseFloat(y),
                };
            }
        }

        return {
            type: ActionTypes.SET_CHART_DATA,
            data: data,
            currency: currency,
            timeframe: timeframe,
        };
    }

    return {
        type: ActionTypes.SET_CHART_DATA,
        data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        currency: currency,
        timeframe: timeframe,
    };
}

export function getMarketData() {
    return dispatch =>
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD')
            .then(response => response.json(), error => console.log('SOMETHING WENT WRONG: ', error))
            .then(json => dispatch(setMarketData(json)));
}

export function changeCurrency(currency, timeframe) {
    return dispatch => {
        dispatch(setCurrency(currency));
        dispatch(getPrice(currency));
        dispatch(getChartData(currency, timeframe));
    };
}
export function changeTimeframe(currency, timeframe) {
    return dispatch => {
        dispatch(setTimeframe(timeframe));
        dispatch(getPrice(currency));
        dispatch(getChartData(currency, timeframe));
    };
}
