import assign from 'lodash/assign';
import get from 'lodash/get';
import keys from 'lodash/keys';
import each from 'lodash/each';
import find from 'lodash/find';
import head from 'lodash/head';
import map from 'lodash/map';
import omitBy from 'lodash/omitBy';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import filter from 'lodash/filter';
import size from 'lodash/size';
import some from 'lodash/some';
import reduce from 'lodash/reduce';
import transform from 'lodash/transform';
import difference from 'lodash/difference';
import union from 'lodash/union';
import unionBy from 'lodash/unionBy';
import flatten from 'lodash/flatten';
import orderBy from 'lodash/orderBy';
import { DEFAULT_TAG, DEFAULT_BALANCES_THRESHOLD, DEFAULT_MIN_WEIGHT_MAGNITUDE } from '../../config';
import { iota } from './index';
import {
    getBalancesSync,
    accumulateBalance,
    getUnspentAddressesSync,
    getSpentAddressesWithPendingTransfersSync,
} from './addresses';
import {
    getBalancesAsync,
    getTransactionsObjectsAsync,
    getLatestInclusionAsync,
    findTransactionObjectsAsync,
    findTransactionsAsync,
} from './extendedApi';
import Errors from './../errors';

/**
 *   Returns a transfer array
 *   Converts message to trytes. Basically preparing an array of transfer objects before making a transfer.
 *   Since zero value transfers have no inputs, after a sync with ledger, these transfers would not be detected.
 *   To make sure zero value transfers are detected after a sync, add a second transfer to the array that has
 *   seed's own address at index 0.
 *
 *   @method prepareTransferArray
 *   @param {string} address
 *   @param {number} value
 *   @param {string} message
 *   @param {string} firstOwnAddress
 *   @param {string} [tag='TRINITY']
 *   @returns {array} Transfer object
 **/
export const prepareTransferArray = (address, value, message, firstOwnAddress, tag = DEFAULT_TAG) => {
    const trytesConvertedMessage = iota.utils.toTrytes(message);
    const isZeroValue = value === 0;
    const transfer = {
        address,
        value,
        message: trytesConvertedMessage,
        tag,
    };

    if (isZeroValue) {
        return [transfer, assign({}, transfer, { address: firstOwnAddress })];
    }

    return [transfer];
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
 *   Check if the bundle is outgoing
 *
 *   @method isSentTransfer
 *   @param {array} bundle
 *   @param {array} addresses
 *   @returns {boolean}
 **/
export const isSentTransfer = (bundle, addresses) => {
    return some(bundle, (tx) => {
        const isRemainder = tx.currentIndex === tx.lastIndex && tx.lastIndex !== 0;
        return includes(addresses, tx.address) && tx.value < 0 && !isRemainder;
    });
};

/**
 *   Check if the bundle is incoming
 *
 *   @method isReceivedTransfer
 *   @param {array} bundle
 *   @param {array} addresses
 *   @returns {boolean}
 **/
export const isReceivedTransfer = (bundle, addresses) => !isSentTransfer(bundle, addresses);

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
        // Check if any transaction object has a negative (spent) value
        if (!some(bundle, (tx) => tx.value < 0)) {
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

/**
 *   Accepts tail transaction object and all transaction objects from bundle hashes
 *   Then construct a bundle by following trunk transaction from tail transaction object.
 *
 *   @method constructBundle
 *   @param {object} tailTransaction
 *   @param {array} allTransactionObjects
 *
 *   @returns {boolean}
 **/
export const constructBundle = (tailTransaction, allTransactionObjects) => {
    // Start from the tail transaction object
    // This will also preserve the order since the next objects will be pushed
    const bundle = [tailTransaction];

    // In case tail transaction is only transfer in the bundle
    // Just return the tail transaction as a bundle
    if (tailTransaction.currentIndex === tailTransaction.lastIndex) {
        return bundle;
    }

    let hasFoundLastTransfer = false;

    // Start off from by searching for trunk transaction of tail transaction object,
    // Which is hash of the next transfer i.e. transfer with current index 1
    let nextTrunkTransaction = tailTransaction.trunkTransaction;

    // Finds the next transfer which would basically be that transfer that has hash === nextTrunkTransaction
    const nextTransfer = () => find(allTransactionObjects, { hash: nextTrunkTransaction });

    while (
        // Safety check to see if the next transfer exists
        nextTransfer() &&
        // Next check if bundle hash for tail transaction matches the next found transfer
        nextTransfer().bundle === tailTransaction.bundle &&
        // Make sure it hasn't already found the last transfer in the bundle
        !hasFoundLastTransfer
    ) {
        const transfer = nextTransfer();
        const isLastTransferInBundle = transfer.currentIndex === transfer.lastIndex;

        // Assign trunk transaction of this transaction as the next trunk transaction to be searched for,
        // Next trunk transaction should always be the hash of currentIndex + 1 except for the case in remainder objects (currentIndex === lastIndex)
        nextTrunkTransaction = transfer.trunkTransaction;

        bundle.push(transfer);

        if (isLastTransferInBundle) {
            hasFoundLastTransfer = true;
        }
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
 *   Get latest inclusion states with hashes.
 *   Filter confirmed hashes.
 *
 *   @method getConfirmedTransactionHashes
 *   @param {array} pendingTxTailHashes
 *
 *   @returns {Promise<array>}
 **/
export const getConfirmedTransactionHashes = (pendingTxTailHashes) => {
    return getLatestInclusionAsync(pendingTxTailHashes).then((states) =>
        filter(pendingTxTailHashes, (hash, idx) => states[idx]),
    );
};

/**
 *   Construct bundles, assign confirmation states and filter invalid bundles.
 *
 *   @method bundlesFromTransactionObjects
 *   @param {array} tailTransactions
 *   @param {array} transactionObjects
 *   @param {array} inclusionStates
 *
 *   @returns {array}
 **/
export const bundlesFromTransactionObjects = (tailTransactions, transactionObjects, inclusionStates) => {
    const transfers = [];

    const { unconfirmed, confirmed } = categorizeTransactionsByPersistence(tailTransactions, inclusionStates);

    // Make sure we keep a single bundle for confirmed transfers i.e. get rid of reattachments.
    const updatedUnconfirmedTailTransactions = omitBy(unconfirmed, (tx, bundle) => bundle in confirmed);

    // Map persistence to tail transactions so that they can later be mapped to other transaction objects in the bundle
    const finalTailTransactions = [
        ...map(confirmed, (tx) => ({ ...tx, persistence: true })),
        ...map(updatedUnconfirmedTailTransactions, (tx) => ({ ...tx, persistence: false })),
    ];

    each(finalTailTransactions, (tx) => {
        const bundle = constructBundle(tx, transactionObjects);

        if (iota.utils.isBundle(bundle)) {
            // Map persistence from tail transaction object to all transfer objects in the bundle
            transfers.push(map(bundle, (transfer) => ({ ...transfer, persistence: tx.persistence })));
        }
    });

    return transfers;
};

/**
 *   Get transaction objects associated with hashes, assign persistence by calling inclusion states
 *   Resolves transfers.
 *
 *   @method syncTransfers
 *   @param {array} diff
 *   @param {object} existingAccountState - Account object
 *
 *   @returns {Promise<object>} - { transfers (Updated transfers), newTransfers }
 **/
export const syncTransfers = (diff, accountState) => {
    const bundleHashes = new Set();

    const cached = {
        tailTransactions: [],
        transactionObjects: [],
    };

    return getTransactionsObjectsAsync(diff)
        .then((transactionObjects) => {
            each(transactionObjects, (transactionObject) => bundleHashes.add(transactionObject.bundle));

            // Find all transaction objects from bundle hashes
            return findTransactionObjectsAsync({ bundles: Array.from(bundleHashes) });
        })
        .then((transactionObjects) => {
            cached.transactionObjects = transactionObjects;

            const storeTailTransactions = (tx) => {
                if (tx.currentIndex === 0) {
                    cached.tailTransactions = unionBy(cached.tailTransactions, [tx], 'hash');
                }
            };

            each(cached.transactionObjects, storeTailTransactions);

            return getLatestInclusionAsync(map(cached.tailTransactions, (tx) => tx.hash));
        })
        .then((states) => {
            const newTransfers = bundlesFromTransactionObjects(
                cached.tailTransactions,
                cached.transactionObjects,
                states,
            );

            return {
                transfers: [...accountState.transfers, ...newTransfers],
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

/**
 *   Performs proof of work and updates trytes and transaction objects with nonce
 *
 *   @method performPow
 *   @param {function} powFn
 *   @param {array} trytes
 *   @param {string} trunkTransaction
 *   @param {string} branchTransaction
 *   @param {integer} [minWeightMagnitude = 14]
 *   @returns {promise<object>}
 **/
export const performPow = (
    powFn,
    trytes,
    trunkTransaction,
    branchTransaction,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    if (!isFunction(powFn)) {
        throw new Error(Errors.POW_FUNCTION_UNDEFINED);
    }

    const transactionObjects = map(trytes, (transactionTrytes) =>
        assign({}, iota.utils.transactionObject(transactionTrytes), {
            attachmentTimestamp: Date.now(),
            attachmentTimestampLowerBound: 0,
            attachmentTimestampUpperBound: (Math.pow(3, 27) - 1) / 2,
        }),
    );

    // Order transaction objects in descending to make sure it starts from remainder object.
    const sortedTransactionObjects = orderBy(transactionObjects, 'currentIndex', ['desc']);

    return reduce(
        sortedTransactionObjects,
        (promise, transaction, index) => {
            return promise.then((result) => {
                // Assign parent transactions (trunk and branch)
                // Starting from the remainder transaction object (index = 0 in sortedTransactionObjects)
                // - When index === 0 i.e. remainder transaction object
                //    * Assign trunkTransaction with provided trunk transaction from (getTransactionsToApprove)
                //    * Assign branchTransaction with provided branch transaction from (getTransactionsToApprove)
                // - When index > 0 i.e. not remainder transaction objects
                //    * Assign trunkTransaction with hash of previous transaction object
                //    * Assign branchTransaction with provided trunk transaction from (getTransactionsToApprove)
                const withParentTransactions = assign({}, transaction, {
                    trunkTransaction: index ? head(result.transactionObjects).hash : trunkTransaction,
                    branchTransaction: index ? trunkTransaction : branchTransaction,
                });

                const transactionTryteString = iota.utils.transactionTrytes(withParentTransactions);

                return powFn(transactionTryteString, minWeightMagnitude).then((nonce) => {
                    const trytesWithNonce = transactionTryteString.substr(0, 2673 - nonce.length).concat(nonce);
                    const transactionObjectWithNonce = iota.utils.transactionObject(trytesWithNonce);

                    result.trytes.unshift(trytesWithNonce);
                    result.transactionObjects.unshift(transactionObjectWithNonce);

                    return result;
                });
            });
        },
        Promise.resolve({ trytes: [], transactionObjects: [] }),
    );
};

/**
 *   Finds latest transaction hashes for unspent addresses.
 *
 *   IMPORTANT: This function should always be used after the account is synced.
 *
 *   @method getTransactionHashesForUnspentAddresses
 *   @param {object} addressData
 *
 *   @returns {Promise<array>}.
 **/
export const getTransactionHashesForUnspentAddresses = (addressData) => {
    const unspentAddresses = getUnspentAddressesSync(addressData);

    if (isEmpty(unspentAddresses)) {
        return Promise.resolve([]);
    }

    return findTransactionsAsync({ addresses: unspentAddresses });
};

/**
 *   Finds latest pending transaction hashes for spent addresses.
 *
 *   IMPORTANT: This function should always be used after the account is sycnced.
 *
 *   @method getPendingTransactionHashesForSpentAddresses
 *   @param {array} transfers
 *   @param {object} addressData
 *
 *   @returns {Promise<array>}
 **/
export const getPendingTransactionHashesForSpentAddresses = (transfers, addressData) => {
    const pendingTransfers = filterConfirmedTransfers(transfers);

    const spentAddressesWithPendingTransfers = getSpentAddressesWithPendingTransfersSync(pendingTransfers, addressData);

    if (isEmpty(spentAddressesWithPendingTransfers)) {
        return Promise.resolve([]);
    }

    return findTransactionsAsync({ addresses: spentAddressesWithPendingTransfers });
};

export const getLatestTransactionHashes = (transfers, addresses) => {
    return Promise.all([
        getTransactionHashesForUnspentAddresses(addresses),
        getPendingTransactionHashesForSpentAddresses(transfers, addresses),
    ]).then((hashes) => {
        const [txHashesForUnspentAddresses, pendingTxHashesForSpentAddresses] = hashes;

        return { txHashesForUnspentAddresses, pendingTxHashesForSpentAddresses };
    });
};
