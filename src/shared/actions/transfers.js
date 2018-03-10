import head from 'lodash/head';
import find from 'lodash/find';
import get from 'lodash/get';
import some from 'lodash/some';
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
} from '../selectors/account';
import { completeTransfer, sendTransferError, sendTransferRequest } from './tempAccount';
import { setNextStepAsActive } from './progress';
import {
    getTailTransactionForBundle,
    getAllTailTransactionsForBundle,
    isValidForPromotion,
    getFirstConsistentTail,
    prepareTransferArray,
    filterInvalidPendingTransfers,
    filterZeroValueTransfers,
    performPow,
    syncAccount,
} from '../libs/iota/transfers';
import { syncAccountAfterReattachment } from '../libs/iota/accounts';
import { updateAccountAfterReattachment, updateAccountInfo, accountInfoFetchSuccess } from './account';
import { shouldAllowSendingToAddress, syncAddresses, getLatestAddress } from '../libs/iota/addresses';
import { getStartingSearchIndexToPrepareInputs, getUnspentInputs } from '../libs/iota/inputs';
import { generateAlert } from './alerts';
import i18next from '../i18next.js';
import Errors from '../libs/errors';

export const ActionTypes = {
    BROADCAST_BUNDLE_REQUEST: 'IOTA/TRANSFERS/BROADCAST_BUNDLE_REQUEST',
    BROADCAST_BUNDLE_SUCCESS: 'IOTA/TRANSFERS/BROADCAST_BUNDLE_SUCCESS',
    BROADCAST_BUNDLE_ERROR: 'IOTA/TRANSFERS/BROADCAST_BUNDLE_ERROR',
    PROMOTE_TRANSACTION_REQUEST: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
    PROMOTE_TRANSACTION_SUCCESS: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_SUCCESS',
    PROMOTE_TRANSACTION_ERROR: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_ERROR',
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

const promoteTransactionRequest = () => ({
    type: ActionTypes.PROMOTE_TRANSACTION_REQUEST,
});

const promoteTransactionSuccess = () => ({
    type: ActionTypes.PROMOTE_TRANSACTION_SUCCESS,
});

const promoteTransactionError = () => ({
    type: ActionTypes.PROMOTE_TRANSACTION_ERROR,
});

export const broadcastBundle = (bundleHash, accountName) => (dispatch, getState) => {
    dispatch(broadcastBundleRequest());

    const accountState = selectedAccountStateFactory(accountName)(getState());
    const tailTransaction = getTailTransactionForBundle(bundleHash, accountState.transfers);

    return broadcastBundleAsync(tailTransaction.hash)
        .then(() => {
            dispatch(
                generateAlert('success', 'Rebroadcast', `Rebroadcasted transaction with hash ${tailTransaction.hash}.`),
            );

            return dispatch(broadcastBundleSuccess());
        })
        .catch(() => {
            dispatch(
                generateAlert(
                    'error',
                    'Rebroadcast',
                    'Something went wrong while rebroadcasting your transaction. Please try again.',
                ),
            );

            dispatch(broadcastBundleError());
        });
};

export const promoteTransaction = (bundleHash, accountName) => (dispatch, getState) => {
    dispatch(promoteTransactionRequest());

    const accountState = selectedAccountStateFactory(accountName)(getState());
    const tailTransactions = getAllTailTransactionsForBundle(bundleHash, accountState.transfers);
    let chainBrokenInternally = false;

    return isValidForPromotion(bundleHash, accountState.transfers, accountState.addresses)
        .then((isValid) => {
            if (!isValid) {
                chainBrokenInternally = true;
                throw new Error('Bundle no longer valid');
            }

            return getFirstConsistentTail(tailTransactions, 0);
        })
        .then((consistentTail) => dispatch(forceTransactionPromotion(accountName, consistentTail, tailTransactions)))
        .then((hash) => {
            dispatch(
                generateAlert(
                    'success',
                    i18next.t('global:autopromoting'),
                    i18next.t('global:autopromotingExplanation', { hash }),
                ),
            );

            return dispatch(promoteTransactionSuccess());
        })
        .catch((err) => {
            if (err.message.includes('no longer valid') && chainBrokenInternally) {
                dispatch(
                    generateAlert('error', 'Promotion', 'The bundle you are trying to promote is no longer valid. '),
                );
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

export const makeTransaction = (seed, address, value, message, accountName, powFn) => (dispatch, getState) => {
    dispatch(sendTransferRequest());

    // Use a local variable to keep track if the promise chain was interrupted internally.
    let chainBrokenInternally = false;

    // Initialize latest account state, remainderAddress and startingSearchIndexToPrepareInputs as null
    // Reassign all when account is synced
    let latestAccountState = null;

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
                    const currentAccountState = selectedAccountStateFactory(accountName)(getState());
                    return syncAddresses(seed, currentAccountState, true);
                }

                chainBrokenInternally = true;
                throw new Error(Errors.KEY_REUSE);
            })
            .then((newState) => {
                // Syncing account
                dispatch(setNextStepAsActive());

                // TODO: seed is not needed anymore in syncAccount
                return syncAccount(seed, newState);
            })
            .then((newState) => {
                latestAccountState = newState;

                // Update local store with the latest account information
                dispatch(accountInfoFetchSuccess(latestAccountState));

                const valueTransfers = filterZeroValueTransfers(latestAccountState.transfers);
                return filterInvalidPendingTransfers(valueTransfers, latestAccountState.addresses);
            })
            .then((filteredTransfers) => {
                const { addresses } = latestAccountState;
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

                // Verify if a user is sending to on of his own addresses.
                const isSendingToOwnAddress = some(
                    get(inputs, 'inputs'),
                    (input) => input.address === iota.utils.noChecksum(address),
                );

                if (isSendingToOwnAddress) {
                    chainBrokenInternally = true;
                    throw new Error(Errors.CANNOT_SEND_TO_OWN_ADDRESS);
                }

                const remainderAddress = getLatestAddress(latestAccountState.addresses);

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
            .then(() => {
                // Progress summary
                dispatch(setNextStepAsActive());

                // TODO: Validate bundle
                dispatch(updateAccountInfo(accountName, cached.transactionObjects, value));

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
                } else if (message.includes('attachToTangle is not available')) {
                    return dispatch(
                        generateAlert(
                            'error',
                            i18next.t('global:attachToTangleUnavailable'),
                            i18next.t('global:attachToTangleUnavailableExplanation'),
                            20000,
                        ),
                    );
                }

                return dispatch(
                    generateAlert('error', i18next.t('global:transferError'), i18next.t('global:transferErrorMessage')),
                    20000,
                    error,
                );
            })
    );
};
