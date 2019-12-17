import assign from 'lodash/assign';
import extend from 'lodash/extend';
import has from 'lodash/has';
import head from 'lodash/head';
import find from 'lodash/find';
import map from 'lodash/map';
import join from 'lodash/join';
import orderBy from 'lodash/orderBy';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import some from 'lodash/some';
import get from 'lodash/get';
import size from 'lodash/size';
import every from 'lodash/every';
import includes from 'lodash/includes';
import uniq from 'lodash/uniq';
import { verifyCDA } from '@iota/cda';
import { iota } from '../libs/iota';
import {
    replayBundleAsync,
    promoteTransactionAsync,
    getTransactionsToApproveAsync,
    attachToTangleAsync,
    storeAndBroadcastAsync,
} from '../libs/iota/extendedApi';
import { getRemotePoWFromState, nodesConfigurationFactory } from '../selectors/global';
import { selectedAccountStateFactory } from '../selectors/accounts';
import { isLastTritZero } from '../libs/iota/utils';
import { setNextStepAsActive, reset as resetProgress } from './progress';
import { clearSendFields, setCDAContent, setSendAmountField, setSendMessageField, setSendAddressField } from './ui';
import {
    findPromotableTail,
    prepareTransferArray,
    retryFailedTransaction as retry,
    constructBundlesFromTransactions,
    isFundedBundle,
    isBundle,
    isFatalTransactionError,
    isAboveMaxDepth,
} from '../libs/iota/transfers';
import {
    syncAccountAfterReattachment,
    syncAccount,
    syncAccountAfterSpending,
    syncAccountOnErrorAfterSigning,
    syncAccountOnSuccessfulRetryAttempt,
    syncAccountOnUnsuccessfulAutoRetryAttempt,
} from '../libs/iota/accounts';
import {
    updateAccountAfterReattachment,
    updateAccountInfoAfterSpending,
    syncAccountBeforeManualPromotion,
} from './accounts';
import {
    isAnyAddressSpent,
    getAddressDataUptoRemainder,
    categoriseAddressesBySpentStatus,
} from '../libs/iota/addresses';
import { getInputs } from '../libs/iota/inputs';
import {
    generateAlert,
    generateTransferErrorAlert,
    generatePromotionErrorAlert,
    generateNodeOutOfSyncErrorAlert,
    generateUnsupportedNodeErrorAlert,
    generateTransactionSuccessAlert,
    prepareLogUpdate,
} from './alerts';
import i18next from '../libs/i18next';
import Errors from '../libs/errors';
import { Account } from '../storage';
import { TransfersActionTypes } from '../types';
import NodesManager from '../libs/iota/NodesManager';

/**
 * Dispatch when a transaction is about to be manually promoted
 *
 * @method promoteTransactionRequest
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
const promoteTransactionRequest = (payload) => ({
    type: TransfersActionTypes.PROMOTE_TRANSACTION_REQUEST,
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
    type: TransfersActionTypes.PROMOTE_TRANSACTION_SUCCESS,
});

/**
 * Dispatch when an error occurs during manual promotion
 *
 * @method promoteTransactionError
 *
 * @returns {{type: {string} }}
 */
const promoteTransactionError = () => ({
    type: TransfersActionTypes.PROMOTE_TRANSACTION_ERROR,
});

/**
 * Dispatch when a transaction is about to be made
 *
 * @method sendTransferRequest
 *
 * @returns {{type: {string} }}
 */
export const sendTransferRequest = () => ({
    type: TransfersActionTypes.SEND_TRANSFER_REQUEST,
});

/**
 * Dispatch when a transaction is successfully sent
 *
 * @method sendTransferSuccess
 *
 * @returns {{type: {string} }}
 */
export const sendTransferSuccess = () => ({
    type: TransfersActionTypes.SEND_TRANSFER_SUCCESS,
});

/**
 * Dispatch when an error occurs during transaction
 *
 * @method sendTransferError
 *
 * @returns {{type: {string} }}
 */
export const sendTransferError = () => ({
    type: TransfersActionTypes.SEND_TRANSFER_ERROR,
});

/**
 * Dispatch before a retry attempt on a failed transaction
 *
 * @method retryFailedTransactionRequest
 *
 * @returns {{type: {string} }}
 */
export const retryFailedTransactionRequest = () => ({
    type: TransfersActionTypes.RETRY_FAILED_TRANSACTION_REQUEST,
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
    type: TransfersActionTypes.RETRY_FAILED_TRANSACTION_SUCCESS,
    payload,
});

/**
 * Dispatch if an error occurs during a retry attempt to send a failed transaction to the tangle
 *
 * @method retryFailedTransactionSuccess
 *
 * @returns {{type: {string}, payload ?: {object} }}
 */
export const retryFailedTransactionError = (payload) => ({
    type: TransfersActionTypes.RETRY_FAILED_TRANSACTION_ERROR,
    payload,
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
        dispatch(clearCDAContent());
        dispatch(sendTransferSuccess());
    };
};

/**
 *  Promote transaction
 *
 * @method promoteTransaction
 *
 * @param {string} bundleHash
 * @param {string} accountName
 * @param {object} seedStore
 * @param {boolean} [withQuorum]
 *
 * @returns {function} dispatch
 **/
export const promoteTransaction = (bundleHash, accountName, seedStore, quorum = true) => (dispatch, getState) => {
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

    let accountState = selectedAccountStateFactory(accountName)(getState());
    const getTailTransactionsForThisBundleHash = (transactions) =>
        filter(transactions, (transaction) => transaction.bundle === bundleHash && transaction.currentIndex === 0);

    const executePrePromotionChecks = (settings, withQuorum) => () => {
        return syncAccount(settings, withQuorum)(accountState)
            .then((newAccountState) => {
                accountState = newAccountState;

                Account.update(accountName, accountState);

                dispatch(syncAccountBeforeManualPromotion(accountState));

                const transactionsForThisBundleHash = filter(
                    accountState.transactions,
                    (transaction) => transaction.bundle === bundleHash,
                );

                if (some(transactionsForThisBundleHash, (transaction) => transaction.persistence === true)) {
                    throw new Error(Errors.TRANSACTION_ALREADY_CONFIRMED);
                }

                const bundles = constructBundlesFromTransactions(
                    filter(accountState.transactions, (transaction) => transaction.bundle === bundleHash),
                );

                if (isEmpty(filter(bundles, isBundle))) {
                    throw new Error(Errors.NO_VALID_BUNDLES_CONSTRUCTED);
                }

                return isFundedBundle(settings, withQuorum)(head(bundles));
            })
            .then((isFunded) => {
                if (!isFunded) {
                    throw new Error(Errors.BUNDLE_NO_LONGER_VALID);
                }

                return findPromotableTail()(getTailTransactionsForThisBundleHash(accountState.transactions), 0);
            });
    };

    // Find nodes with proof of work enabled
    return new NodesManager(
        nodesConfigurationFactory({
            quorum,
            useOnlyPowNodes: true,
        })(getState()),
    )
        .withRetries()(executePrePromotionChecks)()
        .then((result) => {
            return dispatch(
                forceTransactionPromotion(
                    accountName,
                    result,
                    getTailTransactionsForThisBundleHash(accountState.transactions),
                    true,
                    // If proof of work configuration is set to remote,
                    // Extend seedStore object with offloadPow
                    // This property will lead to perform remote proof-of-work
                    // See: extendedApi#attachToTangle
                    remotePoW
                        ? extend(
                              {
                                  __proto__: seedStore.__proto__,
                              },
                              seedStore,
                              { offloadPow: true },
                          )
                        : seedStore,
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
            if (get(err, 'message') === Errors.BUNDLE_NO_LONGER_VALID) {
                dispatch(
                    generateAlert(
                        'error',
                        i18next.t('global:promotionError'),
                        i18next.t('global:noLongerValid'),
                        undefined,
                        err,
                    ),
                );
            } else if (get(err, 'message') === Errors.ATTACH_TO_TANGLE_UNAVAILABLE) {
                dispatch(
                    generateAlert(
                        'error',
                        i18next.t('global:attachToTangleUnavailable'),
                        i18next.t('global:attachToTangleUnavailableExplanationShort'),
                        10000,
                    ),
                );
            } else if (get(err, 'message') === Errors.TRANSACTION_ALREADY_CONFIRMED) {
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
 *   @param {object} seedStore
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
    seedStore,
    maxReplays = 1,
    maxPromotionAttempts = 2,
) => (dispatch, getState) => {
    let replayCount = 0;
    let promotionAttempt = 0;

    const promote = (settings) => (tailTransaction) => {
        const { hash, attachmentTimestamp } = tailTransaction;

        promotionAttempt += 1;

        return promoteTransactionAsync(settings, seedStore)(hash).catch((error) => {
            const isTransactionInconsistent = includes(error.message, Errors.TRANSACTION_IS_INCONSISTENT);

            if (
                isTransactionInconsistent &&
                // If promotion attempt on this reference (hash) hasn't exceeded maximum promotion attempts
                promotionAttempt < maxPromotionAttempts
            ) {
                // Retry promotion on same reference (hash)
                return promote(settings)(tailTransaction);
            } else if (
                isTransactionInconsistent &&
                promotionAttempt === maxPromotionAttempts &&
                // Do not allow reattachments if transaction is still above max depth
                !isAboveMaxDepth(attachmentTimestamp) &&
                // If number of reattachments haven't exceeded max reattachments
                replayCount < maxReplays
            ) {
                // Reset promotion attempt counter
                promotionAttempt = 0;

                // Reattach and try to promote with a newly reattached reference (hash)
                return reattachAndPromote(settings)();
            }

            throw error;
        });
    };

    // Reattach a transaction and promote newly reattached transaction
    const reattachAndPromote = (settings) => () => {
        // Increment the reattachment's count
        replayCount += 1;
        // Grab first tail transaction hash
        const tailTransaction = head(tailTransactionHashes);
        const hash = tailTransaction.hash;

        return replayBundleAsync(settings, seedStore)(hash).then((reattachment) => {
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
            const newState = syncAccountAfterReattachment(reattachment, existingAccountState);

            // Update storage (realm)
            Account.update(accountName, newState);

            // Update redux store
            dispatch(updateAccountAfterReattachment(newState));
            const tailTransaction = find(reattachment, { currentIndex: 0 });

            return promote(settings)(tailTransaction);
        });
    };

    const manager = new NodesManager(
        nodesConfigurationFactory({
            useOnlyPowNodes: true,
        })(getState()),
    );

    if (has(consistentTail, 'hash')) {
        return manager
            .withRetries()(promote)(consistentTail)
            .then((result) => {
                return result;
            });
    }

    return manager
        .withRetries()(reattachAndPromote)()
        .then((result) => {
            return result;
        });
};

/**
 * Sends a transaction
 *
 * @param {object} seedStore - SeedStore class object
 * @param {string} receiveAddress
 * @param {number} value
 * @param {string} message
 * @param {string} accountName
 * @param {boolean} [quorum]
 *
 * @returns {function} dispatch
 */
export const makeTransaction = (seedStore, receiveAddress, value, message, accountName, quorum = true) => (
    dispatch,
    getState,
) => {
    dispatch(sendTransferRequest());

    const address = size(receiveAddress) === 90 ? receiveAddress : iota.utils.addChecksum(receiveAddress);

    // Keep track if the inputs are signed
    let hasSignedInputs = false;

    // Keep track if the bundle was successfully broadcasted
    let hasBroadcast = false;

    // Keep track if the created bundle is valid after inputs are signed
    let isValidBundle = false;

    let maxInputs = 0;

    // Initialize account state
    // Reassign with latest state when account is synced
    let accountState = selectedAccountStateFactory(accountName)(getState());

    const withPreTransactionSecurityChecks = (settings, withQuorum) => () => {
        // Progressbar step => (Validating receive address)
        dispatch(setNextStepAsActive());

        // Check the last trit for validity
        return Promise.resolve(isLastTritZero(address))
            .then((lastTritIsZero) => {
                if (!lastTritIsZero) {
                    throw new Error(Errors.INVALID_LAST_TRIT);
                }

                return typeof seedStore.getMaxInputs === 'function' ? seedStore.getMaxInputs() : Promise.resolve(0);
            })
            .then((maxInputResponse) => {
                maxInputs = maxInputResponse;

                // Make sure that the address a user is about to send to is not already used.
                return isAnyAddressSpent(settings, withQuorum)([address]).then((isSpent) => {
                    if (isSpent) {
                        throw new Error(Errors.KEY_REUSE);
                    }

                    // Progressbar step => (Syncing account)
                    dispatch(setNextStepAsActive());

                    return syncAccount(settings, withQuorum)(accountState, seedStore);
                });
            })
            .then((newState) => {
                // Assign latest account but do not update the local store yet.
                // Only update the local store with updated account information after this transaction is successfully completed.
                accountState = newState;

                // Progressbar step => (Preparing inputs)
                dispatch(setNextStepAsActive());

                return getInputs(settings, withQuorum)(
                    accountState.addressData,
                    accountState.transactions,
                    value,
                    maxInputs,
                );
            })
            .then(({ inputs }) => {
                // Do not allow receiving address to be one of the user's own input addresses.
                const isSendingToAnyInputAddress = some(
                    inputs,
                    (input) => input.address === iota.utils.noChecksum(address),
                );

                if (isSendingToAnyInputAddress) {
                    throw new Error(Errors.CANNOT_SEND_TO_OWN_ADDRESS);
                }

                if (isSendingToAnyInputAddress) {
                    throw new Error(Errors.CANNOT_SEND_TO_OWN_ADDRESS);
                }

                return getAddressDataUptoRemainder(settings, withQuorum)(
                    accountState.addressData,
                    accountState.transactions,
                    seedStore,
                    [
                        // Make sure inputs are blacklisted
                        ...map(inputs, (input) => input.address),
                        // Make sure receive address is blacklisted
                        iota.utils.noChecksum(receiveAddress),
                    ],
                ).then(({ remainderAddress, remainderIndex, addressDataUptoRemainder }) => {
                    // getAddressesUptoRemainder returns the latest unused address as the remainder address
                    // Also returns updated address data including new address data for the intermediate addresses.
                    // E.g: If latest locally stored address has an index 50 and remainder address was calculated to be
                    // at index 53 it would include address data for 51, 52 and 53.
                    accountState.addressData = addressDataUptoRemainder;

                    return {
                        inputs,
                        address: remainderAddress,
                        keyIndex: remainderIndex,
                    };
                });
            });
    };

    const isZeroValue = value === 0;

    const cached = {
        trytes: [],
        transactionObjects: [],
    };

    return (
        (isZeroValue
            ? Promise.resolve(null)
            : new NodesManager(nodesConfigurationFactory({ quorum })(getState())).withRetries()(
                  withPreTransactionSecurityChecks,
              )()
        )
            // If we are making a zero value transaction, options would be null
            // Otherwise, it would be a dictionary with inputs and remainder address
            // Forward options to prepareTransfersAsync as is, because it contains a null check
            .then((options) => {
                const transfer = prepareTransferArray(address, value, message, accountState.addressData);

                // Progressbar step => (Preparing transfers)
                dispatch(setNextStepAsActive());

                return new NodesManager(nodesConfigurationFactory({ quorum })(getState())).withRetries()(
                    (settings) => () => {
                        return seedStore
                            .prepareTransfers(settings)(transfer, options)
                            .then((trytes) => {
                                if (!isZeroValue) {
                                    hasSignedInputs = true;
                                }

                                cached.trytes = trytes;

                                const convertToTransactionObjects = (tryteString) =>
                                    iota.utils.transactionObject(tryteString);
                                cached.transactionObjects = map(cached.trytes, convertToTransactionObjects);

                                if (isBundle(cached.transactionObjects)) {
                                    isValidBundle = true;
                                    // Progressbar step => (Getting transactions to approve)
                                    dispatch(setNextStepAsActive());

                                    return getTransactionsToApproveAsync(settings)();
                                }

                                throw new Error(Errors.INVALID_BUNDLE);
                            });
                    },
                )();
            })
            .then(({ trunkTransaction, branchTransaction }) => {
                const shouldOffloadPow = getRemotePoWFromState(getState());

                // Progressbar step => (Proof of work)
                dispatch(setNextStepAsActive());

                const performLocalPow = () =>
                    attachToTangleAsync(null, seedStore)(trunkTransaction, branchTransaction, cached.trytes);

                if (!shouldOffloadPow) {
                    return performLocalPow();
                }

                // Find nodes with proof of work enabled
                return new NodesManager(
                    nodesConfigurationFactory({
                        quorum,
                        useOnlyPowNodes: true,
                    })(getState()),
                )
                    .withRetries(() =>
                        dispatch(
                            generateAlert(
                                'info',
                                i18next.t('global:pleaseWait'),
                                `${i18next.t('global:problemPerformingProofOfWork')} ${i18next.t(
                                    'global:tryingAgainWithDifferentNode',
                                )}`,
                                20000,
                            ),
                        ),
                    )((settings) =>
                        attachToTangleAsync(
                            settings,
                            extend(
                                {
                                    __proto__: seedStore.__proto__,
                                },
                                seedStore,
                                { offloadPow: true },
                            ),
                        ),
                    )(trunkTransaction, branchTransaction, cached.trytes)
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
            })
            // Re-check spend statuses of all addresses in bundle
            .then(({ trytes, transactionObjects }) => {
                // Skip this check if it's a zero value transaction
                if (isZeroValue) {
                    return Promise.resolve({ trytes, transactionObjects });
                }

                // Progressbar step => (Validating transaction addresses)
                dispatch(setNextStepAsActive());

                const addresses = uniq(map(transactionObjects, (transaction) => transaction.address));

                return new NodesManager(
                    nodesConfigurationFactory({
                        quorum,
                    })(getState()),
                )
                    .withRetries()(isAnyAddressSpent)(addresses)
                    .then((isSpent) => {
                        if (isSpent) {
                            throw new Error(Errors.KEY_REUSE);
                        }

                        return { trytes, transactionObjects };
                    });
            })
            .then(({ trytes, transactionObjects }) => {
                cached.trytes = trytes;
                cached.transactionObjects = transactionObjects;

                // Progressbar step => (Broadcasting)
                dispatch(setNextStepAsActive());

                // Make an attempt to broadcast transaction on selected node
                // If it fails, auto retry broadcast on random nodes
                return new NodesManager(nodesConfigurationFactory({ quorum })(getState())).withRetries(
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
                hasBroadcast = true;
                return new NodesManager(
                    nodesConfigurationFactory({
                        quorum,
                    })(getState()),
                )
                    .withRetries()(syncAccountAfterSpending)(seedStore, cached.transactionObjects, accountState)
                    .catch((error) => {
                        dispatch(prepareLogUpdate(error));
                        return syncAccountOnErrorAfterSigning(
                            // Sort in ascending order
                            orderBy(cached.transactionObjects, ['currentIndex']),
                            accountState,
                            hasBroadcast,
                        );
                    });
            })
            .then((newState) => {
                // Update account in (Realm) storage
                Account.update(accountName, newState);

                dispatch(updateAccountInfoAfterSpending(assign({}, newState, { accountName })));

                // Progressbar => (Progress complete)
                dispatch(setNextStepAsActive());
                dispatch(generateTransactionSuccessAlert(isZeroValue));

                setTimeout(() => {
                    dispatch(completeTransfer());
                    dispatch(resetProgress());
                }, 3500);
            })
            .catch((error) => {
                dispatch(sendTransferError());
                dispatch(resetProgress());
                // If local PoW produces an invalid bundle we do not need to store it or mark the address as spent because the signature has not been broadcast.
                const message = error.message;

                if (message === Errors.INVALID_BUNDLE_CONSTRUCTED_WITH_LOCAL_POW) {
                    isValidBundle = false;
                }
                // Only keep the failed trytes locally if the bundle was valid
                // In case the bundle is invalid, discard the signing as it was never broadcast
                if (hasSignedInputs && isValidBundle) {
                    const newState = syncAccountOnErrorAfterSigning(
                        // Sort in ascending order
                        orderBy(cached.transactionObjects, ['currentIndex']),
                        accountState,
                        hasBroadcast,
                    );

                    // Update account in (Realm) storage
                    Account.update(accountName, newState);

                    dispatch(updateAccountInfoAfterSpending(newState));
                    // Clear send screen text fields
                    dispatch(clearSendFields());
                    dispatch(setCDAContent({}));

                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:rebroadcastError'),
                            i18next.t('global:signedTrytesBroadcastErrorExplanation'),
                            20000,
                            error,
                        ),
                    );
                }

                if (message === Errors.NODE_NOT_SYNCED) {
                    return dispatch(generateNodeOutOfSyncErrorAlert(error));
                } else if (message === Errors.UNSUPPORTED_NODE) {
                    return dispatch(generateUnsupportedNodeErrorAlert(error));
                } else if (message === Errors.INVALID_LAST_TRIT) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('send:invalidAddress'),
                            i18next.t('send:invalidAddressExplanation4'),
                        ),
                        undefined,
                        error,
                    );
                } else if (message === Errors.KEY_REUSE) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:keyReuse'),
                            i18next.t('global:keyReuseError'),
                            undefined,
                            error,
                        ),
                    );
                } else if (message === Errors.INSUFFICIENT_BALANCE) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:balanceError'),
                            i18next.t('global:balanceErrorMessage'),
                            undefined,
                            error,
                        ),
                    );
                } else if (message === Errors.ADDRESS_HAS_PENDING_TRANSFERS) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:pleaseWait'),
                            i18next.t('global:pleaseWaitTransferExplanation'),
                            20000,
                            error,
                        ),
                    );
                } else if (message === Errors.FUNDS_AT_SPENT_ADDRESSES) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:spentAddressExplanation'),
                            i18next.t('global:discordInformation'),
                            20000,
                            error,
                        ),
                    );
                } else if (message === Errors.INCOMING_TRANSFERS) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:pleaseWait'),
                            i18next.t('global:pleaseWaitIncomingTransferExplanation'),
                            20000,
                            error,
                        ),
                    );
                } else if (message === Errors.CANNOT_SEND_TO_OWN_ADDRESS) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:cannotSendToOwn'),
                            i18next.t('global:cannotSendToOwnExplanation'),
                            20000,
                            error,
                        ),
                    );
                } else if (message === Errors.LEDGER_ZERO_VALUE) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('ledger:cannotSendZeroValueTitle'),
                            i18next.t('ledger:cannotSendZeroValueExplanation'),
                            20000,
                            error,
                        ),
                    );
                } else if (message === Errors.LEDGER_DISCONNECTED) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('ledger:ledgerDisconnectedTitle'),
                            i18next.t('ledger:ledgerDisconnectedExplanation'),
                            20000,
                            error,
                        ),
                    );
                } else if (message === Errors.LEDGER_DENIED) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('ledger:ledgerDeniedTitle'),
                            i18next.t('ledger:ledgerDeniedExplanation'),
                            20000,
                            error,
                        ),
                    );
                } else if (message === Errors.LEDGER_INVALID_INDEX) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('ledger:ledgerIncorrectIndex'),
                            i18next.t('ledger:ledgerIncorrectIndexExplanation'),
                            undefined,
                            error,
                        ),
                    );
                } else if (message === Errors.LEDGER_CANCELLED) {
                    return;
                }
                return dispatch(generateTransferErrorAlert(error));
            })
    );
};

/**
 * Retries a transaction that previously failed to send.
 *
 * @method retryFailedTransaction
 *
 * @param {string} accountName
 * @param {string} bundleHash
 * @param {object} seedStore
 * @param {boolean} [isAutoRetrying]
 * @param {boolean} [withQuorum]
 *
 * @returns {function} dispatch
 */
export const retryFailedTransaction = (accountName, bundleHash, seedStore, quorum = true) => (dispatch, getState) => {
    const existingAccountState = selectedAccountStateFactory(accountName)(getState());
    const shouldOffloadPow = getRemotePoWFromState(getState());
    const failedTransactionsForThisBundleHash = filter(
        existingAccountState.transactions,
        (tx) => tx.bundle === bundleHash,
    );

    dispatch(retryFailedTransactionRequest());

    const retryFn = (settings, withQuorum) => () => {
        return (
            // First check spent statuses against transaction addresses
            categoriseAddressesBySpentStatus(settings, withQuorum)(
                map(failedTransactionsForThisBundleHash, (tx) => tx.address),
            )
                // If any address (input, remainder, receive) is spent, error out
                .then(({ spent }) => {
                    if (size(spent)) {
                        throw new Error(`${Errors.ALREADY_SPENT_FROM_ADDRESSES.slice(0, -1)}: ${join(spent, ',')}`);
                    }

                    // If all addresses are still unspent, retry
                    return retry(settings)(
                        failedTransactionsForThisBundleHash,
                        // If proof of work configuration is set to remote,
                        // Extend seedStore object with offloadPow
                        // This property will lead to perform remote proof-of-work
                        // See: extendedApi#attachToTangle
                        shouldOffloadPow
                            ? extend(
                                  {
                                      __proto__: seedStore.__proto__,
                                  },
                                  seedStore,
                                  { offloadPow: true },
                              )
                            : seedStore,
                    );
                })
                .then(({ transactionObjects }) => {
                    // Update state
                    const newState = syncAccountOnSuccessfulRetryAttempt(transactionObjects, existingAccountState);

                    // Persist updated state
                    Account.update(accountName, newState);

                    // Since this transaction was never sent to the tangle
                    // Generate the same alert we display when a transaction is successfully sent to the tangle
                    const isZeroValue = every(transactionObjects, (tx) => tx.value === 0);

                    dispatch(generateTransactionSuccessAlert(isZeroValue));

                    return dispatch(retryFailedTransactionSuccess(newState));
                })
        );
    };

    return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
        .withRetries()(retryFn)()
        .catch((err) => {
            if (isFatalTransactionError(err)) {
                // Update state
                const newState = syncAccountOnUnsuccessfulAutoRetryAttempt(existingAccountState, bundleHash);

                // Persist updated state
                Account.update(accountName, newState);

                dispatch(retryFailedTransactionError(newState));
            } else {
                dispatch(retryFailedTransactionError());
            }

            if (err.message && err.message.includes(Errors.ALREADY_SPENT_FROM_ADDRESSES)) {
                dispatch(
                    generateAlert(
                        'error',
                        i18next.t('global:broadcastError'),
                        i18next.t('global:addressesAlreadySpentFrom'),
                        20000,
                        err,
                    ),
                );
            } else {
                dispatch(generateTransferErrorAlert(err));
            }
        });
};

/**
 * Verifies CDA content
 *
 * @method verifyCDAContent
 *
 * @param {object} CDA data
 *
 * @returns {function} dispatch
 */
export const verifyCDAContent = (data) => {
    return (dispatch) => {
        try {
            verifyCDA(Date.now() / 1000, data);
            dispatch(setCDAContent(data));
            dispatch(setSendAddressField(data.address));
            if (data.expectedAmount) {
                dispatch(setSendAmountField(data.expectedAmount.toString()));
            }
            if (data.message) {
                dispatch(setSendMessageField(data.message));
            }
        } catch (err) {
            if (err.message === 'Expired timeout.') {
                return dispatch(
                    generateAlert(
                        'error',
                        i18next.t('send:paymentRequestExpired'),
                        i18next.t('send:paymentRequestExpiredExplanation'),
                        undefined,
                        undefined,
                        500,
                    ),
                );
            }
            dispatch(
                generateAlert(
                    'error',
                    i18next.t('send:invalidAddress'),
                    i18next.t('send:invalidAddressExplanationGeneric'),
                    undefined,
                    undefined,
                    500,
                ),
            );
        }
    };
};

/**
 * Clears CDA content
 *
 * @method clearCDAContent
 *
 * @returns {function} dispatch
 */
export const clearCDAContent = () => {
    return (dispatch) => {
        dispatch(setCDAContent({}));
    };
};
