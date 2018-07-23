import head from 'lodash/head';
import isNull from 'lodash/isNull';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import IOTA from 'iota.lib.js';
import { iota } from './index';
import nativeBindings from './nativeBindings';
import Errors from '../errors';
import { isWithinMinutes } from '../date';
import { DEFAULT_BALANCES_THRESHOLD, DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE } from '../../config';
import { performPow } from './transfers';

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

const getNodeInfoAsync = (provider = null) => {
    return new Promise((resolve, reject) => {
        const instance = provider ? new IOTA({ provider }) : iota;

        instance.api.getNodeInfo((err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
};

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

const findTransactionObjectsAsync = (args) => {
    return findTransactionsAsync(args).then((hashes) => getTransactionsObjectsAsync(hashes));
};

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

const getTrytesAsync = (hashes, provider = null) => {
    return new Promise((resolve, reject) => {
        const instance = provider ? new IOTA({ provider }) : iota;

        instance.api.getTrytes(hashes, (err, trytes) => {
            if (err) {
                reject(err);
            } else {
                resolve(trytes);
            }
        });
    });
};

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

const generateAddressAsync = (seed, index, security, addressGenFn = null) => {
    if (isNull(addressGenFn)) {
        return Promise.resolve(iota.api._newAddress(seed, index, security, false));
    }

    return addressGenFn(seed, index, security);
};

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
