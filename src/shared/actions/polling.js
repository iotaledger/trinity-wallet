import { getUrlTimeFormat, getUrlNumberFormat, setPrice, setChartData, setMarketData } from './marketData';
import { getSelectedAccount } from '../selectors/account';
import { iota } from '../libs/iota';

export const ActionTypes = {
    SET_POLL_FOR: 'IOTA/POLLING/SET_POLL_FOR',
    FETCH_PRICE_REQUEST: 'IOTA/POLLING/FETCH_PRICE_REQUEST',
    FETCH_PRICE_SUCCESS: 'IOTA/POLLING/FETCH_PRICE_SUCCESS',
    FETCH_PRICE_ERROR: 'IOTA/POLLING/FETCH_PRICE_ERROR',
    FETCH_CHART_DATA_REQUEST: 'IOTA/POLLING/FETCH_CHART_DATA_REQUEST',
    FETCH_CHART_DATA_SUCCESS: 'IOTA/POLLING/FETCH_CHART_DATA_SUCCESS',
    FETCH_CHART_DATA_ERROR: 'IOTA/POLLING/FETCH_CHART_DATA_ERROR',
    FETCH_MARKET_DATA_REQUEST: 'IOTA/POLLING/FETCH_MARKET_DATA_REQUEST',
    FETCH_MARKET_DATA_SUCCESS: 'IOTA/POLLING/FETCH_MARKET_DATA_SUCCESS',
    FETCH_MARKET_DATA_ERROR: 'IOTA/POLLING/FETCH_MARKET_DATA_ERROR',
    NEW_ADDRESS_DATA_FETCH_REQUEST: 'IOTA/POLLING/NEW_ADDRESS_DATA_FETCH_REQUEST',
    NEW_ADDRESS_DATA_FETCH_SUCCESS: 'IOTA/POLLING/NEW_ADDRESS_DATA_FETCH_SUCCESS',
    NEW_ADDRESS_DATA_FETCH_ERROR: 'IOTA/POLLING/NEW_ADDRESS_DATA_FETCH_ERROR',
};

const fetchPriceRequest = () => ({
    type: ActionTypes.FETCH_PRICE_REQUEST,
});

const fetchPriceSuccess = () => ({
    type: ActionTypes.FETCH_PRICE_SUCCESS,
});

const fetchPriceError = () => ({
    type: ActionTypes.FETCH_PRICE_ERROR,
});

const fetchChartDataRequest = () => ({
    type: ActionTypes.FETCH_CHART_DATA_REQUEST,
});

const fetchChartDataSuccess = () => ({
    type: ActionTypes.FETCH_CHART_DATA_SUCCESS,
});

const fetchChartDataError = () => ({
    type: ActionTypes.FETCH_CHART_DATA_ERROR,
});

const fetchMarketDataRequest = () => ({
    type: ActionTypes.FETCH_MARKET_DATA_REQUEST,
});

const fetchMarketDataSuccess = () => ({
    type: ActionTypes.FETCH_MARKET_DATA_SUCCESS,
});

const fetchMarketDataError = () => ({
    type: ActionTypes.FETCH_MARKET_DATA_ERROR,
});

const newAddressDataFetchRequest = () => ({
    type: ActionTypes.NEW_ADDRESS_DATA_FETCH_REQUEST,
});

const newAddressDataFetchSuccess = payload => ({
    type: ActionTypes.NEW_ADDRESS_DATA_FETCH_SUCCESS,
    payload,
});

const newAddressDataFetchError = () => ({
    type: ActionTypes.NEW_ADDRESS_DATA_FETCH_ERROR,
});

export const setPollFor = payload => ({
    type: ActionTypes.SET_POLL_FOR,
    payload,
});

// TODO: Do not call fetch again for market data api calls.
// Instead just directly dispatch
export const fetchMarketData = () => {
    return dispatch => {
        dispatch(fetchMarketDataRequest());
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD')
            .then(
                response => response.json(),
                () => {
                    dispatch(fetchMarketDataError());
                },
            )
            .then(json => {
                dispatch(setMarketData(json));
                dispatch(fetchMarketDataSuccess());
            });
    };
};

export const fetchPrice = () => {
    return dispatch => {
        dispatch(fetchPriceRequest());
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD,BTC,ETH')
            .then(response => response.json(), () => dispatch(fetchPriceError()))
            .then(json => {
                dispatch(setPrice(json));
                dispatch(fetchPriceSuccess());
            });
    };
};

export const fetchChartData = () => {
    return dispatch => {
        const currencies = ['USD', 'BTC', 'ETH'];
        const timeframes = ['24h', '7d', '1m', '1h'];

        dispatch(fetchChartDataRequest());
        currencies.forEach((currency, i) => {
            timeframes.forEach((timeframe, j) => {
                const url = `https://min-api.cryptocompare.com/data/histo${getUrlTimeFormat(
                    timeframe,
                )}?fsym=IOT&tsym=${currency}&limit=${getUrlNumberFormat(timeframe)}`;
                return fetch(url)
                    .then(
                        response => response.json(),
                        () => {
                            if (i === currencies.length - 1 && j === timeframes.length - 1) {
                                dispatch(fetchChartDataError());
                            }
                        },
                    )
                    .then(json => {
                        if (json) {
                            dispatch(setChartData(json, currency, timeframe));
                        }

                        if (i === currencies.length - 1 && j === timeframes.length - 1) {
                            // Dirty hack
                            dispatch(fetchChartDataSuccess());
                        }
                    });
            });
        });
    };
};

export const getNewAddressData = (seed, accountName) => {
    return (dispatch, getState) => {
        dispatch(newAddressDataFetchRequest());

        const selectedAccount = getSelectedAccount(accountName, getState().account.accountInfo);
        const index = Object.keys(selectedAccount.addresses).length - 1;

        iota.api.getInputs(seed, { start: index }, (error, success) => {
            if (!error) {
                const newAddressData = success.inputs.reduce((obj, x) => {
                    obj[x.address] = { balance: x.balance, spent: false };
                    return obj;
                }, {});

                dispatch(newAddressDataFetchSuccess({ accountName, addresses: newAddressData }));
            } else {
                dispatch(newAddressDataFetchError()); // Also generate an alert
            }
        });
    };
};
