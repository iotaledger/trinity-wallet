import get from 'lodash/get';
import some from 'lodash/some';
import isFunction from 'lodash/isFunction';
import { iota } from '../libs/iota';
import { updateAddresses, updateAccountInfo, accountInfoFetchSuccess } from '../actions/account';
import {
    selectedAccountStateFactory,
    getNetworkBoundPowFromState,
    selectFirstAddressFromAccountFactory,
} from '../selectors/account';
import { clearSendFields } from '../actions/ui';
import { generateAlert } from '../actions/alerts';
import {
    prepareTransferArray,
    filterInvalidPendingTransfers,
    filterZeroValueTransfers,
    makeTransferWithLocalPow,
} from '../libs/iota/transfers';
import { syncAccount } from '../libs/iota/accounts';
import { shouldAllowSendingToAddress, syncAddresses, getLatestAddress } from '../libs/iota/addresses';
import { getStartingSearchIndexToPrepareInputs, getUnspentInputs } from '../libs/iota/inputs';
import { MAX_SEED_LENGTH } from '../libs/util';
import { DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE } from '../config';
import { sendTransferAsync } from '../libs/iota/extendedApi';
import i18next from '../i18next.js';

/* eslint-disable no-console */

export const ActionTypes = {
    GET_TRANSFERS_REQUEST: 'IOTA/TEMP_ACCOUNT/GET_TRANSFERS_REQUEST',
    GET_TRANSFERS_SUCCESS: 'IOTA/TEMP_ACCOUNT/GET_TRANSFERS_SUCCESS',
    GET_TRANSFERS_ERROR: 'IOTA/TEMP_ACCOUNT/GET_TRANSFERS_ERROR',
    GENERATE_NEW_ADDRESS_REQUEST: 'IOTA/TEMP_ACCOUNT/GENERATE_NEW_ADDRESS_REQUEST',
    GENERATE_NEW_ADDRESS_SUCCESS: 'IOTA/TEMP_ACCOUNT/GENERATE_NEW_ADDRESS_SUCCESS',
    GENERATE_NEW_ADDRESS_ERROR: 'IOTA/TEMP_ACCOUNT/GENERATE_NEW_ADDRESS_ERROR',
    SEND_TRANSFER_REQUEST: 'IOTA/TEMP_ACCOUNT/SEND_TRANSFER_REQUEST',
    SEND_TRANSFER_SUCCESS: 'IOTA/TEMP_ACCOUNT/SEND_TRANSFER_SUCCESS',
    SEND_TRANSFER_ERROR: 'IOTA/TEMP_ACCOUNT/SEND_TRANSFER_ERROR',
    SET_COPIED_TO_CLIPBOARD: 'IOTA/TEMP_ACCOUNT/SET_COPIED_TO_CLIPBOARD',
    SET_RECEIVE_ADDRESS: 'IOTA/TEMP_ACCOUNT/SET_RECEIVE_ADDRESS',
    SET_SEED_NAME: 'IOTA/TEMP_ACCOUNT/SET_SEED_NAME',
    SET_PASSWORD: 'IOTA/TEMP_ACCOUNT/SET_PASSWORD',
    CLEAR_TEMP_DATA: 'IOTA/TEMP_ACCOUNT/CLEAR_TEMP_DATA',
    SET_USED_SEED_TO_LOGIN: 'IOTA/TEMP_ACCOUNT/SET_USED_SEED_TO_LOGIN',
    SET_SEED_INDEX: 'IOTA/TEMP_ACCOUNT/SET_SEED_INDEX',
    SET_READY: 'IOTA/TEMP_ACCOUNT/SET_READY',
    SET_SEED: 'IOTA/TEMP_ACCOUNT/SET_SEED',
    CLEAR_SEED: 'IOTA/TEMP_ACCOUNT/CLEAR_SEED',
    SET_SETTING: 'IOTA/TEMP_ACCOUNT/SET_SETTING',
    SET_USER_ACTIVITY: 'IOTA/TEMP_ACCOUNT/SET_USER_ACTIVITY',
    SET_ADDITIONAL_ACCOUNT_INFO: 'IOTA/TEMP_ACCOUNT/SET_ADDITIONAL_ACCOUNT_INFO',
    SNAPSHOT_TRANSITION_REQUEST: 'IOTA/TEMP_ACCOUNT/SNAPSHOT_TRANSITION_REQUEST',
    SNAPSHOT_TRANSITION_SUCCESS: 'IOTA/TEMP_ACCOUNT/SNAPSHOT_TRANSITION_SUCCESS',
    SNAPSHOT_TRANSITION_ERROR: 'IOTA/TEMP_ACCOUNT/SNAPSHOT_TRANSITION_ERROR',
    SNAPSHOT_ATTACH_TO_TANGLE_REQUEST: 'IOTA/TEMP_ACCOUNT/SNAPSHOT_ATTACH_TO_TANGLE_REQUEST',
    SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE: 'IOTA/TEMP_ACCOUNT/SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE',
    UPDATE_TRANSITION_BALANCE: 'IOTA/TEMP_ACCOUNT/UPDATE_TRANSITION_BALANCE',
    SWITCH_BALANCE_CHECK_TOGGLE: 'IOTA/TEMP_ACCOUNT/SWITCH_BALANCE_CHECK_TOGGLE',
    UPDATE_TRANSITION_ADDRESSES: 'IOTA/TEMP_ACCOUNT/UPDATE_TRANSITION_ADDRESSES',
};

export const updateTransitionAddresses = (payload) => ({
    type: ActionTypes.UPDATE_TRANSITION_ADDRESSES,
    payload,
});

export const updateTransitionBalance = (payload) => ({
    type: ActionTypes.UPDATE_TRANSITION_BALANCE,
    payload,
});

export const switchBalanceCheckToggle = () => ({
    type: ActionTypes.SWITCH_BALANCE_CHECK_TOGGLE,
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

export const snapshotAttachToTangleRequest = (payload) => ({
    type: ActionTypes.SNAPSHOT_ATTACH_TO_TANGLE_REQUEST,
    payload,
});

export const snapshotAttachToTangleComplete = () => ({
    type: ActionTypes.SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE,
});

export const getTransfersRequest = () => ({
    type: ActionTypes.GET_TRANSFERS_REQUEST,
});

export const getTransfersSuccess = (payload) => ({
    type: ActionTypes.GET_TRANSFERS_SUCCESS,
    payload,
});

export const getTransfersError = () => ({
    type: ActionTypes.GET_TRANSFERS_ERROR,
});

export const setCopiedToClipboard = (payload) => ({
    type: ActionTypes.SET_COPIED_TO_CLIPBOARD,
    payload,
});

export const setReceiveAddress = (payload) => ({
    type: ActionTypes.SET_RECEIVE_ADDRESS,
    payload,
});

export const setUsedSeedToLogin = () => ({
    type: ActionTypes.SET_USED_SEED_TO_LOGIN,
    payload: true,
});

export const setSeedIndex = (payload) => ({
    type: ActionTypes.SET_SEED_INDEX,
    payload,
});

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

export const setReady = () => ({
    type: ActionTypes.SET_READY,
    payload: true,
});

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

export const clearTempData = () => ({
    type: ActionTypes.CLEAR_TEMP_DATA,
});

export const setPassword = (payload) => ({
    type: ActionTypes.SET_PASSWORD,
    payload,
});

export const setSeedName = (payload) => ({
    type: ActionTypes.SET_SEED_NAME,
    payload,
});

export const setAdditionalAccountInfo = (payload) => ({
    type: ActionTypes.SET_ADDITIONAL_ACCOUNT_INFO,
    payload,
});

export const generateNewAddress = (seed, accountName, existingAccountData) => {
    return (dispatch) => {
        dispatch(generateNewAddressRequest());

        return syncAddresses(seed, existingAccountData, true)
            .then((newAccountData) => {
                const receiveAddress = iota.utils.addChecksum(getLatestAddress(newAccountData.addresses));
                dispatch(updateAddresses(accountName, newAccountData.addresses));
                dispatch(generateNewAddressSuccess(receiveAddress));
            })
            .catch(() => dispatch(generateNewAddressError()));
    };
};

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

const makeTransfer = (seed, address, value, accountName, transfer, options = null, powFn = null) => (dispatch) => {
    // If powFn is provided, proof of work would be performed locally
    const shouldOffloadPow = !isFunction(powFn);

    let args = shouldOffloadPow
        ? [seed, DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE, transfer]
        : [seed, transfer, powFn];

    if (options) {
        args = [...args, options];
    }

    const promise = shouldOffloadPow ? sendTransferAsync : makeTransferWithLocalPow;

    return promise(...args)
        .then((newTransfer) => {
            dispatch(updateAccountInfo(accountName, newTransfer, value));

            if (value === 0) {
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

            dispatch(completeTransfer({ address, value }));
        })
        .catch((error) => {
            dispatch(sendTransferError());
            const alerts = {
                attachToTangle: [
                    i18next.t('global:attachToTangleUnavailable'),
                    i18next.t('global:attachToTangleUnavailableExplanation'),
                    20000,
                    error,
                ],
                default: [
                    i18next.t('global:invalidResponse'),
                    i18next.t('global:invalidResponseSendingTransfer'),
                    20000,
                    error,
                ],
            };

            const args =
                error.message.indexOf('attachToTangle is not available') > -1 ? alerts.attachToTangle : alerts.default;

            dispatch(generateAlert('error', ...args));
        });
};

export const prepareTransfer = (seed, address, value, message, accountName, powFn) => {
    return (dispatch, getState) => {
        dispatch(sendTransferRequest());

        const shouldOffloadPow = getNetworkBoundPowFromState(getState());
        const firstAddress = selectFirstAddressFromAccountFactory(accountName)(getState());
        const transfer = prepareTransferArray(address, value, message, firstAddress);
        const isZeroValue = value === 0;

        // If its a zero value transfer,
        // Do not need to trigger pre-transfer checks
        if (isZeroValue && shouldOffloadPow) {
            return dispatch(makeTransfer(seed, address, value, accountName, transfer));
        } else if (isZeroValue && !shouldOffloadPow) {
            return dispatch(makeTransfer(seed, address, value, accountName, transfer, null, powFn));
        }

        const makeTransferWithBalanceCheck = (inputs) => {
            // allBalance -> total balance associated with addresses.
            // Contains balance from addresses regardless of the fact they are spent from.
            // Less than the value user is about to send to -> Not enough balance.
            if (get(inputs, 'allBalance') < value) {
                dispatch(sendTransferError());
                return dispatch(
                    generateAlert(
                        'error',
                        i18next.t('global:balanceError'),
                        i18next.t('global:balanceErrorMessage'),
                        20000,
                    ),
                );

                // totalBalance -> balance after filtering out addresses that are spent.
                // Contains balance from those addresses only that are not spent from.
                // Less than value user is about to send to -> Has already spent from addresses and the txs aren't confirmed.
                // TODO: At this point, we could leverage the change addresses and allow user making a transfer on top from those.
            } else if (get(inputs, 'totalBalance') < value) {
                dispatch(sendTransferError());
                return dispatch(
                    generateAlert(
                        'error',
                        i18next.t('global:pleaseWait'),
                        i18next.t('global:pleaseWaitTransferExplanation'),
                        20000,
                    ),
                );
            }

            // Verify if a user is sending to on of his own addresses.
            const isSendingToOwnAddress = some(
                get(inputs, 'inputs'),
                (input) => input.address === iota.utils.noChecksum(address),
            );

            if (isSendingToOwnAddress) {
                dispatch(sendTransferError());
                return dispatch(
                    generateAlert(
                        'error',
                        i18next.t('global:cannotSendToOwn'),
                        i18next.t('global:cannotSendToOwnExplanation'),
                        20000,
                    ),
                );
            }

            const remainderAddress = getLatestAddress(newAccountData.addresses);

            return dispatch(
                makeTransfer(
                    seed,
                    address,
                    value,
                    accountName,
                    transfer,
                    {
                        inputs: get(inputs, 'inputs'),
                        address: remainderAddress,
                    },
                    powFn,
                ),
            );
        };

        let newAccountData = {};

        const syncAndGetInputs = () => {
            const existingAccountState = selectedAccountStateFactory(accountName)(getState());

            return syncAddresses(seed, existingAccountState, true)
                .then((accountData) => {
                    return syncAccount(seed, accountData);
                })
                .then((accountData) => {
                    dispatch(accountInfoFetchSuccess(accountData));
                    newAccountData = accountData;

                    const valueTransfers = filterZeroValueTransfers(newAccountData.transfers);
                    return filterInvalidPendingTransfers(valueTransfers, newAccountData.addresses);
                })
                .then((filteredTransfers) => {
                    const newAddressData = newAccountData.addresses;
                    const startIndex = getStartingSearchIndexToPrepareInputs(newAddressData);

                    getUnspentInputs(newAddressData, filteredTransfers, startIndex, value, null, unspentInputs);
                })
                .catch(() => {
                    dispatch(sendTransferError());
                });
        };

        const unspentInputs = (err, inputs) => {
            if (err) {
                dispatch(sendTransferError());
                return dispatch(
                    generateAlert('error', i18next.t('global:transferError'), i18next.t('global:transferErrorMessage')),
                    20000,
                    err,
                );
            }

            return makeTransferWithBalanceCheck(inputs);
        };

        // Make sure that the address a user is about to send to is not already used.
        // err -> Since shouldAllowSendingToAddress consumes wereAddressesSpentFrom endpoint
        // Omit input preparation in case the address is already spent from.
        return shouldAllowSendingToAddress([address])
            .then((shouldAllowSending) => {
                if (shouldAllowSending) {
                    return syncAndGetInputs();
                }

                dispatch(sendTransferError());
                return dispatch(
                    generateAlert('error', i18next.t('global:keyReuse'), i18next.t('global:keyReuseError')),
                );
            })
            .catch((err) => {
                console.log('Err', err);
                return dispatch(
                    generateAlert('error', i18next.t('global:transferError'), i18next.t('global:transferErrorMessage')),
                    20000,
                    err,
                );
            });
    };
};

export const randomiseSeed = (randomBytesFn) => {
    return (dispatch) => {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
        let seed = '';
        randomBytesFn(100).then((bytes) => {
            Object.keys(bytes).forEach((key) => {
                if (bytes[key] < 243 && seed.length < MAX_SEED_LENGTH) {
                    const randomNumber = bytes[key] % 27;
                    const randomLetter = charset.charAt(randomNumber);
                    seed += randomLetter;
                }
            });
            dispatch(setSeed(seed));
        });
    };
};

export function setUserActivity(payload) {
    return {
        type: ActionTypes.SET_USER_ACTIVITY,
        payload,
    };
}
