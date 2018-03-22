import get from 'lodash/get';
import filter from 'lodash/filter';
import { setPrice, setChartData, setMarketData } from './marketData';
import {
    formatChartData,
    getUrlTimeFormat,
    getUrlNumberFormat,
    rearrangeObjectKeys
} from '../libs/utils';
import { generateAlert, generateAccountInfoErrorAlert } from './alerts';
import { setNewUnconfirmedBundleTails, removeBundleFromUnconfirmedBundleTails } from './accounts';
import { getFirstConsistentTail, isValidForPromotion } from '../libs/iota/transfers';
import { selectedAccountStateFactory } from '../selectors/accounts';
import { syncAccount } from '../libs/iota/accounts';
import { forceTransactionPromotion } from './transfers';
import i18next from '../i18next.js';

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
    ACCOUNT_INFO_FETCH_REQUEST: 'IOTA/POLLING/ACCOUNT_INFO_FETCH_REQUEST',
    ACCOUNT_INFO_FETCH_SUCCESS: 'IOTA/POLLING/ACCOUNT_INFO_FETCH_SUCCESS',
    ACCOUNT_INFO_FETCH_ERROR: 'IOTA/POLLING/ACCOUNT_INFO_FETCH_ERROR',
    PROMOTE_TRANSACTION_REQUEST: 'IOTA/POLLING/PROMOTE_TRANSACTION_REQUEST',
    PROMOTE_TRANSACTION_SUCCESS: 'IOTA/POLLING/PROMOTE_TRANSACTION_SUCCESS',
    PROMOTE_TRANSACTION_ERROR: 'IOTA/POLLING/PROMOTE_TRANSACTION_ERROR',
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

const accountInfoFetchRequest = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_REQUEST,
});

const accountInfoFetchSuccess = (payload) => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS,
    payload,
});

const accountInfoFetchError = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_ERROR,
});

const promoteTransactionRequest = () => ({
    type: ActionTypes.PROMOTE_TRANSACTION_REQUEST,
});

const promoteTransactionSuccess = () => ({
    type: ActionTypes.PROMOTE_TRANSACTION_SUCCESS,
});

const promoteTransactionError = () => ({
    type: ActionTypes.PROMOTE_TRANSACTION_ERROR,
});

export const setPollFor = (payload) => ({
    type: ActionTypes.SET_POLL_FOR,
    payload,
});

// TODO: Do not call fetch again for market data api calls.
// Instead just directly dispatch
export const fetchMarketData = () => {
    return (dispatch) => {
        dispatch(fetchMarketDataRequest());
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD')
            .then(
            (response) => response.json(),
            () => {
                dispatch(fetchMarketDataError());
            },
        )
            .then((json) => {
                dispatch(setMarketData(json));
                dispatch(fetchMarketDataSuccess());
            });
    };
};

export const fetchPrice = () => {
    return (dispatch) => {
        dispatch(fetchPriceRequest());
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD,EUR,BTC,ETH')
            .then((response) => response.json(), () => dispatch(fetchPriceError()))
            .then((json) => {
                dispatch(setPrice(json));
                dispatch(fetchPriceSuccess());
            });
    };
};

export const fetchChartData = () => {
    return (dispatch) => {
        const arrayCurrenciesTimeFrames = [];
        //If you want a new currency just add it in this array, the function will handle the rest.
        const currencies = ['USD', 'EUR', 'BTC', 'ETH'];
        const timeframes = ['24h', '7d', '1m', '1h'];
        const chartData = {};
        const arrayPromises = [];

        dispatch(fetchChartDataRequest());
        currencies.forEach((itemCurrency) => {
            chartData[itemCurrency] = {};
            filter(timeframes, (timeFrameItem) => {
                arrayCurrenciesTimeFrames.push({ currency: itemCurrency, timeFrame: timeFrameItem });
            });
        });

        arrayCurrenciesTimeFrames.forEach((currencyTimeFrameArrayItem) => {
            const url = `https://min-api.cryptocompare.com/data/histo${getUrlTimeFormat(
                currencyTimeFrameArrayItem.timeFrame,
            )}?fsym=IOT&tsym=${currencyTimeFrameArrayItem.currency}&limit=${getUrlNumberFormat(
                currencyTimeFrameArrayItem.timeFrame,
            )}`;
            arrayPromises.push(
                fetch(url).then((response) => {
                    try {
                        return response.json();
                    } catch (err) {
                        dispatch(fetchChartDataError());
                    }
                }),
            );
        });

        Promise.all(arrayPromises).then((results) => {
            const chartData = { USD: {}, EUR: {}, BTC: {}, ETH: {} };
            let actualCurrency = '';
            let currentTimeFrame = '';
            let currentCurrency = '';
            results.forEach((resultItem, index) => {
                currentTimeFrame = arrayCurrenciesTimeFrames[index].timeFrame;
                currentCurrency = arrayCurrenciesTimeFrames[index].currency;
                const formatedData = formatChartData(resultItem, currentCurrency, currentTimeFrame);

                if (actualCurrency !== currentCurrency) {
                    actualCurrency = currentCurrency;
                }
                chartData[currentCurrency][currentTimeFrame] = formatedData;
            });
            dispatch(setChartData(chartData));
            dispatch(fetchChartDataSuccess());
        });
    };
};

/**
 *   Accepts a user's seed and account name and sync local account state with ledger's.
 *
 *   @method getAccountInfo
 *   @param {string} seed
 *   @param {string} accountName
 *   @returns {function} dispatch
 **/
export const getAccountInfo = (accountName) => {
    return (dispatch, getState) => {
        dispatch(accountInfoFetchRequest());

        const existingAccountState = selectedAccountStateFactory(accountName)(getState());

        return syncAccount(existingAccountState)
            .then((newAccountData) => dispatch(accountInfoFetchSuccess(newAccountData)))
            .catch((err) => {
                dispatch(accountInfoFetchError());
                dispatch(generateAccountInfoErrorAlert(err));
            });
    };
};

/**
 *   Accepts a bundle hash and all tail transaction objects relevant to the bundle.
 *   Check if a bundle is still valid.
 *   For cases where a bundle is invalid, it would remove it for promotion.
 *   For cases where a bundle in valid, find first consistent tail and promote it.
 *
 *   @method promoteTransfer
 *   @param {string} bundle
 *   @param {array} tails - All tail transaction objects for the bundle
 *   @returns {function} - dispatch
 **/
export const promoteTransfer = (bundle, tails) => (dispatch, getState) => {
    dispatch(promoteTransactionRequest());

    const accountName = get(tails, '[0].account');
    const existingAccountState = selectedAccountStateFactory(accountName)(getState());

    return isValidForPromotion(bundle, existingAccountState.transfers, existingAccountState.addresses)
        .then((isValid) => {
            if (!isValid) {
                dispatch(removeBundleFromUnconfirmedBundleTails(bundle));

                throw new Error('Bundle no longer valid');
            }

            return getFirstConsistentTail(tails, 0);
        })
        .then((consistentTail) => dispatch(forceTransactionPromotion(accountName, consistentTail, tails)))
        .then((hash) => {
            dispatch(
                generateAlert(
                    'success',
                    i18next.t('global:autopromoting'),
                    i18next.t('global:autopromotingExplanation', { hash }),
                ),
            );

            // Rearrange bundles so that the next cycle picks up a new bundle for promotion
            dispatch(
                setNewUnconfirmedBundleTails(rearrangeObjectKeys(existingAccountState.unconfirmedBundleTails, bundle)),
            );

            return dispatch(promoteTransactionSuccess());
        })
        .catch(() => dispatch(promoteTransactionError()));
};
