import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import clone from 'lodash/clone';
import get from 'lodash/get';
import keys from 'lodash/keys';
import each from 'lodash/each';
import find from 'lodash/find';
import findKey from 'lodash/findKey';
import findIndex from 'lodash/findIndex';
import head from 'lodash/head';
import has from 'lodash/has';
import isObject from 'lodash/isObject';
import isNumber from 'lodash/isNumber';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
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
import nativeBindings from './nativeBindings';
import { getBalancesSync, accumulateBalance } from './addresses';
import {
    getBalancesAsync,
    getTransactionsObjectsAsync,
    getLatestInclusionAsync,
    findTransactionObjectsAsync,
    getTransactionsToApproveAsync,
    attachToTangleAsync,
    storeAndBroadcastAsync,
    isPromotable,
    promoteTransactionAsync,
    replayBundleAsync,
} from './extendedApi';
import i18next from '../../libs/i18next.js';
import {
    convertFromTrytes,
    EMPTY_HASH_TRYTES,
    EMPTY_TRANSACTION_MESSAGE,
    VALID_ADDRESS_WITHOUT_CHECKSUM_REGEX,
} from './utils';
import Errors from './../errors';

/**
 * Gets total transfer value from a bundle
 *
 * @method getTransferValue
 * @param {array} inputs
 * @param {array} outputs
 * @param {array} addresses
 *
 * @returns {number}
 */
export const getTransferValue = (inputs, outputs, addresses) => {
    const remainderValue = get(
        find(outputs, (output) => output.currentIndex === output.lastIndex && output.lastIndex !== 0),
        'value',
    );

    const ownInputs = filter(inputs, (input) => includes(addresses, input.address));
    const inputsValue = reduce(inputs, (acc, input) => acc + Math.abs(input.value), 0);

    return size(ownInputs)
        ? inputsValue - remainderValue
        : reduce(
              filter(outputs, (output) => includes(addresses, output.address)),
              (acc, output) => acc + output.value,
              0,
          );
};

/**
 * Finds transaction message from a bundle.
 *
 * @method computeTransactionMessage
 * @param {array} bundle
 *
 * @returns {string}
 */
export const computeTransactionMessage = (bundle) => {
    let message = EMPTY_TRANSACTION_MESSAGE;

    each(bundle, (tx) => {
        message = convertFromTrytes(tx.signatureMessageFragment);

        if (message !== EMPTY_TRANSACTION_MESSAGE) {
            return false;
        }
    });

    return message;
};

/**
 * Finds a promotable (consistent & above max depth) tail transaction
 *
 * @method findPromotableTail
 * @param {string} [provider]
 *
 * @returns {function(array, number): Promise<object|boolean>}
 */
export const findPromotableTail = (provider) => (tails, idx) => {
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

    return isPromotable(provider)(get(thisTail, 'hash'))
        .then((state) => {
            if (state === true && isAboveMaxDepth(get(thisTail, 'attachmentTimestamp'))) {
                return thisTail;
            }

            idx += 1;
            return findPromotableTail(provider)(tailsAboveMaxDepth, idx);
        })
        .catch(() => false);
};

/**
 * Check if attachment timestamp on transaction is above max depth (~11 minutes)
 *
 * @method isAboveMaxDepth
 * @param {number} attachmentTimestamp
 *
 * @returns {boolean}
 */
export const isAboveMaxDepth = (attachmentTimestamp) => {
    return attachmentTimestamp < Date.now() && Date.now() - attachmentTimestamp < 11 * 60 * 1000;
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
 *   @param {number} [value]
 *   @param {string} [message]
 *   @param {object} addressData
 *   @param {string} [tag='TRINITY']
 *
 *   @returns {array} Transfer object
 **/
export const prepareTransferArray = (address, value, message, addressData, tag = DEFAULT_TAG) => {
    const firstAddress = findKey(addressData, { index: 0 });

    if (!firstAddress) {
        throw new Error(Errors.EMPTY_ADDRESS_DATA);
    }

    const trytesConvertedMessage = iota.utils.toTrytes(message);
    const transfer = {
        address,
        value,
        message: trytesConvertedMessage,
        tag,
    };

    const isZeroValueTransaction = value === 0;

    if (isZeroValueTransaction) {
        return iota.utils.noChecksum(address) in addressData
            ? [transfer]
            : [transfer, assign({}, transfer, { address: firstAddress })];
    }

    return [transfer];
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
              inputs: categorisedBundle.inputs,
              outputs: categorisedBundle.outputs,
          }
        : {
              inputs: categorisedBundle.inputs,
              outputs: filter(
                  categorisedBundle.outputs,
                  (output) => includes(addresses, output.address) || isRemainder(output),
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
    const categorisedBundle = categoriseBundleByInputsOutputs(bundle, addresses);
    const value = getTransferValue(categorisedBundle.inputs, categorisedBundle.outputs, addresses);

    if (value === 0) {
        return (
            !includes(addresses, get(categorisedBundle.outputs, '[0].address')) &&
            includes(addresses, get(categorisedBundle.outputs, '[1].address'))
        );
    }
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
 *   @param {string} provider
 *
 *   @returns {function(object): Promise<boolean>}
 **/
export const isValidTransactionAsync = (provider) => (transaction) => {
    const knownTransactionBalanceOnInputs = reduce(transaction.inputs, (acc, input) => acc + Math.abs(input.value), 0);

    return getBalancesAsync(provider)(
        map(transaction.inputs, (input) => input.address),
        DEFAULT_BALANCES_THRESHOLD,
    ).then((balances) => {
        const latestBalanceOnInputs = accumulateBalance(map(balances.balances, Number));

        return knownTransactionBalanceOnInputs <= latestBalanceOnInputs;
    });
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
 *   @param {string} provider
 *
 *   @returns {function(array): Promise<array>}
 **/
export const filterInvalidTransactionsAsync = (provider) => (transactions) => {
    return reduce(
        transactions,
        (promise, transaction) => {
            return promise.then((result) => {
                return isValidTransactionAsync(provider)(transaction).then((isValid) => {
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
 *   @param {string} provider
 *
 *   @returns {function(array, object, string): Promise<object>}
 **/
export const prepareForAutoPromotion = (provider) => (transfers, addressData, account) => {
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
    return filterInvalidTransactionsAsync(provider)(incomingValueTransactions).then((validIncomingTransactions) => {
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
 *   @param {string} provider
 *
 *   @returns {function(array): Promise<array>}
 **/
export const getConfirmedTransactionHashes = (provider) => (transactionsHashes) => {
    if (isEmpty(transactionsHashes)) {
        return Promise.resolve([]);
    }

    return getLatestInclusionAsync(provider)(transactionsHashes).then((states) =>
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
    const transaction = get(bundle, '[0]');
    const bundleHash = transaction.bundle;
    const { inputs, outputs } = categoriseBundleByInputsOutputs(bundle, addresses);

    return {
        ...pick(transaction, ['bundle', 'timestamp', 'attachmentTimestamp']),
        inputs,
        outputs,
        persistence,
        incoming: isReceivedTransfer(bundle, addresses),
        transferValue: getTransferValue(inputs, outputs, addresses),
        message: computeTransactionMessage(bundle),
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
 *   @param {string} provider
 *
 *   @returns {function(array, object): Promise<object>}
 **/
export const syncTransfers = (provider) => (diff, accountState) => {
    const bundleHashes = new Set();
    const outOfSyncTransactionHashes = [];

    const cached = {
        tailTransactions: [],
        transactionObjects: [],
    };

    return getTransactionsObjectsAsync(provider)(diff)
        .then((transactionObjects) => {
            each(transactionObjects, (transactionObject, idx) => {
                if (transactionObject.bundle !== EMPTY_HASH_TRYTES) {
                    bundleHashes.add(transactionObject.bundle);
                } else {
                    outOfSyncTransactionHashes.push(diff[idx]);
                }
            });

            // Find all transaction objects for bundle hashes
            return findTransactionObjectsAsync(provider)({ bundles: Array.from(bundleHashes) });
        })
        .then((transactionObjects) => {
            cached.transactionObjects = transactionObjects;
            cached.tailTransactions = pickNewTailTransactions(cached.transactionObjects, accountState.transfers);

            return getLatestInclusionAsync(provider)(map(cached.tailTransactions, (tx) => tx.hash));
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
 *   @method isStillAValidTransaction
 *   @param {string} [provider]
 *
 *   @returns {function(object, object): Promise<object>}
 **/
export const isStillAValidTransaction = (provider) => (transaction, addressData) => {
    return transaction.incoming
        ? isValidTransactionAsync(provider)(transaction)
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
 *   @param {string} [provider]
 *
 *   @returns {function(array, object): Promise<object>}
 **/
export const filterInvalidPendingTransactions = (provider) => (transactions, addressData) => {
    const pendingTransactions = filter(transactions, (tx) => !tx.persistence);

    if (isEmpty(pendingTransactions)) {
        return Promise.resolve([]);
    }

    const { incoming, outgoing } = categoriseTransactions(pendingTransactions);

    const validOutgoingTransfers = filterInvalidTransactionsSync(outgoing, addressData);

    return filterInvalidTransactionsAsync(provider)(incoming).then((validIncomingTransfers) => {
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

                return powFn(transactionTryteString, minWeightMagnitude)
                    .then((nonce) => {
                        const trytesWithNonce = transactionTryteString.substr(0, 2673 - nonce.length).concat(nonce);

                        result.trytes.unshift(trytesWithNonce);

                        return nativeBindings.asyncTransactionObject(trytesWithNonce);
                    })
                    .then((tx) => {
                        result.transactionObjects.unshift(tx);

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

/**
 *   Retry failed transaction with signed inputs
 *
 *   @method retryFailedTransaction
 *   @param {string} [provider]
 *
 *   @returns {function(array, function): Promise<object>}
 **/
export const retryFailedTransaction = (provider) => (transactionObjects, powFn) => {
    const convertToTrytes = (tx) => iota.utils.transactionTrytes(tx);

    const cached = {
        transactionObjects: cloneDeep(transactionObjects),
        trytes: map(transactionObjects, convertToTrytes),
    };

    const isInvalidTransactionHash = ({ hash }) =>
        hash === EMPTY_HASH_TRYTES || !iota.utils.isTransactionHash(hash, DEFAULT_MIN_WEIGHT_MAGNITUDE);

    // Verify if all transaction objects have valid hash
    // Proof of work was not performed correctly if any transaction has invalid hash
    if (some(transactionObjects, isInvalidTransactionHash)) {
        // If proof of work failed, select new tips and retry
        return getTransactionsToApproveAsync(provider)()
            .then(({ trunkTransaction, branchTransaction }) => {
                return attachToTangleAsync(provider, powFn)(trunkTransaction, branchTransaction, cached.trytes);
            })
            .then(({ trytes, transactionObjects }) => {
                cached.trytes = trytes;
                cached.transactionObjects = transactionObjects;

                return storeAndBroadcastAsync(provider)(cached.trytes).then(() => cached);
            });
    }

    return storeAndBroadcastAsync(provider)(cached.trytes).then(() => cached);
};

/**
 *  Returns string for current transaction's status
 *
 *   @method computeStatusText
 *
 *   @param {array} outputs
 *   @param {boolean} persistence
 *   @param {boolean} incoming
 *   @return {string} Status text
 */

export const computeStatusText = (outputs, persistence, incoming) => {
    const receiveStatus = persistence ? i18next.t('global:received') : i18next.t('global:receiving');
    const sendStatus = persistence ? i18next.t('global:sent') : i18next.t('global:sending');
    return incoming ? receiveStatus : sendStatus;
};

/**
 * Formats transaction list to accommodate for sending to self
 * @param {Array} transactions
 * @return {Array} Formatted transaction list
 */
export const formatRelevantTransactions = (transactions, addresses) => {
    const relevantTransactions = [];
    map(transactions, (transaction) => {
        if (!transaction.incoming && transaction.outputs.every((tx) => addresses.includes(tx.address))) {
            const sendToSelfTransaction = clone(transaction);
            sendToSelfTransaction.incoming = true;
            relevantTransactions.push(sendToSelfTransaction);
            relevantTransactions.push(transaction);
        } else {
            relevantTransactions.push(transaction);
        }
    });
    return relevantTransactions;
};

/**
 * Formats recent transactions to accommodate for sending to self
 *
 * @method formatRelevantRecentTransactions
 * @param {array} transactions
 * @param {array} addresses
 *
 * @return {array} Formatted recent transactions
 */
export const formatRelevantRecentTransactions = (transactions, addresses) => {
    const relevantTransactions = [];
    map(transactions, (transaction) => {
        if (relevantTransactions.length < 4) {
            if (!transaction.incoming && transaction.outputs.every((tx) => addresses.includes(tx.address))) {
                const sendToSelfTransaction = clone(transaction);
                sendToSelfTransaction.incoming = true;
                relevantTransactions.push(sendToSelfTransaction);
                if (relevantTransactions.length < 4) {
                    relevantTransactions.push(transaction);
                }
            } else {
                relevantTransactions.push(transaction);
            }
        }
    });
    return relevantTransactions;
};

/**
 * Sort transaction trytes array
 *
 * @method sortTransactionTrytesArray
 * @param {array} trytes
 * @param {string} [sortBy]
 * @param {string} [order]
 *
 */
export const sortTransactionTrytesArray = (trytes, sortBy = 'currentIndex', order = 'desc') => {
    const sortableTransactionKeys = ['currentIndex', 'lastIndex', 'timestamp', 'attachmentTimestamp'];

    if (!includes(sortableTransactionKeys, sortBy) || !includes(['desc', 'asc'], order)) {
        return trytes;
    }

    const transactionObjects = map(trytes, (tryteString) =>
        iota.utils.transactionObject(
            tryteString,
            // Pass in null hash trytes to avoid computing transaction hash.
            EMPTY_HASH_TRYTES,
        ),
    );

    return map(orderBy(transactionObjects, [sortBy], [order]), iota.utils.transactionTrytes);
};

/**
 *   Checks if a transfer object is valid
 *
 *   @method isValidTransfer
 *   @param {object} transfer
 *
 *   @returns {boolean}
 **/
export const isValidTransfer = (transfer) => {
    return (
        isObject(transfer) && VALID_ADDRESS_WITHOUT_CHECKSUM_REGEX.test(transfer.address) && isNumber(transfer.value)
    );
};

/**
 *   Checks if a bundle is funded
 *   Note: Does not validate signatures or other bundle attributes
 *
 *   @method isFundedBundle
 *   @param {string} [provider]
 *
 *   @returns {function(array): Promise<boolean>}
 **/

export const isFundedBundle = (provider) => (bundle) => {
    if (isEmpty(bundle)) {
        return Promise.reject(new Error(Errors.EMPTY_BUNDLE_PROVIDED));
    }

    return getBalancesAsync(provider)(
        reduce(bundle, (acc, tx) => (tx.value < 0 ? [...acc, tx.address] : acc), []),
    ).then((balances) => {
        return (
            reduce(bundle, (acc, tx) => (tx.value < 0 ? acc + Math.abs(tx.value) : acc), 0) <=
            accumulateBalance(map(balances.balances, Number))
        );
    });
};

/**
 * Categorises inclusion states by bundle hash of tail transactions
 * Note: Make sure the order of tail transactions -> inclusion states is preserved before using this function
 *
 * @method categoriseInclusionStatesByBundleHash
 * @param {array} transactions
 * @param {array} inclusionStates
 *
 * @returns {object}
 */
export const categoriseInclusionStatesByBundleHash = (transactions, inclusionStates) =>
    transform(
        transactions,
        (acc, tailTransaction, idx) => {
            if (tailTransaction.bundle in acc) {
                acc[tailTransaction.bundle] = acc[tailTransaction.bundle] || inclusionStates[idx];
            } else {
                acc[tailTransaction.bundle] = inclusionStates[idx];
            }
        },
        {},
    );

/**
 * Promotes a transaction till it gets confirmed.
 *
 * @method promoteTransactionTilConfirmed
 * @param {string} [provider]
 * @param {function} [powFn]
 *
 * @returns {function(array, [number]): Promise<object>}
 */
export const promoteTransactionTilConfirmed = (provider, powFn) => (tailTransactions, promotionsAttemptsLimit = 50) => {
    let promotionAttempt = 0;
    const tailTransactionsClone = cloneDeep(tailTransactions);

    const _promote = (tailTransaction) => {
        promotionAttempt += 1;

        if (promotionAttempt === promotionsAttemptsLimit) {
            return Promise.reject(new Error(Errors.PROMOTIONS_LIMIT_REACHED));
        }

        // Before every promotion, check confirmation state
        return getLatestInclusionAsync(provider)(map(tailTransactionsClone, (tx) => tx.hash)).then((states) => {
            if (some(states, (state) => state === true)) {
                // If any of the tail is confirmed, return the "confirmed" tail transaction object.
                return find(tailTransactionsClone, (_, idx) => idx === findIndex(states, (state) => state === true));
            }

            const { hash, attachmentTimestamp } = tailTransaction;

            // Promote transaction
            return promoteTransactionAsync(provider, powFn)(hash)
                .then(() => {
                    return _promote(tailTransaction);
                })
                .catch((error) => {
                    const isTransactionInconsistent = includes(error.message, Errors.TRANSACTION_IS_INCONSISTENT);

                    if (isTransactionInconsistent) {
                        // Temporarily disable reattachments if transaction is still above max depth
                        return !isAboveMaxDepth(attachmentTimestamp)
                            ? _reattachAndPromote()
                            : _promote(tailTransaction);
                    }

                    throw error;
                });
        });
    };

    const _reattachAndPromote = () => {
        // Grab first tail transaction hash
        const tailTransaction = head(tailTransactionsClone);
        const hash = tailTransaction.hash;

        return replayBundleAsync(provider, powFn)(hash).then((reattachment) => {
            const tailTransaction = find(reattachment, { currentIndex: 0 });
            // Add newly reattached transaction
            tailTransactionsClone.push(tailTransaction);

            return _promote(tailTransaction);
        });
    };

    return findPromotableTail(provider)(tailTransactionsClone, 0).then((consistentTail) => {
        if (has(consistentTail, 'hash')) {
            return _promote(consistentTail);
        }

        return _reattachAndPromote();
    });
};
