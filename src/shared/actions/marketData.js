import get from 'lodash/get';
import filter from 'lodash/filter';
import { formatChartData, getUrlTimeFormat, getUrlNumberFormat } from '../libs/marketData';

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

export function getPrice() {
    return (dispatch) => {
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD,EUR,BTC,ETH')
            .then((response) => response.json(), (error) => console.log('SOMETHING WENT WRONG: ', error))
            .then((json) => dispatch(setPrice(json)));
    };
}

// export function getChartData() {
//     return (dispatch) => {
//         const currencies = ['USD', 'EUR', 'BTC', 'ETH'];
//         //const currencies = ['USD', 'EUR', 'BTC', 'ETH'];
//         const timeframes = ['24h', '7d', '1m', '1h'];
//
//         currencies.forEach((currency) => {
//             timeframes.forEach((timeframe) => {
//                 const url = `https://min-api.cryptocompare.com/data/histo${getUrlTimeFormat(
//                     timeframe,
//                 )}?fsym=IOT&tsym=${currency}&limit=${getUrlNumberFormat(timeframe)}`;
//                 return fetch(url)
//                     .then((response) => response.json(), (error) => console.log('SOMETHING WENT WRONG: ', error))
//                     .then((json) => {
//                         if (json) {
//                             const data = formatChartData(json, currency, timeframe);
//                             dispatch(setChartData(data, currency, timeframe));
//                         }
//                     });
//             });
//         });
//     };
// }

export function getChartData() {
    return (dispatch) => {
        let arrayCurrenciesTimeFrames = [];
        const currencies = ['USD', 'EUR', 'BTC', 'ETH'];
        const timeframes = ['24h', '7d', '1m', '1h'];
        let arrayPromises = [];
        currencies.forEach((currencyItem) => {
            filter(timeframes, timeFrameItem => {
                arrayCurrenciesTimeFrames.push({currency: currencyItem, timeFrame: timeFrameItem});
            });
        });

        arrayCurrenciesTimeFrames.forEach((currencyTimeFrameArrayItem) => {
            let url = `https://min-api.cryptocompare.com/data/histo${getUrlTimeFormat
            (currencyTimeFrameArrayItem.timeFrame)}?fsym=IOT&tsym=${currencyTimeFrameArrayItem.currency}&limit=${getUrlNumberFormat
            (currencyTimeFrameArrayItem.timeFrame)}`;
            arrayPromises.push(fetch(url).then( (response)=> {
                return response.json();
            }));
        });
        Promise.all(arrayPromises).then( (results) => {
            results.forEach( (resultItem, index) => {
                let resultFormated = formatChartData(resultItem,
                    arrayCurrenciesTimeFrames[index].currency, arrayCurrenciesTimeFrames[index].timeFrame);
                dispatch(setChartData(resultFormated));
            });
        });
    };
}

export function setChartData(data) {
    return {
        type: ActionTypes.SET_CHART_DATA,
        data,
    };
}

export function getMarketData() {
    return (dispatch) =>
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD')
            .then((response) => response.json(), (error) => console.log('SOMETHING WENT WRONG: ', error))
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
