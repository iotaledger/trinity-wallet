import get from 'lodash/get';
import has from 'lodash/has';
import includes from 'lodash/includes';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import IOTA from 'iota.lib.js';
import { composeAPI } from '@iota/core';
import { iota, quorum } from './index';
import Errors from '../errors';
import {
    DEFAULT_BALANCES_THRESHOLD,
    DEFAULT_DEPTH,
    DEFAULT_MIN_WEIGHT_MAGNITUDE,
    DEFAULT_NODE_REQUEST_TIMEOUT,
    GET_NODE_INFO_REQUEST_TIMEOUT,
    WERE_ADDRESSES_SPENT_FROM_REQUEST_TIMEOUT,
    GET_BALANCES_REQUEST_TIMEOUT,
    ATTACH_TO_TANGLE_REQUEST_TIMEOUT,
    GET_TRANSACTIONS_TO_APPROVE_REQUEST_TIMEOUT,
    IRI_API_VERSION,
    MINIMUM_ALLOWED_HORNET_VERSION,
} from '../../config';
import {
    sortTransactionTrytesArray,
    constructBundleFromAttachedTrytes,
    isBundle,
    isBundleTraversable,
} from './transfers';
import { withRequestTimeoutsHandler } from './utils';

/**
 * Returns timeouts for specific quorum requests
 *
 * @method getApiTimeout
 * @param {string} method
 * @param {array} [payload]

 * @returns {number}
 */
/* eslint-disable no-unused-vars */
const getApiTimeout = (method, payload) => {
    /* eslint-enable no-unused-vars */
    switch (method) {
        case 'wereAddressesSpentFrom':
            return WERE_ADDRESSES_SPENT_FROM_REQUEST_TIMEOUT;
        case 'getBalances':
            return GET_BALANCES_REQUEST_TIMEOUT;
        case 'getNodeInfo':
            return GET_NODE_INFO_REQUEST_TIMEOUT;
        case 'attachToTangle':
            return ATTACH_TO_TANGLE_REQUEST_TIMEOUT;
        case 'getTransactionsToApprove':
            return GET_TRANSACTIONS_TO_APPROVE_REQUEST_TIMEOUT;
        default:
            return DEFAULT_NODE_REQUEST_TIMEOUT;
    }
};

/**
 * Returns a new IOTA instance if provider is passed, otherwise returns the global instance
 *
 * @method getIotaInstance
 * @param {object} [settings]
 *
 * @returns {object} IOTA instance
 */
const getIotaInstance = (settings, requestTimeout = DEFAULT_NODE_REQUEST_TIMEOUT) => {
    if (settings) {
        const { url, username, password } = settings;

        const instance = new IOTA({ provider: url, password, username });
        instance.api.setApiTimeout(requestTimeout);

        return instance;
    }

    iota.api.setApiTimeout(requestTimeout);

    return iota;
};

/**
 * Promisified version of iota.api.getBalances
 *
 * @method getBalancesAsync
 * @param {object} [settings]
 * @param {boolean} [withQuorum]
 *
 * @returns {function(array, number): Promise<object>}
 */
const getBalancesAsync = (settings, withQuorum = true) => (addresses, threshold = DEFAULT_BALANCES_THRESHOLD) =>
    withQuorum
        ? quorum.getBalances(addresses, threshold)
        : new Promise((resolve, reject) => {
              getIotaInstance(settings, getApiTimeout('getBalances')).api.getBalances(
                  addresses,
                  threshold,
                  (err, balances) => {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(balances);
                      }
                  },
              );
          });

/**
 * Promisified version of iota.api.getNodeInfo
 *
 * @method getNodeInfoAsync
 * @param {object} [settings]
 *
 * @returns {function(): Promise<object>}
 */
const getNodeInfoAsync = (settings) => () =>
    new Promise((resolve, reject) => {
        getIotaInstance(settings, getApiTimeout('getNodeInfo')).api.getNodeInfo((err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });

/**
 * Promisified version of iota.api.getTransactionsObjects
 *
 * @method getTransactionsObjectsAsync
 * @param {object} [settings]
 *
 * @returns {function(array): Promise<any>}
 */
const getTransactionsObjectsAsync = (settings) => (hashes) =>
    new Promise((resolve, reject) => {
        getIotaInstance(settings).api.getTransactionsObjects(hashes, (err, txs) => {
            if (err) {
                reject(err);
            } else {
                resolve(txs);
            }
        });
    });

/**
 * Promisified version of iota.api.findTransactionObjects
 *
 * @method findTransactionObjectsAsync
 * @param {object} [settings]
 *
 * @returns {function(object): Promise<any>}
 */
const findTransactionObjectsAsync = (settings) => (args) =>
    findTransactionsAsync(settings)(args).then((hashes) => getTransactionsObjectsAsync(settings)(hashes));

/**
 * Promisified version of iota.api.findTransactions
 *
 * @method findTransactionsAsync
 * @param {object} [settings]
 *
 * @returns {function(object): Promise<array>}
 */
const findTransactionsAsync = (settings) => (args) =>
    new Promise((resolve, reject) => {
        getIotaInstance(settings).api.findTransactions(args, (err, txs) => {
            if (err) {
                reject(err);
            } else {
                resolve(txs);
            }
        });
    });

/**
 * Promisified version of iota.api.getLatestInclusion
 *
 * @method getLatestInclusionAsync
 * @param {object} [settings]
 * @param {boolean} [withQuorum]
 *
 * @returns {function(array): Promise<array>}
 */
const getLatestInclusionAsync = (settings, withQuorum = false) => (hashes) =>
    withQuorum
        ? quorum.getLatestInclusion(hashes)
        : new Promise((resolve, reject) => {
              getIotaInstance(settings, getApiTimeout('getInclusionStates')).api.getLatestInclusion(
                  hashes,
                  (err, states) => {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(states);
                      }
                  },
              );
          });

/**
 * Extended version of iota.api.promoteTransaction with an option to perform PoW locally
 *
 * @method promoteTransactionAsync
 * @param {object} [settings]
 * @param {object} seedStore
 *
 * @returns {function(string, number, number, object): Promise<string>}
 */
const promoteTransactionAsync = (settings, seedStore) => (
    hash,
    depth = DEFAULT_DEPTH,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
    transfer = { address: 'U'.repeat(81), value: 0, message: '', tag: '' },
) => {
    const cached = {
        trytes: [],
    };

    return prepareTransfersAsync(settings)(transfer.address, [transfer])
        .then((trytes) => {
            cached.trytes = trytes;

            return getTransactionsToApproveAsync(settings)(
                {
                    reference: hash,
                    adjustDepth: true,
                },
                depth,
            );
        })
        .then(({ trunkTransaction, branchTransaction }) =>
            attachToTangleAsync(settings, seedStore)(
                trunkTransaction,
                branchTransaction,
                cached.trytes,
                minWeightMagnitude,
            ),
        )
        .then(({ trytes }) => {
            cached.trytes = trytes;

            return storeAndBroadcastAsync(settings)(cached.trytes);
        })
        .then(() => hash);
};

/**
 * Promisified version of iota.api.replayBundle
 *
 * @method replayLocallyStoredBundleAsync
 * @param {object} [settings]
 * @param {object} seedStore
 *
 * @returns {function(string, function, number, number): Promise<array>}
 */
const replayLocallyStoredBundleAsync = (settings, seedStore) => (
    bundle,
    depth = DEFAULT_DEPTH,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const cached = {
        trytes: [],
        transactionObjects: [],
    };

    const convertToTrytes = (tx) => iota.utils.transactionTrytes(tx);
    cached.trytes = map(bundle, convertToTrytes);
    cached.transactionObjects = bundle;

    return getTransactionsToApproveAsync(settings)({}, depth)
        .then(({ trunkTransaction, branchTransaction }) =>
            attachToTangleAsync(settings, seedStore)(
                trunkTransaction,
                branchTransaction,
                cached.trytes,
                minWeightMagnitude,
            ),
        )
        .then(({ trytes, transactionObjects }) => {
            cached.trytes = trytes;
            cached.transactionObjects = transactionObjects;

            return storeAndBroadcastAsync(settings)(cached.trytes);
        })
        .then(() => cached.transactionObjects);
};

/**
 * Promisified version of iota.api.replayBundle
 *
 * @method replayBundleAsync
 * @param {object} [settings]
 * @param {object} seedStore
 *
 * @returns {function(string, function, number, number): Promise<array>}
 */
const replayBundleAsync = (settings, seedStore) => (
    hash,
    depth = DEFAULT_DEPTH,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const cached = {
        trytes: [],
        transactionObjects: [],
    };

    return getBundleAsync(settings)(hash)
        .then((bundle) => {
            const convertToTrytes = (tx) => iota.utils.transactionTrytes(tx);
            cached.trytes = map(bundle, convertToTrytes);
            cached.transactionObjects = bundle;

            return getTransactionsToApproveAsync(settings)({}, depth);
        })
        .then(({ trunkTransaction, branchTransaction }) =>
            attachToTangleAsync(settings, seedStore)(
                trunkTransaction,
                branchTransaction,
                cached.trytes,
                minWeightMagnitude,
            ),
        )
        .then(({ trytes, transactionObjects }) => {
            cached.trytes = trytes;
            cached.transactionObjects = transactionObjects;

            return storeAndBroadcastAsync(settings)(cached.trytes);
        })
        .then(() => cached.transactionObjects);
};

/**
 * Promisified version of iota.api.getBundle
 *
 * @method getBundleAsync
 * @param {object} [settings]
 *
 * @returns {function(string): Promise<array>}
 */
const getBundleAsync = (settings) => (tailTransactionHash) =>
    new Promise((resolve, reject) => {
        getIotaInstance(settings).api.getBundle(tailTransactionHash, (err, bundle) => {
            if (err) {
                reject(err);
            } else {
                resolve(bundle);
            }
        });
    });

/**
 * Promisified version of iota.api.wereAddressesSpentFrom
 *
 * @method wereAddressesSpentFromAsync
 * @param {object} [settings]
 * @param {boolean} [withQuorum]
 *
 * @returns {function(array): Promise<array>}
 */
const wereAddressesSpentFromAsync = (settings, withQuorum = true) => (addresses) =>
    withQuorum
        ? quorum.wereAddressesSpentFrom(addresses)
        : new Promise((resolve, reject) => {
              getIotaInstance(settings, getApiTimeout('wereAddressesSpentFrom')).api.wereAddressesSpentFrom(
                  addresses,
                  (err, wereSpent) => {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(wereSpent);
                      }
                  },
              );
          });

/**
 * Promisified version of iota.api.sendTransfer
 *
 * @method sendTransferAsync
 * @param {object} [settings]
 *
 * @returns {function(object, array, function, *, number, number): Promise<array>}
 */
const sendTransferAsync = (settings) => (
    seedStore,
    transfers,
    options = null,
    depth = DEFAULT_DEPTH,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const cached = {
        trytes: [],
        transactionObjects: [],
    };

    return seedStore
        .prepareTransfers(settings)(transfers, options)
        .then((trytes) => {
            cached.trytes = trytes;

            return getTransactionsToApproveAsync(settings)({}, depth);
        })
        .then(({ trunkTransaction, branchTransaction }) =>
            attachToTangleAsync(settings, seedStore)(
                trunkTransaction,
                branchTransaction,
                cached.trytes,
                minWeightMagnitude,
            ),
        )
        .then(({ trytes, transactionObjects }) => {
            cached.trytes = trytes;
            cached.transactionObjects = transactionObjects;

            return storeAndBroadcastAsync(settings)(cached.trytes);
        })
        .then(() => cached.transactionObjects);
};

/**
 * Promisified version of iota.api.getTransactionsToApprove
 *
 * @method getTransactionsToApproveAsync
 * @param {object} [settings]
 *
 * @returns {function(*, number): Promise<object>}
 */
const getTransactionsToApproveAsync = (settings) => (reference = {}, depth = DEFAULT_DEPTH) =>
    new Promise((resolve, reject) => {
        getIotaInstance(settings, getApiTimeout('getTransactionsToApprove')).api.getTransactionsToApprove(
            depth,
            reference,
            (err, transactionsToApprove) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(transactionsToApprove);
                }
            },
        );
    });

/**
 * Promisified version of iota.api.prepareTransfers
 *
 * @method prepareTransfersAsync
 * @param {object} [settings]
 *
 * @returns {function(string, array, *): Promise<any>}
 */
export const prepareTransfersAsync = (settings) => (seed, transfers, options = null, signatureFn = null) => {
    // https://github.com/iotaledger/iota.lib.js/blob/e60c728c836cb37f3d6fb8b0eff522d08b745caa/lib/api/api.js#L1058
    let args = [seed, transfers];

    if (options) {
        args = [...args, { ...options, nativeGenerateSignatureFunction: signatureFn }];
    }

    const api = composeAPI(settings || { ...iota });

    return api.prepareTransfers(...args);
};

/**
 * Promisified version of iota.api.storeAndBroadcast
 *
 * @method storeAndBroadcastAsync
 * @param {object} [settings]
 *
 * @returns {function(array): Promise<any>}
 */
const storeAndBroadcastAsync = (settings) => (trytes) =>
    new Promise((resolve, reject) => {
        getIotaInstance(settings).api.storeAndBroadcast(trytes, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

/**
 * Checks if attachToTangle is available on the provided node
 *
 * @method checkAttachToTangleAsync
 * @param {string} node
 *
 * @returns {Promise}
 */
const checkAttachToTangleAsync = (node) => {
    return fetch(node, {
        method: 'POST',
        body: JSON.stringify({ command: 'attachToTangle' }),
        headers: new Headers({
            'Content-Type': 'application/json',
            'X-IOTA-API-Version': IRI_API_VERSION,
        }),
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }

            throw response;
        })
        .catch(() => {
            // return a fake normal IRI response when attachToTangle is not available
            return { error: Errors.ATTACH_TO_TANGLE_UNAVAILABLE };
        });
};

/**
 * Promisified version of iota.api.getTipInfo
 *
 * @method getTipInfoAsync
 *
 * @param {object} [settings]
 *
 * @returns {function(string): Promise<object>}
 */
const getTipInfoAsync = (settings) => (tailTransactionHash) => {
    return fetch(settings.url, {
        method: 'POST',
        body: JSON.stringify({
            command: 'getTipInfo',
            tailTransaction: tailTransactionHash,
        }),
        headers: new Headers({
            'Content-Type': 'application/json',
            'X-IOTA-API-Version': IRI_API_VERSION,
        }),
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }

        throw response;
    });
};

/**
 * Checks if remote pow is allowed on the provided node
 *
 * @method allowsRemotePow
 * @param {object} settings
 *
 * @returns {Promise<Boolean>}
 */
const allowsRemotePow = (settings) => {
    return getNodeInfoAsync(settings)().then((info) => {
        // Check if provided node has upgraded to IRI to a version, where it adds "features" prop in node info
        if (has(info, 'features')) {
            return includes(info.features, 'RemotePOW');
        }

        // Fallback to old way of checking remote pow
        return checkAttachToTangleAsync(settings.url).then((response) =>
            includes(response.error, Errors.INVALID_PARAMETERS),
        );
    });
};

/**
 * Promisified version of iota.api.attachToTangle
 *
 * @method attachToTangleAsync
 * @param {object} [settings]
 * @param {object} seedStore
 *
 * @returns {function(string, string, array, number): Promise<object>}
 */
const attachToTangleAsync = (settings, seedStore) => (
    trunkTransaction,
    branchTransaction,
    trytes,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const shouldOffloadPow = get(seedStore, 'offloadPow') === true;

    if (shouldOffloadPow) {
        const request = (requestTimeout) =>
            new Promise((resolve, reject) => {
                getIotaInstance(settings, requestTimeout).api.attachToTangle(
                    trunkTransaction,
                    branchTransaction,
                    minWeightMagnitude,
                    // Make sure trytes are sorted properly
                    sortTransactionTrytesArray(trytes),
                    (err, attachedTrytes) => {
                        if (err) {
                            reject(err);
                        } else {
                            constructBundleFromAttachedTrytes(attachedTrytes, seedStore)
                                .then((transactionObjects) => {
                                    if (
                                        isBundle(transactionObjects) &&
                                        isBundleTraversable(transactionObjects, trunkTransaction, branchTransaction)
                                    ) {
                                        resolve({
                                            transactionObjects,
                                            trytes: attachedTrytes,
                                        });
                                    } else {
                                        reject(new Error(Errors.INVALID_BUNDLE_CONSTRUCTED_WITH_REMOTE_POW));
                                    }
                                })
                                .catch(reject);
                        }
                    },
                );
            });

        const defaultRequestTimeout = getApiTimeout('attachToTangle');

        return withRequestTimeoutsHandler(defaultRequestTimeout)(request);
    }

    return seedStore
        .performPow(trytes, trunkTransaction, branchTransaction, minWeightMagnitude)
        .then((result) => {
            if (get(result, 'trytes') && get(result, 'transactionObjects')) {
                return Promise.resolve(result);
            }

            // Batched proof-of-work only returns the attached trytes
            return constructBundleFromAttachedTrytes(sortTransactionTrytesArray(result), seedStore).then(
                (transactionObjects) => ({
                    transactionObjects: orderBy(transactionObjects, 'currentIndex', ['desc']),
                    trytes: result,
                }),
            );
        })
        .then(({ transactionObjects, trytes }) => {
            if (
                isBundle(transactionObjects) &&
                isBundleTraversable(transactionObjects, trunkTransaction, branchTransaction)
            ) {
                return {
                    transactionObjects,
                    trytes,
                };
            }

            throw new Error(Errors.INVALID_BUNDLE_CONSTRUCTED_WITH_LOCAL_POW);
        });
};

/**
 * Checks if a node is synced and runs a stable IRI release
 *
 * @method isNodeHealthy
 * @param {object} [settings]
 *
 * @returns {Promise}
 */
const isNodeHealthy = (settings) => {
    return getNodeInfoAsync(settings)().then(({ appName, appVersion, isHealthy }) => {
        if (
            ['rc', 'beta', 'alpha'].some((el) => appVersion.toLowerCase().indexOf(el) > -1) ||
            // Blacklist nodes running [IRI](https://github.com/iotaledger/iri)
            ['iri'].some((el) => appName.toLowerCase().indexOf(el) > -1) ||
            // Blacklist nodes running [Hornet](https://github.com/iotaledger/hornet) running lower version than ALLOWED_MINIMUM_HORNET_VERSION
            (['hornet'].some((el) => appName.toLowerCase().indexOf(el) > -1) &&
                appVersion < MINIMUM_ALLOWED_HORNET_VERSION)
        ) {
            throw new Error(Errors.UNSUPPORTED_NODE);
        }

        return isHealthy;
    });
};

export {
    getIotaInstance,
    getApiTimeout,
    getBalancesAsync,
    getNodeInfoAsync,
    getTransactionsObjectsAsync,
    findTransactionObjectsAsync,
    findTransactionsAsync,
    getLatestInclusionAsync,
    promoteTransactionAsync,
    replayBundleAsync,
    replayLocallyStoredBundleAsync,
    getBundleAsync,
    wereAddressesSpentFromAsync,
    sendTransferAsync,
    getTransactionsToApproveAsync,
    storeAndBroadcastAsync,
    attachToTangleAsync,
    checkAttachToTangleAsync,
    getTipInfoAsync,
    allowsRemotePow,
    isNodeHealthy,
};
