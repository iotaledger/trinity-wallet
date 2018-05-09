import head from 'lodash/head';
import find from 'lodash/find';
import get from 'lodash/get';
import map from 'lodash/map';
import filter from 'lodash/filter';
import some from 'lodash/some';
import sample from 'lodash/sample';
import size from 'lodash/size';
import { iota } from '../libs/iota';
import {
    broadcastBundleAsync,
    replayBundleAsync,
    promoteTransactionAsync,
    prepareTransfersAsync,
    getTransactionsToApproveAsync,
    attachToTangleAsync,
    storeAndBroadcastAsync,
} from '../libs/iota/extendedApi';
import {
    selectedAccountStateFactory,
    getRemotePoWFromState,
    selectFirstAddressFromAccountFactory,
} from '../selectors/accounts';
import { setNextStepAsActive } from './progress';
import { clearSendFields } from './ui';
import {
    isStillAValidTransaction,
    getFirstConsistentTail,
    prepareTransferArray,
    filterInvalidPendingTransactions,
    performPow,
} from '../libs/iota/transfers';
import { syncAccountAfterReattachment, syncAccount, syncAccountAfterSpending } from '../libs/iota/accounts';
import { updateAccountAfterReattachment, updateAccountInfoAfterSpending, accountInfoFetchSuccess } from './accounts';
import { shouldAllowSendingToAddress, syncAddresses, getLatestAddress } from '../libs/iota/addresses';
import { getStartingSearchIndexToPrepareInputs, getUnspentInputs } from '../libs/iota/inputs';
import { generateAlert, generateTransferErrorAlert, generatePromotionErrorAlert } from './alerts';
import i18next from '../i18next.js';
import Errors from '../libs/errors';

export const ActionTypes = {
    BROADCAST_BUNDLE_REQUEST: 'IOTA/TRANSFERS/BROADCAST_BUNDLE_REQUEST',
    BROADCAST_BUNDLE_SUCCESS: 'IOTA/TRANSFERS/BROADCAST_BUNDLE_SUCCESS',
    BROADCAST_BUNDLE_ERROR: 'IOTA/TRANSFERS/BROADCAST_BUNDLE_ERROR',
    PROMOTE_TRANSACTION_REQUEST: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
    PROMOTE_TRANSACTION_SUCCESS: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_SUCCESS',
    PROMOTE_TRANSACTION_ERROR: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_ERROR',
    SEND_TRANSFER_REQUEST: 'IOTA/TRANSFERS/SEND_TRANSFER_REQUEST',
    SEND_TRANSFER_SUCCESS: 'IOTA/TRANSFERS/SEND_TRANSFER_SUCCESS',
    SEND_TRANSFER_ERROR: 'IOTA/TRANSFERS/SEND_TRANSFER_ERROR',
};

const broadcastBundleRequest = () => ({
    type: ActionTypes.BROADCAST_BUNDLE_REQUEST,
});

const broadcastBundleSuccess = () => ({
    type: ActionTypes.BROADCAST_BUNDLE_SUCCESS,
});

const broadcastBundleError = () => ({
    type: ActionTypes.BROADCAST_BUNDLE_ERROR,
});

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

/**
 *   On successful transfer, update store, generate alert and clear send text fields
 *   @method completeTransfer
 *   @param {object} payload - sending status, address, transfer value
 **/
export const completeTransfer = (payload) => {
    return (dispatch) => {
        dispatch(clearSendFields());
        dispatch(sendTransferSuccess(payload));
    };
};

export const broadcastBundle = (bundleHash, accountName) => (dispatch, getState) => {
    dispatch(broadcastBundleRequest());

    const accountState = selectedAccountStateFactory(accountName)(getState());
    const transaction = accountState.transfers[bundleHash];
    const tailTransaction = sample(transaction.tailTransactions);

    let chainBrokenInternally = false;

    return isStillAValidTransaction(transaction, accountState.addresses)
        .then((isValid) => {
            if (!isValid) {
                chainBrokenInternally = true;

                throw new Error(Errors.BUNDLE_NO_LONGER_VALID);
            }

            return broadcastBundleAsync(tailTransaction.hash);
        })
        .then(() => {
            dispatch(
                generateAlert(
                    'success',
                    'Rebroadcasted transaction',
                    `Rebroadcasted transaction with hash ${tailTransaction.hash}.`,
                ),
            );

            return dispatch(broadcastBundleSuccess());
        })
        .catch((err) => {
            if (err.message === Errors.BUNDLE_NO_LONGER_VALID && chainBrokenInternally) {
                // TODO: Replace error message with a valid broadcast error message
                dispatch(generateAlert('error', i18next.t('global:promotionError'), i18next.t('global:noLongerValid')));
            } else {
                dispatch(
                    generateAlert(
                        'error',
                        'Could not rebroadcast transaction ',
                        'Something went wrong while rebroadcasting your transaction. Please try again.',
                    ),
                );
            }

            return dispatch(broadcastBundleError());
        });
};

export const promoteTransaction = (bundleHash, accountName) => (dispatch, getState) => {
    dispatch(promoteTransactionRequest(bundleHash));

    const accountState = selectedAccountStateFactory(accountName)(getState());
    const transaction = accountState.transfers[bundleHash];
    const tailTransactions = transaction.tailTransactions;

    let chainBrokenInternally = false;

    return isStillAValidTransaction(transaction, accountState.addresses)
        .then((isValid) => {
            if (!isValid) {
                chainBrokenInternally = true;
                throw new Error(Errors.BUNDLE_NO_LONGER_VALID);
            }

            return getFirstConsistentTail(tailTransactions, 0);
        })
        .then((consistentTail) => dispatch(forceTransactionPromotion(accountName, consistentTail, tailTransactions)))
        .then((hash) => {
            dispatch(
                generateAlert(
                    'success',
                    i18next.t('global:promoting'),
                    i18next.t('global:autopromotingExplanation', { hash }),
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
                        i18next.t('global:attachToTangleUnavailableExplanation'),
                        20000,
                    ),
                );
            } else {
                dispatch(generatePromotionErrorAlert());
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
 *   @param {boolean} consistentTail
 *   @param {array} tails
 *   @returns {Promise}
 **/
export const forceTransactionPromotion = (accountName, consistentTail, tails) => (dispatch, getState) => {
    if (!consistentTail) {
        // Grab hash from the top tail to replay
        const topTx = head(tails);
        const hash = topTx.hash;

        return replayBundleAsync(hash)
            .then((reattachment) => {
                dispatch(
                    generateAlert(
                        'success',
                        i18next.t('global:autoreattaching'),
                        i18next.t('global:autoreattachingExplanation', { hash }),
                        2500,
                    ),
                );

                const existingAccountState = selectedAccountStateFactory(accountName)(getState());

                return syncAccountAfterReattachment(accountName, reattachment, existingAccountState);
            })
            .then(({ newState, reattachment }) => {
                dispatch(updateAccountAfterReattachment(newState));

                const tailTransaction = find(reattachment, { currentIndex: 0 });
                return promoteTransactionAsync(tailTransaction.hash);
            });
    }

    return promoteTransactionAsync(consistentTail.hash);
};

export const makeTransaction = (seed, receiveAddress, value, message, accountName, powFn, genFn) => (
    dispatch,
    getState,
) => {
    dispatch(sendTransferRequest());

    const address = size(receiveAddress) === 90 ? receiveAddress : iota.utils.addChecksum(receiveAddress);

    // Use a local variable to keep track if the promise chain was interrupted internally.
    let chainBrokenInternally = false;

    // Initialize account state
    // Reassign with latest state when account is synced
    let accountState = selectedAccountStateFactory(accountName)(getState());

    // Security checks are not necessary for zero value transfers
    // Have them wrapped in a separate private function so in case it is a value transfer,
    // it can be chained together with the rest of the promise chain.
    const withPreTransactionSecurityChecks = () => {
        // Validating receive address
        dispatch(setNextStepAsActive());

        // Make sure that the address a user is about to send to is not already used.
        // err -> Since shouldAllowSendingToAddress consumes wereAddressesSpentFrom endpoint
        // Omit input preparation in case the address is already spent from.
        return shouldAllowSendingToAddress([address])
            .then((shouldAllowSending) => {
                if (shouldAllowSending) {
                    return syncAddresses(seed, accountState, genFn, true);
                }

                chainBrokenInternally = true;
                throw new Error(Errors.KEY_REUSE);
            })
            .then((newState) => {
                // Syncing account
                dispatch(setNextStepAsActive());

                return syncAccount(newState);
            })
            .then((newState) => {
                // Assign latest account
                accountState = newState;

                // Update local store with the latest account information
                dispatch(accountInfoFetchSuccess(accountState));

                const valueTransfers = filter(map(accountState.transfers, (tx) => tx), (tx) => tx.transferValue !== 0);

                return filterInvalidPendingTransactions(valueTransfers, accountState.addresses);
            })
            .then((filteredTransfers) => {
                const { addresses } = accountState;
                const startIndex = getStartingSearchIndexToPrepareInputs(addresses);

                // Preparing inputs
                dispatch(setNextStepAsActive());

                return getUnspentInputs(addresses, filteredTransfers, startIndex, value, null);
            })
            .then((inputs) => {
                // allBalance -> total balance associated with addresses.
                // Contains balance from addresses regardless of the fact they are spent from.
                // Less than the value user is about to send to -> Not enough balance.
                if (get(inputs, 'allBalance') < value) {
                    chainBrokenInternally = true;
                    throw new Error(Errors.NOT_ENOUGH_BALANCE);

                    // totalBalance -> balance after filtering out addresses that are spent.
                    // Contains balance from those addresses only that are not spent from.
                    // Less than value user is about to send to -> Has already spent from addresses and the txs aren't confirmed.
                    // TODO: At this point, we could leverage the change addresses and allow user making a transfer on top from those.
                } else if (get(inputs, 'totalBalance') < value) {
                    chainBrokenInternally = true;
                    throw new Error(Errors.ADDRESS_HAS_PENDING_TRANSFERS);
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

                const remainderAddress = getLatestAddress(accountState.addresses);

                return {
                    inputs: get(inputs, 'inputs'),
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
                cached.trytes = trytes;

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
            .then(() => syncAccountAfterSpending(accountName, cached.transactionObjects, accountState, !isZeroValue))
            .then(({ newState }) => {
                // Progress summary
                dispatch(setNextStepAsActive());

                // TODO: Validate bundle
                dispatch(updateAccountInfoAfterSpending(newState));

                // Delay dispatching alerts to display the progress summary
                return setTimeout(() => {
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

                    return dispatch(completeTransfer({ address, value }));
                }, 5000);
            })
            .catch((error) => {
                dispatch(sendTransferError());

                const message = error.message;

                if (message === Errors.KEY_REUSE && chainBrokenInternally) {
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
