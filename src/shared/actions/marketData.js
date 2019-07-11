import get from 'lodash/get';
import each from 'lodash/each';
import map from 'lodash/map';
import { formatChartData, getUrlTimeFormat, getUrlNumberFormat } from '../libs/utils';
import { MarketDataActionTypes } from '../types';

/**
 * Dispatch to set timeframe for IOTA time series price information
 *
 * @method setTimeframe
 * @param {string} timeframe
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export function setTimeframe(timeframe) {
    return {
        type: MarketDataActionTypes.SET_TIMEFRAME,
        payload: timeframe,
    };
}

/**
 * Dispatch to set latest IOTA market information in state
 *
 * @method setMarketData
 * @param {object} data
 *
 * @returns {{type: {string}, usdPrice: {number}, mcap: {number}, volume: {number}, change24h: {string} }}
 */
export function setMarketData(data) {
    const usdPrice = get(data, 'RAW.MIOTA.USD.PRICE') || 0;
    const volume24Hours = get(data, 'RAW.MIOTA.USD.TOTALVOLUME24HTO') || 0;
    const changePct24Hours = get(data, 'RAW.MIOTA.USD.CHANGEPCT24HOUR') || 0;
    const mcap = Math.round(usdPrice * 2779530283);
    const volume = Math.round(volume24Hours);
    const change24h = parseFloat(Math.round(changePct24Hours * 100) / 100).toFixed(2);

    return {
        type: MarketDataActionTypes.SET_STATISTICS,
        usdPrice,
        mcap,
        volume,
        change24h,
    };
}

/**
 * Dispatch to set currency in state
 *
 * @method setCurrency
 * @param {string} currency
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export function setCurrency(currency) {
    return {
        type: MarketDataActionTypes.SET_CURRENCY,
        payload: currency,
    };
}

/**
 * Dispatch to set latest IOTA price information in state
 *
 * @method setPrice
 * @param {object} data
 *
 * @returns {{type: {string}, usd: {number}, eur: {number}, btc: {number}, eth: {number} }}
 */
export function setPrice(data) {
    const priceData = get(data, 'RAW.MIOTA');
    const usdPrice = get(priceData, 'USD.PRICE') || 0;
    const eurPrice = get(priceData, 'EUR.PRICE') || 0;
    const btcPrice = get(priceData, 'BTC.PRICE') || 0;
    const ethPrice = get(priceData, 'ETH.PRICE') || 0;

    return {
        type: MarketDataActionTypes.SET_PRICE,
        usd: usdPrice,
        eur: eurPrice,
        btc: btcPrice,
        eth: ethPrice,
    };
}

/**
 * Gets latest IOTA price information
 *
 * @method getPrice
 *
 * @returns {function} dispatch
 */
export function getPrice() {
    return (dispatch) => {
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=MIOTA&tsyms=USD,EUR,BTC,ETH')
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }

                throw response;
            })
            .then((json) => dispatch(setPrice(json)));
    };
}

/**
 * Gets latest time series price data to map on chart
 *
 * @method getChartData
 *
 * @returns {function} dispatch
 */
export function getChartData() {
    return (dispatch) => {
        const arrayCurrenciesTimeFrames = [];
        //If you want a new currency just add it in this array, the function will handle the rest.
        const currencies = ['USD', 'EUR', 'BTC', 'ETH'];
        const timeframes = ['24h', '7d', '1m', '1h'];
        const chartData = {};

        each(currencies, (itemCurrency) => {
            chartData[itemCurrency] = {};
            each(timeframes, (timeFrameItem) => {
                arrayCurrenciesTimeFrames.push({ currency: itemCurrency, timeFrame: timeFrameItem });
            });
        });

        const urls = [];
        const grabContent = (url) =>
            fetch(url).then((response) => {
                if (response.ok) {
                    return response.json();
                }

                throw response;
            });

        each(arrayCurrenciesTimeFrames, (currencyTimeFrameArrayItem) => {
            const url = `https://min-api.cryptocompare.com/data/histo${getUrlTimeFormat(
                currencyTimeFrameArrayItem.timeFrame,
            )}?fsym=MIOTA&tsym=${currencyTimeFrameArrayItem.currency}&limit=${getUrlNumberFormat(
                currencyTimeFrameArrayItem.timeFrame,
            )}`;

            urls.push(url);
        });

        Promise.all(map(urls, grabContent))
            .then((results) => {
                const chartData = { USD: {}, EUR: {}, BTC: {}, ETH: {} };
                let actualCurrency = '';
                let currentTimeFrame = '';
                let currentCurrency = '';

                each(results, (resultItem, index) => {
                    currentTimeFrame = arrayCurrenciesTimeFrames[index].timeFrame;
                    currentCurrency = arrayCurrenciesTimeFrames[index].currency;

                    const formattedData = formatChartData(resultItem, currentTimeFrame);

                    if (actualCurrency !== currentCurrency) {
                        actualCurrency = currentCurrency;
                    }

                    chartData[currentCurrency][currentTimeFrame] = formattedData;
                });

                dispatch(setChartData(chartData));
            })
            .catch((err) => console.log(err)); // eslint-disable-line no-console
    };
}

/**
 * Dispatch to set latest chart data points in state
 *
 * @method setPrice
 * @param {object} chartData
 *
 * @returns {{type: {string}, chartData: {object} }}
 */
export function setChartData(chartData) {
    return {
        type: MarketDataActionTypes.SET_CHART_DATA,
        chartData,
    };
}

/**
 * Gets latest market information
 *
 * @method getMarketData
 *
 * @returns {function} dispatch
 */
export function getMarketData() {
    return (dispatch) =>
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=MIOTA&tsyms=USD')
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }

                throw response;
            })
            .then((json) => dispatch(setMarketData(json)));
}

export function changeCurrency(currency, timeframe) {
    return (dispatch) => {
        dispatch(setCurrency(currency));
        dispatch(getPrice(currency));
        dispatch(getChartData(currency, timeframe));
    };
}

export function changeTimeframe(currency, timeframe) {
    return (dispatch) => {
        dispatch(setTimeframe(timeframe));
        dispatch(getPrice(currency));
        dispatch(getChartData(currency, timeframe));
    };
}
