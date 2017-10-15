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

function filterSpentAddresses(inputs) {
    return new Promise((resolve, reject) => {
        iota.api.findTransactionObjects({ addresses: inputs.map(input => input.address) }, (err, txs) => {
            if (err) {
                reject(err);
            }
            txs = txs.filter(tx => tx.value < 0);
            var bundleHashes = txs.map(tx => tx.bundle);
            if (txs.length > 0) {
                var bundles = txs.map(tx => tx.bundle);
                iota.api.findTransactionObjects({ bundles: bundles }, (err, txs) => {
                    if (err) {
                        reject(err);
                    }
                    var hashes = txs.filter(tx => tx.currentIndex === 0);
                    var allBundleHashes = txs.map(tx => tx.bundle);
                    hashes = hashes.map(tx => tx.hash);
                    iota.api.getLatestInclusion(hashes, (err, states) => {
                        if (err) {
                            reject(err);
                        }
                        var confirmedHashes = hashes.filter((hash, i) => states[i]);
                        var unconfirmedHashes = hashes
                            .filter(hash => confirmedHashes.indexOf(hash) === -1)
                            .map(hash => {
                                return { hash: hash, validate: true };
                            });
                        var getBundles = confirmedHashes.concat(unconfirmedHashes).map(
                            hash =>
                                new Promise((resolve, reject) => {
                                    iota.api.traverseBundle(
                                        typeof hash == 'string' ? hash : hash.hash,
                                        null,
                                        [],
                                        (err, bundle) => {
                                            if (err) {
                                                reject(err);
                                            }
                                            resolve(
                                                typeof hash === 'string' ? bundle : { bundle: bundle, validate: true },
                                            );
                                        },
                                    );
                                }),
                        );
                        resolve(
                            Promise.all(getBundles)
                                .then(bundles => {
                                    bundles = bundles
                                        .filter(bundle => {
                                            if (bundle.validate) {
                                                return iota.utils.isBundle(bundle.bundle);
                                            }
                                            return true;
                                        })
                                        .map(bundle => (bundle.hasOwnProperty('validate') ? bundle.bundle : bundle));
                                    var blacklist = bundles
                                        .reduce((a, b) => a.concat(b), [])
                                        .filter(tx => tx.value < 0)
                                        .map(tx => tx.address);
                                    return inputs.filter(input => blacklist.indexOf(input.address) === -1);
                                })
                                .catch(err => reject(err)),
                        );
                    });
                });
            } else {
                resolve(inputs);
            }
        });
    });
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
    var outputsToCheck = transfer.map(transfer => {
        return { address: iota.utils.noChecksum(transfer.address) };
    });
    var exptectedOutputsLength = outputsToCheck.length;
    if (!iota.valid.isTransfersArray(transfer)) {
        console.log('Error: Invalid transfer array');
        return;
    }
    // Check to make sure user is not sending to an already used address
    filterSpentAddresses(outputsToCheck).then(filtered => {
        if (filtered.length !== exptectedOutputsLength) {
            console.log('You cannot send to an already used address');
            return;
        }
    });

    // Send transfer with depth 4 and minWeightMagnitude 18
    iota.api.sendTransfer(seed, 4, 18, transfer, (error, success) => {
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
