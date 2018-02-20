import { ActionTypes } from '../actions/marketData';

const initialState = {
    currency: 'USD',
    timeframe: '24h',
    chartData: {},
    mcap: '0',
    volume: '0',
    change24h: '0.00',
    usdPrice: 0,
    eurPrice: 0,
    btcPrice: 0,
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
                chartData: {
                    ...state.chartData,
                    [action.currency]: {
                        ...state.chartData[action.currency],
                        [action.timeframe]: action.data,
                    },
                },
            };
        default:
            return state;
    }
};

export default marketData;
