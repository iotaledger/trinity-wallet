import { MarketDataActionTypes } from '../types';
import { availableCurrencies } from '../libs/currency';

const initialState = {
    /**
     * Price data points for mapping on chart
     */
    chartData: {},
    /**
     * Market cap
     */
    mcap: '0',
    /**
     * Total amount traded over twenty four hours
     */
    volume: '0',
    /**
     * Percentage of change in IOTA price over twenty four hours
     */
    change24h: '0.00',
    /**
     * USD equivalent price of IOTA token
     */
    usdPrice: 0,
    /**
     * Euro equivalent price of IOTA token
     */
    eurPrice: 0,
    /**
     * Bitcoin equivalent price of IOTA token
     */
    btcPrice: 0,
    /**
     * Ethereum equivalent price of IOTA token
     */
    ethPrice: 0,
    /**
     * Exchange rates
     */
    rates: availableCurrencies,
};

const marketData = (state = initialState, action) => {
    switch (action.type) {
        case MarketDataActionTypes.SET_PRICE:
            return {
                ...state,
                usdPrice: action.usd,
                eurPrice: action.eur,
                btcPrice: action.btc,
                ethPrice: action.eth,
            };
        case MarketDataActionTypes.SET_STATISTICS:
            return {
                ...state,
                mcap: action.mcap,
                volume: action.volume,
                change24h: action.change24h,
            };
        case MarketDataActionTypes.SET_CHART_DATA:
            return {
                ...state,
                chartData: action.chartData,
            };
        case MarketDataActionTypes.SET_RATES_DATA:
            return {
                ...state,
                rates: action.payload,
            };
        default:
            return state;
    }
};

export default marketData;
