import assign from 'lodash/assign';
import get from 'lodash/get';
import head from 'lodash/head';
import clone from 'lodash/clone';
import concat from 'lodash/concat';
import merge from 'lodash/merge';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import filter from 'lodash/filter';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import some from 'lodash/some';
import includes from 'lodash/includes';
import { getUrlTimeFormat, getUrlNumberFormat, setPrice, setChartData, setMarketData } from './marketData';
import { generateAlert, generateAccountInfoErrorAlert } from './alerts';
import {
    setNewUnconfirmedBundleTails,
    updateUnconfirmedBundleTails,
    removeBundleFromUnconfirmedBundleTails,
} from './account';
import { getFirstConsistentTail, isWithinAnHour } from '../libs/promoter';
import {
    getSelectedAccount,
    getExistingUnspentAddressesHashes,
    getPendingTxTailsHashesForSelectedAccount,
} from '../selectors/account';
import { iota } from '../libs/iota';
import {
    getUnspentAddresses,
    mergeLatestTransfersInOld,
    formatTransfers,
    markTransfersConfirmed,
    getPendingTxTailsHahses,
} from '../libs/accountUtils';
import { rearrangeObjectKeys } from '../libs/util';

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

const accountInfoFetchSuccess = payload => ({
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
    console.log('GET TRANSACTION OBJECTS', addresses);

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
    console.log('GET TX OBJECTS', hashes);
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
    console.log('GET INCLUSION WITH HAHSES', hashes);
    return new Promise((resolve, reject) => {
        iota.api.getLatestInclusion(hashes, (err, states) => {
            if (err) {
                reject(err);
            } else {
                resolve({ states, hashes });
            }
        });
    });
};

const getBundleWithPersistence = (tailTxHash, persistence) => {
    console.log('UMAIRS');
    console.log('TAIL TX HASHES', tailTxHash);
    return new Promise((resolve, reject) => {
        iota.api.getBundle(tailTxHash, (err, bundle) => {
            if (err) {
                reject(err);
            } else {
                console.log('WHAT', bundle);
                resolve(map(bundle, tx => assign({}, tx, { persistence })));
            }
        });
    });
};

const getBundlesWithPersistence = (inclusionStates, hashes) => {
    console.log('SARFRAZ', inclusionStates);
    console.log('SARFRAZ', hashes);
    return reduce(
        hashes,
        (promise, hash, idx) => {
            return promise
                .then(result => {
                    return getBundleWithPersistence(hash, inclusionStates[idx]).then(bundle => {
                        result.push(bundle);

                        return result;
                    });
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

        const pendingTxTailsHashes = getPendingTxTailsHashesForSelectedAccount(
            accountName,
            getState().account.pendingTxTailsHashes,
        );

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
            .then(({ states, hashes }) => getBundlesWithPersistence(states, hashes))
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
            .then(({ states, hashes }) => getConfirmedTxTailsHashes(states, hashes))
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

export const promoteTransfer = (bundle, tails) => (dispatch, getState) => {
    dispatch(promoteTransactionRequest());

    // Create a copy so you can mutate easily
    let consistentTails = map(tails, clone);
    let allTails = map(tails, clone);

    const alertArguments = (title, message, status = 'success') => [status, title, message];

    const promote = tail => {
        const spamTransfer = [{ address: 'U'.repeat(81), value: 0, message: '', tag: '' }];

        return iota.api.promoteTransaction(tail.hash, 3, 14, spamTransfer, { interrupt: false, delay: 0 }, err => {
            if (err) {
                if (err.message.indexOf('Inconsistent subtangle') > -1) {
                    consistentTails = filter(consistentTails, t => t.hash !== tail.hash);

                    return getFirstConsistentTail(consistentTails, 0).then(consistentTail => {
                        if (!consistentTail) {
                            return dispatch(promoteTransactionError());
                        }

                        return promote(consistentTail);
                    });
                }

                return dispatch(promoteTransactionError());
            }

            dispatch(
                generateAlert(...alertArguments('Promoting transfer', `Promoting transaction with hash ${tail.hash}`)),
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

        const tailsFromLatestTransactionObjects = filter(txs, t => {
            const attachmentTimestamp = get(t, 'attachmentTimestamp');
            const hasMadeReattachmentWithinAnHour = isWithinAnHour(attachmentTimestamp);

            return !t.persistence && t.currentIndex === 0 && t.value > 0 && hasMadeReattachmentWithinAnHour;
        });

        if (size(tailsFromLatestTransactionObjects) > size(allTails)) {
            dispatch(updateUnconfirmedBundleTails({ [bundle]: tailsFromLatestTransactionObjects }));

            // Assign updated tails to the local copy
            allTails = tailsFromLatestTransactionObjects;
        }

        return iota.api.getLatestInclusion(map(allTails, t => t.hash), (err, states) => {
            if (err) {
                return dispatch(promoteTransactionError());
            }

            if (some(states, state => state)) {
                dispatch(removeBundleFromUnconfirmedBundleTails(bundle));

                return dispatch(promoteTransactionSuccess()); // In case the transaction is approved, no need to go further and promote it.
            }

            return getFirstConsistentTail(consistentTails, 0).then(consistentTail => {
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
                                    'Autoreattaching to Tangle',
                                    `Reattaching transaction with hash ${txHash}`,
                                ),
                            ),
                        );

                        const newTail = filter(newTxs, t => t.currentIndex === 0);
                        // Update local copy for all tails
                        allTails = concat([], newTail, allTails);

                        // Probably unnecessary at this point
                        consistentTails = concat([], newTail, consistentTails);
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
