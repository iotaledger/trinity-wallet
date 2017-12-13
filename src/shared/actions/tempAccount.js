import cloneDeep from 'lodash/cloneDeep';
import size from 'lodash/size';
import get from 'lodash/get';
import { iota } from '../libs/iota';
import { updateAddresses, addPendingTransfer } from '../actions/account';
import { generateAlert } from '../actions/alerts';
import { filterSpentAddresses, getUnspentInputs } from '../libs/accountUtils';
import { MAX_SEED_LENGTH } from '../libs/util';

// FIXME: Hacking no-console linting.
// Should rather be dispatching an action.

/* eslint-disable no-console */

export function getTransfersRequest() {
    return {
        type: 'GET_TRANSFERS_REQUEST',
    };
}

export function getTransfersSuccess() {
    return {
        type: 'GET_TRANSFERS_SUCCESS',
    };
}

export function setCopiedToClipboard(boolean) {
    return {
        type: 'SET_COPIED_TO_CLIPBOARD',
        payload: boolean,
    };
}

export function setReceiveAddress(payload) {
    return {
        type: 'SET_RECEIVE_ADDRESS',
        payload,
    };
}

export function setUsedSeedToLogin() {
    return {
        type: 'SET_USED_SEED_TO_LOGIN',
        payload: true,
    };
}

// TODO: Remove this
// Depcreated in favor of setSeedIndex
export function incrementSeedIndex() {
    return {
        type: 'INCREMENT_SEED_INDEX',
    };
}

// TODO: Remove this
// Depcreated in favor of setSeedIndex
export function decrementSeedIndex() {
    return {
        type: 'DECREMENT_SEED_INDEX',
    };
}

export function setSeedIndex(payload) {
    return {
        type: 'SET_SEED_INDEX',
        payload,
    };
}

export function generateNewAddressRequest() {
    return {
        type: 'GENERATE_NEW_ADDRESS_REQUEST',
    };
}

export function generateNewAddressSuccess(payload) {
    return {
        type: 'GENERATE_NEW_ADDRESS_SUCCESS',
        payload,
    };
}

export function generateNewAddressError() {
    return {
        type: 'GENERATE_NEW_ADDRESS_ERROR',
    };
}

export function manualSyncRequest() {
    return {
        type: 'MANUAL_SYNC_REQUEST',
    };
}

export function manualSyncComplete() {
    return {
        type: 'MANUAL_SYNC_COMPLETE',
    };
}

export function sendTransferRequest() {
    return {
        type: 'SEND_TRANSFER_REQUEST',
    };
}

export function sendTransferSuccess(address, value) {
    return {
        type: 'SEND_TRANSFER_SUCCESS',
        address,
        value,
    };
}

export function sendTransferError() {
    return {
        type: 'SEND_TRANSFER_ERROR',
    };
}

export function setReady() {
    return {
        type: 'SET_READY',
        payload: true,
    };
}

export function setSeed(payload) {
    return {
        type: 'SET_SEED',
        payload,
    };
}

export function clearSeed() {
    return {
        type: 'CLEAR_SEED',
        payload: Array(82).join(' '),
    };
}

export function setSetting(setting) {
    return {
        type: 'SET_SETTING',
        payload: setting,
    };
}

export function replayBundle(transactionHash, depth = 3, minWeightMagnitude = 14) {
    return dispatch => {
        // Should be fire and forget
        return iota.api.replayBundle(transactionHash, depth, minWeightMagnitude, err => {
            if (err) {
                console.log(err);
                dispatch(
                    generateAlert(
                        'error',
                        'Invalid Response',
                        `The node returned an invalid response while auto-reattaching.`,
                    ),
                );
            } else {
                dispatch(
                    generateAlert(
                        'success',
                        'Autoreattaching to Tangle',
                        `Reattaching transaction with hash ${transactionHash}`,
                    ),
                );
            }
        });
    };
}

export function generateNewAddress(seed, seedName, addresses) {
    return dispatch => {
        let index = 0;
        size(addresses) == 0 ? (index = 0) : (index = size(addresses) - 1);
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
                    updatedAddresses[addressNoChecksum] = { balance: 0, spent: false };
                }

                dispatch(updateAddresses(seedName, updatedAddresses));
                dispatch(generateNewAddressSuccess(address));
            } else {
                dispatch(generateNewAddressError());
            }
        });
    };
}

export function sendTransaction(seed, currentSeedAccountInfo, seedName, address, value, message, tag = 'IOTA') {
    return dispatch => {
        const verifyAndSend = (filtered, expectedOutputsLength, transfer, inputs) => {
            if (filtered.length !== expectedOutputsLength) {
                return dispatch(
                    generateAlert(
                        'error',
                        'Key reuse',
                        `You cannot send to an address that has already been spent from.`,
                    ),
                );
            }
            // Send transfer with depth 4 and minWeightMagnitude 14
            const addressesWithBalance = currentSeedAccountInfo.addresses;
            const transfers = currentSeedAccountInfo.transfers;
            const options = { inputs };

            return iota.api.sendTransfer(seed, 4, 14, transfer, options, (error, success) => {
                if (!error) {
                    dispatch(checkForNewAddress(seedName, addressesWithBalance, success));
                    dispatch(addPendingTransfer(seedName, transfers, success));
                    dispatch(generateAlert('success', 'Transfer sent', 'Your transfer has been sent to the Tangle.'));
                    dispatch(sendTransferSuccess(address, value));
                } else {
                    dispatch(sendTransferError());
                    dispatch(
                        generateAlert(
                            'error',
                            'Invalid Response',
                            `The node returned an invalid response while sending transfer.`,
                        ),
                    );
                }
            });
        };

        const unspentInputs = (err, inputs) => {
            if (err && err.message !== 'Not enough balance') {
                dispatch(sendTransferError());
                return dispatch(
                    generateAlert(
                        'error',
                        'Transfer Error',
                        `Something went wrong while sending your transfer. Please try again.`,
                    ),
                );
            } else {
                if (get(inputs, 'allBalance') < value) {
                    dispatch(sendTransferError());
                    return dispatch(
                        generateAlert(
                            'error',
                            'Not enough balance',
                            'You do not have enough IOTA to complete this transfer.',
                        ),
                    );
                } else if (get(inputs, 'totalBalance') < value) {
                    dispatch(sendTransferError());
                    return dispatch(
                        generateAlert(
                            'error',
                            'Key reuse',
                            `You cannot send to an address that has already been spent from.`,
                        ),
                    );
                }

                const transfer = [
                    {
                        address: address,
                        value: value,
                        message: iota.utils.toTrytes(message),
                        tag: iota.utils.toTrytes(tag),
                    },
                ];

                const outputsToCheck = transfer.map(t => ({ address: iota.utils.noChecksum(t.address) }));

                // Check to make sure user is not sending to an already used address
                return filterSpentAddresses(outputsToCheck).then(filtered =>
                    verifyAndSend(filtered, outputsToCheck.length, transfer, get(inputs, 'inputs')),
                );
            }
        };

        return getUnspentInputs(seed, 0, value, null, unspentInputs);
    };
}

export function checkForNewAddress(seedName, addressesWithBalance, txArray) {
    return dispatch => {
        // Check if 0 value transfer
        if (txArray[0].value != 0) {
            const changeAddress = txArray[txArray.length - 1].address;
            const addresses = Object.keys(addressesWithBalance);
            // Remove checksum
            const addressNoChecksum = changeAddress.substring(0, MAX_SEED_LENGTH);
            // If current addresses does not include change address, add new address and balance
            if (!addresses.includes(addressNoChecksum)) {
                const addressArray = [addressNoChecksum];
                // Check change address balance
                iota.api.getBalances(addressArray, 1, (error, success) => {
                    if (!error) {
                        const addressBalance = parseInt(success.balances[0]);
                        addressesWithBalance[addressNoChecksum] = { balance: addressBalance, spent: false };
                    } else {
                        addressesWithBalance[addressNoChecksum] = { balance: 0, spent: false };
                    }
                });
            }
            dispatch(updateAddresses(seedName, addressesWithBalance));
        }
    };
}

export function randomiseSeed(randomBytesFn) {
    return dispatch => {
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
                console.log(error);
                dispatch(generateAlert('error', 'Something went wrong', `Please restart the app.`));
            }
        });
    };
}

export function clearTempData() {
    return {
        type: 'CLEAR_TEMP_DATA',
    };
}

export function setPassword(password) {
    return {
        type: 'SET_PASSWORD',
        payload: password,
    };
}

export function setSeedName(seedName) {
    return {
        type: 'SET_SEED_NAME',
        payload: seedName,
    };
}
