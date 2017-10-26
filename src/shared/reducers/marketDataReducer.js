const marketDataReducer = (
    state = {
        currency: 'USD',
        timeFrame: '24h',
        chartData: [{ x: 0, y: 0.1 }, { x: 1, y: 0.15 }, { x: 2, y: 0.2 }],
    },
    action,
) => {
    switch (action.type) {
        case 'SET_CURRENCY':
            state = {
                ...state,
                currency: action.payload,
            };
            break;
        case 'SET_TIMEFRAME':
            state = {
                ...state,
                timeFrame: action.payload,
            };
            break;
        case 'SET_PRICE':
            state = {
                ...state,
                price: action.payload,
            };
            break;
        case 'SET_MARKETDATA':
            state = {
                ...state,
                usdPrice: action.usdPrice,
                mcap: action.mcap,
                volume: action.volume,
                change24h: action.change24h,
            };
            break;
        case 'SET_CHARTDATA':
            state = {
                ...state,
                chartData: action.payload,
            };
            break;
    }
    return state;
};

export default marketDataReducer;
