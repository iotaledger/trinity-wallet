import get from 'lodash/get';
import each from 'lodash/each';
import isArray from 'lodash/isArray';
import map from 'lodash/map';
import union from 'lodash/union';
import { setPrice, setChartData, setMarketData } from './marketData';
import { setNodeList, setRandomlySelectedNode, setAutoPromotion } from './settings';
import { getRandomNode, changeIotaNode } from '../libs/iota';
import { formatChartData, getUrlTimeFormat, getUrlNumberFormat, rearrangeObjectKeys } from '../libs/utils';
import { generateAccountInfoErrorAlert, generateAlert } from './alerts';
import { setNewUnconfirmedBundleTails, removeBundleFromUnconfirmedBundleTails } from './accounts';
import { getFirstConsistentTail, isStillAValidTransaction } from '../libs/iota/transfers';
import { selectedAccountStateFactory } from '../selectors/accounts';
import { syncAccount } from '../libs/iota/accounts';
import { forceTransactionPromotion } from './transfers';
import { NODELIST_URL, nodes, nodesWithPoWEnabled } from '../config';
import Errors from '../libs/errors';
import i18next from '../i18next';

export const ActionTypes = {
    SET_POLL_FOR: 'IOTA/POLLING/SET_POLL_FOR',
    FETCH_PRICE_REQUEST: 'IOTA/POLLING/FETCH_PRICE_REQUEST',
    FETCH_PRICE_SUCCESS: 'IOTA/POLLING/FETCH_PRICE_SUCCESS',
    FETCH_PRICE_ERROR: 'IOTA/POLLING/FETCH_PRICE_ERROR',
    FETCH_NODELIST_REQUEST: 'IOTA/POLLING/FETCH_NODELIST_REQUEST',
    FETCH_NODELIST_SUCCESS: 'IOTA/POLLING/FETCH_NODELIST_SUCCESS',
    FETCH_NODELIST_ERROR: 'IOTA/POLLING/FETCH_NODELIST_ERROR',
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
    SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION: 'IOTA/POLLING/SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION',
};

/**
 * Dispatch when IOTA price information is about to be fetched
 *
 * @method fetchPriceRequest
 *
 * @returns {{type: {string} }}
 */
const fetchPriceRequest = () => ({
    type: ActionTypes.FETCH_PRICE_REQUEST,
});

/**
 * Dispatch when IOTA price information is successfully fetched
 *
 * @method fetchPriceSuccess
 *
 * @returns {{type: {string} }}
 */
const fetchPriceSuccess = () => ({
    type: ActionTypes.FETCH_PRICE_SUCCESS,
});

/**
 * Dispatch when an error occurs when fetching IOTA price information
 *
 * @method fetchPriceError
 *
 * @returns {{type: {string} }}
 */
const fetchPriceError = () => ({
    type: ActionTypes.FETCH_PRICE_ERROR,
});

/**
 * Dispatch when list of IRI nodes are about to be fetched from a remote server
 *
 * @method fetchNodeListRequest
 *
 * @returns {{type: {string} }}
 */
const fetchNodeListRequest = () => ({
    type: ActionTypes.FETCH_NODELIST_REQUEST,
});

/**
 * Dispatch when list of IRI nodes are successfully fetched from remote server
 *
 * @method fetchNodeListSuccess
 *
 * @returns {{type: {string} }}
 */
const fetchNodeListSuccess = () => ({
    type: ActionTypes.FETCH_NODELIST_SUCCESS,
});

/**
 * Dispatch if an error occurs while fetching list of IRI nodes from remote server
 *
 * @method fetchNodeListError
 *
 * @returns {{type: {string} }}
 */
const fetchNodeListError = () => ({
    type: ActionTypes.FETCH_NODELIST_ERROR,
});

/**
 * Dispatch when data points for IOTA time series price information are about to be fetched
 *
 * @method fetchChartDataRequest
 *
 * @returns {{type: {string} }}
 */
const fetchChartDataRequest = () => ({
    type: ActionTypes.FETCH_CHART_DATA_REQUEST,
});

/**
 * Dispatch when data points for IOTA time series price information are successfully fetched
 *
 * @method fetchChartDataSuccess
 *
 * @returns {{type: {string} }}
 */
const fetchChartDataSuccess = () => ({
    type: ActionTypes.FETCH_CHART_DATA_SUCCESS,
});

/**
 * Dispatch when an error occurs while fetching IOTA time series price information
 *
 * @method fetchChartDataError
 *
 * @returns {{type: {string} }}
 */
const fetchChartDataError = () => ({
    type: ActionTypes.FETCH_CHART_DATA_ERROR,
});

/**
 * Dispatch when IOTA market information is about to be fetched
 *
 * @method fetchMarketDataRequest
 *
 * @returns {{type: {string} }}
 */
const fetchMarketDataRequest = () => ({
    type: ActionTypes.FETCH_MARKET_DATA_REQUEST,
});

/**
 * Dispatch when IOTA market information is successfully fetched
 *
 * @method fetchMarketDataSuccess
 *
 * @returns {{type: {string} }}
 */
const fetchMarketDataSuccess = () => ({
    type: ActionTypes.FETCH_MARKET_DATA_SUCCESS,
});

/**
 * Dispatch if an error occurs while fetching IOTA market information
 *
 * @method fetchMarketDataError
 *
 * @returns {{type: {string} }}
 */
const fetchMarketDataError = () => ({
    type: ActionTypes.FETCH_MARKET_DATA_ERROR,
});

/**
 * Dispatch when account information is about to be fetched during polling
 *
 * @method accountInfoFetchRequest
 *
 * @returns {{type: {string} }}
 */
const accountInfoFetchRequest = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_REQUEST,
});

/**
 * Dispatch when account information is successfully fetched during polling
 *
 * @method accountInfoFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
const accountInfoFetchSuccess = (payload) => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS,
    payload,
});

/**
 * Dispatch when an error occurs during account sync
 *
 * @method accountInfoFetchError
 *
 * @returns {{type: {string} }}
 */
const accountInfoFetchError = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_ERROR,
});

/**
 * Dispatch when a transaction is about to be auto promoted
 *
 * @method promoteTransactionRequest
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
const promoteTransactionRequest = (payload) => ({
    type: ActionTypes.PROMOTE_TRANSACTION_REQUEST,
    payload,
});

/**
 * Dispatch when a transaction is successfully auto promoted
 *
 * @method promoteTransactionSuccess
 *
 * @returns {{type: {string} }}
 */
const promoteTransactionSuccess = () => ({
    type: ActionTypes.PROMOTE_TRANSACTION_SUCCESS,
});

/**
 * Dispatch when an error occurs during auto promotion
 *
 * @method promoteTransactionError
 *
 * @returns {{type: {string} }}
 */
const promoteTransactionError = () => ({
    type: ActionTypes.PROMOTE_TRANSACTION_ERROR,
});

/**
 * Dispatch to set active polling service
 *
 * @method setPollFor
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setPollFor = (payload) => ({
    type: ActionTypes.SET_POLL_FOR,
    payload,
});

/**
 * Dispatch to update account state before auto promoting a transaction
 *
 * @method syncAccountBeforeAutoPromotion
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const syncAccountBeforeAutoPromotion = (payload) => ({
    type: ActionTypes.SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION,
    payload,
});

/**
 *  Fetch IOTA market information
 *
 *   @method fetchMarketData
 *
 *   @returns {function} - dispatch
 **/
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

/**
 *  Fetch IOTA price information
 *
 *   @method fetchPrice
 *
 *   @returns {function} - dispatch
 **/
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

/**
 * Fetch list of IRI nodes from a remote server
 *
 * @method fetchNodeList
 *
 * @param {boolean} chooseRandomNode
 * @returns {function}
 */
export const fetchNodeList = (chooseRandomNode = false) => {
    return (dispatch) => {
        dispatch(fetchNodeListRequest());

        const setRandomNode = (nodesList) => {
            if (chooseRandomNode) {
                const node = getRandomNode(nodesList);
                changeIotaNode(node);
                dispatch(setRandomlySelectedNode(node));
            }
        };

        fetch(NODELIST_URL, {
            headers: {
                Accept: 'application/json',
            },
        })
            .then(
                (response) => response.json(),
                () => {
                    // In case there is an error fetching the remote nodes list
                    // Choose a random node from the list of hardcoded nodes
                    setRandomNode(nodes);
                    dispatch(fetchNodeListError());
                },
            )
            .then((response) => {
                if (isArray(response) && response.length) {
                    const remoteNodes = response
                        .map((node) => node.node)
                        .filter((node) => typeof node === 'string' && node.indexOf('https://') === 0);

                    const remoteNodesWithPoWEnabled = response
                        .filter((node) => node.pow)
                        .map((nodeWithPoWEnabled) => nodeWithPoWEnabled.node);

                    const unionNodes = union(nodes, remoteNodes);

                    // A temporary addition
                    // Only choose a random node with PoW enabled.
                    setRandomNode(union(nodesWithPoWEnabled, remoteNodesWithPoWEnabled));
                    dispatch(setNodeList(unionNodes));
                }

                dispatch(fetchNodeListSuccess());
            });
    };
};

/**
 * Fetch data points for time series price information
 *
 * @method fetchChartData
 *
 * @returns {function} - dispatch
 */
export const fetchChartData = () => {
    return (dispatch) => {
        dispatch(fetchChartDataRequest());

        const arrayCurrenciesTimeFrames = [];
        //If you want a new currency just add it in this array, the function will handle the rest.
        const currencies = ['USD', 'EUR', 'BTC', 'ETH'];
        const timeframes = ['24h', '7d', '1m', '1h'];
        const chartData = {};

        each(currencies, (itemCurrency) => {
            chartData[itemCurrency] = {};
            each(timeframes, (timeFrameItem) => {
                arrayCurrenciesTimeFrames.push({ currency: itemCurrency, timeFrame: timeFrameItem });
            });
        });

        const urls = [];
        const grabContent = (url) => fetch(url).then((response) => response.json());

        each(arrayCurrenciesTimeFrames, (currencyTimeFrameArrayItem) => {
            const url = `https://min-api.cryptocompare.com/data/histo${getUrlTimeFormat(
                currencyTimeFrameArrayItem.timeFrame,
            )}?fsym=IOT&tsym=${currencyTimeFrameArrayItem.currency}&limit=${getUrlNumberFormat(
                currencyTimeFrameArrayItem.timeFrame,
            )}`;

            urls.push(url);
        });

        Promise.all(map(urls, grabContent))
            .then((results) => {
                const chartData = { USD: {}, EUR: {}, BTC: {}, ETH: {} };
                let actualCurrency = '';
                let currentTimeFrame = '';
                let currentCurrency = '';

                each(results, (resultItem, index) => {
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
            })
            .catch(() => dispatch(fetchChartDataError()));
    };
};

/**
 *   Accepts account name and syncs local account state with ledger's.
 *
 *   @method getAccountInfo
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
 *   Checks if a bundle is still valid.
 *   For cases where a bundle is invalid, it would remove the transaction for promotion.
 *   For cases where a bundle is valid, find first consistent tail and promote it.
 *
 *   @method promoteTransfer
 *   @param {string} bundleHash
 *   @param {array} seenTailTransactions
 *   @returns {function} - dispatch
 **/
export const promoteTransfer = (bundleHash, seenTailTransactions) => (dispatch, getState) => {
    dispatch(promoteTransactionRequest(bundleHash));

    const accountName = get(seenTailTransactions, '[0].account');
    let accountState = selectedAccountStateFactory(accountName)(getState());

    return syncAccount(accountState)
        .then((newState) => {
            accountState = newState;
            dispatch(syncAccountBeforeAutoPromotion(accountState));

            const transaction = accountState.transfers[bundleHash];

            if (transaction.persistence) {
                dispatch(removeBundleFromUnconfirmedBundleTails(bundleHash));
                throw new Error(Errors.TRANSACTION_ALREADY_CONFIRMED);
            }

            return isStillAValidTransaction(accountState.transfers[bundleHash], accountState.addresses);
        })
        .then((isValid) => {
            if (!isValid) {
                dispatch(removeBundleFromUnconfirmedBundleTails(bundleHash));

                throw new Error(Errors.BUNDLE_NO_LONGER_VALID);
            }

            return getFirstConsistentTail(accountState.unconfirmedBundleTails[bundleHash], 0);
        })
        .then((consistentTail) =>
            dispatch(
                forceTransactionPromotion(
                    accountName,
                    consistentTail,
                    accountState.unconfirmedBundleTails[bundleHash],
                    false,
                    // Auto promote does not support local proof of work
                    // Pass in null in replacement of proof of work function
                    null,
                ),
            ),
        )
        .then(() => {
            // Rearrange bundles so that the next cycle picks up a new bundle for promotion
            dispatch(
                setNewUnconfirmedBundleTails(rearrangeObjectKeys(accountState.unconfirmedBundleTails, bundleHash)),
            );

            return dispatch(promoteTransactionSuccess());
        })
        .catch((err) => {
            if (err.message.includes(Errors.ATTACH_TO_TANGLE_UNAVAILABLE)) {
                // FIXME: Temporary solution until local/remote PoW is reworked on auto-promotion
                dispatch(
                    generateAlert(
                        'error',
                        i18next.t('global:autopromotionError'),
                        i18next.t('global:autopromotionErrorExplanation'),
                    ),
                );
                dispatch(setAutoPromotion(false));
            }
            dispatch(promoteTransactionError());
        });
};
