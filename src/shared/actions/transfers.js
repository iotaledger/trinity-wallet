import has from 'lodash/has';
import head from 'lodash/head';
import find from 'lodash/find';
import get from 'lodash/get';
import map from 'lodash/map';
import join from 'lodash/join';
import orderBy from 'lodash/orderBy';
import filter from 'lodash/filter';
import some from 'lodash/some';
import size from 'lodash/size';
import every from 'lodash/every';
import includes from 'lodash/includes';
import { iota } from '../libs/iota';
import {
    replayBundleAsync,
    promoteTransactionAsync,
    getTransactionsToApproveAsync,
    attachToTangleAsync,
    storeAndBroadcastAsync,
    isNodeSynced,
} from '../libs/iota/extendedApi';
import {
    selectedAccountStateFactory,
    getRemotePoWFromState,
    getFailedBundleHashesForSelectedAccount,
    getNodesFromState,
    getSelectedNodeFromState,
} from '../selectors/accounts';
import { withRetriesOnDifferentNodes, fetchRemoteNodes, getRandomNodes } from '../libs/iota/utils';
import { setNextStepAsActive, reset as resetProgress } from './progress';
import { clearSendFields } from './ui';
import {
    isStillAValidTransaction,
    findPromotableTail,
    prepareTransferArray,
    filterInvalidPendingTransactions,
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
import {
    shouldAllowSendingToAddress,
    getAddressesUptoRemainder,
    categoriseAddressesBySpentStatus,
} from '../libs/iota/addresses';
import { getStartingSearchIndexToPrepareInputs, getUnspentInputs } from '../libs/iota/inputs';
import {
    generateAlert,
    generateTransferErrorAlert,
    generatePromotionErrorAlert,
    generateNodeOutOfSyncErrorAlert,
    generateTransactionSuccessAlert,
} from './alerts';
import i18next from '../libs/i18next.js';
import Errors from '../libs/errors';
import { DEFAULT_RETRIES } from '../config';

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

/**
 * Dispatch when a transaction is about to be manually promoted
 *
 * @method promoteTransactionRequest
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
const promoteTransactionRequest = (payload) => ({
    type: ActionTypes.PROMOTE_TRANSACTION_REQUEST,
    payload,
});

/**
 * Dispatch when a transaction is successfully promoted
 *
 * @method promoteTransactionSuccess
 *
 * @returns {{type: {string} }}
 */
const promoteTransactionSuccess = () => ({
    type: ActionTypes.PROMOTE_TRANSACTION_SUCCESS,
});

/**
 * Dispatch when an error occurs during manual promotion
 *
 * @method promoteTransactionError
 *
 * @returns {{type: {string} }}
 */
const promoteTransactionError = () => ({
    type: ActionTypes.PROMOTE_TRANSACTION_ERROR,
});

/**
 * Dispatch when a transaction is about to be made
 *
 * @method sendTransferRequest
 *
 * @returns {{type: {string} }}
 */
export const sendTransferRequest = () => ({
    type: ActionTypes.SEND_TRANSFER_REQUEST,
});

/**
 * Dispatch when a transaction is successfully sent
 *
 * @method sendTransferSuccess
 *
 * @returns {{type: {string} }}
 */
export const sendTransferSuccess = () => ({
    type: ActionTypes.SEND_TRANSFER_SUCCESS,
});

/**
 * Dispatch when an error occurs during transaction
 *
 * @method sendTransferError
 *
 * @returns {{type: {string} }}
 */
export const sendTransferError = () => ({
    type: ActionTypes.SEND_TRANSFER_ERROR,
});

/**
 * Dispatch before a retry attempt on a failed transaction
 *
 * @method retryFailedTransactionRequest
 *
 * @returns {{type: {string} }}
 */
export const retryFailedTransactionRequest = () => ({
    type: ActionTypes.RETRY_FAILED_TRANSACTION_REQUEST,
});

/**
 * Dispatch when a failed transaction is successfully sent to the tangle
 *
 * @method retryFailedTransactionSuccess
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const retryFailedTransactionSuccess = (payload) => ({
    type: ActionTypes.RETRY_FAILED_TRANSACTION_SUCCESS,
    payload,
});

/**
 * Dispatch if an error occurs during a retry attempt to send a failed transaction to the tangle
 *
 * @method retryFailedTransactionSuccess
 *
 * @returns {{type: {string} }}
 */
export const retryFailedTransactionError = () => ({
    type: ActionTypes.RETRY_FAILED_TRANSACTION_ERROR,
});

/**
 *  On successful transfer, update store, generate alert and clear send page text fields
 *
 *  @method completeTransfer
 *
 *  @returns {function} dispatch
 **/
export const completeTransfer = () => {
    return (dispatch) => {
        dispatch(clearSendFields());
        dispatch(sendTransferSuccess());
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

    const remotePoW = getRemotePoWFromState(getState());

    if (!remotePoW) {
        dispatch(
            generateAlert(
                'info',
                i18next.t('global:promotingTransaction'),
                i18next.t('global:deviceMayBecomeUnresponsive'),
            ),
        );
    }

    let accountState = {};

    return syncAccount()(selectedAccountStateFactory(accountName)(getState()))
        .then((newAccountState) => {
            accountState = newAccountState;

            dispatch(syncAccountBeforeManualPromotion(accountState));

            const transaction = accountState.transfers[bundleHash];

            if (transaction.persistence) {
                throw new Error(Errors.TRANSACTION_ALREADY_CONFIRMED);
            }

            return isStillAValidTransaction()(transaction, accountState.addresses);
        })
        .then((isValid) => {
            if (!isValid) {
                throw new Error(Errors.BUNDLE_NO_LONGER_VALID);
            }

            const tailTransactions = accountState.transfers[bundleHash].tailTransactions;

            return findPromotableTail()(tailTransactions, 0);
        })
        .then((consistentTail) => {
            return dispatch(
                forceTransactionPromotion(
                    accountName,
                    consistentTail,
                    accountState.transfers[bundleHash].tailTransactions,
                    true,
                    // If proof of work configuration is set to remote, pass proof of work function as null
                    remotePoW ? null : powFn,
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
            if (err.message === Errors.BUNDLE_NO_LONGER_VALID) {
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
            } else if (err.message === Errors.TRANSACTION_ALREADY_CONFIRMED) {
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
 *  Tries to promote transaction. If transaction cannot be promoted, replays before promotion.
 *
 *   @method forceTransactionPromotion
 *   @param {string} accountName
 *   @param {boolean | object} consistentTail
 *   @param {array} tailTransactionHashes
 *   @param {boolean} shouldGenerateAlert
 *   @param {function} powFn
 *   @param {number} maxReplays - Maximum number of reattachments if promotion fails because of transaction inconsistency
 *   @param {number} maxPromotionAttempts - Maximum number of promotion retry attempts
 *
 *   @returns {function} dispatch
 **/
export const forceTransactionPromotion = (
    accountName,
    consistentTail,
    tailTransactionHashes,
    shouldGenerateAlert,
    powFn = null,
    maxReplays = 1,
    maxPromotionAttempts = 2,
) => (dispatch, getState) => {
    let replayCount = 0;
    let promotionAttempt = 0;

    const promote = (tailTransaction) => {
        const { hash } = tailTransaction;

        promotionAttempt += 1;

        return promoteTransactionAsync(null, powFn)(hash).catch((error) => {
            const isTransactionInconsistent = includes(error.message, Errors.TRANSACTION_IS_INCONSISTENT);

            if (
                isTransactionInconsistent &&
                // If promotion attempt on this reference (hash) hasn't exceeded maximum promotion attempts
                promotionAttempt < maxPromotionAttempts
            ) {
                // Retry promotion on same reference (hash)
                return promote(tailTransaction);
            } else if (
                isTransactionInconsistent &&
                promotionAttempt === maxPromotionAttempts &&
                // If number of reattachments haven't exceeded max reattachments
                replayCount < maxReplays
            ) {
                // Reset promotion attempt counter
                promotionAttempt = 0;

                // Reattach and try to promote with a newly reattached reference (hash)
                return reattachAndPromote();
            }

            throw error;
        });
    };

    // Reattach a transaction and promote newly reattached transaction
    const reattachAndPromote = () => {
        // Increment the reattachment's count
        replayCount += 1;
        // Grab first tail transaction hash
        const tailTransaction = head(tailTransactionHashes);
        const hash = tailTransaction.hash;

        return replayBundleAsync(null, powFn)(hash).then((reattachment) => {
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

            return promote(tailTransaction);
        });
    };

    if (has(consistentTail, 'hash')) {
        return promote(consistentTail);
    }

    return reattachAndPromote();
};

/**
 * Sends a transaction
 *
 * @param  {object} seedStore - SeedStore class object
 * @param  {string} receiveAddress
 * @param  {number} value
 * @param  {string} message
 * @param  {string} accountName
 * @param  {function} powFn
 *
 * @returns {function} dispatch
 */
export const makeTransaction = (seedStore, receiveAddress, value, message, accountName, powFn) => (
    dispatch,
    getState,
) => {
    dispatch(sendTransferRequest());

    const address = size(receiveAddress) === 90 ? receiveAddress : iota.utils.addChecksum(receiveAddress);

    // Keep track if the inputs are signed
    let hasSignedInputs = false;

    // Keep track if the created bundle is valid after inputs are signed
    let isValidBundle = false;

    // Initialize account state
    // Reassign with latest state when account is synced
    let accountState = selectedAccountStateFactory(accountName)(getState());
    let transferInputs = [];

    const withPreTransactionSecurityChecks = () => {
        // Progressbar step => (Checking node's health)
        dispatch(setNextStepAsActive());

        return isNodeSynced()
            .then((isSynced) => {
                if (isSynced) {
                    // Progressbar step => (Validating receive address)
                    dispatch(setNextStepAsActive());

                    // Make sure that the address a user is about to send to is not already used.
                    return shouldAllowSendingToAddress()([address]);
                }

                throw new Error(Errors.NODE_NOT_SYNCED);
            })
            .then((shouldAllowSending) => {
                if (shouldAllowSending) {
                    // Progressbar step => (Syncing account)
                    dispatch(setNextStepAsActive());

                    return syncAccount()(accountState, seedStore);
                }

                throw new Error(Errors.KEY_REUSE);
            })
            .then((newState) => {
                // Assign latest account but do not update the local store yet.
                // Only update the local store with updated account information after this transaction is successfully completed.
                accountState = newState;

                const valueTransfers = filter(map(accountState.transfers, (tx) => tx), (tx) => tx.transferValue !== 0);

                return filterInvalidPendingTransactions()(valueTransfers, accountState.addresses);
            })
            .then((filteredTransfers) => {
                const { addresses, transfers } = accountState;
                const startIndex = getStartingSearchIndexToPrepareInputs(addresses);

                // Progressbar step => (Preparing inputs)
                dispatch(setNextStepAsActive());

                // Prepare inputs.
                return getUnspentInputs()(
                    // Latest address data
                    addresses,
                    // Normalised transactions list
                    map(transfers, (tx) => tx),
                    // Pending value transactions
                    filteredTransfers,
                    // Start index for address (for input selection)
                    startIndex,
                    // Transfer value
                    value,
                    // Inputs
                    null,
                );
            })
            .then((inputs) => {
                // Input selection prepares inputs sequentially starting from the first address with balance
                // If total balance is less than transfer value, do not allow transaction.
                if (get(inputs, 'totalBalance') < value) {
                    throw new Error(Errors.NOT_ENOUGH_BALANCE);

                    // availableBalance: balance after filtering out addresses that are spent and also addresses with incoming transfers..
                    // Contains only spendable balance
                    // Note: At this point, we could leverage the change addresses and allow user making a transfer on top from those.
                } else if (get(inputs, 'availableBalance') < value) {
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

                        throw new Error(Errors.SOMETHING_WENT_WRONG_DURING_INPUT_SELECTION);
                    }
                }

                // Do not allow receiving address to be one of the user's own input addresses.
                const isSendingToAnyInputAddress = some(
                    get(inputs, 'inputs'),
                    (input) => input.address === iota.utils.noChecksum(address),
                );

                if (isSendingToAnyInputAddress) {
                    throw new Error(Errors.CANNOT_SEND_TO_OWN_ADDRESS);
                }

                transferInputs = get(inputs, 'inputs');

                return getAddressesUptoRemainder()(
                    accountState.addresses,
                    map(accountState.transfers, (tx) => tx),
                    seedStore,
                    [
                        // Make sure inputs are blacklisted
                        ...map(transferInputs, (input) => input.address),
                        // Make sure receive address is blacklisted
                        iota.utils.noChecksum(receiveAddress),
                    ],
                );
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

    const withInputs = isZeroValue ? () => Promise.resolve(null) : withPreTransactionSecurityChecks;

    return (
        withInputs()
            // If we are making a zero value transaction, options would be null
            // Otherwise, it would be a dictionary with inputs and remainder address
            // Forward options to prepareTransfersAsync as is, because it contains a null check
            .then((options) => {
                const transfer = prepareTransferArray(address, value, message, accountState.addresses);

                // Progressbar step => (Preparing transfers)
                dispatch(setNextStepAsActive());

                return seedStore.prepareTransfers(transfer, options);
            })
            .then((trytes) => {
                if (!isZeroValue) {
                    hasSignedInputs = true;
                }

                cached.trytes = trytes;

                const convertToTransactionObjects = (tryteString) => iota.utils.transactionObject(tryteString);
                cached.transactionObjects = map(cached.trytes, convertToTransactionObjects);

                if (iota.utils.isBundle(cached.transactionObjects.slice().reverse())) {
                    isValidBundle = true;
                    // Progressbar step =>  (Getting transactions to approve)
                    dispatch(setNextStepAsActive());

                    return getTransactionsToApproveAsync()();
                }

                throw new Error(Errors.INVALID_BUNDLE);
            })
            .then(({ trunkTransaction, branchTransaction }) => {
                const shouldOffloadPow = getRemotePoWFromState(getState());

                // Progressbar step => (Proof of work)
                dispatch(setNextStepAsActive());

                const performLocalPow = () =>
                    attachToTangleAsync(null, powFn)(trunkTransaction, branchTransaction, cached.trytes);

                if (!shouldOffloadPow) {
                    return performLocalPow();
                }

                // If proof of work configuration is set to remote PoW
                // Make an attempt to offload proof of work to remote
                // If network call fails:
                // 1) Find nodes with PoW enabled
                // 2) Auto retry offloading PoW
                // 3) If auto retry fails, perform proof of work locally
                return attachToTangleAsync()(trunkTransaction, branchTransaction, cached.trytes).catch(() => {
                    dispatch(
                        generateAlert(
                            'info',
                            i18next.t('global:pleaseWait'),
                            `${i18next.t('global:problemPerformingProofOfWork')} ${i18next.t(
                                'global:tryingAgainWithDifferentNode',
                            )}`,
                            20000,
                        ),
                    );

                    // Find nodes with proof of work enabled
                    return fetchRemoteNodes()
                        .then((remoteNodes) => {
                            const nodesWithPowEnabled = map(
                                filter(remoteNodes, (node) => node.pow),
                                (nodeWithPoWEnabled) => nodeWithPoWEnabled.node,
                            );

                            return withRetriesOnDifferentNodes(
                                getRandomNodes(nodesWithPowEnabled, DEFAULT_RETRIES, [
                                    getSelectedNodeFromState(getState()),
                                ]),
                            )(attachToTangleAsync)(trunkTransaction, branchTransaction, cached.trytes);
                        })
                        .then(({ result }) => result)
                        .catch(() => {
                            // If outsourced proof of work fails on all nodes, fallback to local proof of work.
                            dispatch(
                                generateAlert(
                                    'info',
                                    i18next.t('global:pleaseWait'),
                                    `${i18next.t('global:problemPerformingProofOfWork')} ${i18next.t(
                                        'global:tryingAgainWithLocalPoW',
                                    )}`,
                                ),
                            );

                            return performLocalPow();
                        });
                });
            })
            .then(({ trytes, transactionObjects }) => {
                cached.trytes = trytes;
                cached.transactionObjects = transactionObjects;

                // Progressbar step => (Broadcasting)
                dispatch(setNextStepAsActive());

                // Make an attempt to broadcast transaction on selected node
                // If it fails, auto retry broadcast on random nodes
                const selectedNode = getSelectedNodeFromState(getState());
                const randomNodes = [
                    selectedNode,
                    ...getRandomNodes(getNodesFromState(getState()), DEFAULT_RETRIES, [selectedNode]),
                ];

                return withRetriesOnDifferentNodes(
                    randomNodes,
                    // Failure callbacks.
                    // Only pass one, as we just want an alert on first broadcast failure
                    () =>
                        dispatch(
                            generateAlert(
                                'info',
                                i18next.t('global:pleaseWait'),
                                `${i18next.t('global:problemSendingYourTransaction')} ${i18next.t(
                                    'global:tryingAgainWithDifferentNode',
                                )}`,
                                20000,
                            ),
                        ),
                )(storeAndBroadcastAsync)(cached.trytes);
            })
            .then(() => {
                return syncAccountAfterSpending()(
                    seedStore,
                    accountName,
                    cached.transactionObjects,
                    accountState,
                    !isZeroValue,
                );
            })
            .then(({ newState }) => {
                dispatch(updateAccountInfoAfterSpending(newState));

                // Progressbar => (Progress summary)
                dispatch(setNextStepAsActive());
                dispatch(generateTransactionSuccessAlert(isZeroValue));

                setTimeout(() => {
                    dispatch(completeTransfer());
                    dispatch(resetProgress());
                }, 5000);
            })
            .catch((error) => {
                dispatch(sendTransferError());

                // Only keep the failed trytes locally if the bundle was valid
                // In case the bundle is invalid, discard the signing as it was never broadcast
                if (hasSignedInputs && isValidBundle) {
                    const { newState } = syncAccountOnValueTransactionFailure(
                        // Sort in ascending order
                        orderBy(cached.transactionObjects, ['currentIndex']),
                        accountState,
                    );

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
                            error,
                        ),
                    );
                }

                const message = error.message;

                if (message === Errors.NODE_NOT_SYNCED) {
                    return dispatch(generateNodeOutOfSyncErrorAlert());
                } else if (message === Errors.KEY_REUSE) {
                    return dispatch(
                        generateAlert('error', i18next.t('global:keyReuse'), i18next.t('global:keyReuseError')),
                    );
                } else if (message === Errors.NOT_ENOUGH_BALANCE) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:balanceError'),
                            i18next.t('global:balanceErrorMessage'),
                            20000,
                        ),
                    );
                } else if (message === Errors.ADDRESS_HAS_PENDING_TRANSFERS) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:pleaseWait'),
                            i18next.t('global:pleaseWaitTransferExplanation'),
                            20000,
                        ),
                    );
                } else if (message === Errors.FUNDS_AT_SPENT_ADDRESSES) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:spentAddressExplanation'),
                            i18next.t('global:discordInformation'),
                            20000,
                        ),
                    );
                } else if (message === Errors.INCOMING_TRANSFERS) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:pleaseWait'),
                            i18next.t('global:pleaseWaitIncomingTransferExplanation'),
                            20000,
                        ),
                    );
                } else if (message === Errors.CANNOT_SEND_TO_OWN_ADDRESS) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:cannotSendToOwn'),
                            i18next.t('global:cannotSendToOwnExplanation'),
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
 *
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

    // First check spent statuses against transaction addresses
    return (
        categoriseAddressesBySpentStatus()(
            map(existingFailedTransactionsForThisAccount[bundleHash], (tx) => tx.address),
        )
            // If any address (input, remainder, receive) is spent, error out
            .then(({ spent }) => {
                if (size(spent)) {
                    throw new Error(`${Errors.ALREADY_SPENT_FROM_ADDRESSES}:${join(spent, ',')}`);
                }

                // If all addresses are still unspent, retry
                return retry()(
                    existingFailedTransactionsForThisAccount[bundleHash],
                    // If proof of work is set to remote, pass in null as the proof of work function
                    shouldOffloadPow ? null : powFn,
                );
            })
            .then(({ transactionObjects }) => {
                dispatch(markBundleBroadcastStatusComplete({ accountName, bundleHash }));

                const { newState } = syncAccountOnSuccessfulRetryAttempt(
                    accountName,
                    transactionObjects,
                    existingAccountState,
                );

                // Since this transaction was never sent to the tangle
                // Generate the same alert we display when a transaction is successfully sent to the tangle
                const isZeroValue = every(transactionObjects, (tx) => tx.value === 0);

                dispatch(generateTransactionSuccessAlert(isZeroValue));

                return dispatch(retryFailedTransactionSuccess(newState));
            })
            .catch((error) => {
                dispatch(retryFailedTransactionError());

                if (error.message.includes(Errors.ALREADY_SPENT_FROM_ADDRESSES)) {
                    dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:broadcastError'),
                            i18next.t('global:addressesAlreadySpentFrom'),
                            20000,
                            error,
                        ),
                    );
                } else {
                    dispatch(generateTransferErrorAlert(error));
                }
            })
    );
};
