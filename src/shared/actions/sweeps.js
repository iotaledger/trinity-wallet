import extend from 'lodash/extend';
import reduce from 'lodash/reduce';
import { selectedAccountStateFactory } from '../selectors/accounts';
import { getRemotePoWFromState } from '../selectors/global';
import { syncAccount, syncAccountAfterSpending } from '../libs/iota/accounts';
import { updateAccountInfoAfterSpending, syncAccountBeforeSweeping } from './accounts';
import { sweep } from '../libs/iota/sweeps';
import { getLatestAddress } from '../libs/iota/addresses';
import Errors from '../libs/errors';
import { Account } from '../storage';
import { SweepsActionTypes } from '../types';

/**
 * Dispatch to set sweeps statuses
 *
 * @method setSweepsStatuses
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {number} }}
 */
export const setSweepsStatuses = (payload) => ({
    type: SweepsActionTypes.SET_SWEEPS_STATUSES,
    payload,
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
    return reduce(
        inputs,
        (promise, input) => {
            return promise.then(() => {
                dispatch(setSweepsStatuses({ [input.address]: 0 }));

                // Sync account state in each iteration
                return syncAccount(undefined, withQuorum)(
                    selectedAccountStateFactory(accountName)(getState()),
                    seedStore,
                )
                    .then((newState) => {
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
                    .then(({ transactionObjects }) =>
                        syncAccountAfterSpending()(
                            seedStore,
                            transactionObjects,
                            // Since we updated state before sweeping
                            // Get the latest state directly via store.getState()
                            selectedAccountStateFactory(accountName)(getState()),
                        ),
                    )
                    .then((newState) => {
                        // Update storage (realm)
                        Account.update(accountName, newState);
                        // Update redux store
                        dispatch(updateAccountInfoAfterSpending(newState));

                        dispatch(setSweepsStatuses({ [input.address]: 1 }));
                    })
                    .catch(() => {
                        dispatch(setSweepsStatuses({ [input.address]: -1 }));
                    });
            });
        },
        Promise.resolve(),
    );
};
