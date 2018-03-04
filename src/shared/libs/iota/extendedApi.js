import { iota } from './index';
import { DEFAULT_BALANCES_THRESHOLD, DEFAULT_DEPTH } from '../../config';

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

const getNodeInfoAsync = () => {
    return new Promise((resolve, reject) => {
        iota.api.getNodeInfo((err, info) => {
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
    return new Promise((resolve, reject) => {
        iota.api.findTransactionObjects(args, (err, txs) => {
            if (err) {
                reject(err);
            } else {
                resolve(txs);
            }
        });
    });
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
    depth = 3,
    minWeightMagnitude = 14,
    transfer = [{ address: 'U'.repeat(81), value: 0, message: '', tag: '' }],
    options = { interrupt: false, delay: 0 },
) => {
    return new Promise((resolve, reject) => {
        iota.api.promoteTransaction(hash, depth, minWeightMagnitude, transfer, options, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
};

const replayBundleAsync = (hash, depth = 3, minWeightMagnitude = 14) => {
    return new Promise((resolve, reject) => {
        iota.api.replayBundle(hash, depth, minWeightMagnitude, (err, txs) => {
            if (err) {
                reject(err);
            } else {
                resolve(txs);
            }
        });
    });
};

const getBundleAsync = (tailTransactionHash) => {
    return new Promise((resolve, reject) => {
        iota.api.getBundle(tailTransactionHash, (err, bundle) => {
            if (err) {
                if (err.message.includes('Invalid Bundle')) {
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
                resolve();
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

const getTransactionsToApproveAsync = (depth = DEFAULT_DEPTH) => {
    return new Promise((resolve, reject) => {
        iota.api.getTransactionsToApprove(depth, null, (err, transactionsToApprove) => {
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
};
