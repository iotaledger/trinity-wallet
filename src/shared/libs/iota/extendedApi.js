import get from 'lodash/get';
import head from 'lodash/head';
import has from 'lodash/has';
import includes from 'lodash/includes';
import map from 'lodash/map';
import IOTA from 'iota.lib.js';
import { createPrepareTransfers } from '@iota/core';
import { iota, quorum } from './index';
import Errors from '../errors';
import { isWithinMinutes } from '../date';
import {
    DEFAULT_BALANCES_THRESHOLD,
    DEFAULT_DEPTH,
    DEFAULT_MIN_WEIGHT_MAGNITUDE,
    DEFAULT_NODE_REQUEST_TIMEOUT,
    GET_NODE_INFO_REQUEST_TIMEOUT,
    WERE_ADDRESSES_SPENT_FROM_REQUEST_TIMEOUT,
    GET_BALANCES_REQUEST_TIMEOUT,
    ATTACH_TO_TANGLE_REQUEST_TIMEOUT,
    IRI_API_VERSION,
} from '../../config';
import { sortTransactionTrytesArray, constructBundleFromAttachedTrytes } from './transfers';
import { EMPTY_HASH_TRYTES } from './utils';

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
        default:
            return DEFAULT_NODE_REQUEST_TIMEOUT;
    }
};

/**
 * Returns a new IOTA instance if provider is passed, otherwise returns the global instance
 *
 * @method getIotaInstance
 * @param {string} [provider]
 *
 * @returns {object} IOTA instance
 */
const getIotaInstance = (provider, requestTimeout = DEFAULT_NODE_REQUEST_TIMEOUT) => {
    if (provider) {
        const instance = new IOTA({ provider });
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
 * @param {string} [provider]
 * @param {boolean} [withQuorum]
 *
 * @returns {function(array, number): Promise<object>}
 */
const getBalancesAsync = (provider, withQuorum = true) => (addresses, threshold = DEFAULT_BALANCES_THRESHOLD) =>
    withQuorum
        ? quorum.getBalances(addresses, threshold)
        : new Promise((resolve, reject) => {
              getIotaInstance(provider, getApiTimeout('getBalances')).api.getBalances(
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
 * @param {string} [provider]
 *
 * @returns {function(): Promise<object>}
 */
const getNodeInfoAsync = (provider) => () =>
    new Promise((resolve, reject) => {
        getIotaInstance(provider, getApiTimeout('getNodeInfo')).api.getNodeInfo((err, info) => {
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
 * @param {string} [provider]
 *
 * @returns {function(array): Promise<any>}
 */
const getTransactionsObjectsAsync = (provider) => (hashes) =>
    new Promise((resolve, reject) => {
        getIotaInstance(provider).api.getTransactionsObjects(hashes, (err, txs) => {
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
 * @param {string} [provider]
 *
 * @returns {function(object): Promise<any>}
 */
const findTransactionObjectsAsync = (provider) => (args) =>
    findTransactionsAsync(provider)(args).then((hashes) => getTransactionsObjectsAsync(provider)(hashes));

/**
 * Promisified version of iota.api.findTransactions
 *
 * @method findTransactionsAsync
 * @param {string} [provider]
 *
 * @returns {function(object): Promise<array>}
 */
const findTransactionsAsync = (provider) => (args) =>
    new Promise((resolve, reject) => {
        getIotaInstance(provider).api.findTransactions(args, (err, txs) => {
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
 * @param {string} [provider]
 * @param {boolean} [withQuorum]
 *
 * @returns {function(array): Promise<array>}
 */
const getLatestInclusionAsync = (provider, withQuorum = false) => (hashes) =>
    withQuorum
        ? quorum.getLatestInclusion(hashes)
        : new Promise((resolve, reject) => {
              getIotaInstance(provider, getApiTimeout('getInclusionStates')).api.getLatestInclusion(
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
 * @param {*} [provider]
 * @param {object} seedStore
 *
 * @returns {function(string, number, number, object): Promise<string>}
 */
const promoteTransactionAsync = (provider, seedStore) => (
    hash,
    depth = DEFAULT_DEPTH,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
    transfer = { address: 'U'.repeat(81), value: 0, message: '', tag: '' },
) => {
    const cached = {
        trytes: [],
    };

    return (
        isPromotable(provider)(hash, { rejectWithReason: true })
            // rejectWithReason only resolves if provided hashes are consistent
            .then(() => prepareTransfersAsync(provider)(transfer.address, [transfer]))
            .then((trytes) => {
                cached.trytes = trytes;

                return getTransactionsToApproveAsync(provider)(
                    {
                        reference: hash,
                        adjustDepth: true,
                    },
                    depth,
                );
            })
            .then(({ trunkTransaction, branchTransaction }) =>
                attachToTangleAsync(provider, seedStore)(
                    trunkTransaction,
                    branchTransaction,
                    cached.trytes,
                    minWeightMagnitude,
                ),
            )
            .then(({ trytes }) => {
                cached.trytes = trytes;

                return storeAndBroadcastAsync(provider)(cached.trytes);
            })
            .then(() => hash)
    );
};

/**
 * Promisified version of iota.api.replayBundle
 *
 * @method replayBundleAsync
 * @param {*} [provider]
 * @param {object} seedStore
 *
 * @returns {function(string, function, number, number): Promise<array>}
 */
const replayBundleAsync = (provider, seedStore) => (
    hash,
    depth = DEFAULT_DEPTH,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const cached = {
        trytes: [],
        transactionObjects: [],
    };

    return getBundleAsync(provider)(hash)
        .then((bundle) => {
            const convertToTrytes = (tx) => iota.utils.transactionTrytes(tx);
            cached.trytes = map(bundle, convertToTrytes);
            cached.transactionObjects = bundle;

            return getTransactionsToApproveAsync(provider)({}, depth);
        })
        .then(({ trunkTransaction, branchTransaction }) =>
            attachToTangleAsync(provider, seedStore)(
                trunkTransaction,
                branchTransaction,
                cached.trytes,
                minWeightMagnitude,
            ),
        )
        .then(({ trytes, transactionObjects }) => {
            cached.trytes = trytes;
            cached.transactionObjects = transactionObjects;

            return storeAndBroadcastAsync(provider)(cached.trytes);
        })
        .then(() => cached.transactionObjects);
};

/**
 * Promisified version of iota.api.getBundle
 *
 * @method getBundleAsync
 * @param {string} [provider]
 *
 * @returns {function(string): Promise<array>}
 */
const getBundleAsync = (provider) => (tailTransactionHash) =>
    new Promise((resolve, reject) => {
        getIotaInstance(provider).api.getBundle(tailTransactionHash, (err, bundle) => {
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
 * @param {string} [provider]
 * @param {boolean} [withQuorum]
 *
 * @returns {function(array): Promise<array>}
 */
const wereAddressesSpentFromAsync = (provider, withQuorum = true) => (addresses) =>
    withQuorum
        ? quorum.wereAddressesSpentFrom(addresses)
        : new Promise((resolve, reject) => {
              getIotaInstance(provider, getApiTimeout('wereAddressesSpentFrom')).api.wereAddressesSpentFrom(
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
 * @param {*} [provider]
 *
 * @returns {function(object, array, function, *, number, number): Promise<array>}
 */
const sendTransferAsync = (provider) => (
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
        .prepareTransfers(transfers, options)
        .then((trytes) => {
            cached.trytes = trytes;

            return getTransactionsToApproveAsync(provider)({}, depth);
        })
        .then(({ trunkTransaction, branchTransaction }) =>
            attachToTangleAsync(provider, seedStore)(
                trunkTransaction,
                branchTransaction,
                cached.trytes,
                minWeightMagnitude,
            ),
        )
        .then(({ trytes, transactionObjects }) => {
            cached.trytes = trytes;
            cached.transactionObjects = transactionObjects;

            return storeAndBroadcastAsync(provider)(cached.trytes);
        })
        .then(() => cached.transactionObjects);
};

/**
 * Promisified version of iota.api.getTransactionsToApprove
 *
 * @method getTransactionsToApproveAsync
 * @param {string} [provider]
 *
 * @returns {function(*, number): Promise<object>}
 */
const getTransactionsToApproveAsync = (provider) => (reference = {}, depth = DEFAULT_DEPTH) =>
    new Promise((resolve, reject) => {
        getIotaInstance(provider).api.getTransactionsToApprove(depth, reference, (err, transactionsToApprove) => {
            if (err) {
                reject(err);
            } else {
                resolve(transactionsToApprove);
            }
        });
    });

/**
 * Promisified version of iota.api.prepareTransfers
 *
 * @method prepareTransfersAsync
 * @param {string} [provider]
 *
 * @returns {function(string, array, *): Promise<any>}
 */
export const prepareTransfersAsync = (provider) => (seed, transfers, options = null, signatureFn = null) => {
    // https://github.com/iotaledger/iota.lib.js/blob/e60c728c836cb37f3d6fb8b0eff522d08b745caa/lib/api/api.js#L1058
    let args = [seed, transfers];

    if (options) {
        args = [...args, { ...options, nativeGenerateSignatureFunction: signatureFn }];
    }

    return createPrepareTransfers(provider)(...args);
};

/**
 * Promisified version of iota.api.storeAndBroadcast
 *
 * @method storeAndBroadcastAsync
 * @param {string} [provider]
 *
 * @returns {function(array): Promise<any>}
 */
const storeAndBroadcastAsync = (provider) => (trytes) =>
    new Promise((resolve, reject) => {
        getIotaInstance(provider).api.storeAndBroadcast(trytes, (err) => {
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
        .then((res) => res.json())
        .catch(() => {
            // return a fake normal IRI response when attachToTangle is not available
            return { error: Errors.ATTACH_TO_TANGLE_UNAVAILABLE };
        });
};

/**
 * Checks if remote pow is allowed on the provided node
 *
 * @method allowsRemotePow
 * @param {string} provider
 *
 * @returns {Promise<Boolean>}
 */
const allowsRemotePow = (provider) => {
    return getNodeInfoAsync(provider)().then((info) => {
        // Check if provided node has upgraded to IRI to a version, where it adds "features" prop in node info
        if (has(info, 'features')) {
            return includes(info.features, 'RemotePOW');
        }

        // Fallback to old way of checking remote pow
        return checkAttachToTangleAsync(provider).then((response) =>
            includes(response.error, Errors.INVALID_PARAMETERS),
        );
    });
};

/**
 * Promisified version of iota.api.attachToTangle
 *
 * @method attachToTangleAsync
 * @param {*} [provider]
 * @param {object} seedStore
 *
 * @returns {function(string, string, array, number): Promise<object>}
 */
const attachToTangleAsync = (provider, seedStore) => (
    trunkTransaction,
    branchTransaction,
    trytes,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const shouldOffloadPow = get(seedStore, 'offloadPow') === true;

    if (shouldOffloadPow) {
        return new Promise((resolve, reject) => {
            getIotaInstance(provider, getApiTimeout('attachToTangle')).api.attachToTangle(
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
                                if (iota.utils.isBundle(transactionObjects)) {
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
    }

    return seedStore
        .performPow(trytes, trunkTransaction, branchTransaction, minWeightMagnitude)
        .then((result) => {
            if (get(result, 'trytes') && get(result, 'transactionObjects')) {
                return Promise.resolve(result);
            }

            // Batched proof-of-work only returns the attached trytes
            return constructBundleFromAttachedTrytes(result, seedStore).then((transactionObjects) => ({
                transactionObjects: transactionObjects.slice().reverse(),
                trytes: result,
            }));
        })
        .then(({ transactionObjects, trytes }) => {
            if (iota.utils.isBundle(transactionObjects)) {
                return {
                    transactionObjects,
                    trytes,
                };
            }
            throw new Error(Errors.INVALID_BUNDLE_CONSTRUCTED_WITH_LOCAL_POW);
        });
};

/**
 * Promisified version of iota.api.getTrytes
 *
 * @method getTrytesAsync
 * @param {string} [provider]
 *
 * @returns {function(array): Promise<array>}
 */
const getTrytesAsync = (provider) => (hashes) =>
    new Promise((resolve, reject) => {
        getIotaInstance(provider).api.getTrytes(hashes, (err, trytes) => {
            if (err) {
                reject(err);
            } else {
                resolve(trytes);
            }
        });
    });

/**
 * Checks if a node is synced and runs a stable IRI release
 *
 * @method isNodeHealthy
 * @param {string} [provider]
 *
 * @returns {Promise}
 */
const isNodeHealthy = (provider) => {
    const cached = {
        latestMilestone: EMPTY_HASH_TRYTES,
    };

    return getNodeInfoAsync(provider)()
        .then(
            ({
                appVersion,
                latestMilestone,
                latestMilestoneIndex,
                latestSolidSubtangleMilestone,
                latestSolidSubtangleMilestoneIndex,
            }) => {
                if (['rc', 'beta', 'alpha'].some((el) => appVersion.toLowerCase().indexOf(el) > -1)) {
                    throw new Error(Errors.UNSUPPORTED_NODE);
                }

                cached.latestMilestone = latestMilestone;
                if (
                    (cached.latestMilestone === latestSolidSubtangleMilestone ||
                        latestMilestoneIndex - 1 === latestSolidSubtangleMilestoneIndex) &&
                    cached.latestMilestone !== EMPTY_HASH_TRYTES
                ) {
                    return getTrytesAsync(provider)([cached.latestMilestone]);
                }

                throw new Error(Errors.NODE_NOT_SYNCED);
            },
        )
        .then((trytes) => {
            const { timestamp } = iota.utils.transactionObject(head(trytes), cached.latestMilestone);

            return isWithinMinutes(timestamp * 1000, 5);
        });
};

/**
 * Extended version of iota.api.isPromotable.
 *
 * @method isPromotable
 * @param {string} [provider]
 *
 * @returns {function(string): (Promise<boolean>)}
 */
const isPromotable = (provider) => (tailTransactionHash, options = {}) =>
    getIotaInstance(provider).api.isPromotable(tailTransactionHash, options);

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
    getBundleAsync,
    wereAddressesSpentFromAsync,
    sendTransferAsync,
    getTransactionsToApproveAsync,
    storeAndBroadcastAsync,
    attachToTangleAsync,
    checkAttachToTangleAsync,
    allowsRemotePow,
    isNodeHealthy,
    isPromotable,
};
