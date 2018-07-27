import head from 'lodash/head';
import isNull from 'lodash/isNull';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import IOTA from 'iota.lib.js';
import { iota } from './index';
import nativeBindings from './nativeBindings';
import Errors from '../errors';
import { isWithinMinutes } from '../date';
import {
    DEFAULT_BALANCES_THRESHOLD,
    DEFAULT_DEPTH,
    DEFAULT_MIN_WEIGHT_MAGNITUDE,
    NODE_REQUEST_TIMEOUT,
} from '../../config';
import { performPow } from './transfers';

/**
 * Promisified version of iota.api.getBalances
 *
 * @method getBalancesAsync
 * @param {array} addresses
 * @param {number} threshold
 *
 * @returns {Promise}
 */
const getBalancesAsync = (addresses, threshold = DEFAULT_BALANCES_THRESHOLD) => {
    return new Promise((resolve, reject) => {
        iota.api.getBalances(addresses, threshold, (err, balances) => {
            if (err) {
                reject(err);
            } else {
                resolve(balances);
            }
        });
    });
};

/**
 * Promisified version of iota.api.getNodeInfo
 *
 * @method getNodeInfoAsync
 * @param {*} provider
 *
 * @returns {Promise}
 */
const getNodeInfoAsync = (provider = null) => {
    return new Promise((resolve, reject) => {
        const instance = provider ? new IOTA({ provider }) : iota;

        instance.api.setApiTimeout(NODE_REQUEST_TIMEOUT);
        instance.api.getNodeInfo((err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
};

/**
 * Promisified version of iota.api.getTransactionObjects
 *
 * @method getTransactionsObjectsAsync
 * @param {array} hashes
 *
 * @returns {Promise}
 */
const getTransactionsObjectsAsync = (hashes) => {
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

/**
 * Promisified version of iota.api.findTransactionObjects
 *
 * @method getTransactionsObjectsAsync
 * @param {object} args
 *
 * @returns {Promise}
 */
const findTransactionObjectsAsync = (args) => {
    return findTransactionsAsync(args).then((hashes) => getTransactionsObjectsAsync(hashes));
};

/**
 * Promisified version of iota.api.findTransactions
 *
 * @method findTransactionsAsync
 * @param {object} args
 *
 * @returns {Promise}
 */
const findTransactionsAsync = (args) => {
    return new Promise((resolve, reject) => {
        iota.api.findTransactions(args, (err, txs) => {
            if (err) {
                reject(err);
            } else {
                resolve(txs);
            }
        });
    });
};

/**
 * Promisified version of iota.api.getLatestInclusion
 *
 * @method getLatestInclusionAsync
 * @param {array} hashes
 *
 * @returns {Promise}
 */
const getLatestInclusionAsync = (hashes) => {
    return new Promise((resolve, reject) => {
        iota.api.getLatestInclusion(hashes, (err, states) => {
            if (err) {
                reject(err);
            } else {
                resolve(states);
            }
        });
    });
};

/**
 * Extended version of iota.api.promoteTransaction with an option to perform PoW locally
 *
 * @method promoteTransactionAsync
 * @param {string} hash
 * @param {*} powFn
 * @param {number} depth
 * @param {number} minWeightMagnitude
 * @param {object} transfer
 * @param {object} options
 *
 * @returns {Promise}
 */
const promoteTransactionAsync = (
    hash,
    powFn = null,
    depth = DEFAULT_DEPTH,
    minWeightMagnitude = 14,
    transfer = { address: 'U'.repeat(81), value: 0, message: '', tag: '' },
    options = { interrupt: false, delay: 0 },
) => {
    // If proof of work function is not provided, offload promotion to a remote node
    const shouldOffloadPow = isNull(powFn);

    const cached = {
        trytes: [],
    };

    return iota.api
        .isPromotable(hash)
        .then((isPromotable) => {
            if (!isPromotable) {
                throw new Error(Errors.INCONSISTENT_SUBTANGLE);
            }

            return prepareTransfersAsync(transfer.address, [transfer], options);
        })
        .then((trytes) => {
            cached.trytes = trytes;

            return getTransactionsToApproveAsync(hash, depth);
        })
        .then(
            ({ trunkTransaction, branchTransaction }) =>
                shouldOffloadPow
                    ? attachToTangleAsync(trunkTransaction, branchTransaction, cached.trytes, minWeightMagnitude)
                    : performPow(powFn, cached.trytes, trunkTransaction, branchTransaction, minWeightMagnitude),
        )
        .then(({ trytes }) => {
            cached.trytes = trytes;

            return storeAndBroadcastAsync(cached.trytes);
        })
        .then(() => hash);
};

/**
 * Extended version of iota.api.replayBundle with an option to perform PoW locally
 *
 * @method replayBundleAsync
 * @param {string} hash
 * @param {*} powFn
 * @param {number} depth
 * @param {number} minWeightMagnitude
 *
 * @returns {Promise}
 */
const replayBundleAsync = (
    hash,
    powFn = null,
    depth = DEFAULT_DEPTH,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const shouldOffloadPow = isNull(powFn);

    const cached = {
        trytes: [],
        transactionObjects: [],
    };

    return getBundleAsync(hash)
        .then((bundle) => {
            if (isNull(bundle)) {
                throw new Error(Errors.INVALID_BUNDLE);
            }

            const convertToTrytes = (tx) => iota.utils.transactionTrytes(tx);
            cached.trytes = map(bundle, convertToTrytes);
            cached.transactionObjects = bundle;

            return getTransactionsToApproveAsync(null, depth);
        })
        .then(
            ({ trunkTransaction, branchTransaction }) =>
                shouldOffloadPow
                    ? attachToTangleAsync(
                          trunkTransaction,
                          branchTransaction,
                          cached.trytes.reverse(),
                          minWeightMagnitude,
                      )
                    : performPow(powFn, cached.trytes, trunkTransaction, branchTransaction, minWeightMagnitude),
        )
        .then(({ trytes, transactionObjects }) => {
            cached.trytes = trytes;
            cached.transactionObjects = transactionObjects;

            return storeAndBroadcastAsync(cached.trytes);
        })
        .then(() => cached.transactionObjects);
};

/**
 * Promisified version of iota.api.getBundle
 *
 * @method getBundleAsync
 * @param {string} tailTransactionHash
 *
 * @returns {Promise}
 */
const getBundleAsync = (tailTransactionHash) => {
    return new Promise((resolve, reject) => {
        iota.api.getBundle(tailTransactionHash, (err, bundle) => {
            if (err) {
                if (err.message.includes(Errors.INVALID_BUNDLE)) {
                    resolve(null);
                } else {
                    reject(err);
                }
            } else {
                resolve(bundle);
            }
        });
    });
};

/**
 * Promisified version of iota.api.wereAddressesSpentFrom
 *
 * @method getBundleAsync
 * @param {array} addresses
 *
 * @returns {Promise}
 */
const wereAddressesSpentFromAsync = (addresses) => {
    return new Promise((resolve, reject) => {
        iota.api.wereAddressesSpentFrom(addresses, (err, wereSpent) => {
            if (err) {
                reject(err);
            } else {
                resolve(wereSpent);
            }
        });
    });
};

/**
 * Promisified version of iota.api.sendTransfer
 *
 * @method sendTransferAsync
 * @param {string} seed
 * @param {array} transfers
 * @param {*} powFn
 * @param {*} options
 * @param {number} depth
 * @param {number} minWeightMagnitude
 *
 * @returns {Promise}
 */
const sendTransferAsync = (
    seed,
    transfers,
    powFn = null,
    options = null,
    depth = DEFAULT_DEPTH,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const shouldOffloadPow = isNull(powFn);

    const cached = {
        trytes: [],
        transactionObjects: [],
    };

    return prepareTransfersAsync(seed, transfers, options)
        .then((trytes) => {
            cached.trytes = trytes;

            return getTransactionsToApproveAsync(null, depth);
        })
        .then(
            ({ trunkTransaction, branchTransaction }) =>
                shouldOffloadPow
                    ? attachToTangleAsync(trunkTransaction, branchTransaction, cached.trytes, minWeightMagnitude)
                    : performPow(powFn, cached.trytes, trunkTransaction, branchTransaction, minWeightMagnitude),
        )
        .then(({ trytes, transactionObjects }) => {
            cached.trytes = trytes;
            cached.transactionObjects = transactionObjects;

            return storeAndBroadcastAsync(cached.trytes);
        })
        .then(() => cached.transactionObjects);
};

/**
 * Promisified version of iota.api.getTransactionsToApprove
 *
 * @method getTransactionsToApproveAsync
 * @param {*} reference
 * @param {number} depth
 *
 * @returns {Promise}
 */
const getTransactionsToApproveAsync = (reference = null, depth = DEFAULT_DEPTH) => {
    return new Promise((resolve, reject) => {
        iota.api.getTransactionsToApprove(depth, reference, (err, transactionsToApprove) => {
            if (err) {
                reject(err);
            } else {
                resolve(transactionsToApprove);
            }
        });
    });
};

/**
 * Promisified version of iota.api.prepareTransfers
 *
 * @method prepareTransfersAsync
 * @param {string} seed
 * @param {array} transfers
 * @param {*} options
 *
 * @returns {Promise}
 */
const prepareTransfersAsync = (seed, transfers, options = null) => {
    // https://github.com/iotaledger/iota.lib.js/blob/e60c728c836cb37f3d6fb8b0eff522d08b745caa/lib/api/api.js#L1058
    let args = [seed, transfers];

    if (options) {
        args = [...args, options];
    }

    return new Promise((resolve, reject) => {
        iota.api.prepareTransfers(...args, (err, trytes) => {
            if (err) {
                reject(err);
            } else {
                resolve(trytes);
            }
        });
    });
};

/**
 * Promisified version of iota.api.storeAndBroadcast
 *
 * @method storeAndBroadcastAsync
 * @param {array} trytes
 *
 * @returns {Promise}
 */
const storeAndBroadcastAsync = (trytes) => {
    return new Promise((resolve, reject) => {
        iota.api.storeAndBroadcast(trytes, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

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
        headers: { 'X-IOTA-API-Version': '1' },
    })
        .then((res) => res.json())
        .catch(() => {
            // return a fake normal IRI response when attachToTangle is not available
            return { error: Errors.ATTACH_TO_TANGLE_UNAVAILABLE };
        });
};

/**
 * Promisified version of iota.api.attachToTangle
 *
 * @method attachToTangleAsync
 * @param {string} trunkTransaction
 * @param {string} branchTransaction
 * @param {array} trytes
 * @param {number} minWeightMagnitude
 *
 * @returns {Promise}
 */
const attachToTangleAsync = (
    trunkTransaction,
    branchTransaction,
    trytes,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    return new Promise((resolve, reject) => {
        iota.api.attachToTangle(
            trunkTransaction,
            branchTransaction,
            minWeightMagnitude,
            trytes,
            (err, attachedTrytes) => {
                if (err) {
                    reject(err);
                } else {
                    const promise = () =>
                        reduce(
                            attachedTrytes,
                            (promise, tryteString) => {
                                return promise.then((result) => {
                                    return nativeBindings.asyncTransactionObject(tryteString).then((tx) => {
                                        result.push(tx);

                                        return result;
                                    });
                                });
                            },
                            Promise.resolve([]),
                        );

                    promise()
                        .then((transactionObjects) =>
                            resolve({
                                transactionObjects,
                                trytes: attachedTrytes,
                            }),
                        )
                        .catch(reject);
                }
            },
        );
    });
};

/**
 * Promisified version of iota.api.getTrytes
 *
 * @method getTrytesAsync
 * @param {array} hashes
 * @param {*} provider
 *
 * @returns {Promise}
 */
const getTrytesAsync = (hashes, provider = null) => {
    return new Promise((resolve, reject) => {
        const instance = provider ? new IOTA({ provider }) : iota;

        instance.api.setApiTimeout(NODE_REQUEST_TIMEOUT);
        instance.api.getTrytes(hashes, (err, trytes) => {
            if (err) {
                reject(err);
            } else {
                resolve(trytes);
            }
        });
    });
};

/**
 * Checks if a node is synced
 *
 * @method isNodeSynced
 * @param {*} provider
 *
 * @returns {Promise}
 */
const isNodeSynced = (provider = null) => {
    const cached = {
        latestMilestone: '9'.repeat(81),
    };

    return getNodeInfoAsync(provider)
        .then(
            ({
                latestMilestone,
                latestMilestoneIndex,
                latestSolidSubtangleMilestone,
                latestSolidSubtangleMilestoneIndex,
            }) => {
                cached.latestMilestone = latestMilestone;
                if (
                    (cached.latestMilestone === latestSolidSubtangleMilestone ||
                        latestMilestoneIndex - 1 === latestSolidSubtangleMilestoneIndex) &&
                    cached.latestMilestone !== '9'.repeat(81)
                ) {
                    return getTrytesAsync([cached.latestMilestone], provider);
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
 * Generates single address for provided index and security
 *
 * @method generateAddressAsync
 *
 * @param {string} seed
 * @param {number} index
 * @param {number} security
 * @param {function} addressGenFn
 *
 * @returns {Promise}
 */
const generateAddressAsync = (seed, index, security, addressGenFn = null) => {
    if (isNull(addressGenFn)) {
        return Promise.resolve(iota.api._newAddress(seed, index, security, false));
    }

    return addressGenFn(seed, index, security);
};

/**
 * Generates bulk addresses
 *
 * @method generateAddressesAsync
 *
 * @param {string} seed
 * @param {object} options { index, security, total }
 * @param {function} addressesGenFn
 *
 * @returns {Promise}
 */
const generateAddressesAsync = (seed, options, addressesGenFn = null) => {
    const { index, security, total } = options;
    if (isNull(addressesGenFn)) {
        return new Promise((resolve, reject) => {
            iota.api.getNewAddress(seed, { index, security, total }, (err, addresses) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(addresses);
                }
            });
        });
    }

    return addressesGenFn(seed, index, security, total);
};

export {
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
    prepareTransfersAsync,
    storeAndBroadcastAsync,
    attachToTangleAsync,
    checkAttachToTangleAsync,
    isNodeSynced,
    generateAddressAsync,
    generateAddressesAsync,
};
