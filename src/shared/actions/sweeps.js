import extend from 'lodash/extend';
import reduce from 'lodash/reduce';
import { selectedAccountStateFactory } from '../selectors/accounts';
import { getRemotePoWFromState } from '../selectors/global';
import { syncAccount, syncAccountAfterSpending } from '../libs/iota/accounts';
import { updateAccountInfoAfterSpending, syncAccountBeforeSweeping } from './accounts';
import { startTrackingProgress, setNextStepAsActive, reset as resetProgress } from './progress';
import { sweep } from '../libs/iota/sweeps';
import { getLatestAddress } from '../libs/iota/addresses';
import { Account } from '../storage';
import { SweepsActionTypes } from '../types';

/**
 * Dispatch to set sweeps statuses
 *
 * @method setSweepsStatuses
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setSweepsStatuses = (payload) => ({
    type: SweepsActionTypes.SET_SWEEPS_STATUSES,
    payload,
});

/**
 * Dispatch to update sweeps statuses
 *
 * @method updateSweepsStatuses
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateSweepsStatuses = (payload) => ({
    type: SweepsActionTypes.UPDATE_SWEEPS_STATUSES,
    payload,
});

/**
 * Dispatch when funds recovery is about to start
 *
 * @method recoverFundsRequest
 *
 * @returns {{type: {string} }}
 */
export const recoverFundsRequest = () => ({
    type: SweepsActionTypes.RECOVER_FUNDS_REQUEST,
});

/**
 * Dispatch when funds recovery is about to start
 *
 * @method recoverFundsComplete
 *
 * @returns {{type: {string} }}
 */
export const recoverFundsComplete = () => ({
    type: SweepsActionTypes.RECOVER_FUNDS_COMPLETE,
});

/**
 * Recover funds.
 *
 * @param {string} accountName
 * @param {object} seedStore
 * @param {object} inputs Inputs list [{ address, keyIndex, balance, security, bundleHashes: [] }]
 * @param {boolean} [withQuorum]
 *
 * @returns {function} dispatch
 */
export const recoverLockedFunds = (accountName, seedStore, inputs, withQuorum = true) => (dispatch, getState) => {
    dispatch(recoverFundsRequest());

    return reduce(
        inputs,
        (promise, input) => {
            return promise.then(() => {
                // Initialise progress bar
                dispatch(startTrackingProgress(['Syncing account', 'Sweeping funds', 'complete']));

                dispatch(updateSweepsStatuses({ [input.address]: 0 }));

                dispatch(setNextStepAsActive());

                // Sync account state in each iteration
                return syncAccount(undefined, withQuorum)(
                    selectedAccountStateFactory(accountName)(getState()),
                    seedStore,
                )
                    .then((newState) => {
                        dispatch(setNextStepAsActive());

                        // Update storage (realm)
                        Account.update(accountName, newState);
                        // Update redux store
                        dispatch(syncAccountBeforeSweeping(newState));

                        const receiveAddress = getLatestAddress(newState.addressData);

                        return sweep(undefined, withQuorum)(
                            // See: extendedApi#attachToTangle
                            getRemotePoWFromState(getState())
                                ? extend(
                                      {
                                          __proto__: seedStore.__proto__,
                                      },
                                      seedStore,
                                      { offloadPow: true },
                                  )
                                : seedStore,
                            input,
                            receiveAddress,
                            input.bundleHashes,
                        );
                    })
                    .then(({ transactionObjects }) => {
                        dispatch(setNextStepAsActive());

                        return syncAccountAfterSpending()(
                            seedStore,
                            transactionObjects,
                            // Since we updated state before sweeping
                            // Get the latest state directly via store.getState()
                            selectedAccountStateFactory(accountName)(getState()),
                        );
                    })
                    .then((newState) => {
                        dispatch(resetProgress());
                        // Update storage (realm)
                        Account.update(accountName, newState);
                        // Update redux store
                        dispatch(updateAccountInfoAfterSpending(newState));

                        dispatch(updateSweepsStatuses({ [input.address]: 1 }));
                    })
                    .catch(() => {
                        dispatch(resetProgress());

                        dispatch(updateSweepsStatuses({ [input.address]: -1 }));
                    });
            });
        },
        Promise.resolve(),
    ).then(() => {
        dispatch(recoverFundsComplete());
    });
};
