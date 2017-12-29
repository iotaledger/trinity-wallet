import assign from 'lodash/assign';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import filter from 'lodash/filter';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import includes from 'lodash/includes';
import { getUrlTimeFormat, getUrlNumberFormat, setPrice, setChartData, setMarketData } from './marketData';
import { setBalance } from './account';
import { generateAccountInfoErrorAlert } from './alerts';
import { getSelectedAccount, getExistingUnspentAddressesHashes } from '../selectors/account';
import { iota } from '../libs/iota';
import {
    getUnspentAddresses,
    mergeLatestTransfersInOld,
    formatTransfers,
    markTransfersConfirmed,
} from '../libs/accountUtils';

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

const accountInfoFetchSuccess = payload => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS,
    payload,
});

const accountInfoFetchError = () => ({
    type: ActionTypes.ACCOUNT_INFO_FETCH_ERROR,
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

                        // Dirty hack
                        if (i === currencies.length - 1 && j === timeframes.length - 1) {
                            dispatch(fetchChartDataSuccess());
                        }
                    });
            });
        });
    };
};

const getTotalBalance = (addresses, threshold = 1) => {
    return new Promise((resolve, reject) => {
        iota.api.getBalances(addresses, threshold, (err, data) => {
            if (err) {
                reject(err);
            } else {
                const newBalances = map(data.balances, Number);
                const totalBalance = reduce(
                    newBalances,
                    (res, val) => {
                        res = res + val;
                        return res;
                    },
                    0,
                );

                resolve(totalBalance);
            }
        });
    });
};

const getLatestAddresses = (seed, index) => {
    return new Promise((resolve, reject) => {
        iota.api.getInputs(seed, { start: index }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                const addresses = reduce(
                    data.inputs,
                    (obj, x) => {
                        obj[x.address] = { balance: x.balance, spent: false };
                        return obj;
                    },
                    {},
                );

                resolve(addresses);
            }
        });
    });
};

const getTransactionHashes = addresses => {
    return new Promise((resolve, reject) => {
        iota.api.findTransactions({ addresses }, (err, hashes) => {
            if (err) {
                reject(err);
            } else {
                resolve(hashes);
            }
        });
    });
};

const getTransactionsObjects = hashes => {
    return new Promise((resolve, reject) => {
        iota.api.getTransactionsObjects(hashes, (err, txs) => {
            if (err) {
                reject(err);
            } else {
                resolve(txs);
            }
        });
    });
};

const getInclusionWithHashes = hashes => {
    return new Promise((resolve, reject) => {
        iota.api.getLatestInclusion(hashes, (err, states) => {
            if (err) {
                reject(err);
            } else {
                resolve(states, hashes);
            }
        });
    });
};

const getBundleWithPersistence = (tailTxHash, persistence) => {
    return new Promise((resolve, reject) => {
        iota.api.getBundles(tailTxHash, (err, bundle) => {
            if (err) {
                reject(err);
            } else {
                resolve(assign({}, bundle, { persistence }));
            }
        });
    });
};

const getBundlesWithPersistence = (inclusionStates, hashes) => {
    return reduce(
        hashes,
        (promise, hash, idx) => {
            return promise
                .then(result => {
                    return getBundleWithPersistence(hash, inclusionStates[idx]).then(bundle => result.concat(bundle));
                })
                .catch(console.error);
        },
        Promise.resolve([]),
    );
};

const getConfirmedTxTailsHashes = (states, hashes) => {
    const confirmedHashes = filter(hashes, (hash, idx) => states[idx]);

    return new Promise((resolve, reject) => resolve(confirmedHashes));
};

export const getAccountInfo = (seed, accountName) => {
    return (dispatch, getState) => {
        dispatch(accountInfoFetchRequest());

        const selectedAccount = getSelectedAccount(accountName, getState().account.accountInfo);
        const addresses = Object.keys(selectedAccount.addresses);

        const existingHashes = getExistingUnspentAddressesHashes(
            accountName,
            getState().account.unspentAddressesHashes,
        );

        const pendingTxTailsHashes = getState().account.pendingTxTailsHashes;

        let payload = {
            accountName,
            balance: selectedAccount.balance,
            addresses: selectedAccount.addresses,
            unspentAddressesHashes: existingHashes,
            pendingTxTailsHashes,
            transfers: selectedAccount.transfers,
        };

        return getTotalBalance(addresses)
            .then(balance => {
                console.log('balance', balance);
                payload = assign({}, payload, { balance });

                const index = addresses.length ? addresses.length - 1 : 0;

                return getLatestAddresses(seed, index);
            })
            .then(addressData => {
                const unspentAddresses = getUnspentAddresses(selectedAccount.addresses);

                console.log('Unspent addresses', unspentAddresses);
                if (isEmpty(unspentAddresses)) {
                    payload = assign({}, payload, { addresses: addressData });

                    throw new Error('intentionally break chain');
                }

                return getTransactionHashes(unspentAddresses);
            })
            .then(latestHashes => {
                console.log('Latest hashes', latestHashes);

                const hasNewHashes = size(latestHashes) > size(existingHashes);

                if (hasNewHashes) {
                    const diff = difference(existingHashes, latestHashes);

                    return getTransactionsObjects(diff);
                }

                // throw new Error('intentionally break chain');
                return getTransactionsObjects(latestHashes);
            })
            .then(txs => {
                console.log('New txs', txs);

                const tailTxs = filter(txs, t => t.currentIndex === 0);

                return getInclusionWithHashes(map(tailTxs, t => t.hash));
            })
            .then(getBundlesWithPersistence)
            .then(bundles => {
                console.log('Bundles', bundles);

                const updatedTransfers = mergeLatestTransfersInOld(selectedAccount.transfers, bundles);
                const updatedTransfersWithFormatting = formatTransfers(updatedTransfers, addresses);

                payload = assign({}, payload, { transfers: updatedTransfersWithFormatting });

                if (isEmpty(pendingTxTailsHashes)) {
                    throw new Error('intentionally break chain');
                }

                return getInclusionWithHashes(pendingTxTailsHashes);
            })
            .then(getConfirmedTxTailsHashes)
            .then(confirmedHashes => {
                if (isEmpty(confirmedHashes)) {
                    throw new Error('intentionally break chain');
                }

                payload = assign({}, payload, {
                    transfers: markTransfersConfirmed(payload.transfers, confirmedHashes),
                    pendingTxTailsHashes: filter(payload.pendingTxTailsHashes, tx => !includes(confirmedHashes, tx)),
                });

                return dispatch(accountInfoFetchSuccess(payload));
            })
            .catch(err => {
                console.log('Err', err);
                console.log('ERRR', err.message);
                if (err && err.message === 'intentionally break chain') {
                    dispatch(accountInfoFetchSuccess(payload));
                } else {
                    dispatch(accountInfoFetchError());
                    dispatch(generateAccountInfoErrorAlert());
                }
            });
    };
};
