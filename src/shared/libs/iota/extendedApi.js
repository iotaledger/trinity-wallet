import head from 'lodash/head';
import isNull from 'lodash/isNull';
import map from 'lodash/map';
import size from 'lodash/size';
import clone from 'lodash/clone';
import IOTA from 'iota.lib.js';
import { iota } from './index';
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
    const cachedHashes = clone(hashes);
    return new Promise((resolve, reject) => {
        iota.api.getTrytes(hashes, (err, trytes) => {
            if (err) {
                reject(err);
            } else if (size(cachedHashes) !== size(trytes)) {
                reject();
            } else {
                resolve(
                    map(trytes, (tryteString, idx) => iota.utils.fastTransactionObject(cachedHashes[idx], tryteString)),
                );
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

    if (shouldOffloadPow) {
        return new Promise((resolve, reject) => {
            iota.api.promoteTransaction(hash, depth, minWeightMagnitude, [transfer], options, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(hash);
                }
            });
        });
    }

    const cached = {
        trytes: [],
    };

    return iota.api
        .isPromotable(hash)
        .then((isPromotable) => {
            if (!isPromotable) {
                throw new Error(Errors.INCONSISTENT_SUBTANGLE);
            }

            return prepareTransfersAsync(transfer.address, [transfer]);
        })
        .then((trytes) => {
            cached.trytes = trytes;

            return getTransactionsToApproveAsync(hash);
        })
        .then(
            ({ trunkTransaction, branchTransaction }) =>
                shouldOffloadPow
                    ? attachToTangleAsync(trunkTransaction, branchTransaction, cached.trytes)
                    : performPow(powFn, cached.trytes, trunkTransaction, branchTransaction),
        )
        .then(({ trytes }) => {
            cached.trytes = trytes;

            return storeAndBroadcastAsync(cached.trytes);
        })
        .then(() => hash);
};

const replayBundleAsync = (hash, powFn = null, depth = 3, minWeightMagnitude = 14) => {
    const shouldOffloadPow = isNull(powFn);

    if (shouldOffloadPow) {
        return new Promise((resolve, reject) => {
            iota.api.replayBundle(hash, depth, minWeightMagnitude, (err, txs) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(txs);
                }
            });
        });
    }

    const cached = {
        trytes: [],
        transactionObjects: [],
    };

    return getBundleAsync(hash)
        .then((bundle) => {
            if (isNull(bundle)) {
                throw new Error(Errors.INVALID_BUNDLE);
            }

            const convertToTrytes = (tx) => iota.utils.toTrytes(tx);
            cached.trytes = map(bundle, convertToTrytes).reverse();
            cached.transactionObjects = bundle;

            return getTransactionsToApproveAsync();
        })
        .then(
            ({ trunkTransaction, branchTransaction }) =>
                shouldOffloadPow
                    ? attachToTangleAsync(trunkTransaction, branchTransaction, cached.trytes)
                    : performPow(powFn, cached.trytes, trunkTransaction, branchTransaction),
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

const broadcastBundleAsync = (tail) => {
    return new Promise((resolve, reject) => {
        iota.api.broadcastBundle(tail, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(tail);
            }
        });
    });
};

const sendTransferAsync = (seed, depth, minWeightMagnitude, transfers, options = null) => {
    // https://github.com/iotaledger/iota.lib.js/blob/e60c728c836cb37f3d6fb8b0eff522d08b745caa/lib/api/api.js#L1058
    let args = [seed, depth, minWeightMagnitude, transfers];

    if (options) {
        args = [...args, options];
    }

    return new Promise((resolve, reject) => {
        iota.api.sendTransfer(...args, (err, newTransfer) => {
            if (err) {
                reject(err);
            } else {
                resolve(newTransfer);
            }
        });
    });
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
    }).then((res) => res.json());
};

const attachToTangleAsync = (
    trunkTransaction,
    branchTransaction,
    trytes,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    return new Promise((resolve, reject) => {
        iota.api.attachToTangle(trunkTransaction, branchTransaction, minWeightMagnitude, trytes, (err, trytes) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    trytes,
                    transactionObjects: map(trytes, (tryteString) => iota.utils.transactionObject(tryteString)),
                });
            }
        });
    });
};

const getTrytesAsync = (hashes) => {
    return new Promise((resolve, reject) => {
        iota.api.getTrytes(hashes, (err, trytes) => {
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
        .then(({ latestMilestone, latestSolidSubtangleMilestone }) => {
            cached.latestMilestone = latestMilestone;
            if (cached.latestMilestone === latestSolidSubtangleMilestone && cached.latestMilestone !== '9'.repeat(81)) {
                return getTrytesAsync([cached.latestMilestone]);
            }

            throw new Error(Errors.NODE_NOT_SYNCED);
        })
        .then((trytes) => {
            const { timestamp } = iota.utils.fastTransactionObject(cached.latestMilestone, head(trytes));

            return isWithinMinutes(timestamp * 1000, 5);
        });
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
    broadcastBundleAsync,
    sendTransferAsync,
    getTransactionsToApproveAsync,
    prepareTransfersAsync,
    storeAndBroadcastAsync,
    attachToTangleAsync,
    checkAttachToTangleAsync,
    isNodeSynced,
};
