import get from 'lodash/get';
import head from 'lodash/head';
import clone from 'lodash/clone';
import concat from 'lodash/concat';
import merge from 'lodash/merge';
import map from 'lodash/map';
import filter from 'lodash/filter';
import size from 'lodash/size';
import some from 'lodash/some';
import { setPrice, setChartData, setMarketData } from './marketData';
import { formatChartData, getUrlTimeFormat, getUrlNumberFormat } from '../libs/marketData';
import { generateAlert, generateAccountInfoErrorAlert } from './alerts';
import {
    setNewUnconfirmedBundleTails,
    updateUnconfirmedBundleTails,
    removeBundleFromUnconfirmedBundleTails,
    updateTransfers,
} from './account';
import { getFirstConsistentTail } from '../libs/iota/transfers';
import { getSelectedAccount, getExistingUnspentAddressesHashes } from '../selectors/account';
import { iota } from '../libs/iota';
import { syncAccount } from '../libs/iota/accounts';
import { rearrangeObjectKeys } from '../libs/util';
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
                        (response) => response.json(),
                        () => {
                            if (i === currencies.length - 1 && j === timeframes.length - 1) {
                                dispatch(fetchChartDataError());
                            }
                        },
                    )
                    .then((json) => {
                        if (json) {
                            const data = formatChartData(json, currency, timeframe);
                            dispatch(setChartData(data, currency, timeframe));
                        }

                        // Dirty hack
                        if (i === currencies.length - 1 && j === timeframes.length - 1) {
                            dispatch(fetchChartDataSuccess());
                        }
                    });
            });
        });
    };
};

/**
 *   Poll for updated account information.
 *   - Starts by checking if there are pending transaction hashes. In case there are it would grab persistence on those.
 *   - Checks for latest addresses.
 *   - Grabs balance on latest addresses
 *   - Grabs transaction hashes on all unspent addresses
 *   - Checks if there are new transaction hashes by comparing it with a local copy of transaction hashes.
 *     In case there are new hashes, constructs the bundle and dispatch with latest account information
 *   Stops at the point where there are no transaction hashes associated with last (total defaults to --> 10) addresses
 *
 *   @method getAccountInfo
 *   @param {string} seed
 *   @param {string} accountName
 *   @returns {function} dispatch
 **/

export const getAccountInfo = (seed, accountName) => {
    return (dispatch, getState) => {
        dispatch(accountInfoFetchRequest());

        const selectedAccount = getSelectedAccount(accountName, getState().account.accountInfo);
        const existingHashes = getExistingUnspentAddressesHashes(
            accountName,
            getState().account.unspentAddressesHashes,
        );

        const unconfirmedBundleTails = getState().account.unconfirmedBundleTails;

        const existingAccountData = {
            accountName,
            balance: selectedAccount.balance,
            addresses: selectedAccount.addresses,
            unspentAddressesHashes: existingHashes,
            transfers: selectedAccount.transfers,
            unconfirmedBundleTails,
        };

        return syncAccount(seed, existingAccountData)
            .then((newAccountData) => dispatch(accountInfoFetchSuccess(newAccountData)))
            .catch((err) => {
                dispatch(accountInfoFetchError());
                dispatch(generateAccountInfoErrorAlert(err));
            });
    };
};

export const promoteTransfer = (bundle, tails) => (dispatch, getState) => {
    dispatch(promoteTransactionRequest());

    // Create a copy so you can mutate easily
    let consistentTails = map(tails, clone);
    let allTails = map(tails, clone);
    const txAccount = get(tails, '[0].account');

    const alertArguments = (title, message, status = 'success') => [status, title, message];

    const promote = (tail) => {
        const spamTransfer = [{ address: 'U'.repeat(81), value: 0, message: '', tag: '' }];

        return iota.api.promoteTransaction(tail.hash, 3, 14, spamTransfer, { interrupt: false, delay: 0 }, (err) => {
            if (err) {
                if (err.message.indexOf('Inconsistent subtangle') > -1) {
                    consistentTails = filter(consistentTails, (t) => t.hash !== tail.hash);

                    return getFirstConsistentTail(consistentTails, 0).then((consistentTail) => {
                        if (!consistentTail) {
                            return dispatch(promoteTransactionError());
                        }

                        return promote(consistentTail);
                    });
                }

                return dispatch(promoteTransactionError());
            }

            dispatch(
                generateAlert(
                    ...alertArguments(
                        i18next.t('global:autopromoting'),
                        i18next.t('global:autopromotingExplanation', { hash: tail.hash }),
                    ),
                ),
            );

            const existingBundlesInStore = getState().account.unconfirmedBundleTails;
            const updatedBundles = merge({}, existingBundlesInStore, { [bundle]: allTails });

            dispatch(setNewUnconfirmedBundleTails(rearrangeObjectKeys(updatedBundles, bundle)));
            return dispatch(promoteTransactionSuccess());
        });
    };

    return iota.api.findTransactionObjects({ bundles: [bundle] }, (err, txs) => {
        if (err) {
            return dispatch(promoteTransactionError());
        }

        const tailsFromLatestTransactionObjects = filter(txs, (t) => {
            // TODO: Validate transfers
            return !t.persistence && t.currentIndex === 0 && t.value > 0;
        });

        if (size(tailsFromLatestTransactionObjects) > size(allTails)) {
            dispatch(
                updateUnconfirmedBundleTails({
                    [bundle]: map(tailsFromLatestTransactionObjects, (t) => ({ ...t, account: txAccount })),
                }),
            );

            // Assign updated tails to the local copy
            allTails = tailsFromLatestTransactionObjects;
        }

        return iota.api.getLatestInclusion(map(allTails, (t) => t.hash), (err, states) => {
            if (err) {
                return dispatch(promoteTransactionError());
            }

            if (some(states, (state) => state)) {
                dispatch(removeBundleFromUnconfirmedBundleTails(bundle));

                return dispatch(promoteTransactionSuccess()); // In case the transaction is approved, no need to go further and promote it.
            }

            return getFirstConsistentTail(consistentTails, 0).then((consistentTail) => {
                if (!consistentTail) {
                    // Grab hash from the top tail to replay
                    const topTx = head(allTails);
                    const txHash = get(topTx, 'hash');

                    return iota.api.replayBundle(txHash, 3, 14, (err, newTxs) => {
                        if (err) {
                            return dispatch(promoteTransactionError());
                        }

                        dispatch(
                            generateAlert(
                                ...alertArguments(
                                    i18next.t('global:autoreattaching'),
                                    i18next.t('global:autoreattachingExplanation', { hash: txHash }),
                                ),
                            ),
                        );

                        const newTxsWithAccount = map(newTxs, (t) => ({ ...t, account: txAccount }));
                        const newTail = filter(newTxsWithAccount, (t) => t.currentIndex === 0);
                        // Update local copy for all tails
                        allTails = concat([], newTail, allTails);

                        // Probably unnecessary at this point
                        consistentTails = concat([], newTail, consistentTails);

                        const selectedAccountInfo = getSelectedAccount(txAccount, getState().account.accountInfo);
                        const existingTransfers = selectedAccountInfo.transfers;

                        // Prepare/Transform new transfer bundle
                        const newTransferBundleWithPersistenceAndTransferValue = map(newTxs, (bundle) => ({
                            ...bundle,
                            ...{ transferValue: bundle.value, persistence: false },
                        }));

                        // Append new transfer to existing transfers
                        const updatedTransfers = [
                            ...[newTransferBundleWithPersistenceAndTransferValue],
                            ...existingTransfers,
                        ];

                        dispatch(updateTransfers(txAccount, updatedTransfers));

                        const existingBundlesInStore = getState().account.unconfirmedBundleTails;

                        const updateBundles = merge({}, existingBundlesInStore, { [bundle]: allTails });
                        dispatch(setNewUnconfirmedBundleTails(rearrangeObjectKeys(updateBundles, bundle)));

                        return dispatch(promoteTransactionError());
                    });
                }

                return promote(consistentTail);
            });
        });
    });
};
