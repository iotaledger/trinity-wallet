import extend from 'lodash/extend';
import map from 'lodash/map';
import noop from 'lodash/noop';
import findLastIndex from 'lodash/findLastIndex';
import reduce from 'lodash/reduce';
import { updateAddressData, updateAccountAfterTransition, getSelectedAccountName } from '../actions/accounts';
import {
    generateAlert,
    generateTransitionErrorAlert,
    generateAddressesSyncRetryAlert,
    generateNodeOutOfSyncErrorAlert,
    generateUnsupportedNodeErrorAlert,
} from '../actions/alerts';
import { setActiveStepIndex, startTrackingProgress, reset as resetProgress } from '../actions/progress';
import { changeNode } from '../actions/settings';
import { accumulateBalance, attachAndFormatAddress, syncAddresses } from '../libs/iota/addresses';
import i18next from '../libs/i18next';
import { syncAccountDuringSnapshotTransition } from '../libs/iota/accounts';
import { getBalancesAsync } from '../libs/iota/extendedApi';
import Errors from '../libs/errors';
import { selectedAccountStateFactory } from '../selectors/accounts';
import { getRemotePoWFromState, nodesConfigurationFactory } from '../selectors/global';
import { Account } from '../storage';
import { DEFAULT_SECURITY } from '../config';
import NodesManager from '../libs/iota/NodesManager';

export const ActionTypes = {
    GENERATE_NEW_ADDRESS_REQUEST: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_REQUEST',
    GENERATE_NEW_ADDRESS_SUCCESS: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_SUCCESS',
    GENERATE_NEW_ADDRESS_ERROR: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_ERROR',
    SET_ACCOUNT_NAME: 'IOTA/WALLET/SET_ACCOUNT_NAME',
    SET_RECEIVE_ADDRESS: 'IOTA/WALLET/SET_RECEIVE_ADDRESS',
    SET_PASSWORD: 'IOTA/WALLET/SET_PASSWORD',
    CLEAR_WALLET_DATA: 'IOTA/WALLET/CLEAR_WALLET_DATA',
    SET_SEED_INDEX: 'IOTA/WALLET/SET_SEED_INDEX',
    SET_READY: 'IOTA/WALLET/SET_READY',
    SET_SETTING: 'IOTA/WALLET/SET_SETTING',
    SNAPSHOT_TRANSITION_REQUEST: 'IOTA/WALLET/SNAPSHOT_TRANSITION_REQUEST',
    SNAPSHOT_TRANSITION_SUCCESS: 'IOTA/WALLET/SNAPSHOT_TRANSITION_SUCCESS',
    SNAPSHOT_TRANSITION_ERROR: 'IOTA/WALLET/SNAPSHOT_TRANSITION_ERROR',
    SNAPSHOT_ATTACH_TO_TANGLE_REQUEST: 'IOTA/WALLET/SNAPSHOT_ATTACH_TO_TANGLE_REQUEST',
    SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE: 'IOTA/WALLET/SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE',
    UPDATE_TRANSITION_BALANCE: 'IOTA/WALLET/UPDATE_TRANSITION_BALANCE',
    UPDATE_TRANSITION_ADDRESSES: 'IOTA/WALLET/UPDATE_TRANSITION_ADDRESSES',
    SET_BALANCE_CHECK_FLAG: 'IOTA/WALLET/SET_BALANCE_CHECK_FLAG',
    CANCEL_SNAPSHOT_TRANSITION: 'IOTA/WALLET/CANCEL_SNAPSHOT_TRANSITION',
    CONNECTION_CHANGED: 'IOTA/WALLET/CONNECTION_CHANGED',
    SHOULD_UPDATE: 'IOTA/APP/WALLET/SHOULD_UPDATE',
    FORCE_UPDATE: 'IOTA/APP/WALLET/FORCE_UPDATE',
    DISPLAY_TEST_WARNING: 'IOTA/APP/WALLET/DISPLAY_TEST_WARNING',
    INITIATE_DEEP_LINK_REQUEST: 'IOTA/APP/WALLET/INITIATE_DEEP_LINK_REQUEST',
    COMPLETE_DEEP_LINK_REQUEST: 'IOTA/APP/WALLET/COMPLETE_DEEP_LINK_REQUEST',
    MAP_STORAGE_TO_STATE: 'IOTA/SETTINGS/MAP_STORAGE_TO_STATE',
    ADDRESS_VALIDATION_REQUEST: 'IOTA/APP/WALLET/ADDRESS_VALIDATION_REQUEST',
    ADDRESS_VALIDATION_SUCCESS: 'IOTA/APP/WALLET/ADDRESS_VALIDATION_SUCCESS',
    PUSH_ROUTE: 'IOTA/APP/WALLET/PUSH_ROUTE',
    POP_ROUTE: 'IOTA/APP/WALLET/POP_ROUTE',
    POP_TO_ROUTE: 'IOTA/APP/WALLET/POP_TO_ROUTE',
    RESET_ROUTE: 'IOTA/APP/WALLET/RESET_ROUTE',
};

/**
 * Dispatch when new addresses are about to be generated
 *
 * @method generateNewAddressRequest
 *
 * @returns {{type: {string} }}
 */
export const generateNewAddressRequest = () => ({
    type: ActionTypes.GENERATE_NEW_ADDRESS_REQUEST,
});

/**
 * Dispatch when new addresses are successfully generated
 *
 * @method generateNewAddressSuccess
 *
 * @returns {{type: {string} }}
 */
export const generateNewAddressSuccess = () => ({
    type: ActionTypes.GENERATE_NEW_ADDRESS_SUCCESS,
});

/**
 * Dispatch in case an error occurs during new addresses generation
 *
 * @method generateNewAddressError
 *
 * @returns {{type: {string} }}
 */
export const generateNewAddressError = () => ({
    type: ActionTypes.GENERATE_NEW_ADDRESS_ERROR,
});

/**
 * Dispatch to set password hash on login
 *
 * @method setPassword
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setPassword = (payload) => ({
    type: ActionTypes.SET_PASSWORD,
    payload,
});

/**
 * Dispatch to clear "wallet" reducer state
 *
 * @method clearWalletData
 *
 * @returns {{type: {string} }}
 */
export const clearWalletData = () => ({
    type: ActionTypes.CLEAR_WALLET_DATA,
});

/**
 * Dispatch to set active seed (account) index in state
 *
 * @method setSeedIndex
 * @param {number} payload
 *
 * @returns {{type: {string}, payload: {number} }}
 */
export const setSeedIndex = (payload) => ({
    type: ActionTypes.SET_SEED_INDEX,
    payload,
});

/**
 * Dispatch to complete loading of account information for newly added account
 *
 * @method setReady
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setReady = () => ({
    type: ActionTypes.SET_READY,
    payload: true,
});

/**
 * Dispatch to set active setting page mobile in state
 *
 * @method setSetting
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setSetting = (payload) => ({
    type: ActionTypes.SET_SETTING,
    payload,
});

/**
 * Dispatch when snapshot transition is about to be performed
 *
 * @method snapshotTransitionRequest
 *
 * @returns {{type: {string} }}
 */
export const snapshotTransitionRequest = () => ({
    type: ActionTypes.SNAPSHOT_TRANSITION_REQUEST,
});

/**
 * Dispatch when snapshot transition is successfully completed
 *
 * @method snapshotTransitionSuccess
 *
 * @returns {{type: {string} }}
 */
export const snapshotTransitionSuccess = () => ({
    type: ActionTypes.SNAPSHOT_TRANSITION_SUCCESS,
});

/**
 * Dispatch if an error occurs during snapshot transition
 *
 * @method snapshotTransitionError
 *
 * @returns {{type: {string} }}
 */
export const snapshotTransitionError = () => ({
    type: ActionTypes.SNAPSHOT_TRANSITION_ERROR,
});

/**
 * Cancels a snapshot transition
 *
 * @method cancelSnapshotTransition
 *
 * @returns {{type: {string} }}
 */
export const cancelSnapshotTransition = () => ({
    type: ActionTypes.CANCEL_SNAPSHOT_TRANSITION,
});

/**
 * Dispatch when addresses are about to be attached to tangle during snapshot transition
 *
 * @method snapshotAttachToTangleRequest
 *
 * @returns {{type: {string} }}
 */
export const snapshotAttachToTangleRequest = () => ({
    type: ActionTypes.SNAPSHOT_ATTACH_TO_TANGLE_REQUEST,
});

/**
 * Dispatch when addresses are successfully attached to tangle during snapshot transition
 *
 * @method snapshotAttachToTangleComplete
 *
 * @returns {{type: {string} }}
 */
export const snapshotAttachToTangleComplete = () => ({
    type: ActionTypes.SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE,
});

/**
 * Dispatch to update detected balance during snapshot transition
 *
 * @method updateTransitionBalance
 * @param {number} payload
 *
 * @returns {{type: {string}, payload: {number} }}
 */
export const updateTransitionBalance = (payload) => ({
    type: ActionTypes.UPDATE_TRANSITION_BALANCE,
    payload,
});

/**
 * Dispatch to update generated addresses during snapshot transition
 *
 * @method updateTransitionAddresses
 * @param {array} payload
 *
 * @returns {{type: {string}, payload: {array} }}
 */
export const updateTransitionAddresses = (payload) => ({
    type: ActionTypes.UPDATE_TRANSITION_ADDRESSES,
    payload,
});

/**
 * Dispatch to show/hide ('Is your balance correct?') during snapshot transition
 *
 * @method setBalanceCheckFlag
 * @param {boolean} payload

 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setBalanceCheckFlag = (payload) => ({
    type: ActionTypes.SET_BALANCE_CHECK_FLAG,
    payload,
});

/**
 * Dispatch to set parsed data from link (amount, address and message) in state
 *
 * @method initiateDeepLinkRequest
 * @param {string} amount
 * @param {string} address
 * @param {string} message
 *
 * @returns {{type: {string}, amount: {string}, address: {string}, message: {string} }}
 */
export const initiateDeepLinkRequest = (amount, address, message) => {
    return {
        type: ActionTypes.INITIATE_DEEP_LINK_REQUEST,
        amount,
        address,
        message,
    };
};

/**
 * Dispatch to disable deep linking for wallet
 *
 * @method completeDeepLinkRequest
 *
 * @returns {{type: {string} }}
 */
export const completeDeepLinkRequest = () => {
    return {
        type: ActionTypes.COMPLETE_DEEP_LINK_REQUEST,
    };
};

/**
 * Dispatch to map storage (persisted) data to redux state
 *
 * @method mapStorageToState
 * @param {object} payload

 * @returns {{type: {string}, payload: {object} }}
 */
export const mapStorageToState = (payload) => ({
    type: ActionTypes.MAP_STORAGE_TO_STATE,
    payload,
});

/**
 * Generate new receive address for wallet
 *
 * @method generateNewAddress
 *
 * @param {object} seedStore - SeedStore class object
 * @param {string} accountName
 * @param {object} existingAccountData
 *
 * @returns {function(*): Promise<any>}
 */
export const generateNewAddress = (seedStore, accountName, existingAccountData) => {
    return (dispatch, getState) => {
        dispatch(generateNewAddressRequest());

        return new NodesManager(nodesConfigurationFactory()(getState()))
            .withRetries(() => dispatch(generateAddressesSyncRetryAlert()))(syncAddresses)(
                seedStore,
                existingAccountData.addressData,
                existingAccountData.transactions,
            )
            .then((result) => {
                // Update address data in storage (realm)
                Account.update(accountName, { addressData: result });

                dispatch(updateAddressData(accountName, result));
                dispatch(generateNewAddressSuccess());
            })
            .catch((err) => {
                dispatch(
                    generateAlert(
                        'error',
                        i18next.t('global:somethingWentWrong'),
                        i18next.t('global:somethingWentWrongTryAgain'),
                        10000,
                        err,
                    ),
                );
                dispatch(generateNewAddressError());
            });
    };
};

/**
 * Checks for balance against generated addresses for transition
 * In case there are no addresses generated yet, it will generate a batch of addresses
 * and will fetch balance against those
 *
 * @method transitionForSnapshot
 *
 * @param {object} seedStore - SeedStore class object
 * @param {array} addresses
 * @param {function} genFn
 *
 * @returns {function} - dispatch
 */
export const transitionForSnapshot = (seedStore, addresses) => {
    return (dispatch) => {
        dispatch(snapshotTransitionRequest());
        if (addresses.length > 0) {
            dispatch(getBalanceForCheck(addresses));
            dispatch(updateTransitionAddresses(addresses));
        } else {
            setTimeout(() => {
                dispatch(generateAddressesAndGetBalance(seedStore, 0));
            });
        }
    };
};

/**
 * Completes snapshot transition by sequentially attaching addresses to tangle
 *
 * @method completeSnapshotTransition
 *
 * @param {object} seedStore - SeedStore class object
 * @param {string} accountName
 * @param {array} addresses
 * @param {boolean} withQuorum
 *
 * @returns {function}
 */
export const completeSnapshotTransition = (seedStore, accountName, addresses, quorum = true) => {
    return (dispatch, getState) => {
        dispatch(
            generateAlert(
                'info',
                i18next.t('snapshotTransition:attaching'),
                i18next.t('global:deviceMayBecomeUnresponsive'),
            ),
        );

        dispatch(snapshotAttachToTangleRequest());

        const snapshotTransitionFn = (settings, withQuorum) => () => {
            return (
                getBalancesAsync(settings, withQuorum)(addresses)
                    // Find balance on all addresses
                    .then((balances) => {
                        const allBalances = map(balances.balances, Number);
                        const totalBalance = accumulateBalance(allBalances);
                        const hasZeroBalance = totalBalance === 0;

                        // If accumulated balance is zero, terminate the snapshot process
                        if (hasZeroBalance) {
                            throw new Error(Errors.CANNOT_TRANSITION_ADDRESSES_WITH_ZERO_BALANCE);
                        }

                        const lastIndexWithBalance = findLastIndex(allBalances, (balance) => balance > 0);
                        const relevantBalances = allBalances.slice(0, lastIndexWithBalance + 1);
                        const relevantAddresses = addresses.slice(0, lastIndexWithBalance + 1);

                        dispatch(startTrackingProgress(relevantAddresses));

                        return reduce(
                            relevantAddresses,
                            (promise, address, index) => {
                                return promise.then((result) => {
                                    dispatch(setActiveStepIndex(index));

                                    const existingAccountState = selectedAccountStateFactory(accountName)(getState());

                                    return attachAndFormatAddress(settings, withQuorum)(
                                        address,
                                        index,
                                        relevantBalances[index],
                                        getRemotePoWFromState(getState())
                                            ? extend(
                                                  {
                                                      __proto__: seedStore.__proto__,
                                                  },
                                                  seedStore,
                                                  { offloadPow: true },
                                              )
                                            : seedStore,
                                        existingAccountState,
                                    )
                                        .then(({ attachedAddressObject, attachedTransactions }) => {
                                            const newState = syncAccountDuringSnapshotTransition(
                                                attachedTransactions,
                                                attachedAddressObject,
                                                existingAccountState,
                                            );

                                            // Update storage (realm)
                                            Account.update(accountName, newState);
                                            // Update redux store
                                            dispatch(updateAccountAfterTransition(newState));

                                            return result;
                                        })
                                        .catch(noop);
                                });
                            },
                            Promise.resolve(),
                        );
                    })
                    .then(({ node }) => {
                        dispatch(changeNode(node));

                        dispatch(snapshotTransitionSuccess());
                        dispatch(snapshotAttachToTangleComplete());
                        dispatch(
                            generateAlert(
                                'success',
                                i18next.t('snapshotTransition:transitionComplete'),
                                i18next.t('snapshotTransition:transitionCompleteExplanation'),
                                20000,
                            ),
                        );

                        dispatch(resetProgress());
                    })
            );
        };

        return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
            .withRetries()(snapshotTransitionFn)()
            .catch((error) => {
                if (error.message === Errors.NODE_NOT_SYNCED) {
                    dispatch(generateNodeOutOfSyncErrorAlert());
                } else if (error.message === Errors.UNSUPPORTED_NODE) {
                    dispatch(generateUnsupportedNodeErrorAlert());
                } else {
                    dispatch(generateTransitionErrorAlert(error));
                }

                dispatch(snapshotTransitionError());
                dispatch(snapshotAttachToTangleComplete());
            });
    };
};

/**
 * Generates a batch of addresses from a seed and grabs balances for those addresses
 *
 * @method generateAddressesAndGetBalance
 *
 * @param {string | array} seed
 * @param {number} index
 * @param {string} accountName
 *
 * @returns {function}
 */
export const generateAddressesAndGetBalance = (seedStore, index, accountName, seedType = 'keychain') => {
    return (dispatch, getState) => {
        const options = {
            index,
            security: DEFAULT_SECURITY,
            total: seedType === 'ledger' ? 15 : 60,
        };

        return seedStore
            .generateAddress(options)
            .then((addresses) => {
                const latestAccountName = getSelectedAccountName(getState());

                if (latestAccountName === accountName) {
                    dispatch(updateTransitionAddresses(addresses));
                    dispatch(getBalanceForCheck(addresses));
                }
            })
            .catch((error) => {
                dispatch(snapshotTransitionError());
                dispatch(generateTransitionErrorAlert(error));
            });
    };
};

/**
 * Fetch balances against addresses and update total transition balance
 *
 * @method getBalanceForCheck
 *
 * @param {array} addresses
 * @param {boolean} withQuorum
 *
 * @returns {function}
 */
export const getBalanceForCheck = (addresses, quorum = true) => {
    return (dispatch, getState) => {
        return new NodesManager(nodesConfigurationFactory({ quorum })(getState()))
            .withRetries()(getBalancesAsync)(addresses)
            .then((result) => {
                const balanceOnAddresses = accumulateBalance(map(result.balances, Number));

                dispatch(updateTransitionBalance(balanceOnAddresses));
                dispatch(setBalanceCheckFlag(true));
            })
            .catch((error) => {
                dispatch(snapshotTransitionError());
                dispatch(generateTransitionErrorAlert(error));
            });
    };
};

/**
 * Dispatch when validating an address
 *
 * @method addressValidationRequest
 *
 * @returns {{type: {string} }}
 */
export const addressValidationRequest = () => ({
    type: ActionTypes.ADDRESS_VALIDATION_REQUEST,
});

/**
 * Dispatch when an address has been successfully validated
 *
 * @method addressValidationSuccess
 *
 * @returns {{type: {string} }}
 */
export const addressValidationSuccess = () => ({
    type: ActionTypes.ADDRESS_VALIDATION_SUCCESS,
});

/**
 * Dispatch to push to navigation stack
 *
 * @method pushRoute
 * @param {string} payload
 *
 * @returns {{ type: {string}, payload: {string} }}
 */
export const pushRoute = (payload) => {
    return {
        type: ActionTypes.PUSH_ROUTE,
        payload,
    };
};

/**
 * Dispatch to pop from navigation stack
 *
 * @method popRoute
 *
 * @returns {{type: {string}}}
 */
export const popRoute = () => {
    return {
        type: ActionTypes.POP_ROUTE,
    };
};

/**
 * Dispatch to pop to a particular route in the navigation stack
 *
 * @method popToRoute
 * @param {string} payload
 *
 * @returns {{type: {string}}}
 */
export const popToRoute = (payload) => {
    return {
        type: ActionTypes.POP_TO_ROUTE,
        payload,
    };
};

/**
 * Dispatch to set navigation root
 *
 * @method resetRoute
 * @param {string} payload
 *
 * @returns {{ type: {string}, payload: {string} }}
 */
export const resetRoute = (payload) => {
    return {
        type: ActionTypes.RESET_ROUTE,
        payload,
    };
};

/**
 * Dispatch to suggest that user should update
 *
 * @method shouldUpdate
 *
 * @returns {{type: {string} }}
 */
export const shouldUpdate = () => ({
    type: ActionTypes.SHOULD_UPDATE,
});

/**
 * Dispatch to force user to update
 *
 * @method forceUpdate
 *
 * @returns {{type: {string} }}
 */
export const forceUpdate = () => ({
    type: ActionTypes.FORCE_UPDATE,
});

/**
 * Dispatch to display test version warning
 *
 * @method displayTestWarning
 *
 * @returns {{type: {string} }}
 */
export const displayTestWarning = () => ({
    type: ActionTypes.DISPLAY_TEST_WARNING,
});
