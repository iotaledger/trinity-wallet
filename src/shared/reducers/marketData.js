const initialState = {
    currency: 'USD',
    timeFrame: '24h',
    chartData: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
};

const marketData = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_CURRENCY':
            return {
                ...state,
                currency: action.payload,
            };
        case 'SET_TIMEFRAME':
            return {
                ...state,
                timeFrame: action.payload,
            };
        case 'SET_PRICE':
            return {
                ...state,
                price: action.payload,
            };
        case 'SET_MARKETDATA':
            return {
                ...state,
                usdPrice: action.usdPrice,
                mcap: action.mcap,
                volume: action.volume,
                change24h: action.change24h,
            };
        case 'SET_CHARTDATA':
            return {
                ...state,
                chartData: action.payload,
            };
        default:
            return state;
    }
};

export default marketData;
