import assign from 'lodash/assign';
import extend from 'lodash/extend';
import filter from 'lodash/filter';
import reduce from 'lodash/reduce';
import { selectedAccountStateFactory } from '../selectors/accounts';
import { getRemotePoWFromState } from '../selectors/global';
import { syncAccount, syncAccountAfterSpending } from '../libs/iota/accounts';
import { promoteTransactionTilConfirmed } from '../libs/iota/transfers';
import { updateAccountInfoAfterSpending, syncAccountBeforeSweeping } from './accounts';
import { startTrackingProgress, setNextStepAsActive, reset as resetProgress } from './progress';
import { sweep } from '../libs/iota/sweeps';
import { getLatestAddress } from '../libs/iota/addresses';
import i18next from '../libs/i18next';
import { Account } from '../storage';
import { SweepsActionTypes } from '../types';
import { __DEV__ } from '../config';

/**
 * Dispatch to set the total iterations for the current sweep
 *
 * @method setTotalSweepIterations
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setTotalSweepIterations = (payload) => ({
    type: SweepsActionTypes.SET_TOTAL_SWEEP_ITERATIONS,
    payload,
});

/**
 * Dispatch to set the current iteration for the current sweep
 *
 * @method setCurrentSweepIteration
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setCurrentSweepIteration = (payload) => {
    return {
        type: SweepsActionTypes.SET_CURRENT_SWEEP_ITERATION,
        payload,
    };
};

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
                dispatch(
                    startTrackingProgress([
                        i18next.t('progressSteps:syncingAccount'),
                        i18next.t('progressSteps:sweepingFunds'),
                        i18next.t('progressSteps:promotingTransaction'),
                        i18next.t('progressSteps:syncingAccountAfterSpending'),
                        i18next.t('progressSteps:fundsSweptSuccessfully'),
                    ]),
                );

                dispatch(
                    updateSweepsStatuses({
                        [input.address]: {
                            active: true,
                            status: 0,
                            initialisationTime: Date.now(),
                        },
                    }),
                );

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

                        return new Promise((resolve) => {
                            setTimeout(() => {
                                sweep(undefined, withQuorum)(
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
                                ).then(resolve);
                            }, 2000);
                        });
                    })
                    .then(({ transactionObjects }) => {
                        dispatch(setNextStepAsActive());

                        const _promote = () => {
                            return promoteTransactionTilConfirmed(undefined, seedStore)(
                                filter(transactionObjects, (tx) => tx.currentIndex === 0),
                                -1,
                            )
                                .then(() => {
                                    dispatch(setNextStepAsActive());

                                    return syncAccountAfterSpending()(
                                        seedStore,
                                        transactionObjects,
                                        // Since we updated state before sweeping
                                        // Get the latest state directly via store.getState()
                                        selectedAccountStateFactory(accountName)(getState()),
                                    ).then((newState) => {
                                        // Update storage (realm)
                                        Account.update(accountName, newState);
                                        // Update redux store
                                        dispatch(updateAccountInfoAfterSpending(assign({}, newState, { accountName })));

                                        dispatch(
                                            updateSweepsStatuses({
                                                [input.address]: {
                                                    active: true,
                                                    status: 1,
                                                    initialisationTime: Date.now(),
                                                },
                                            }),
                                        );

                                        dispatch(resetProgress());
                                    });
                                })
                                .catch((error) => {
                                    if (__DEV__) {
                                        /* eslint-disable no-console */
                                        console.log(error);
                                        /* eslint-enable no-console */
                                    }

                                    return _promote();
                                });
                        };

                        return _promote();
                    })
                    .catch((error) => {
                        if (__DEV__) {
                            /* eslint-disable no-console */
                            console.log(error);
                            /* eslint-enable no-console */
                        }

                        dispatch(resetProgress());

                        dispatch(
                            updateSweepsStatuses({
                                [input.address]: {
                                    active: true,
                                    status: -1,
                                    initialisationTime: Date.now(),
                                },
                            }),
                        );
                    });
            });
        },
        Promise.resolve(),
    ).then(() => {
        dispatch(recoverFundsComplete());
    });
};
