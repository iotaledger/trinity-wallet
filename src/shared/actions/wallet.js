import map from 'lodash/map';
import noop from 'lodash/noop';
import findLastIndex from 'lodash/findLastIndex';
import reduce from 'lodash/reduce';
import { updateAddresses, updateAccountAfterTransition } from '../actions/accounts';
import { generateAlert, generateTransitionErrorAlert } from '../actions/alerts';
import { setActiveStepIndex, startTrackingProgress, reset as resetProgress } from '../actions/progress';
import { accumulateBalance, attachAndFormatAddress, syncAddresses } from '../libs/iota/addresses';
import i18next from '../i18next';
import { syncAccountDuringSnapshotTransition } from '../libs/iota/accounts';
import { getBalancesAsync, generateAddressesAsync } from '../libs/iota/extendedApi';
import Errors from '../libs/errors';
import { selectedAccountStateFactory } from '../selectors/accounts';
import { DEFAULT_SECURITY } from '../config';

export const ActionTypes = {
    GENERATE_NEW_ADDRESS_REQUEST: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_REQUEST',
    GENERATE_NEW_ADDRESS_SUCCESS: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_SUCCESS',
    GENERATE_NEW_ADDRESS_ERROR: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_ERROR',
    SET_RECEIVE_ADDRESS: 'IOTA/WALLET/SET_RECEIVE_ADDRESS',
    SET_ACCOUNT_NAME: 'IOTA/WALLET/SET_ACCOUNT_NAME',
    SET_PASSWORD: 'IOTA/WALLET/SET_PASSWORD',
    CLEAR_WALLET_DATA: 'IOTA/WALLET/CLEAR_WALLET_DATA',
    SET_SEED_INDEX: 'IOTA/WALLET/SET_SEED_INDEX',
    SET_READY: 'IOTA/WALLET/SET_READY',
    SET_SEED: 'IOTA/WALLET/SET_SEED',
    CLEAR_SEED: 'IOTA/WALLET/CLEAR_SEED',
    SET_SETTING: 'IOTA/WALLET/SET_SETTING',
    SET_ADDITIONAL_ACCOUNT_INFO: 'IOTA/WALLET/SET_ADDITIONAL_ACCOUNT_INFO',
    SNAPSHOT_TRANSITION_REQUEST: 'IOTA/WALLET/SNAPSHOT_TRANSITION_REQUEST',
    SNAPSHOT_TRANSITION_SUCCESS: 'IOTA/WALLET/SNAPSHOT_TRANSITION_SUCCESS',
    SNAPSHOT_TRANSITION_ERROR: 'IOTA/WALLET/SNAPSHOT_TRANSITION_ERROR',
    SNAPSHOT_ATTACH_TO_TANGLE_REQUEST: 'IOTA/WALLET/SNAPSHOT_ATTACH_TO_TANGLE_REQUEST',
    SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE: 'IOTA/WALLET/SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE',
    UPDATE_TRANSITION_BALANCE: 'IOTA/WALLET/UPDATE_TRANSITION_BALANCE',
    UPDATE_TRANSITION_ADDRESSES: 'IOTA/WALLET/UPDATE_TRANSITION_ADDRESSES',
    SWITCH_BALANCE_CHECK_TOGGLE: 'IOTA/WALLET/SWITCH_BALANCE_CHECK_TOGGLE',
    CONNECTION_CHANGED: 'IOTA/WALLET/CONNECTION_CHANGED',
    SET_DEEP_LINK: 'IOTA/APP/WALLET/SET_DEEP_LINK',
    SET_DEEP_LINK_INACTIVE: 'IOTA/APP/WALLET/SET_DEEP_LINK_INACTIVE',
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
 * Dispatch to set new account name during mobile onboarding
 *
 * @method setAccountName
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setAccountName = (payload) => ({
    type: ActionTypes.SET_ACCOUNT_NAME,
    payload,
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
 * @method setPassword
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
 * Dispatch to complete loading of account information for newly added account to wallet
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
 * Dispatch to temporarily set seed and related info (If seed was generated within Trinity) in state during mobile onboarding
 *
 * @method setSeed
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setSeed = (payload) => ({
    type: ActionTypes.SET_SEED,
    payload,
});

/**
 * Dispatch to clear temporarily stored seed from state
 *
 * @method clearSeed
 *
 * @returns {{type: {string} }}
 */
export const clearSeed = () => ({
    type: ActionTypes.CLEAR_SEED,
    payload: Array(82).join(' '),
});

/**
 * Dispatch to set active setting name (for settings screen on mobile) in state
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
 * Dispatch to temporarily store account information for additional seeds in state
 *
 * @method setAdditionalAccountInfo
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setAdditionalAccountInfo = (payload) => ({
    type: ActionTypes.SET_ADDITIONAL_ACCOUNT_INFO,
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
 * Dispatch to show/hide (is your balance correct) modal during snapshot transition
 *
 * @method switchBalanceCheckToggle
 *
 * @returns {{type: {string} }}
 */
export const switchBalanceCheckToggle = () => ({
    type: ActionTypes.SWITCH_BALANCE_CHECK_TOGGLE,
});

/**
 * Dispatch to set parsed data from link (amount, address and message) in state
 *
 * @method setDeepLink
 * @param {string} amount
 * @param {string} address
 * @param {string} message
 *
 * @returns {{type: {string}, amount: {string}, address: {string}, message: {string} }}
 */
export const setDeepLink = (amount, address, message) => {
    return {
        type: ActionTypes.SET_DEEP_LINK,
        amount,
        address,
        message,
    };
};

/**
 * Dispatch to disable deep linking for wallet
 *
 * @method setDeepLinkInactive
 *
 * @returns {{type: {string} }}
 */
export const setDeepLinkInactive = () => {
    return {
        type: ActionTypes.SET_DEEP_LINK_INACTIVE,
    };
};

/**
 * Generate new receive address for wallet
 *
 * @method generateNewAddress
 *
 * @param {string} seed
 * @param {string} accountName
 * @param {object} existingAccountData
 * @param {function} genFn
 *
 * @returns {function(*): Promise<any>}
 */
export const generateNewAddress = (seed, accountName, existingAccountData, genFn) => {
    return (dispatch) => {
        dispatch(generateNewAddressRequest());
        return syncAddresses(seed, existingAccountData.addresses, genFn)
            .then((latestAddressData) => {
                dispatch(updateAddresses(accountName, latestAddressData));
                dispatch(generateNewAddressSuccess());
            })
            .catch(() => dispatch(generateNewAddressError()));
    };
};

/**
 * Checks for balance against generated addresses for transition
 * In case there are no addresses generated yet, it will generate a batch of addresses
 * and will fetch balance against those
 *
 * @method transitionForSnapshot
 *
 * @param {string} seed
 * @param {array} addresses
 * @param {function} genFn
 *
 * @returns {function} - dispatch
 */
export const transitionForSnapshot = (seed, addresses, genFn) => {
    return (dispatch) => {
        dispatch(snapshotTransitionRequest());
        if (addresses.length > 0) {
            dispatch(getBalanceForCheck(addresses));
            dispatch(updateTransitionAddresses(addresses));
        } else {
            setTimeout(() => {
                dispatch(generateAddressesAndGetBalance(seed, 0, genFn));
            });
        }
    };
};

/**
 * Completes snapshot transition by sequentially attaching addresses to tangle
 *
 * @method completeSnapshotTransition
 *
 * @param {string} seed
 * @param {string} accountName
 * @param {array} addresses
 * @param {function} powFn
 *
 * @returns {function}
 */
export const completeSnapshotTransition = (seed, accountName, addresses, powFn) => {
    return (dispatch, getState) => {
        dispatch(
            generateAlert(
                'info',
                i18next.t('snapshotTransition:attaching'),
                i18next.t('global:deviceMayBecomeUnresponsive'),
            ),
        );

        dispatch(snapshotAttachToTangleRequest());

        // Find balance on all addresses
        getBalancesAsync(addresses)
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

                            return attachAndFormatAddress(address, index, relevantBalances[index], seed, powFn)
                                .then(({ addressData, transfer }) => {
                                    const existingAccountState = selectedAccountStateFactory(accountName)(getState());

                                    const { newState } = syncAccountDuringSnapshotTransition(
                                        transfer,
                                        addressData,
                                        existingAccountState,
                                    );
                                    dispatch(updateAccountAfterTransition(newState));

                                    return result;
                                })
                                .catch(noop);
                        });
                    },
                    Promise.resolve(),
                );
            })
            .then(() => {
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
            .catch((error) => {
                dispatch(snapshotTransitionError());
                dispatch(snapshotAttachToTangleComplete());
                dispatch(generateTransitionErrorAlert(error));
            });
    };
};

/**
 * Generates a batch of addresses from a seed and grabs balances for those addresses
 *
 * @method generateAddressesAndGetBalance
 *
 * @param {string} seed
 * @param {number} index
 * @param {function} genFn
 *
 * @returns {function}
 */
export const generateAddressesAndGetBalance = (seed, index, genFn) => {
    return (dispatch) => {
        const options = {
            index,
            total: 20,
            security: DEFAULT_SECURITY,
        };

        generateAddressesAsync(seed, options, genFn, (error, addresses) => {
            if (error) {
                dispatch(snapshotTransitionError());
                dispatch(generateTransitionErrorAlert(error));
            } else {
                dispatch(updateTransitionAddresses(addresses));
                dispatch(getBalanceForCheck(addresses));
            }
        });
    };
};

/**
 * Fetch balances against addresses and update total transition balance
 *
 * @method getBalanceForCheck
 *
 * @param {array} addresses
 *
 * @returns {function}
 */
export const getBalanceForCheck = (addresses) => {
    return (dispatch) => {
        getBalancesAsync(addresses)
            .then((balances) => {
                const balanceOnAddresses = accumulateBalance(map(balances.balances, Number));

                dispatch(updateTransitionBalance(balanceOnAddresses));
                dispatch(switchBalanceCheckToggle());
            })
            .catch((error) => {
                dispatch(snapshotTransitionError());
                dispatch(generateTransitionErrorAlert(error));
            });
    };
};
