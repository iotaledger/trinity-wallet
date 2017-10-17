const marketDataReducer = (
    state = {
        currency: 'USD',
        timeFrame: '24h',
        chartData: [
            { x: 0, y: 0.43 },
            { x: 1, y: 0.43 },
            { x: 2, y: 0.43 },
            { x: 3, y: 0.425 },
            { x: 4, y: 0.4239 },
            { x: 5, y: 0.425 },
            { x: 6, y: 0.4228 },
            { x: 7, y: 0.4288 },
            { x: 8, y: 0.4319 },
            { x: 9, y: 0.4415 },
            { x: 10, y: 0.4383 },
            { x: 11, y: 0.442 },
            { x: 12, y: 0.4397 },
            { x: 13, y: 0.4362 },
            { x: 14, y: 0.4299 },
            { x: 15, y: 0.4245 },
            { x: 16, y: 0.4311 },
            { x: 17, y: 0.4302 },
            { x: 18, y: 0.43 },
            { x: 19, y: 0.4308 },
            { x: 20, y: 0.444 },
            { x: 21, y: 0.44 },
            { x: 22, y: 0.4494 },
            { x: 23, y: 0.4538 },
        ],
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
