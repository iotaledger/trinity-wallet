import head from 'lodash/head';
import find from 'lodash/find';
import get from 'lodash/get';
import map from 'lodash/map';
import filter from 'lodash/filter';
import some from 'lodash/some';
import size from 'lodash/size';
import { iota } from '../libs/iota';
import {
    replayBundleAsync,
    promoteTransactionAsync,
    prepareTransfersAsync,
    getTransactionsToApproveAsync,
    attachToTangleAsync,
    storeAndBroadcastAsync,
    isNodeSynced,
} from '../libs/iota/extendedApi';
import {
    selectedAccountStateFactory,
    getRemotePoWFromState,
    selectFirstAddressFromAccountFactory,
    getFailedBundleHashesForSelectedAccount,
} from '../selectors/accounts';
import { setNextStepAsActive, reset as resetProgress } from './progress';
import { clearSendFields } from './ui';
import {
    isStillAValidTransaction,
    getFirstConsistentTail,
    prepareTransferArray,
    filterInvalidPendingTransactions,
    performPow,
    getPendingOutgoingTransfersForAddresses,
    retryFailedTransaction as retry,
} from '../libs/iota/transfers';
import {
    syncAccountAfterReattachment,
    syncAccount,
    syncAccountAfterSpending,
    syncAccountOnValueTransactionFailure,
    syncAccountOnSuccessfulRetryAttempt,
} from '../libs/iota/accounts';
import {
    updateAccountAfterReattachment,
    updateAccountInfoAfterSpending,
    syncAccountBeforeManualPromotion,
    markBundleBroadcastStatusComplete,
    markBundleBroadcastStatusPending,
} from './accounts';
import { shouldAllowSendingToAddress, getAddressesUptoRemainder, isAnyAddressSpent } from '../libs/iota/addresses';
import {
    getStartingSearchIndexToPrepareInputs,
    getUnspentInputs,
    getSpentAddressesFromTransactions,
} from '../libs/iota/inputs';
import {
    generateAlert,
    generateTransferErrorAlert,
    generatePromotionErrorAlert,
    generateNodeOutOfSyncErrorAlert,
} from './alerts';
import i18next from '../i18next.js';
import Errors from '../libs/errors';
import { DEFAULT_DEPTH } from '../config';

export const ActionTypes = {
    PROMOTE_TRANSACTION_REQUEST: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
    PROMOTE_TRANSACTION_SUCCESS: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_SUCCESS',
    PROMOTE_TRANSACTION_ERROR: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_ERROR',
    SEND_TRANSFER_REQUEST: 'IOTA/TRANSFERS/SEND_TRANSFER_REQUEST',
    SEND_TRANSFER_SUCCESS: 'IOTA/TRANSFERS/SEND_TRANSFER_SUCCESS',
    SEND_TRANSFER_ERROR: 'IOTA/TRANSFERS/SEND_TRANSFER_ERROR',
    RETRY_FAILED_TRANSACTION_REQUEST: 'IOTA/TRANSFERS/RETRY_FAILED_TRANSACTION_REQUEST',
    RETRY_FAILED_TRANSACTION_SUCCESS: 'IOTA/TRANSFERS/RETRY_FAILED_TRANSACTION_SUCCESS',
    RETRY_FAILED_TRANSACTION_ERROR: 'IOTA/TRANSFERS/RETRY_FAILED_TRANSACTION_ERROR',
};

const promoteTransactionRequest = (payload) => ({
    type: ActionTypes.PROMOTE_TRANSACTION_REQUEST,
    payload,
});

const promoteTransactionSuccess = () => ({
    type: ActionTypes.PROMOTE_TRANSACTION_SUCCESS,
});

const promoteTransactionError = () => ({
    type: ActionTypes.PROMOTE_TRANSACTION_ERROR,
});

export const sendTransferRequest = () => ({
    type: ActionTypes.SEND_TRANSFER_REQUEST,
});

export const sendTransferSuccess = (payload) => ({
    type: ActionTypes.SEND_TRANSFER_SUCCESS,
    payload,
});

export const sendTransferError = () => ({
    type: ActionTypes.SEND_TRANSFER_ERROR,
});

export const retryFailedTransactionRequest = () => ({
    type: ActionTypes.RETRY_FAILED_TRANSACTION_REQUEST,
});

export const retryFailedTransactionSuccess = (payload) => ({
    type: ActionTypes.RETRY_FAILED_TRANSACTION_SUCCESS,
    payload,
});

export const retryFailedTransactionError = () => ({
    type: ActionTypes.RETRY_FAILED_TRANSACTION_ERROR,
});

/**
 *   On successful transfer, update store, generate alert and clear send text fields
 *   @method completeTransfer
 *   @param {object} payload - sending status, address, transfer value
 *
 *   @returns {function} dispatch
 **/
export const completeTransfer = (payload) => {
    return (dispatch) => {
        dispatch(clearSendFields());
        dispatch(sendTransferSuccess(payload));
    };
};

/**
 *  Promote transaction
 *
 *   @method promoteTransaction
 *   @param {string} bundleHash
 *   @param {string} accountName
 *   @param {function} powFn
 *
 *   @returns {function} dispatch
 **/
export const promoteTransaction = (bundleHash, accountName, powFn) => (dispatch, getState) => {
    dispatch(promoteTransactionRequest(bundleHash));
    const remotePoW = getState().settings.remotePoW;
    if (!remotePoW) {
        dispatch(
            generateAlert(
                'info',
                i18next.t('global:promotingTransaction'),
                i18next.t('global:deviceMayBecomeUnresponsive'),
            ),
        );
    }
    let accountState = null;
    let chainBrokenInternally = false;

    return syncAccount(selectedAccountStateFactory(accountName)(getState()))
        .then((newAccountState) => {
            accountState = newAccountState;

            dispatch(syncAccountBeforeManualPromotion(accountState));

            const transaction = accountState.transfers[bundleHash];

            if (transaction.persistence) {
                chainBrokenInternally = true;
                throw new Error(Errors.TRANSACTION_ALREADY_CONFIRMED);
            }

            return isStillAValidTransaction(transaction, accountState.addresses);
        })
        .then((isValid) => {
            if (!isValid) {
                chainBrokenInternally = true;
                throw new Error(Errors.BUNDLE_NO_LONGER_VALID);
            }

            const tailTransactions = accountState.transfers[bundleHash].tailTransactions;

            return getFirstConsistentTail(tailTransactions, 0);
        })
        .then((consistentTail) => {
            const shouldOffloadPow = getRemotePoWFromState(getState());

            return dispatch(
                forceTransactionPromotion(
                    accountName,
                    consistentTail,
                    accountState.transfers[bundleHash].tailTransactions,
                    true,
                    shouldOffloadPow ? null : powFn,
                ),
            );
        })
        .then((hash) => {
            dispatch(
                generateAlert(
                    'success',
                    i18next.t('global:promoted'),
                    i18next.t('global:promotedExplanation', { hash }),
                ),
            );

            return dispatch(promoteTransactionSuccess());
        })
        .catch((err) => {
            if (err.message === Errors.BUNDLE_NO_LONGER_VALID && chainBrokenInternally) {
                dispatch(generateAlert('error', i18next.t('global:promotionError'), i18next.t('global:noLongerValid')));
            } else if (err.message.includes(Errors.ATTACH_TO_TANGLE_UNAVAILABLE)) {
                dispatch(
                    generateAlert(
                        'error',
                        i18next.t('global:attachToTangleUnavailable'),
                        i18next.t('global:attachToTangleUnavailableExplanationShort'),
                        10000,
                    ),
                );
            } else if (err.message === Errors.TRANSACTION_ALREADY_CONFIRMED && chainBrokenInternally) {
                dispatch(
                    generateAlert(
                        'success',
                        i18next.t('global:transactionAlreadyConfirmed'),
                        i18next.t('global:transactionAlreadyConfirmedExplanation'),
                    ),
                );
            } else {
                dispatch(generatePromotionErrorAlert(err));
            }

            return dispatch(promoteTransactionError());
        });
};

/**
 *   Accepts a consistent tail boolean with all tails associated with a bundle.
 *   - Case (when no consistent tail)
 *      > Replays bundle and promotes with the reattachment's transaction hash
 *   - Case (when there is a consistent tail)
 *      > Just directly promote transaction with the consistent tail hash
 *
 *   @method forceTransactionPromotion
 *   @param {string} accountName
 *   @param {boolean | object} consistentTail
 *   @param {array} tails
 *   @param {boolean} shouldGenerateAlert
 *   @param {function} powFn
 *   @param {number} depth
 *
 *   @returns {function} dispatch
 **/
export const forceTransactionPromotion = (
    accountName,
    consistentTail,
    tails,
    shouldGenerateAlert,
    powFn = null,
    depth = DEFAULT_DEPTH,
) => (dispatch, getState) => {
    if (!consistentTail) {
        // Grab hash from the top tail to replay
        const topTx = head(tails);
        const hash = topTx.hash;

        return replayBundleAsync(hash, powFn).then((reattachment) => {
            if (shouldGenerateAlert) {
                dispatch(
                    generateAlert(
                        'success',
                        i18next.t('global:reattached'),
                        i18next.t('global:reattachedExplanation', { hash }),
                        2500,
                    ),
                );
            }

            const existingAccountState = selectedAccountStateFactory(accountName)(getState());

            const { newState } = syncAccountAfterReattachment(accountName, reattachment, existingAccountState);

            // Update local store
            dispatch(updateAccountAfterReattachment(newState));

            const tailTransaction = find(reattachment, { currentIndex: 0 });

            return promoteTransactionAsync(tailTransaction.hash, powFn);
        });
    }

    return promoteTransactionAsync(consistentTail.hash, powFn, depth)
        .then((txs) => txs)
        .catch((error) => {
            const isReferenceTxOld = error.message.includes(Errors.REFERENCE_TRANSACTION_TOO_OLD);
            const hasDefaultDepth = depth === DEFAULT_DEPTH;

            if (isReferenceTxOld && hasDefaultDepth) {
                return dispatch(
                    forceTransactionPromotion(
                        accountName,
                        consistentTail,
                        tails,
                        shouldGenerateAlert,
                        powFn,
                        depth * 2,
                    ),
                );
            } else if (isReferenceTxOld && !hasDefaultDepth) {
                return dispatch(forceTransactionPromotion(accountName, null, tails, shouldGenerateAlert, powFn));
            }

            throw new Error(error.message);
        });
};

/**
 * Sends a transaction
 * @param  {string} seed
 * @param  {string} receiveAddress
 * @param  {number} value
 * @param  {string} message
 * @param  {string} accountName
 * @param  {function} powFn
 * @param  {function} genFn
 *
 * @returns {function} dispatch
 */
export const makeTransaction = (seed, receiveAddress, value, message, accountName, powFn, genFn) => (
    dispatch,
    getState,
) => {
    dispatch(sendTransferRequest());

    const address = size(receiveAddress) === 90 ? receiveAddress : iota.utils.addChecksum(receiveAddress);

    // Use a local variable to keep track if the promise chain was interrupted internally.
    let chainBrokenInternally = false;

    // Keep track if the inputs are signed
    let hasSignedInputs = false;

    // Initialize account state
    // Reassign with latest state when account is synced
    let accountState = selectedAccountStateFactory(accountName)(getState());
    let transferInputs = [];

    // Security checks are not necessary for zero value transfers
    // Have them wrapped in a separate private function so in case it is a value transfer,
    // it can be chained together with the rest of the promise chain.
    const withPreTransactionSecurityChecks = () => {
        // Checking node's health
        dispatch(setNextStepAsActive());

        return isNodeSynced()
            .then((isSynced) => {
                if (isSynced) {
                    // Validating receive address
                    dispatch(setNextStepAsActive());

                    // Make sure that the address a user is about to send to is not already used.
                    // err -> Since shouldAllowSendingToAddress consumes wereAddressesSpentFrom endpoint
                    // Omit input preparation in case the address is already spent from.
                    return shouldAllowSendingToAddress([address]);
                }

                throw new Error(Errors.NODE_NOT_SYNCED);
            })
            .then((shouldAllowSending) => {
                if (shouldAllowSending) {
                    // Syncing account
                    dispatch(setNextStepAsActive());

                    return syncAccount(accountState, seed, true, genFn, true);
                }

                chainBrokenInternally = true;
                throw new Error(Errors.KEY_REUSE);
            })
            .then((newState) => {
                // Assign latest account but do not update the local store yet.
                // Only update the local store with updated account information after this transaction is successfully completed.
                accountState = newState;

                const valueTransfers = filter(map(accountState.transfers, (tx) => tx), (tx) => tx.transferValue !== 0);

                return filterInvalidPendingTransactions(valueTransfers, accountState.addresses);
            })
            .then((filteredTransfers) => {
                const { addresses, transfers } = accountState;
                const startIndex = getStartingSearchIndexToPrepareInputs(addresses);
                const spentAddressesFromTransactions = getSpentAddressesFromTransactions(transfers);

                // Preparing inputs
                dispatch(setNextStepAsActive());

                return getUnspentInputs(
                    addresses,
                    spentAddressesFromTransactions,
                    filteredTransfers,
                    startIndex,
                    value,
                    null,
                );
            })
            .then((inputs) => {
                // totalBalance: total balance associated with addresses.
                // Contains balance from addresses regardless of the fact they are spent from.
                // If its less than the value user is about to send to, it will generate an alert with Not enough balance.
                if (get(inputs, 'totalBalance') < value) {
                    chainBrokenInternally = true;
                    throw new Error(Errors.NOT_ENOUGH_BALANCE);

                    // availableBalance: balance after filtering out addresses that are spent and also addresses with incoming transfers..
                    // Contains only spendable balance
                    // Note: At this point, we could leverage the change addresses and allow user making a transfer on top from those.
                } else if (get(inputs, 'availableBalance') < value) {
                    chainBrokenInternally = true;
                    const addresses = accountState.addresses;
                    const transfers = accountState.transfers;
                    const pendingOutgoingTransfers = getPendingOutgoingTransfersForAddresses(addresses, transfers);

                    if (size(pendingOutgoingTransfers)) {
                        throw new Error(Errors.ADDRESS_HAS_PENDING_TRANSFERS);
                    } else {
                        if (size(get(inputs, 'spentAddresses'))) {
                            throw new Error(Errors.FUNDS_AT_SPENT_ADDRESSES);
                        } else if (size(get(inputs, 'addressesWithIncomingTransfers'))) {
                            throw new Error(Errors.INCOMING_TRANSFERS);
                        }
                    }
                }

                // Do not allow receiving address to be one of the user's own input addresses.
                const isSendingToOwnAddress = some(
                    get(inputs, 'inputs'),
                    (input) => input.address === iota.utils.noChecksum(address),
                );

                if (isSendingToOwnAddress) {
                    chainBrokenInternally = true;
                    throw new Error(Errors.CANNOT_SEND_TO_OWN_ADDRESS);
                }

                transferInputs = get(inputs, 'inputs');

                return getAddressesUptoRemainder(accountState.addresses, seed, genFn, [
                    // Make sure inputs are blacklisted
                    ...map(transferInputs, (input) => input.address),
                    // When sending to one of own addresses
                    // Make sure receive address is also blacklisted
                    iota.utils.noChecksum(receiveAddress),
                ]);
            })
            .then(({ remainderAddress, addressDataUptoRemainder }) => {
                // getAddressesUptoRemainder returns the latest unused address as the remainder address
                // Also returns updated address data including new address data for the intermediate addresses.
                // E.g: If latest locally stored address has an index 50 and remainder address was calculated to be
                // at index 53 it would include address data for 51, 52 and 53.
                accountState.addresses = addressDataUptoRemainder;

                return {
                    inputs: transferInputs,
                    address: remainderAddress,
                };
            });
    };

    const isZeroValue = value === 0;

    const cached = {
        trytes: [],
        transactionObjects: [],
    };

    const promise = isZeroValue ? () => Promise.resolve(null) : withPreTransactionSecurityChecks;

    return (
        promise()
            // If we are making a zero value transaction, options would be null
            // Otherwise, it would be a dictionary with inputs and remainder address
            // Forward options to prepareTransfersAsync as is, because it contains a null check
            .then((options) => {
                const firstAddress = selectFirstAddressFromAccountFactory(accountName)(getState());
                const transfer = prepareTransferArray(address, value, message, firstAddress);

                // Preparing transfers
                dispatch(setNextStepAsActive());

                return prepareTransfersAsync(seed, transfer, options);
            })
            .then((trytes) => {
                if (!isZeroValue) {
                    hasSignedInputs = true;
                }

                cached.trytes = trytes;

                const convertToTransactionObjects = (tryteString) =>
                    iota.utils.transactionObject(tryteString, '9'.repeat(81));
                cached.transactionObjects = map(cached.trytes, convertToTransactionObjects);

                // Getting transactions to approve
                dispatch(setNextStepAsActive());

                return getTransactionsToApproveAsync();
            })
            .then(({ trunkTransaction, branchTransaction }) => {
                const shouldOffloadPow = getRemotePoWFromState(getState());

                // Proof of work
                dispatch(setNextStepAsActive());

                return shouldOffloadPow
                    ? attachToTangleAsync(trunkTransaction, branchTransaction, cached.trytes)
                    : performPow(powFn, cached.trytes, trunkTransaction, branchTransaction);
            })
            .then(({ trytes, transactionObjects }) => {
                cached.trytes = trytes;
                cached.transactionObjects = transactionObjects;

                // Broadcasting
                dispatch(setNextStepAsActive());

                return storeAndBroadcastAsync(cached.trytes);
            })
            .then(() => {
                const { newState } = syncAccountAfterSpending(
                    accountName,
                    cached.transactionObjects,
                    accountState,
                    !isZeroValue,
                );

                dispatch(updateAccountInfoAfterSpending(newState));

                // Progress summary
                dispatch(setNextStepAsActive());
                if (isZeroValue) {
                    dispatch(
                        generateAlert(
                            'success',
                            i18next.t('global:messageSent'),
                            i18next.t('global:messageSentMessage'),
                            20000,
                        ),
                    );
                } else {
                    dispatch(
                        generateAlert(
                            'success',
                            i18next.t('global:transferSent'),
                            i18next.t('global:transferSentMessage'),
                            20000,
                        ),
                    );
                }

                setTimeout(() => {
                    dispatch(completeTransfer({ address, value }));
                    dispatch(resetProgress());
                }, 5000);
            })
            .catch((error) => {
                dispatch(sendTransferError());

                if (hasSignedInputs) {
                    const { newState } = syncAccountOnValueTransactionFailure(cached.transactionObjects, accountState);

                    // Temporarily mark this transaction as failed.
                    // As the inputs were signed and already exposed to the network
                    dispatch(
                        markBundleBroadcastStatusPending({
                            accountName,
                            bundleHash: head(cached.transactionObjects).bundle,
                            transactionObjects: cached.transactionObjects,
                        }),
                    );

                    dispatch(updateAccountInfoAfterSpending(newState));
                    // Clear send screen text fields
                    dispatch(clearSendFields());

                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:rebroadcastError'),
                            i18next.t('global:signedTrytesBroadcastErrorExplanation'),
                        ),
                    );
                }

                const message = error.message;

                if (message === Errors.NODE_NOT_SYNCED) {
                    return dispatch(generateNodeOutOfSyncErrorAlert());
                } else if (message === Errors.KEY_REUSE && chainBrokenInternally) {
                    return dispatch(
                        generateAlert('error', i18next.t('global:keyReuse'), i18next.t('global:keyReuseError')),
                    );
                } else if (message === Errors.NOT_ENOUGH_BALANCE && chainBrokenInternally) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:balanceError'),
                            i18next.t('global:balanceErrorMessage'),
                            20000,
                        ),
                    );
                } else if (message === Errors.ADDRESS_HAS_PENDING_TRANSFERS && chainBrokenInternally) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:pleaseWait'),
                            i18next.t('global:pleaseWaitTransferExplanation'),
                            20000,
                        ),
                    );
                } else if (message === Errors.FUNDS_AT_SPENT_ADDRESSES && chainBrokenInternally) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:spentAddressExplanation'),
                            i18next.t('global:discordInformation'),
                            20000,
                        ),
                    );
                } else if (message === Errors.INCOMING_TRANSFERS && chainBrokenInternally) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:pleaseWait'),
                            i18next.t('global:pleaseWaitIncomingTransferExplanation'),
                            20000,
                        ),
                    );
                } else if (message === Errors.CANNOT_SEND_TO_OWN_ADDRESS && chainBrokenInternally) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:cannotSendToOwn'),
                            i18next.t('global:cannotSendToOwnExplanation'),
                            20000,
                        ),
                    );
                } else if (message.includes(Errors.ATTACH_TO_TANGLE_UNAVAILABLE)) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:attachToTangleUnavailable'),
                            i18next.t('global:attachToTangleUnavailableExplanation'),
                            20000,
                        ),
                    );
                }

                return dispatch(generateTransferErrorAlert(error));
            })
    );
};

/**
 * Retries a transaction that previously failed to send.
 * @param  {string} accountName
 * @param  {string} bundleHash
 * @param  {function} powFn
 *
 * @returns {function} dispatch
 */
export const retryFailedTransaction = (accountName, bundleHash, powFn) => (dispatch, getState) => {
    const existingAccountState = selectedAccountStateFactory(accountName)(getState());
    const existingFailedTransactionsForThisAccount = getFailedBundleHashesForSelectedAccount(getState());
    const shouldOffloadPow = getRemotePoWFromState(getState());

    dispatch(retryFailedTransactionRequest());

    return isAnyAddressSpent(existingFailedTransactionsForThisAccount[bundleHash])
        .then((isSpent) => {
            if (isSpent) {
                throw new Error(Errors.ALREADY_SPENT_FROM_ADDRESSES);
            }

            return retry(existingFailedTransactionsForThisAccount[bundleHash], powFn, shouldOffloadPow);
        })
        .then(({ transactionObjects }) => {
            dispatch(markBundleBroadcastStatusComplete({ accountName, bundleHash }));

            const { newState } = syncAccountOnSuccessfulRetryAttempt(
                accountName,
                transactionObjects,
                existingAccountState,
            );

            return dispatch(retryFailedTransactionSuccess(newState));
        })
        .catch(() => {
            dispatch(retryFailedTransactionError());
        });
};
