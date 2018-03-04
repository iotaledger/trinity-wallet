import assign from 'lodash/assign';
import get from 'lodash/get';
import keys from 'lodash/keys';
import each from 'lodash/each';
import find from 'lodash/find';
import head from 'lodash/head';
import map from 'lodash/map';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import omitBy from 'lodash/omitBy';
import size from 'lodash/size';
import some from 'lodash/some';
import reduce from 'lodash/reduce';
import transform from 'lodash/transform';
import difference from 'lodash/difference';
import union from 'lodash/union';
import flatten from 'lodash/flatten';
import orderBy from 'lodash/orderBy';
import { DEFAULT_TAG, DEFAULT_BALANCES_THRESHOLD, DEFAULT_MIN_WEIGHT_MAGNITUDE } from '../../config';
import { iota } from './index';
import { getBalancesSync, accumulateBalance } from './addresses';
import {
    getBalancesAsync,
    getTransactionsObjectsAsync,
    getBundleAsync,
    getLatestInclusionAsync,
    findTransactionObjectsAsync,
    prepareTransfersAsync,
    getTransactionsToApproveAsync,
    storeAndBroadcastAsync,
} from './extendedApi';

/**
 *   Returns a single transfer array
 *   Converts message and tag to trytes. Basically preparing an array of transfer objects before making a transfer.
 *
 *   @method prepareTransferArray
 *   @param {string} address
 *   @param {number} value
 *   @param {string} message
 *   @param {string} [tag='TRINITY']
 *   @returns {array} Transfer object
 **/
export const prepareTransferArray = (address, value, message, tag = DEFAULT_TAG) => {
    return [
        {
            address,
            value,
            message: iota.utils.toTrytes(message),
            tag,
        },
    ];
};

/**
 *   Accepts a transfer bundle and returns the tail object
 *
 *   @method extractTailTransferFromBundle
 *   @param {array} bundle - Array of transfer objects
 *   @returns {object} transfer object
 **/
export const extractTailTransferFromBundle = (bundle) => {
    const extractTail = (res, tx) => {
        if (tx.currentIndex === 0) {
            res = tx;
        }

        return res;
    };

    return reduce(bundle, extractTail, {});
};

/**
 *   Accepts tail transaction objects and their corresponding inclusion states.
 *   Categorize tail transactions confirmed/unconfirmed
 *   Transform transaction array to dictionary with key as bundle hash
 *
 *   @method categorizeTransactionsByPersistence
 *   @param {array} tailTransactions - Array of tail transfer objects
 *   @param {array} states - Array of booleans
 *   @returns {object} Categorized transactions by confirmed/unconfirmed.
 **/
export const categorizeTransactionsByPersistence = (tailTransactions, states) => {
    if (!isArray(states) || !isArray(tailTransactions)) {
        return {
            confirmed: {},
            unconfirmed: {},
        };
    }

    return reduce(
        tailTransactions,
        (acc, tx, idx) => {
            if (states[idx]) {
                acc.confirmed[tx.bundle] = tx;
            } else {
                acc.unconfirmed[tx.bundle] = tx;
            }

            return acc;
        },
        {
            confirmed: {},
            unconfirmed: {},
        },
    );
};

/**
 *   Accepts unconfirmed and confirmed transactions.
 *   Removes all those unconfirmed transfers that are already confirmed.
 *
 *   @method removeIrrelevantUnconfirmedTransfers
 *   @param {object} categorizedTransfers - transfers categorized by confirmed/unconfirmed as dictionary with key as bundle hash
 *   @returns {object} Unconfirmed transfers as dictionary after removing transfer objects that are already confirmed.
 **/

export const removeIrrelevantUnconfirmedTransfers = (categorizedTransfers) => {
    const { unconfirmed, confirmed } = categorizedTransfers;
    return omitBy(unconfirmed, (tx, bundle) => bundle in confirmed);
};

export const isReceivedTransfer = (bundle, addresses) => {
    // Iterate over every bundle entry
    for (let i = 0; i < bundle.length; i++) {
        if (addresses.indexOf(bundle[i].address) > -1) {
            // Check if it's a remainder address
            const isRemainder = bundle[i].currentIndex === bundle[i].lastIndex && bundle[i].lastIndex !== 0;
            // check if sent transaction
            if (bundle[i].value < 0 && !isRemainder) {
                return false;
                // check if received transaction, or 0 value (message)
            } else if (bundle[i].value >= 0 && !isRemainder) {
                return true;
            }
        }
    }
};

export const getRelevantTransfer = (bundle, addresses) => {
    for (let i = 0; i < bundle.length; i++) {
        if (addresses.indexOf(bundle[i].address) > -1) {
            const isRemainder = bundle[i].currentIndex === bundle[i].lastIndex && bundle[i].lastIndex !== 0;
            if (bundle[i].value < 0 && !isRemainder) {
                return bundle[0];
            } else if (bundle[i].value >= 0 && !isRemainder) {
                return bundle[i];
            }
        }
    }
    return extractTailTransferFromBundle(bundle);
};

export const getTransferValue = (bundle, addresses) => {
    let value = 0;
    let j = 0;
    for (let i = 0; i < bundle.length; i++) {
        if (addresses.indexOf(bundle[i].address) > -1) {
            const isRemainder = bundle[i].currentIndex === bundle[i].lastIndex && bundle[i].lastIndex !== 0;
            if (bundle[i].value < 0 && !isRemainder) {
                value = bundle[0].value;
                return value;
            } else if (bundle[i].value >= 0 && !isRemainder) {
                value += bundle[i].value;
                j++;
            }
        }
    }
    if (j === 0) {
        return extractTailTransferFromBundle(bundle).value;
    }
    return value;
};

export const isValidBundleSync = (bundle, addressData) => {
    const bundleBalance = accumulateBalanceFromBundle(bundle);
    const bundleAddresses = getUsedAddressesFromBundle(bundle);

    const balances = getBalancesSync(bundleAddresses, addressData);
    const latestBalance = accumulateBalance(balances);

    return bundleBalance <= latestBalance;
};

export const isValidBundleAsync = (bundle) => {
    const bundleBalance = accumulateBalanceFromBundle(bundle);
    const bundleAddresses = getUsedAddressesFromBundle(bundle);

    return getBalancesAsync(bundleAddresses, DEFAULT_BALANCES_THRESHOLD).then((balances) => {
        const latestBalance = accumulateBalance(map(balances.balances, Number));

        return bundleBalance <= latestBalance;
    });
};

export const filterInvalidTransfersSync = (transfers, addressData) => {
    const validTransfers = [];

    each(transfers, (bundle) => {
        const isValidBundle = isValidBundleSync(bundle, addressData);

        if (isValidBundle) {
            validTransfers.push(bundle);
        }
    });

    return validTransfers;
};

export const filterInvalidTransfersAsync = (transfers) => {
    return reduce(
        transfers,
        (promise, bundle) => {
            return promise
                .then((result) => {
                    return isValidBundleAsync(bundle).then((isValid) => {
                        if (isValid) {
                            result.push(bundle);
                        }

                        return result;
                    });
                })
                .catch(console.error);
        },
        Promise.resolve([]),
    );
};

/**
 *   Accepts transfers and filters zero value transfers if any
 *
 *   @method filterZeroValueTransfers
 *   @param {array} transfers
 *   @returns {array} - Value transfers
 **/
export const filterZeroValueTransfers = (transfers) => {
    const keepValueTransfers = (acc, bundle) => {
        const tailTransaction = find(bundle, { currentIndex: 0 });

        if (tailTransaction.value !== 0) {
            acc.push(bundle);
        }

        return acc;
    };

    return reduce(transfers, keepValueTransfers, []);
};

/**
 *   Accepts a bundle and computes the total balance consumed
 *
 *   @method accumulateBalanceOnBundle
 *   @param {array} bundle
 *   @returns {number} - Balance
 **/
export const accumulateBalanceFromBundle = (bundle) => {
    return reduce(bundle, (acc, tx) => (tx.value < 0 ? acc + Math.abs(tx.value) : acc), 0);
};

/**
 *   Accepts a bundle and computes the total balance consumed
 *
 *   @method accumulateBalanceOnBundle
 *   @param {array} bundle
 *   @returns {number} - Balance
 **/
export const getUsedAddressesFromBundle = (bundle) => {
    return map(filter(bundle, (tx) => tx.value < 0), (tx) => tx.address);
};

export const filterConfirmedTransfers = (transfers) => {
    return filter(transfers, (bundle) => {
        const topTx = head(bundle);

        return !topTx.persistence;
    });
};

export const getBundleTailsForPendingValidTransfers = (transfers, addressData, account) => {
    const addresses = keys(addressData);
    const pendingTransfers = filterConfirmedTransfers(transfers);

    if (isEmpty(pendingTransfers)) {
        return Promise.resolve({});
    }

    const { sent, received } = iota.utils.categorizeTransfers(pendingTransfers, addresses);

    const byBundles = (acc, transfers) => {
        each(transfers, (tx) => {
            const isTail = tx.currentIndex === 0;
            const isValueTransfer = tx.value !== 0;

            if (isTail && isValueTransfer) {
                const bundle = tx.bundle;
                const withAccount = assign({}, tx, { account });

                if (bundle in acc) {
                    acc[bundle] = [...acc[bundle], withAccount];
                } else {
                    acc[bundle] = [withAccount];
                }
            }
        });
    };

    // Remove all invalid transfers from sent transfers
    const validSentTransfers = filterInvalidTransfersSync(sent, addressData);

    // Transform all valid sent transfers by bundles
    const allValidSentTransferTailsByBundle = transform(validSentTransfers, byBundles, {});

    // categorizeTransfers categorizes zero value transfers in received.
    const receivedValueTransfers = filterZeroValueTransfers(received);

    // Remove all invalid received transfers
    return filterInvalidTransfersAsync(receivedValueTransfers).then((validReceivedTransfers) => {
        // Transform all valid received transfers by bundles
        const allValidReceivedTransferTailsByBundle = transform(validReceivedTransfers, byBundles, {});

        return { ...allValidSentTransferTailsByBundle, ...allValidReceivedTransferTailsByBundle };
    });
};

export const getFirstConsistentTail = (tails, idx) => {
    if (!tails[idx]) {
        return Promise.resolve(false);
    }

    return iota.api
        .isPromotable(get(tails[idx], 'hash'))
        .then((state) => {
            if (state && isAboveMaxDepth(get(tails[idx], 'attachmentTimestamp'))) {
                return tails[idx];
            }

            idx += 1;
            return getFirstConsistentTail(tails, idx);
        })
        .catch(() => false);
};

export const formatTransfers = (transfers) => {
    // Order transfers from oldest to newest
    return transfers.slice().sort((a, b) => {
        if (a[0].timestamp > b[0].timestamp) {
            return -1;
        }
        if (a[0].timestamp < b[0].timestamp) {
            return 1;
        }
        return 0;
    });
};

/**
 *   Takes in transfer bundles and only keep a single copy
 *
 *   @method deduplicateTransferBundles
 *   @param {array} transfers - transfers array
 *
 *   @returns {array} - filtered transfers array
 **/
export const deduplicateTransferBundles = (transfers) => {
    const deduplicate = (res, transfer) => {
        const tail = find(transfer, (tx) => tx.currentIndex === 0);
        const bundle = tail.bundle;
        const persistence = tail.persistence;

        if (bundle in res) {
            if (persistence) {
                res[bundle] = transfer;
            }
        } else {
            res = { ...res, ...{ [bundle]: transfer } };
        }

        return res;
    };

    const aggregated = reduce(transfers, deduplicate, {});
    return map(aggregated, (v) => v);
};

/**
 *   Takes in transfer bundles and grab hashes for transfer objects that are unconfirmed.
 *
 *   @method getPendingTxTailsHashes
 *   @param {array} bundles - Transfer bundles
 *
 *   @returns {array} - array of transfer hashes
 **/
export const getPendingTxTailsHashes = (bundles) => {
    const grabHashesFromTails = (acc, transfers) => {
        each(transfers, (tx) => {
            if (tx.currentIndex === 0 && !tx.persistence) {
                acc.push(tx.hash);
            }
        });

        return acc;
    };

    return reduce(bundles, grabHashesFromTails, []);
};

/**
 *   Takes in transfer bundles and confirmed tail transaction hashes
 *   Assigns persistence true to all transfers that are confirmed
 *
 *   @method markTransfersConfirmed
 *   @param {array} bundles - Transfer bundles
 *   @param {array} confirmedTransfersTailsHashes - Array of transaction hashes
 *
 *   @returns {array} - bundles
 **/
export const markTransfersConfirmed = (bundles, confirmedTransfersTailsHashes) => {
    return map(bundles, (transfers) => {
        const tailTransaction = find(transfers, { currentIndex: 0 });

        // Safety check to see if tail transaction was actually found.
        // Very unlikely to happen unless and until state is messed up.
        // If tail transaction was found, check if its hash includes in the confirmed trasfers tails hashes list.
        const isConfirmedTailTransaction =
            tailTransaction && includes(confirmedTransfersTailsHashes, tailTransaction.hash);

        // Invert persistence on all transfer objects if transaction is confirmed.
        if (isConfirmedTailTransaction) {
            return map(transfers, (transfer) => ({ ...transfer, persistence: true }));
        }

        return transfers;
    });
};

export const isAboveMaxDepth = (timestamp) => {
    return timestamp < Date.now() && Date.now() - parseInt(timestamp) < 11 * 60 * 1000;
};

export const getHashesWithPersistence = (hashes) => {
    return getLatestInclusionAsync(hashes).then((states) => ({ states, hashes }));
};

export const getBundlesWithPersistence = (inclusionStates, hashes) => {
    return reduce(
        hashes,
        (promise, hash, idx) => {
            return promise
                .then((result) => {
                    return getBundleAsync(hash).then((bundle) => {
                        if (!isNull(bundle) && iota.utils.isBundle(bundle)) {
                            result.push(map(bundle, (tx) => assign({}, tx, { persistence: inclusionStates[idx] })));
                        }

                        return result;
                    });
                })
                .catch(console.error);
        },
        Promise.resolve([]),
    );
};

export const constructBundle = (tailTx, allBundleObjects) => {
    if (tailTx.currentIndex === tailTx.lastIndex) {
        return [tailTx];
    }

    const bundle = [tailTx];
    const bundleHash = tailTx.bundle;

    let trunk = tailTx.trunkTransaction;
    let stop = false;
    const nextTx = () => find(allBundleObjects, { hash: trunk });

    while (nextTx() && nextTx().bundle === bundleHash && !stop) {
        bundle.push(nextTx());

        if (nextTx().currentIndex === nextTx().lastIndex) {
            stop = true;
        }

        trunk = nextTx().trunkTransaction;
    }

    return bundle;
};

/**
 *   Checks if there is a difference between local transaction hashes and ledger's transaction hashes.
 *
 *   @method hasNewTransfers
 *   @param {array} existingHashes
 *   @param {array} newHashes
 *
 *   @returns {boolean}
 **/
export const hasNewTransfers = (existingHashes, newHashes) =>
    isArray(existingHashes) && isArray(newHashes) && size(newHashes) > size(existingHashes);

/**
 *   Calls getHashesWithPersistence to get latest inclusion states with hashes.
 *   Filter confirmed hashes.
 *
 *   @method getConfirmedTransactionHashes
 *   @param {array} pendingTxTailHashes
 *
 *   @returns {Promise<array>}
 **/
export const getConfirmedTransactionHashes = (pendingTxTailHashes) => {
    return getHashesWithPersistence(pendingTxTailHashes).then(({ states, hashes }) =>
        filter(hashes, (hash, idx) => states[idx]),
    );
};

/**
 *   Get transaction objects associated with hashes, assign persistence by calling inclusion states
 *   Resolves formatted transfers.
 *
 *   @method syncTransfers
 *   @param {array} diff
 *   @param {object} existingAccountState - Account object
 *
 *   @returns {Promise<object>} - { transfers (Updated transfers), newTransfers }
 **/
export const syncTransfers = (diff, accountState) => {
    const tailTransactionsHashes = new Set();
    const nonTailBundleHashes = new Set();

    return getTransactionsObjectsAsync(diff)
        .then((transactionObjects) => {
            each(transactionObjects, (transactionObject) => {
                if (transactionObject.currentIndex === 0) {
                    tailTransactionsHashes.add(transactionObject.hash);
                } else {
                    nonTailBundleHashes.add(transactionObject.bundle);
                }
            });

            // Find tail transactions for non-tail bundle hashes
            return findTransactionObjectsAsync({ bundles: Array.from(nonTailBundleHashes) });
        })
        .then((bundleObjects) => {
            each(bundleObjects, (transaction) => {
                if (transaction.currentIndex === 0) {
                    tailTransactionsHashes.add(transaction.hash);
                }
            });

            return getHashesWithPersistence(Array.from(tailTransactionsHashes));
        })
        .then(({ states, hashes }) => getBundlesWithPersistence(states, hashes))
        .then((newTransfers) => {
            const updatedTransfers = [...accountState.transfers, ...newTransfers];

            return {
                transfers: formatTransfers(updatedTransfers),
                newTransfers,
            };
        });
};

/**
 *   Accepts a bundle hash and transfers and returns
 *   all bundles matching the bundle hash
 *
 *   @method findBundlesFromTransfers
 *   @param {string} bundleHash
 *   @param {array} transfers
 *   @param {array} transfers - Transfers matching the bundle hash
 *
 *   @returns {Promise<object>} - { transfers (Updated transfers), newTransfers }
 **/
export const findBundlesFromTransfers = (bundleHash, transfers) => {
    return filter(transfers, (bundle) => {
        const topTx = head(bundle);

        return topTx.bundle === bundleHash;
    });
};

/**
 *   Accepts tail transaction object categorized by bundles and a list of tail transaction hashes
 *   Returns all relevant bundle hashes for tail transaction hashes
 *
 *   @method getBundleHashesForTailTransactionHashes
 *   @param {object} bundleTails - { bundleHash: [{}, {}]}
 *   @param {array} tailTransactionHashes - List of tail transaction hashes
 *
 *   @returns {array} bundleHashes - List of bundle hashes
 **/
export const getBundleHashesForTailTransactionHashes = (bundleTails, tailTransactionHashes) => {
    const grabBundleHashes = (acc, tailTransactions, bundleHash) => {
        if (some(tailTransactions, (tailTransaction) => includes(tailTransactionHashes, tailTransaction.hash))) {
            acc.push(bundleHash);
        }
    };

    return transform(bundleTails, grabBundleHashes, []);
};

/**
 *   Accepts bundle hash, transfers and addressData and determines if the bundle associated
 *   with bundle hash is valid or not.
 *
 *   @method isValidForPromotion
 *   @param {string} bundleHash
 *   @param {array} transfers
 *   @param {object} addressData
 *
 *   @returns {Promise<boolean>} - Promise that resolves whether the bundle is valid or not
 **/
export const isValidForPromotion = (bundleHash, transfers, addressData) => {
    const bundles = findBundlesFromTransfers(bundleHash, transfers);
    const firstBundle = head(bundles);

    // If no bundles found, something in the state is messed up
    if (!firstBundle) {
        return Promise.resolve(false);
    }

    const addresses = keys(addressData);
    const incomingTransfer = isReceivedTransfer(firstBundle, addresses);

    return incomingTransfer
        ? isValidBundleAsync(firstBundle)
        : Promise.resolve(isValidBundleSync(firstBundle, addressData));
};

/**
 *
 *   with bundle hash is valid or not.
 *
 *   @method getHashesDiff
 *   @param {object} oldTxHashesForUnspentAddresses
 *   @param {object} newTxHashesForUnspentAddresses
 *   @param {object} oldPendingTxHashesForSpentAddresses
 *   @param {object} newPendingTxHashesForSpentAddresses
 *
 *   @returns {boolean}
 **/
export const getHashesDiff = (
    oldTxHashesForUnspentAddresses,
    newTxHashesForUnspentAddresses,
    oldPendingTxHashesForSpentAddresses,
    newPendingTxHashesForSpentAddresses,
) => {
    let diffForUnspentAddresses = [];
    let diffForSpentAddressesWithPendingTxs = [];

    if (hasNewTransfers(oldTxHashesForUnspentAddresses, newTxHashesForUnspentAddresses)) {
        diffForUnspentAddresses = difference(newTxHashesForUnspentAddresses, oldTxHashesForUnspentAddresses);
    }

    if (hasNewTransfers(oldPendingTxHashesForSpentAddresses, newPendingTxHashesForSpentAddresses)) {
        diffForSpentAddressesWithPendingTxs = difference(
            newPendingTxHashesForSpentAddresses,
            oldPendingTxHashesForSpentAddresses,
        );
    }

    return union(diffForUnspentAddresses, diffForSpentAddressesWithPendingTxs);
};

/**
 *   Filters all invalid transfers from all pending transfers.
 *
 *   @method filterInvalidPendingTransfers
 *   @param {array} transfers
 *   @param {object} addressData
 *   @returns {Promise<array>}
 **/
export const filterInvalidPendingTransfers = (transfers, addressData) => {
    const pendingTransfers = filterConfirmedTransfers(transfers);

    if (isEmpty(pendingTransfers)) {
        return Promise.resolve([]);
    }

    const allAddresses = keys(addressData);
    const { sent, received } = iota.utils.categorizeTransfers(pendingTransfers, allAddresses);

    const validSentTransfers = filterInvalidTransfersSync(sent, addressData);

    return filterInvalidTransfersAsync(received).then((validReceivedTransfers) => {
        return [...validSentTransfers, ...validReceivedTransfers];
    });
};

/**
 *   Finds a tail transaction object from transfers
 *
 *   @method getTailTransactionForBundle
 *   @param {string} bundleHash
 *   @param {array} transfers
 *   @returns {object}
 **/
export const getTailTransactionForBundle = (bundleHash, transfers) => {
    const bundles = findBundlesFromTransfers(bundleHash, transfers);

    return find(flatten(bundles), { currentIndex: 0 });
};

/**
 *   Finds all tail transaction objects from transfers
 *
 *   @method getAllTailTransactionsForBundle
 *   @param {string} bundleHash
 *   @param {array} transfers
 *   @returns {array}
 **/
export const getAllTailTransactionsForBundle = (bundleHash, transfers) => {
    const bundles = findBundlesFromTransfers(bundleHash, transfers);

    return filter(flatten(bundles), { currentIndex: 0 });
};

export const performPow = (
    powFn,
    transactionObjects,
    trunkTransaction,
    branchTransaction,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    const sortedTransactionObjects = orderBy(transactionObjects, 'currentIndex', ['desc']);

    return reduce(
        sortedTransactionObjects,
        (promise, transaction, index) => {
            return promise.then((result) => {
                const withParentTransactions = assign({}, transaction, {
                    trunkTransaction: index ? result.transactionObjects[index - 1].hash : trunkTransaction,
                    branchTransaction: index ? trunkTransaction : branchTransaction,
                });

                const transactionTryteString = iota.utils.transactionTrytes(withParentTransactions);

                return powFn(transactionTryteString, minWeightMagnitude).then((nonce) => {
                    const trytesWithNonce = transactionTryteString.substr(0, 2673 - 27).concat(nonce);
                    const transactionObjectWithNonce = iota.utils.transactionObject(trytesWithNonce);

                    result.trytes.push(trytesWithNonce);
                    result.transactionObjects.push(transactionObjectWithNonce);

                    return result;
                });
            });
        },
        Promise.resolve({ trytes: [], transactionObjects: [] }),
    );
};

export const makeTransferWithLocalPow = (seed, transfers, powFn, options = null) => {
    const cached = {
        trytes: [],
        transactionObjects: [],
    };

    return prepareTransfersAsync(seed, transfers, options)
        .then((trytes) => {
            cached.trytes = trytes;

            return getTransactionsToApproveAsync();
        })
        .then(({ trunkTransaction, branchTransaction }) => {
            cached.transactionObjects = map(cached.trytes, (tryte) =>
                assign({}, iota.utils.transactionObject(tryte), {
                    attachmentTimestamp: Date.now(),
                    attachmentTimestampLowerBound: 0,
                    attachmentTimestampUpperBound: (Math.pow(3, 27) - 1) / 2,
                }),
            );

            return performPow(powFn, cached.transactionObjects, trunkTransaction, branchTransaction);
        })
        .then(({ trytes, transactionObjects }) => {
            // performPow orders transactions/trytes in descending order
            // Sort trytes/transactions in ascending before storing and broadcasting
            cached.trytes = trytes.reverse();
            cached.transactionObjects = transactionObjects.reverse();

            return storeAndBroadcastAsync(cached.trytes);
        })
        .then(() => cached.transactionObjects);
};
