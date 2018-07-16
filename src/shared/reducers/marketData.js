import { ActionTypes } from '../actions/marketData';

const initialState = {
    /**
     * Wallet selected currency
     */
    currency: 'USD',
    /**
     * Time frame for price
     */
    timeframe: '24h',
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
};

const marketData = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_CURRENCY:
            return {
                ...state,
                currency: action.payload,
            };
        case ActionTypes.SET_TIMEFRAME:
            return {
                ...state,
                timeframe: action.payload,
            };
        case ActionTypes.SET_PRICE:
            return {
                ...state,
                usdPrice: action.usd,
                eurPrice: action.eur,
                btcPrice: action.btc,
                ethPrice: action.eth,
            };
        case ActionTypes.SET_STATISTICS:
            return {
                ...state,
                usdPrice: action.usdPrice,
                mcap: action.mcap,
                volume: action.volume,
                change24h: action.change24h,
            };
        case ActionTypes.SET_CHART_DATA:
            return {
                ...state,
                chartData: action.chartData,
            };
        default:
            return state;
    }
};

export default marketData;
