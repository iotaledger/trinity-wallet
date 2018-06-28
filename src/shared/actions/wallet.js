import map from 'lodash/map';
import noop from 'lodash/noop';
import findLastIndex from 'lodash/findLastIndex';
import reduce from 'lodash/reduce';
import { iota } from '../libs/iota';
import { updateAddresses, updateAccountAfterTransition } from '../actions/accounts';
import { generateAlert, generateTransitionErrorAlert } from '../actions/alerts';
import { setActiveStepIndex, startTrackingProgress, reset as resetProgress } from '../actions/progress';
import {
    getNewAddress,
    syncAddresses,
    getLatestAddress,
    accumulateBalance,
    attachAndFormatAddress,
} from '../libs/iota/addresses';
import i18next from '../i18next';
import { syncAccountDuringSnapshotTransition } from '../libs/iota/accounts';
import { getBalancesAsync } from '../libs/iota/extendedApi';
import Errors from '../libs/errors';
import { selectedAccountStateFactory } from '../selectors/accounts';

export const ActionTypes = {
    GENERATE_NEW_ADDRESS_REQUEST: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_REQUEST',
    GENERATE_NEW_ADDRESS_SUCCESS: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_SUCCESS',
    GENERATE_NEW_ADDRESS_ERROR: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_ERROR',
    SET_RECEIVE_ADDRESS: 'IOTA/WALLET/SET_RECEIVE_ADDRESS',
    SET_ACCOUNT_NAME: 'IOTA/WALLET/SET_ACCOUNT_NAME',
    SET_PASSWORD: 'IOTA/WALLET/SET_PASSWORD',
    CLEAR_WALLET_DATA: 'IOTA/WALLET/CLEAR_WALLET_DATA',
    SET_USED_SEED_TO_LOGIN: 'IOTA/WALLET/SET_USED_SEED_TO_LOGIN',
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

export const generateNewAddressRequest = () => ({
    type: ActionTypes.GENERATE_NEW_ADDRESS_REQUEST,
});

export const generateNewAddressSuccess = (payload) => ({
    type: ActionTypes.GENERATE_NEW_ADDRESS_SUCCESS,
    payload,
});

export const generateNewAddressError = () => ({
    type: ActionTypes.GENERATE_NEW_ADDRESS_ERROR,
});

export const setReceiveAddress = (payload) => ({
    type: ActionTypes.SET_RECEIVE_ADDRESS,
    payload,
});

export const setAccountName = (payload) => ({
    type: ActionTypes.SET_ACCOUNT_NAME,
    payload,
});

export const setPassword = (payload) => ({
    type: ActionTypes.SET_PASSWORD,
    payload,
});

export const clearWalletData = () => ({
    type: ActionTypes.CLEAR_WALLET_DATA,
});

export const setUsedSeedToLogin = () => ({
    type: ActionTypes.SET_USED_SEED_TO_LOGIN,
    payload: true,
});

export const setSeedIndex = (payload) => ({
    type: ActionTypes.SET_SEED_INDEX,
    payload,
});

export const setReady = () => ({
    type: ActionTypes.SET_READY,
    payload: true,
});

// TODO: Change name to something like setSeedInfo
// as payload now has other meta data
export const setSeed = (payload) => ({
    type: ActionTypes.SET_SEED,
    payload,
});

export const clearSeed = () => ({
    type: ActionTypes.CLEAR_SEED,
    payload: Array(82).join(' '),
});

export const setSetting = (payload) => ({
    type: ActionTypes.SET_SETTING,
    payload,
});

export const setAdditionalAccountInfo = (payload) => ({
    type: ActionTypes.SET_ADDITIONAL_ACCOUNT_INFO,
    payload,
});

export const snapshotTransitionRequest = () => ({
    type: ActionTypes.SNAPSHOT_TRANSITION_REQUEST,
});

export const snapshotTransitionSuccess = (payload) => ({
    type: ActionTypes.SNAPSHOT_TRANSITION_SUCCESS,
    payload,
});

export const snapshotTransitionError = () => ({
    type: ActionTypes.SNAPSHOT_TRANSITION_ERROR,
});

export const snapshotAttachToTangleRequest = () => ({
    type: ActionTypes.SNAPSHOT_ATTACH_TO_TANGLE_REQUEST,
});

export const snapshotAttachToTangleComplete = () => ({
    type: ActionTypes.SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE,
});

export const updateTransitionBalance = (payload) => ({
    type: ActionTypes.UPDATE_TRANSITION_BALANCE,
    payload,
});

export const updateTransitionAddresses = (payload) => ({
    type: ActionTypes.UPDATE_TRANSITION_ADDRESSES,
    payload,
});

export const switchBalanceCheckToggle = () => ({
    type: ActionTypes.SWITCH_BALANCE_CHECK_TOGGLE,
});

export const generateNewAddress = (seed, accountName, existingAccountData, genFn) => {
    return (dispatch) => {
        dispatch(generateNewAddressRequest());
        return syncAddresses(seed, existingAccountData.addresses, genFn, true)
            .then((latestAddressData) => {
                const receiveAddress = iota.utils.addChecksum(getLatestAddress(latestAddressData));
                dispatch(updateAddresses(accountName, latestAddressData));
                dispatch(generateNewAddressSuccess(receiveAddress));
            })
            .catch(() => dispatch(generateNewAddressError()));
    };
};

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

export const generateAddressesAndGetBalance = (seed, index, genFn) => {
    return (dispatch) => {
        const options = {
            index,
            total: 20,
            returnAll: true,
            security: 2,
        };

        getNewAddress(seed, options, genFn, (error, addresses) => {
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

export const setDeepLink = (amount, address, message) => {
    return {
        type: ActionTypes.SET_DEEP_LINK,
        amount,
        address,
        message,
    };
};

export const setDeepLinkInactive = () => {
    return {
        type: ActionTypes.SET_DEEP_LINK_INACTIVE,
    };
};
