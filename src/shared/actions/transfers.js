import head from 'lodash/head';
import find from 'lodash/find';
import { broadcastBundleAsync, replayBundleAsync, promoteTransactionAsync } from '../libs/iota/extendedApi';
import { selectedAccountStateFactory } from '../selectors/account';
import {
    getTailTransactionForBundle,
    getAllTailTransactionsForBundle,
    isValidForPromotion,
    getFirstConsistentTail,
} from '../libs/iota/transfers';
import { syncAccountAfterReattachment } from '../libs/iota/accounts';
import { updateAccountAfterReattachment } from './account';
import { generateAlert } from './alerts';
import i18next from '../i18next.js';

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
