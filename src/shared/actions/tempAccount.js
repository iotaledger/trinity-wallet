import i18next from '../i18next.js';
import cloneDeep from 'lodash/cloneDeep';
import size from 'lodash/size';
import get from 'lodash/get';
import { iota } from '../libs/iota';
import { updateAddresses, updateAccountInfo } from '../actions/account';
import { generateAlert } from '../actions/alerts';
import { filterSpentAddresses, getUnspentInputs } from '../libs/accountUtils';
import { MAX_SEED_LENGTH } from '../libs/util';
import { prepareTransferArray } from '../libs/transfers';
import { getSelectedAccount } from '../selectors/account';
import { DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE } from '../config';

/* eslint-disable no-console */

export const ActionTypes = {
    GET_TRANSFERS_REQUEST: 'IOTA/TEMP_ACCOUNT/GET_TRANSFERS_REQUEST',
    GET_TRANSFERS_SUCCESS: 'IOTA/TEMP_ACCOUNT/GET_TRANSFERS_SUCCESS',
    GET_TRANSFERS_ERROR: 'IOTA/TEMP_ACCOUNT/GET_TRANSFERS_ERROR',
    GENERATE_NEW_ADDRESS_REQUEST: 'IOTA/TEMP_ACCOUNT/GENERATE_NEW_ADDRESS_REQUEST',
    GENERATE_NEW_ADDRESS_SUCCESS: 'IOTA/TEMP_ACCOUNT/GENERATE_NEW_ADDRESS_SUCCESS',
    GENERATE_NEW_ADDRESS_ERROR: 'IOTA/TEMP_ACCOUNT/GENERATE_NEW_ADDRESS_ERROR',
    MANUAL_SYNC_REQUEST: 'IOTA/TEMP_ACCOUNT/MANUAL_SYNC_REQUEST',
    MANUAL_SYNC_SUCCESS: 'IOTA/TEMP_ACCOUNT/MANUAL_SYNC_SUCCESS',
    MANUAL_SYNC_ERROR: 'IOTA/TEMP_ACCOUNT/MANUAL_SYNC_ERROR',
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
};

export const getTransfersRequest = () => ({
    type: ActionTypes.GET_TRANSFERS_REQUEST,
});

export const getTransfersSuccess = payload => ({
    type: ActionTypes.GET_TRANSFERS_SUCCESS,
    payload,
});

export const getTransfersError = () => ({
    type: ActionTypes.GET_TRANSFERS_ERROR,
});

export const setCopiedToClipboard = payload => ({
    type: ActionTypes.SET_COPIED_TO_CLIPBOARD,
    payload,
});

export const setReceiveAddress = payload => ({
    type: ActionTypes.SET_RECEIVE_ADDRESS,
    payload,
});

export const setUsedSeedToLogin = () => ({
    type: ActionTypes.SET_USED_SEED_TO_LOGIN,
    payload: true,
});

export const setSeedIndex = payload => ({
    type: ActionTypes.SET_SEED_INDEX,
    payload,
});

export const generateNewAddressRequest = () => ({
    type: ActionTypes.GENERATE_NEW_ADDRESS_REQUEST,
});

export const generateNewAddressSuccess = payload => ({
    type: ActionTypes.GENERATE_NEW_ADDRESS_SUCCESS,
    payload,
});

export const generateNewAddressError = () => ({
    type: ActionTypes.GENERATE_NEW_ADDRESS_ERROR,
});

export const manualSyncRequest = () => ({
    type: ActionTypes.MANUAL_SYNC_REQUEST,
});

export const manualSyncSuccess = () => ({
    type: ActionTypes.MANUAL_SYNC_SUCCESS,
});

export const manualSyncError = () => ({
    type: ActionTypes.MANUAL_SYNC_ERROR,
});

export const sendTransferRequest = () => ({
    type: ActionTypes.SEND_TRANSFER_REQUEST,
});

export const sendTransferSuccess = payload => ({
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

export const setSeed = payload => ({
    type: ActionTypes.SET_SEED,
    payload,
});

export const clearSeed = () => ({
    type: ActionTypes.CLEAR_SEED,
    payload: Array(82).join(' '),
});

export const setSetting = payload => ({
    type: ActionTypes.SET_SETTING,
    payload,
});

export const clearTempData = () => ({
    type: ActionTypes.CLEAR_TEMP_DATA,
});

export const setPassword = payload => ({
    type: ActionTypes.SET_PASSWORD,
    payload,
});

export const setSeedName = payload => ({
    type: ActionTypes.SET_SEED_NAME,
    payload,
});

export const setAdditionalAccountInfo = payload => ({
    type: ActionTypes.SET_ADDITIONAL_ACCOUNT_INFO,
    payload,
});

export const generateNewAddress = (seed, seedName, addresses) => {
    return dispatch => {
        dispatch(generateNewAddressRequest());
        let index = 0;

        size(addresses) === 0 ? (index = 0) : (index = size(addresses) - 1);
        const options = { checksum: true, index };

        iota.api.getNewAddress(seed, options, (error, address) => {
            if (!error) {
                //const addressToCheck = [{ address: address }];
                //Promise.resolve(filterSpentAddresses(addressToCheck)).then(value => console.log(value));

                const updatedAddresses = cloneDeep(addresses);
                const addressNoChecksum = address.substring(0, MAX_SEED_LENGTH);
                // In case the newly created address is not part of the addresses object
                // Add that as a key with a 0 balance.
                if (!(addressNoChecksum in addresses)) {
                    updatedAddresses[addressNoChecksum] = { index, balance: 0, spent: false };
                }

                dispatch(updateAddresses(seedName, updatedAddresses));
                dispatch(generateNewAddressSuccess(address));
            } else {
                dispatch(generateNewAddressError());
            }
        });
    };
};

const makeTransfer = (seed, address, value, accountName, transfer, options = null) => (dispatch, getState) => {
    const selectedAccount = getSelectedAccount(accountName, getState().account.accountInfo);
    const addressData = selectedAccount.addresses;
    let args = [seed, DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE, transfer];

    if (options) {
        args = [...args, options];
    }

    return iota.api.sendTransfer(...args, (error, success) => {
        if (!error) {
            dispatch(checkForNewAddress(accountName, addressData, success));
            dispatch(updateAccountInfo(accountName, success, value));
            if (value === 0) {
                dispatch(
                    generateAlert(
                        'success',
                        i18next.t('global:messageSent'),
                        i18next.t('global:messageSentMessage'),
                        100000,
                    ),
                );
            } else {
                dispatch(
                    generateAlert(
                        'success',
                        i18next.t('global:transferSent'),
                        i18next.t('global:transferSentMessage'),
                        100000,
                    ),
                );
            }
            dispatch(sendTransferSuccess({ address, value }));
        } else {
            dispatch(sendTransferError());
            const alerts = {
                attachToTangle: [
                    i18next.t('global:attachToTangleUnavailable'),
                    i18next.t('global:attachToTangleUnavailableExplanation'),
                    100000,
                ],
                default: [
                    i18next.t('global:invalidResponse'),
                    i18next.t('global:invalidResponseSendingTransfer'),
                    100000,
                ],
            };

            const args =
                error.message.indexOf('attachToTangle is not available') > -1 ? alerts.attachToTangle : alerts.default;

            dispatch(generateAlert('error', ...args));
        }
    });
};

export const prepareTransfer = (seed, address, value, message, accountName) => {
    return (dispatch, getState) => {
        dispatch(sendTransferRequest());

        const transfer = prepareTransferArray(address, value, message);

        if (value === 0) {
            return dispatch(makeTransfer(seed, address, value, accountName, transfer));
        }

        const verifyAndSend = (filtered, expectedOutputsLength, inputs) => {
            if (filtered.length !== expectedOutputsLength) {
                return dispatch(
                    generateAlert('error', i18next.t('global:keyReuse'), i18next.t('global:keyReuseError')),
                );
            }

            const options = { inputs };

            return dispatch(makeTransfer(seed, address, value, accountName, transfer, options));
        };

        const unspentInputs = (err, inputs) => {
            if (err && err.message !== 'Not enough balance') {
                dispatch(sendTransferError());

                return dispatch(
                    generateAlert('error', i18next.t('global:transferError'), i18next.t('global:transferErrorMessage')),
                    100000,
                );
            }

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
            } else if (get(inputs, 'totalBalance') < value) {
                dispatch(sendTransferError());
                return dispatch(
                    generateAlert('error', i18next.t('global:keyReuse'), i18next.t('global:keyReuseError'), 20000),
                );
            }

            const outputsToCheck = transfer.map(t => ({ address: iota.utils.noChecksum(t.address) }));

            // Check to make sure user is not sending to an already used address
            return filterSpentAddresses(outputsToCheck).then(filtered =>
                verifyAndSend(filtered, outputsToCheck.length, get(inputs, 'inputs')),
            );
        };

        const getStartingIndex = () => {
            const addresses = getSelectedAccount(accountName, getState().account.accountInfo).addresses;
            const addr = Object.keys(addresses).find(address => addresses[address].balance > 0);
            return addr ? addresses[addr].index : 0;
        };

        return getUnspentInputs(seed, getStartingIndex(), value, null, unspentInputs);
    };
};

export const checkForNewAddress = (seedName, addressData, txArray) => {
    return dispatch => {
        // Check if 0 value transfer
        if (txArray[0].value !== 0) {
            const changeAddress = txArray[txArray.length - 1].address;
            const addresses = Object.keys(addressData);
            // Remove checksum
            const addressNoChecksum = changeAddress.substring(0, MAX_SEED_LENGTH);
            // If current addresses does not include change address, add new address and balance
            if (!addresses.includes(addressNoChecksum)) {
                const addressArray = [addressNoChecksum];
                const index = addresses.length + 1;

                // Check change address balance
                iota.api.getBalances(addressArray, 1, (error, success) => {
                    if (!error) {
                        const addressBalance = parseInt(success.balances[0]);
                        addressData[addressNoChecksum] = { index, balance: addressBalance, spent: false };
                    } else {
                        addressData[addressNoChecksum] = { index, balance: 0, spent: false };
                    }
                });
            }
            dispatch(updateAddresses(seedName, addressData));
        }
    };
};

export const randomiseSeed = randomBytesFn => {
    return dispatch => {
        // TODO move this to an iota util file
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
        let seed = '';
        // uncomment for synchronous API, uses SJCL
        // var rand = randomBytes(1)

        // asynchronous API, uses iOS-side SecRandomCopyBytes
        randomBytesFn(100, (error, bytes) => {
            if (!error) {
                Object.keys(bytes).forEach(key => {
                    if (bytes[key] < 243 && seed.length < MAX_SEED_LENGTH) {
                        const randomNumber = bytes[key] % 27;
                        const randomLetter = charset.charAt(randomNumber);
                        seed += randomLetter;
                    }
                });
                dispatch(setSeed(seed));
            } else {
                dispatch(
                    generateAlert(
                        'error',
                        i18next.t('global:somethingWentWrong'),
                        i18next.t('global:somethingWentWrongExplanation'),
                        error,
                    ),
                );
            }
        });
    };
};

export function setUserActivity(payload) {
    return {
        type: ActionTypes.SET_USER_ACTIVITY,
        payload,
    };
}
