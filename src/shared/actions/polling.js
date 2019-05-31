import each from 'lodash/each';
import filter from 'lodash/filter';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import some from 'lodash/some';
import reduce from 'lodash/reduce';
import unionBy from 'lodash/unionBy';
import { setPrice, setChartData, setMarketData } from './marketData';
import { quorum } from '../libs/iota';
import { setNodeList, setAutoPromotion } from './settings';
import { fetchRemoteNodes } from '../libs/iota/utils';
import { formatChartData, getUrlTimeFormat, getUrlNumberFormat } from '../libs/utils';
import { generateAccountInfoErrorAlert, generateAlert } from './alerts';
import { constructBundlesFromTransactions, findPromotableTail, isFundedBundle } from '../libs/iota/transfers';
import { selectedAccountStateFactory } from '../selectors/accounts';
import { nodesConfigurationFactory, getCustomNodesFromState } from '../selectors/global';
import { syncAccount } from '../libs/iota/accounts';
import { forceTransactionPromotion } from './transfers';
import { DEFAULT_NODES } from '../config';
import Errors from '../libs/errors';
import i18next from '../libs/i18next';
import { Account } from '../storage';
import { PollingActionTypes } from '../types';
import NodesManager from '../libs/iota/NodesManager';

/**
 * Dispatch when IOTA price information is about to be fetched
 *
 * @method fetchPriceRequest
 *
 * @returns {{type: {string} }}
 */
const fetchPriceRequest = () => ({
    type: PollingActionTypes.FETCH_PRICE_REQUEST,
});

/**
 * Dispatch when IOTA price information is successfully fetched
 *
 * @method fetchPriceSuccess
 *
 * @returns {{type: {string} }}
 */
const fetchPriceSuccess = () => ({
    type: PollingActionTypes.FETCH_PRICE_SUCCESS,
});

/**
 * Dispatch when an error occurs when fetching IOTA price information
 *
 * @method fetchPriceError
 *
 * @returns {{type: {string} }}
 */
const fetchPriceError = () => ({
    type: PollingActionTypes.FETCH_PRICE_ERROR,
});

/**
 * Dispatch when list of IRI nodes are about to be fetched from a remote server
 *
 * @method fetchNodeListRequest
 *
 * @returns {{type: {string} }}
 */
const fetchNodeListRequest = () => ({
    type: PollingActionTypes.FETCH_NODELIST_REQUEST,
});

/**
 * Dispatch when list of IRI nodes are successfully fetched from remote server
 *
 * @method fetchNodeListSuccess
 *
 * @returns {{type: {string} }}
 */
const fetchNodeListSuccess = () => ({
    type: PollingActionTypes.FETCH_NODELIST_SUCCESS,
});

/**
 * Dispatch if an error occurs while fetching list of IRI nodes from remote server
 *
 * @method fetchNodeListError
 *
 * @returns {{type: {string} }}
 */
const fetchNodeListError = () => ({
    type: PollingActionTypes.FETCH_NODELIST_ERROR,
});

/**
 * Dispatch when data points for IOTA time series price information are about to be fetched
 *
 * @method fetchChartDataRequest
 *
 * @returns {{type: {string} }}
 */
const fetchChartDataRequest = () => ({
    type: PollingActionTypes.FETCH_CHART_DATA_REQUEST,
});

/**
 * Dispatch when data points for IOTA time series price information are successfully fetched
 *
 * @method fetchChartDataSuccess
 *
 * @returns {{type: {string} }}
 */
const fetchChartDataSuccess = () => ({
    type: PollingActionTypes.FETCH_CHART_DATA_SUCCESS,
});

/**
 * Dispatch when an error occurs while fetching IOTA time series price information
 *
 * @method fetchChartDataError
 *
 * @returns {{type: {string} }}
 */
const fetchChartDataError = () => ({
    type: PollingActionTypes.FETCH_CHART_DATA_ERROR,
});

/**
 * Dispatch when IOTA market information is about to be fetched
 *
 * @method fetchMarketDataRequest
 *
 * @returns {{type: {string} }}
 */
const fetchMarketDataRequest = () => ({
    type: PollingActionTypes.FETCH_MARKET_DATA_REQUEST,
});

/**
 * Dispatch when IOTA market information is successfully fetched
 *
 * @method fetchMarketDataSuccess
 *
 * @returns {{type: {string} }}
 */
const fetchMarketDataSuccess = () => ({
    type: PollingActionTypes.FETCH_MARKET_DATA_SUCCESS,
});

/**
 * Dispatch if an error occurs while fetching IOTA market information
 *
 * @method fetchMarketDataError
 *
 * @returns {{type: {string} }}
 */
const fetchMarketDataError = () => ({
    type: PollingActionTypes.FETCH_MARKET_DATA_ERROR,
});

/**
 * Dispatch when accounts information is about to be fetched during polling
 *
 * @method accountInfoForAllAccountsFetchRequest
 *
 * @returns {{type: {string} }}
 */
const accountInfoForAllAccountsFetchRequest = () => ({
    type: PollingActionTypes.ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_REQUEST,
});

/**
 * Dispatch when accounts information is successfully fetched during polling
 *
 * @method accountInfoForAllAccountsFetchSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
const accountInfoForAllAccountsFetchSuccess = () => ({
    type: PollingActionTypes.ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_SUCCESS,
});

/**
 * Dispatch when an error occurs during accounts sync
 *
 * @method accountInfoForAllAccountsFetchError
 *
 * @returns {{type: {string} }}
 */
const accountInfoForAllAccountsFetchError = () => ({
    type: PollingActionTypes.ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_ERROR,
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
    type: PollingActionTypes.PROMOTE_TRANSACTION_REQUEST,
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
    type: PollingActionTypes.PROMOTE_TRANSACTION_SUCCESS,
});

/**
 * Dispatch when an error occurs during auto promotion
 *
 * @method promoteTransactionError
 *
 * @returns {{type: {string} }}
 */
const promoteTransactionError = () => ({
    type: PollingActionTypes.PROMOTE_TRANSACTION_ERROR,
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
    type: PollingActionTypes.SET_POLL_FOR,
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
    type: PollingActionTypes.SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION,
    payload,
});

/**
 * Dispatch to update account state during accounts info polling operation
 *
 * @method syncAccountWhilePolling
 *
 * @param {object} payload
 * @returns {{type: {string}, payload: {object} }}
 */
export const syncAccountWhilePolling = (payload) => ({
    type: PollingActionTypes.SYNC_ACCOUNT_WHILE_POLLING,
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
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=MIOTA&tsyms=USD')
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
        fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=MIOTA&tsyms=USD,EUR,BTC,ETH')
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
 * @returns {function}
 */
export const fetchNodeList = () => {
    return (dispatch, getState) => {
        dispatch(fetchNodeListRequest());
        let nodes = unionBy(
            DEFAULT_NODES,
            getState().settings.nodes,
            'url'
        );
        fetchRemoteNodes()
            .then((remoteNodes) => {
                if (remoteNodes.length) {
                    nodes = unionBy(
                        nodes,
                        map(remoteNodes, (node) => ({
                            url: node.node,
                            pow: node.pow,
                            token: '',
                        })),
                        'url',
                    );
                }
                // Set quorum nodes
                quorum.setNodes(
                    unionBy(
                        getCustomNodesFromState(getState()),
                        getState().settings.autoNodeList && nodes,
                        'url',
                    ),
                );
                dispatch(setNodeList(nodes));
                dispatch(fetchNodeListSuccess());
            })
            .catch(() => {
                dispatch(setNodeList(nodes));
                dispatch(fetchNodeListError());
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
            )}?fsym=MIOTA&tsym=${currencyTimeFrameArrayItem.currency}&limit=${getUrlNumberFormat(
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
                    const formattedData = formatChartData(resultItem, currentTimeFrame);

                    if (actualCurrency !== currentCurrency) {
                        actualCurrency = currentCurrency;
                    }
                    chartData[currentCurrency][currentTimeFrame] = formattedData;
                });

                dispatch(setChartData(chartData));
                dispatch(fetchChartDataSuccess());
            })
            .catch(() => dispatch(fetchChartDataError()));
    };
};

/**
 * Accepts account names and syncs local account state with ledger's.
 *
 * @method getAccountInfoForAllAccounts
 *
 * @param {array} accountNames
 * @param {function} notificationFn - New transaction callback function
 * @param {boolean} [quorum]
 *
 * @returns {function} dispatch
 **/
export const getAccountInfoForAllAccounts = (accountNames, notificationFn, quorum = true) => {
    return (dispatch, getState) => {
        dispatch(accountInfoForAllAccountsFetchRequest());

        const settings = getState().settings;

        return reduce(
            accountNames,
            (promise, accountName) => {
                return promise.then(() => {
                    const existingAccountState = selectedAccountStateFactory(accountName)(getState());

                    return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
                        .withRetries()(syncAccount)(existingAccountState, undefined, notificationFn, settings)
                        .then((result) => {
                            dispatch(syncAccountWhilePolling(result));
                        });
                });
            },
            Promise.resolve(),
        )
            .then(() => {
                dispatch(accountInfoForAllAccountsFetchSuccess());
            })
            .catch((err) => {
                dispatch(accountInfoForAllAccountsFetchError());
                dispatch(generateAccountInfoErrorAlert(err));
            });
    };
};

/**
 * Accepts a bundle hash and all tail transaction objects relevant to the bundle.
 * Checks if a bundle is still valid.
 * For cases where a bundle is invalid, it would remove the transaction for promotion.
 * For cases where a bundle is valid, find first consistent tail and promote it.
 *
 * @method promoteTransfer
 *
 * @param {string} bundleHash
 * @param {string} accountName
 * @param {boolean} [withQuorum]
 *
 * @returns {function} - dispatch
 **/
export const promoteTransfer = (bundleHash, accountName, quorum = true) => (dispatch, getState) => {
    dispatch(promoteTransactionRequest(bundleHash));

    let accountState = selectedAccountStateFactory(accountName)(getState());

    const getTailTransactionsForThisBundleHash = (transactions) =>
        filter(transactions, (transaction) => transaction.bundle === bundleHash && transaction.currentIndex === 0);

    const executePrePromotionChecks = (settings, withQuorum) => () => {
        return syncAccount(settings, withQuorum)(accountState)
            .then((newState) => {
                accountState = newState;

                // Update persistent storage
                Account.update(accountName, accountState);

                // Update redux storage
                dispatch(syncAccountBeforeAutoPromotion(accountState));

                const transactionsForThisBundleHash = filter(
                    accountState.transactions,
                    (transaction) => transaction.bundle === bundleHash,
                );

                if (some(transactionsForThisBundleHash, (transaction) => transaction.persistence === true)) {
                    throw new Error(Errors.TRANSACTION_ALREADY_CONFIRMED);
                }

                const bundles = constructBundlesFromTransactions(accountState.transactions);

                if (isEmpty(bundles)) {
                    throw new Error(Errors.NO_VALID_BUNDLES_CONSTRUCTED);
                }

                return isFundedBundle(settings, withQuorum)(head(bundles));
            })
            .then((isFunded) => {
                if (!isFunded) {
                    throw new Error(Errors.BUNDLE_NO_LONGER_FUNDED);
                }

                return findPromotableTail()(getTailTransactionsForThisBundleHash(accountState.transactions), 0);
            });
    };

    return new NodesManager(
        nodesConfigurationFactory({
            quorum,
            useOnlyPowNodes: true,
        })(getState()),
    )
        .withRetries()(executePrePromotionChecks)()
        .then((result) => {
            return dispatch(
                forceTransactionPromotion(
                    accountName,
                    result,
                    getTailTransactionsForThisBundleHash(accountState.transactions),
                    false,
                    // Auto promote does not support local proof of work
                    // Pass in null in replacement of seedStore object
                    null,
                ),
            );
        })
        .then(() => dispatch(promoteTransactionSuccess()))
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
