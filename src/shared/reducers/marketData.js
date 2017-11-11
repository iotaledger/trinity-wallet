import { ActionTypes } from '../actions/marketData';

const initialState = {
    currency: 'USD',
    timeFrame: '24h',
    chartData: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
};

const marketData = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_CURRENCY:
            return {
                ...state,
                currency: action.payload,
            };
        case ActionTypes.SET_TIME_FRAME:
            return {
                ...state,
                timeFrame: action.payload,
            };
        case ActionTypes.SET_PRICE:
            return {
                ...state,
                price: action.payload,
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
                chartData: action.payload,
            };
        default:
            return state;
    }
};

export default marketData;
