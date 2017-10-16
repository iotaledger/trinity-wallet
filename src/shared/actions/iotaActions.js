import { iota } from '../libs/iota';

// FIXME: Hacking no-console linting.
// Should rather be dispatching an action.

/* eslint-disable no-console */

export function setAddress(address) {
    return {
        type: 'SET_ADDRESS',
        payload: address,
    };
}

export function setReady() {
    return {
        type: 'SET_READY',
        payload: true,
    };
}

export function setSeed(seed) {
    return {
        type: 'SET_SEED',
        payload: seed,
    };
}

function addTransactionValues(transactions, addresses) {
    // Add transaction value property to each transaction object
    // FIXME: We should never mutate parameters at any level.
    return transactions.map(arr => {
        /* eslint-disable no-param-reassign */
        arr[0].transactionValue = 0;
        arr.map(obj => {
            if (addresses.includes(obj.address)) {
                arr[0].transactionValue += obj.value;
            }

            /* eslint-enable no-param-reassign */
            return obj;
        });

        return arr;
    });
}

function sortTransactions(transactions) {
    // Order transactions from oldest to newest
    const sortedTransactions = transactions.sort((a, b) => {
        if (a[0].timestamp > b[0].timestamp) {
            return -1;
        }
        if (a[0].timestamp < b[0].timestamp) {
            return 1;
        }
        return 0;
    });
    return sortedTransactions;
}

export function setAccountInfo(accountInfo) {
    const balance = accountInfo.balance;
    let transactions = sortTransactions(accountInfo.transfers);
    transactions = addTransactionValues(transactions, accountInfo.addresses);
    return {
        type: 'SET_ACCOUNTINFO',
        balance,
        transactions,
    };
}

export function getAccountInfo(seed) {
    return dispatch => {
        iota.api.getAccountData(seed, (error, success) => {
            if (!error) {
                Promise.resolve(dispatch(setAccountInfo(success))).then(dispatch(setReady()));
            } else {
                console.log('SOMETHING WENT WRONG: ', error);
            }
        });
    };
}

export function checkNode() {
    return dispatch => {
        iota.api.getNodeInfo(error => {
            if (!error) {
                dispatch(getAccountInfo(seed));
            } else {
                console.log(error);
            }
        });
    };
}

export function generateNewAddress(seed) {
    return dispatch => {
        iota.api.getNewAddress(seed, { checksum: true }, (error, success) => {
            if (!error) {
                dispatch(setAddress(success));
            } else {
                console.log('SOMETHING WENT WRONG: ', error);
            }
        });
    };
}

export function sendTransaction(seed, address, value, message) {
    // Stringify to JSON
    const messageStringified = JSON.stringify(message);
    // Convert to Trytes
    const messageTrytes = iota.utils.toTrytes(messageStringified);
    const transfer = [
        {
            address: address,
            value: value,
            message: messageTrytes,
            tag: 'AAA',
        },
    ];
    if (!iota.valid.isTransfersArray(transfer)) {
        console.log('Error: Invalid transfer array');
        return;
    }
    // Send transfer with depth 3 and minWeightMagnitude 14
    iota.api.sendTransfer(seed, 3, 14, transfer, (error, success) => {
        if (!error) {
            console.log('SUCCESSFULLY SENT TRANSFER: ', success);
        } else {
            console.log('SOMETHING WENT WRONG: ', error);
        }
    });
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
                    if (bytes[key] < 243 && seed.length < 81) {
                        const randomNumber = bytes[key] % 27;
                        const randomLetter = charset.charAt(randomNumber);
                        seed += randomLetter;
                    }
                });

                dispatch(setSeed(seed));
            } else {
                console.log(error);
            }
        });
    };
}

export function clearIOTA() {
    return {
        type: 'CLEAR_IOTA',
    };
}

export function setPassword(password) {
    return {
        type: 'SET_PASSWORD',
        payload: password,
    };
}
