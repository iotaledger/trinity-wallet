import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import keys from 'lodash/keys';
import each from 'lodash/each';
import find from 'lodash/find';
import head from 'lodash/head';
import has from 'lodash/has';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import pick from 'lodash/pick';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import filter from 'lodash/filter';
import some from 'lodash/some';
import size from 'lodash/size';
import reduce from 'lodash/reduce';
import transform from 'lodash/transform';
import difference from 'lodash/difference';
import unionBy from 'lodash/unionBy';
import orderBy from 'lodash/orderBy';
import pickBy from 'lodash/pickBy';
import {
    DEFAULT_TAG,
    DEFAULT_BALANCES_THRESHOLD,
    DEFAULT_MIN_WEIGHT_MAGNITUDE,
    BUNDLE_OUTPUTS_THRESHOLD,
} from '../../config';
import { iota } from './index';
import { getBalancesSync, accumulateBalance } from './addresses';
import {
    getBalancesAsync,
    getTransactionsObjectsAsync,
    getLatestInclusionAsync,
    findTransactionObjectsAsync,
    getTransactionsToApproveAsync,
    attachToTangleAsync,
    storeAndBroadcastAsync,
} from './extendedApi';
import { convertFromTrytes } from './utils';
import Errors from './../errors';

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

export const getFirstConsistentTail = (tails, idx) => {
    let tailsAboveMaxDepth = [];

    if (idx === 0) {
        tailsAboveMaxDepth = filter(tails, (tx) => isAboveMaxDepth(tx.attachmentTimestamp)).sort(
            (a, b) => b.attachmentTimestamp - a.attachmentTimestamp,
        );
    }

    if (!tailsAboveMaxDepth[idx]) {
        return Promise.resolve(false);
    }

    const thisTail = tailsAboveMaxDepth[idx];

    return iota.api
        .isPromotable(get(thisTail, 'hash'))
        .then((state) => {
            if (state && isAboveMaxDepth(get(thisTail, 'attachmentTimestamp'))) {
                return thisTail;
            }

            idx += 1;
            return getFirstConsistentTail(tailsAboveMaxDepth, idx);
        })
        .catch(() => false);
};

export const isAboveMaxDepth = (timestamp) => {
    return timestamp < Date.now() && Date.now() - parseInt(timestamp) < 11 * 60 * 1000;
};

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

    const isSendingToFirstOwnAddress = firstOwnAddress === address;

    if (isZeroValue && !isSendingToFirstOwnAddress) {
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
 *   Categorises transactions as confirmed/unconfirmed
 *
 *   @method categoriseTransactionsByPersistence
 *   @param {array} transactions - Array of transfer objects
 *   @param {array} states
 *   @returns {object} Categorised transactions by confirmed/unconfirmed.
 **/
export const categoriseTransactionsByPersistence = (transactions, states) => {
    if (!isArray(states) || !isArray(transactions)) {
        return {
            confirmed: [],
            unconfirmed: [],
        };
    }

    return reduce(
        transactions,
        (acc, tx, idx) => {
            if (states[idx]) {
                acc.confirmed.push(tx);
            } else {
                acc.unconfirmed.push(tx);
            }

            return acc;
        },
        {
            confirmed: [],
            unconfirmed: [],
        },
    );
};

/**
 *   Categorises transactions as incoming/outgoing
 *
 *   @method categoriseTransactions
 *   @param {array} transactions - Array of transfer objects
 *   @returns {object} Categorised transactions by incoming/outgoing.
 **/
export const categoriseTransactions = (transactions) => {
    return transform(transactions, (acc, tx) => (tx.incoming ? acc.incoming.push(tx) : acc.outgoing.push(tx)), {
        incoming: [],
        outgoing: [],
    });
};

/**
 *   Transforms transaction objects to a dictionary with keys as bundle hashes.
 *
 *   @method transformTransactionsByBundleHash
 *   @param {array} transactions - Array of transfer objects
 *   @returns {object}
 **/
export const transformTransactionsByBundleHash = (transactions) => {
    return transform(
        transactions,
        (acc, tx) => {
            // In case this is a reattachment
            // Keep the latest one
            if (tx.bundle in acc && acc[tx.bundle].attachmentTimestamp < tx.attachmentTimestamp) {
                acc[tx.bundle] = tx;
            } else {
                acc[tx.bundle] = tx;
            }
        },
        {},
    );
};

/**
 *   Categorise bundle by inputs and outputs.
 *
 *   @method categoriseBundleByInputsOutputs
 *   @param {array} bundle
 *   @param {array} addresses
 *   @param {number} outputsThreshold
 *
 *   @returns {object}
 **/
export const categoriseBundleByInputsOutputs = (bundle, addresses, outputsThreshold = BUNDLE_OUTPUTS_THRESHOLD) => {
    const isRemainder = (tx) => tx.currentIndex === tx.lastIndex && tx.lastIndex !== 0;

    const categorisedBundle = transform(
        bundle,
        (acc, tx) => {
            const meta = {
                ...pick(tx, ['address', 'value', 'hash', 'currentIndex', 'lastIndex']),
                checksum: iota.utils.addChecksum(tx.address).slice(tx.address.length),
            };

            if (tx.value < 0 && !isRemainder(tx)) {
                acc.inputs.push(meta);
            } else {
                acc.outputs.push(meta);
            }
        },
        {
            inputs: [],
            outputs: [],
        },
    );

    const removeUnnecessaryProps = (object) => omit(object, ['currentIndex', 'lastIndex']);

    // Note: Ideally we should categorise all outputs
    // But some bundles esp carriota field donation bundles are huge
    // and on devices with restricted storage storing them can cause the problem.

    // Now this does not mean that large bundles should not be validated.
    // Categorisation should always happen after the bundle is construction and validated.

    // This step can lead to an inconsistent behavior if addresses aren't properly synced
    // That is why as a safety check remainder transaction objects would always be considered as outputs

    // TODO: But to make this process more secure, always sync addresses during poll
    return size(categorisedBundle.outputs) <= outputsThreshold
        ? {
              inputs: map(categorisedBundle.inputs, removeUnnecessaryProps),
              outputs: map(categorisedBundle.outputs, removeUnnecessaryProps),
          }
        : {
              inputs: map(categorisedBundle.inputs, removeUnnecessaryProps),
              outputs: map(
                  filter(
                      categorisedBundle.outputs,
                      (output) => includes(addresses, output.address) || isRemainder(output),
                  ),
                  removeUnnecessaryProps,
              ),
          };
};

/**
 *   Checks if the bundle is outgoing
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
 *   Checks if the bundle is incoming
 *
 *   @method isReceivedTransfer
 *   @param {array} bundle
 *   @param {array} addresses
 *   @returns {boolean}
 **/
export const isReceivedTransfer = (bundle, addresses) => !isSentTransfer(bundle, addresses);

/**
 *   Checks if transaction's input addresses still have enough balance.
 *
 *   IMPORTANT: Since, inputs balances would be checked against locally stored addresses data,
 *   this function should only be used after account is synced.
 *
 *   @method isValidTransactionSync
 *   @param {object} transaction
 *   @param {object} addressData
 *   @returns {boolean}
 **/
export const isValidTransactionSync = (transaction, addressData) => {
    const knownTransactionBalanceOnInputs = reduce(transaction.inputs, (acc, input) => acc + Math.abs(input.value), 0);

    const balances = getBalancesSync(map(transaction.inputs, (input) => input.address), addressData);
    const latestBalanceOnInputs = accumulateBalance(balances);

    return knownTransactionBalanceOnInputs <= latestBalanceOnInputs;
};

/**
 *   Communicates with the tangle and checks if transaction's input addresses still have enough balance.
 *
 *   @method isValidTransactionAsync
 *   @param {object} transaction
 *   @returns {boolean}
 **/
export const isValidTransactionAsync = (transaction) => {
    const knownTransactionBalanceOnInputs = reduce(transaction.inputs, (acc, input) => acc + Math.abs(input.value), 0);

    return getBalancesAsync(map(transaction.inputs, (input) => input.address), DEFAULT_BALANCES_THRESHOLD).then(
        (balances) => {
            const latestBalanceOnInputs = accumulateBalance(map(balances.balances, Number));

            return knownTransactionBalanceOnInputs <= latestBalanceOnInputs;
        },
    );
};

/**
 *   Filters out invalid transactions (Transactions that no longer have enough balance on their input addresses)
 *
 *   IMPORTANT: Since, inputs balances would be checked against locally stored addresses data,
 *   this function should only be used after account is synced.
 *
 *   @method filterInvalidTransactionsSync
 *   @param {array} transactions
 *   @param {object} addressData
 *   @returns {array}
 **/
export const filterInvalidTransactionsSync = (transactions, addressData) => {
    const validTransactions = [];

    each(transactions, (transaction) => {
        const isValidTransaction = isValidTransactionSync(transaction, addressData);

        if (isValidTransaction) {
            validTransactions.push(transaction);
        }
    });

    return validTransactions;
};

/**
 *   Communicates with the tangle and filters out invalid transactions,
 *   (Transactions that no longer have enough balance on their input addresses)
 *
 *   @method filterInvalidTransactionsAsync
 *   @param {array} transactions
 *   @returns {promise<array>}
 **/
export const filterInvalidTransactionsAsync = (transactions) => {
    return reduce(
        transactions,
        (promise, transaction) => {
            return promise.then((result) => {
                return isValidTransactionAsync(transaction).then((isValid) => {
                    if (isValid) {
                        result.push(transaction);
                    }

                    return result;
                });
            });
        },
        Promise.resolve([]),
    );
};

/**
 *  Filters out transactions that are:
 *     - Pending
 *     - Zero value
 *     - No longer valid (Input addresses don't have enough balance)
 *
 *  Transforms filtered transactions by bundle hashes so that they can be picked up for promotion
 *
 *   @method prepareForAutoPromotion
 *   @param {array} transfers
 *   @param {object} addressData
 *   @param {string} account
 *
 *   @returns {Promise<object>}
 **/
export const prepareForAutoPromotion = (transfers, addressData, account) => {
    const pendingTransactions = filter(transfers, (tx) => !tx.persistence);

    if (isEmpty(pendingTransactions)) {
        return Promise.resolve({});
    }

    const byBundleHash = (acc, transaction) => {
        const isValueTransfer = transaction.value !== 0;

        if (isValueTransfer) {
            const bundleHash = transaction.bundle;

            acc[bundleHash] = map(transaction.tailTransactions, (meta) => ({ ...meta, account }));
        }
    };

    const { incoming, outgoing } = categoriseTransactions(pendingTransactions);

    // Remove all invalid transactions from outgoing transfers
    const validOutgoingTransactions = filterInvalidTransactionsSync(outgoing, addressData);

    // Transform all valid outgoing transactions by bundles
    const validOutgoingTailTransactions = transform(validOutgoingTransactions, byBundleHash, {});

    // categoriseTransactions categorises zero value transactions to incoming.
    const incomingValueTransactions = filter(incoming, (transaction) => transaction.transferValue !== 0);

    // Remove all invalid incoming transfers
    return filterInvalidTransactionsAsync(incomingValueTransactions).then((validIncomingTransactions) => {
        // Transform all valid received transactions by bundles
        const validIncomingTailTransactions = transform(validIncomingTransactions, byBundleHash, {});

        return { ...validOutgoingTailTransactions, ...validIncomingTailTransactions };
    });
};

/**
 *  Get all tail transactions hashes for pending transactions.
 *
 *   @method getPendingTxTailsHashes
 *   @param {object} normalisedTransactions
 *
 *   @returns {array}
 **/
export const getPendingTxTailsHashes = (normalisedTransactions) => {
    const grabHashes = (acc, transaction) => {
        if (!transaction.persistence) {
            acc.push(...map(transaction.tailTransactions, (tx) => tx.hash));
        }

        return acc;
    };

    return reduce(normalisedTransactions, grabHashes, []);
};

/**
 *  Marks pending transfers as confirmed.
 *
 *   @method markTransfersConfirmed
 *   @param {object} normalisedTransfers
 *   @param {array} confirmedTransactionsHashes - Array of transaction hashes
 *
 *   @returns {object}
 **/
export const markTransfersConfirmed = (normalisedTransfers, confirmedTransactionsHashes) => {
    if (isEmpty(confirmedTransactionsHashes)) {
        return normalisedTransfers;
    }

    return mapValues(normalisedTransfers, (transfer) => ({
        ...transfer,
        persistence: transfer.persistence
            ? transfer.persistence
            : some(transfer.tailTransactions, (tx) => includes(confirmedTransactionsHashes, tx.hash)),
    }));
};

/**
 *   Accepts tail transaction object and all transaction objects from bundle hashes
 *   Then construct a bundle by following trunk transaction from tail transaction object.
 *
 *   @method constructBundle
 *   @param {object} tailTransaction
 *   @param {array} allTransactionObjects
 *
 *   @returns {array}
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
 *   Get latest inclusion states with hashes.
 *   Filter confirmed hashes.
 *
 *   @method getConfirmedTransactionHashes
 *   @param {array} transactionsHashes
 *
 *   @returns {Promise<array>}
 **/
export const getConfirmedTransactionHashes = (transactionsHashes) => {
    if (isEmpty(transactionsHashes)) {
        return Promise.resolve([]);
    }

    return getLatestInclusionAsync(transactionsHashes).then((states) =>
        filter(transactionsHashes, (hash, idx) => states[idx]),
    );
};

/**
 *   Construct bundles, validates, assign confirmation states and Normalises them.
 *
 *   @method constructNormalisedBundles
 *   @param {array} tailTransactions
 *   @param {array} transactionObjects
 *   @param {array} inclusionStates
 *   @param {array} addresses
 *
 *   @returns {array}
 **/
export const constructNormalisedBundles = (tailTransactions, transactionObjects, inclusionStates, addresses) => {
    const { unconfirmed, confirmed } = categoriseTransactionsByPersistence(tailTransactions, inclusionStates);

    const normalisedUnconfirmedTransfers = transformTransactionsByBundleHash(unconfirmed);
    const normalisedConfirmedTransfers = transformTransactionsByBundleHash(confirmed);

    // Make sure we keep a single bundle for confirmed transfers i.e. get rid of reattachments.
    const updatedUnconfirmedTailTransactions = omitBy(
        normalisedUnconfirmedTransfers,
        (tx, bundle) => bundle in normalisedConfirmedTransfers,
    );

    // Map persistence to tail transactions so that they can later be mapped to other transaction objects in the bundle
    const finalTailTransactions = [
        ...map(normalisedConfirmedTransfers, (tx) => ({ ...tx, persistence: true })),
        ...map(updatedUnconfirmedTailTransactions, (tx) => ({ ...tx, persistence: false })),
    ];

    const transfers = {};

    each(finalTailTransactions, (tx) => {
        const bundle = constructBundle(tx, transactionObjects);

        if (iota.utils.isBundle(bundle)) {
            transfers[tx.bundle] = normaliseBundle(bundle, addresses, tailTransactions, tx.persistence);
        }
    });

    return transfers;
};

/**
 *   Normalises bundle.
 *
 *   @method normaliseBundle
 *   @param {array} bundle
 *   @param {array} addresses
 *   @param {array} tailTransactions
 *   @param {boolean} persistence
 *
 *   @returns {object} - Normalised bundle
 **/
export const normaliseBundle = (bundle, addresses, tailTransactions, persistence) => {
    const transfer = getRelevantTransfer(bundle, addresses);
    const bundleHash = transfer.bundle;

    return {
        ...pick(transfer, ['hash', 'bundle', 'timestamp', 'attachmentTimestamp']),
        ...categoriseBundleByInputsOutputs(bundle, addresses),
        persistence,
        incoming: isReceivedTransfer(bundle, addresses),
        transferValue: getTransferValue(bundle, addresses),
        message: convertFromTrytes(transfer.signatureMessageFragment),
        tailTransactions: map(filter(tailTransactions, (tx) => tx.bundle === bundleHash), (tx) => ({
            hash: tx.hash,
            attachmentTimestamp: tx.attachmentTimestamp,
        })),
    };
};

/**
 *   Get transaction objects associated with hashes, assign persistence by calling inclusion states
 *   Resolves transfers.
 *
 *   @method syncTransfers
 *   @param {array} diff
 *   @param {object} accountState - Account object
 *
 *   @returns {Promise<object>} - { transfers (Updated transfers), newTransfers }
 **/
export const syncTransfers = (diff, accountState) => {
    const bundleHashes = new Set();
    const outOfSyncTransactionHashes = [];

    const cached = {
        tailTransactions: [],
        transactionObjects: [],
    };

    return getTransactionsObjectsAsync(diff)
        .then((transactionObjects) => {
            each(transactionObjects, (transactionObject, idx) => {
                if (transactionObject.bundle !== '9'.repeat(81)) {
                    bundleHashes.add(transactionObject.bundle);
                } else {
                    outOfSyncTransactionHashes.push(diff[idx]);
                }
            });

            // Find all transaction objects from bundle hashes
            return findTransactionObjectsAsync({ bundles: Array.from(bundleHashes) });
        })
        .then((transactionObjects) => {
            cached.transactionObjects = transactionObjects;
            cached.tailTransactions = pickNewTailTransactions(cached.transactionObjects, accountState.transfers);

            return getLatestInclusionAsync(map(cached.tailTransactions, (tx) => tx.hash));
        })
        .then((states) => {
            const newNormalisedTransfers = constructNormalisedBundles(
                cached.tailTransactions,
                cached.transactionObjects,
                states,
                keys(accountState.addresses),
            );

            const transfers = mergeNewTransfers(newNormalisedTransfers, accountState.transfers);

            return {
                transfers,
                newNormalisedTransfers,
                outOfSyncTransactionHashes,
            };
        });
};

/**
 *  Merge latest normalised transactions into existing ones
 *
 *   @method mergeNewTransfers
 *   @param {object} newNormalisedTransfers
 *   @param {object} existingNormalisedTransfers
 *
 *   @returns {object} - Updated normalised transfers
 **/
export const mergeNewTransfers = (newNormalisedTransfers, existingNormalisedTransfers) => {
    const transfers = cloneDeep(existingNormalisedTransfers);

    // Check if new transfer found is a reattachment i.e. there is already a bundle instance stored locally.
    // If its a reattachment, just add its tail transaction hash and attachmentTimestamp
    // Otherwise, add it as a new transfer
    each(newNormalisedTransfers, (transfer) => {
        const bundle = transfer.bundle;
        if (bundle in existingNormalisedTransfers) {
            transfers[bundle].tailTransactions = unionBy(
                existingNormalisedTransfers[bundle].tailTransactions,
                transfer.tailTransactions,
                'hash',
            );
        } else {
            transfers[bundle] = transfer;
        }
    });

    return transfers;
};

/**
 *   Accepts tail transaction object categorised by bundles and a list of tail transaction hashes
 *   Returns all relevant bundle hashes for tail transaction hashes
 *
 *   @method getBundleHashesForNewlyConfirmedTransactions
 *   @param {object} unconfirmedBundleTails - { bundleHash: [{}, {}]}
 *   @param {array} confirmedTransactionsHashes - List of tail transaction hashes
 *
 *   @returns {array} bundleHashes - List of bundle hashes
 **/
export const getBundleHashesForNewlyConfirmedTransactions = (unconfirmedBundleTails, confirmedTransactionsHashes) => {
    const grabBundleHashes = (acc, tailTransactions, bundleHash) => {
        if (some(tailTransactions, (tailTransaction) => includes(confirmedTransactionsHashes, tailTransaction.hash))) {
            acc.push(bundleHash);
        }
    };

    return transform(unconfirmedBundleTails, grabBundleHashes, []);
};

/**
 *   Accepts bundle hash, transfers and addressData and determines if the bundle associated
 *   with bundle hash is valid or not.
 *
 *   @method isValidForPromotion
 *   @param {object} transaction
 *   @param {object} addressData
 *
 *   @returns {Promise<boolean>} - Promise that resolves whether the bundle is valid or not
 **/
export const isStillAValidTransaction = (transaction, addressData) => {
    return transaction.incoming
        ? isValidTransactionAsync(transaction)
        : Promise.resolve(isValidTransactionSync(transaction, addressData));
};

/**
 *
 *   with bundle hash is valid or not.
 *
 *   @method getTransactionsDiff
 *   @param {array} existingHashes
 *   @param {array} newHashes
= *
 *   @returns {array}
 **/
export const getTransactionsDiff = (existingHashes, newHashes) => {
    return difference(newHashes, existingHashes);
};

/**
 *   Filters all invalid transactions from all pending transactions.
 *
 *   @method filterInvalidPendingTransactions
 *   @param {array} transactions
 *   @param {object} addressData
 *   @returns {Promise<array>}
 **/
export const filterInvalidPendingTransactions = (transactions, addressData) => {
    const pendingTransactions = filter(transactions, (tx) => !tx.persistence);

    if (isEmpty(pendingTransactions)) {
        return Promise.resolve([]);
    }

    const { incoming, outgoing } = categoriseTransactions(pendingTransactions);

    const validOutgoingTransfers = filterInvalidTransactionsSync(outgoing, addressData);

    return filterInvalidTransactionsAsync(incoming).then((validIncomingTransfers) => {
        return [...validOutgoingTransfers, ...validIncomingTransfers];
    });
};

/**
 *   Performs proof of work and updates trytes and transaction objects with nonce.
 *
 *   @method performPow
 *   @param {function} powFn
 *   @param {array} trytes
 *   @param {string} trunkTransaction
 *   @param {string} branchTransaction
 *   @param {number} [minWeightMagnitude = 14]
 *   @returns {Promise}
 **/
export const performPow = (
    powFn,
    trytes,
    trunkTransaction,
    branchTransaction,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
) => {
    if (!isFunction(powFn)) {
        return Promise.reject(Errors.POW_FUNCTION_UNDEFINED);
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
 * Grab transaction hashes for own addresses from a transaction.
 *
 * @param {object} normalisedTransaction
 * @param {object} addressData
 * @returns {array}
 */
export const getOwnTransactionHashes = (normalisedTransaction, addressData) => {
    return [
        ...map(filter(normalisedTransaction.inputs, (input) => input.address in addressData), (input) => input.hash),
        ...map(
            filter(normalisedTransaction.outputs, (output) => output.address in addressData),
            (output) => output.hash,
        ),
    ];
};

/**
 * Takes addresses and transactions and returns outgoing transfers for those addresses.
 *
 * @param {array} addresses
 * @param {object} transactions
 * @returns {array}
 */
export const getOutgoingTransfersForAddresses = (addresses, transactions) => {
    const selectedTransactions = new Set();
    each(transactions, (tx) => {
        each(tx.inputs, (input) => {
            if (addresses.indexOf(input.address) > -1) {
                selectedTransactions.add(tx);
            }
        });
    });
    return Array.from(selectedTransactions);
};

/**
 * Takes addresses and transactions and returns pending outgoing transfers for those addresses.
 *
 * @param {array} addresses
 * @param {object} transfers
 * @returns {array}
 */
export const getPendingOutgoingTransfersForAddresses = (addresses, transfers) => {
    const addressesWithBalance = pickBy(addresses, (address) => address.balance > 0);
    const relevantTransfers = filter(transfers, (tx) => !tx.persistence);

    return getOutgoingTransfersForAddresses(keys(addressesWithBalance), relevantTransfers);
};

/**
 *   Picks newly found tail transactions from transaction objects
 *
 *   @method pickNewTailTransactions
 *   @param {array} transactionObjects
 *   @param {object} existingNormalisedTransfers
 *
 *   @returns {array}
 **/
export const pickNewTailTransactions = (transactionObjects, existingNormalisedTransfers) => {
    const tailTransactions = [];

    const storeUnseenTailTransactions = (tx) => {
        if (tx.currentIndex === 0) {
            const isSeenBundle = has(existingNormalisedTransfers, tx.bundle);
            const seenTailTransactionsHashes = isSeenBundle
                ? map(existingNormalisedTransfers[tx.bundle].tailTransactions, (transaction) => transaction.hash)
                : [];

            // If this tail transaction is from a seen bundle
            // Check if its a new tail transaction
            // In case its not a new tail transaction, ignore it.
            if (isSeenBundle) {
                if (!includes(seenTailTransactionsHashes, tx.hash)) {
                    tailTransactions.push(tx);
                }
            } else {
                tailTransactions.push(tx);
            }
        }
    };

    each(transactionObjects, storeUnseenTailTransactions);

    return tailTransactions;
};

export const retryFailedTransaction = (transactionObjects, powFn, shouldOffloadPow) => {
    const convertToTrytes = (tx) => iota.utils.transactionTrytes(tx);

    const fakeNonce = '9'.repeat(27);
    const hasFakeNonce = (tx) => tx.nonce !== fakeNonce;

    const cached = {
        transactionObjects: cloneDeep(transactionObjects),
        trytes: map(transactionObjects, convertToTrytes),
    };

    if (some(transactionObjects, hasFakeNonce)) {
        return getTransactionsToApproveAsync()
            .then(({ trunkTransaction, branchTransaction }) => {
                return shouldOffloadPow
                    ? attachToTangleAsync(trunkTransaction, branchTransaction, cached.trytes)
                    : performPow(powFn, cached.trytes, trunkTransaction, branchTransaction);
            })
            .then(({ trytes, transactionObjects }) => {
                cached.trytes = trytes;
                cached.transactionObjects = transactionObjects;

                return storeAndBroadcastAsync(cached.trytes).then(() => cached);
            });
    }

    return storeAndBroadcastAsync(cached.trytes).then(() => cached);
};
