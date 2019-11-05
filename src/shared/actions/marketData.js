import { MarketDataActionTypes } from '../types';
import { MARKETDATA_ENDPOINTS, FETCH_REMOTE_NODES_REQUEST_TIMEOUT } from '../config';

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
 * Gets and sets latest market information
 *
 * @method setMarketData
 *
 * @returns {function} dispatch
 */
export const setMarketData = () => (dispatch) => {
    getMarketData(dispatch);
};

/**
 * Gets latest market information
 *
 * @method getMarketData
 *
 * @returns {function} dispatch
 */
export const getMarketData = async (dispatch) => {
    const requestOptions = {
        headers: {
            Accept: 'application/json',
        },
    };

    let fetched = false;

    for (let index = 0; index < MARKETDATA_ENDPOINTS.length; index++) {
        try {
            const endPoint = MARKETDATA_ENDPOINTS[index];

            const response = await Promise.race([
                fetch(endPoint, requestOptions),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Fetch timeout')), FETCH_REMOTE_NODES_REQUEST_TIMEOUT),
                ),
            ]);
            const marketData = await response.json();

            // Set price data
            if (typeof marketData.currencies === 'object') {
                const currencyData = { usd: 0, eur: 0, btc: 0, eth: 0 };

                Object.keys(currencyData).forEach((currency) => {
                    if (marketData.currencies[currency]) {
                        currencyData[currency] = marketData.currencies[currency];
                    }
                });

                dispatch({
                    type: MarketDataActionTypes.SET_PRICE,
                    ...currencyData,
                });
            }

            // Set chart data
            const chartData = { usd: {}, eur: {}, btc: {}, eth: {} };

            Object.keys(chartData).forEach((currency) => {
                if (marketData[`history-${currency}`] && marketData[`history-${currency}`].data) {
                    chartData[currency] = marketData[`history-${currency}`].data;
                }
            });

            fetched = true;

            dispatch({
                type: MarketDataActionTypes.SET_CHART_DATA,
                chartData,
            });

            // Set market statistics
            if (typeof marketData.market === 'object') {
                const { usd_market_cap, usd_24h_vol, usd_24h_change } = marketData.market;

                dispatch({
                    type: MarketDataActionTypes.SET_STATISTICS,
                    mcap: usd_market_cap || 0,
                    volume: usd_24h_vol || 0,
                    change24h: usd_24h_change ? usd_24h_change.toFixed(3) : 0,
                });
            }

            // Set rates statistics
            if (typeof marketData.rates === 'object') {
                dispatch({
                    type: MarketDataActionTypes.SET_RATES_DATA,
                    payload: { ...marketData.rates },
                });
            }

            break;
        } catch (err) {
            console.log(err); //eslint-disable-line no-console
        }
    }

    return fetched;
};

export function changeCurrency(currency) {
    return (dispatch) => {
        dispatch(setCurrency(currency));
    };
}

export function changeTimeframe(currency, timeframe) {
    return (dispatch) => {
        dispatch(setTimeframe(timeframe));
    };
}
