import { iota } from '../libs/iota';
import { updateAddresses } from '../actions/account';
// FIXME: Hacking no-console linting.
// Should rather be dispatching an action.

/* eslint-disable no-console */

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

export function incrementSeedIndex() {
    return {
        type: 'INCREMENT_SEED_INDEX',
    };
}

export function decrementSeedIndex() {
    return {
        type: 'DECREMENT_SEED_INDEX',
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

// Check for sending to a used address
function filterSpentAddresses(inputs) {
    return new Promise((resolve, reject) => {
        iota.api.findTransactionObjects({ addresses: inputs.map(input => input.address) }, (err, txs) => {
            if (err) {
                reject(err);
            }
            txs = txs.filter(tx => tx.value < 0);
            const bundleHashes = txs.map(tx => tx.bundle);
            if (txs.length > 0) {
                const bundles = txs.map(tx => tx.bundle);
                iota.api.findTransactionObjects({ bundles: bundles }, (err, txs) => {
                    if (err) {
                        reject(err);
                    }
                    let hashes = txs.filter(tx => tx.currentIndex === 0);
                    const allBundleHashes = txs.map(tx => tx.bundle);
                    hashes = hashes.map(tx => tx.hash);
                    iota.api.getLatestInclusion(hashes, (err, states) => {
                        if (err) {
                            reject(err);
                        }
                        const confirmedHashes = hashes.filter((hash, i) => states[i]);
                        const unconfirmedHashes = hashes
                            .filter(hash => confirmedHashes.indexOf(hash) === -1)
                            .map(hash => ({ hash, validate: true }));
                        const getBundles = confirmedHashes.concat(unconfirmedHashes).map(
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
                                            resolve(typeof hash === 'string' ? bundle : { bundle, validate: true });
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
                                    const blacklist = bundles
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

// Check for sending from a used addresses
function getUnspentInputs(seed, start, threshold, inputs, cb) {
    if (arguments.length === 4) {
        cb = arguments[3];
        inputs = { inputs: [], totalBalance: 0, allBalance: 0 };
    }
    iota.api.getInputs(seed, { start: start, threshold: threshold }, (err, res) => {
        if (err) {
            cb(err);
            return;
        }
        inputs.allBalance += res.inputs.reduce((sum, input) => sum + input.balance, 0);
        filterSpentAddresses(res.inputs)
            .then(filtered => {
                var collected = filtered.reduce((sum, input) => sum + input.balance, 0);
                var diff = threshold - collected;
                if (diff > 0) {
                    var ordered = res.inputs.sort((a, b) => a.keyIndex - b.keyIndex).reverse();
                    var end = ordered[0].keyIndex;
                    getUnspentInputs(
                        seed,
                        end + 1,
                        diff,
                        {
                            inputs: inputs.inputs.concat(filtered),
                            totalBalance: inputs.totalBalance + collected,
                            allBalance: inputs.allBalance,
                        },
                        cb,
                    );
                } else {
                    cb(null, {
                        inputs: inputs.inputs.concat(filtered),
                        totalBalance: inputs.totalBalance + collected,
                        allBalance: inputs.allBalance,
                    });
                }
            })
            .catch(err => cb(err));
    });
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

export function generateNewAddress(seed, seedName, addresses) {
    return dispatch => {
        iota.api.getNewAddress(seed, { checksum: true }, (error, address) => {
            if (!error) {
                if (!(address in addresses)) {
                    addresses[address] = 0;
                }
                dispatch(updateAddresses(seedName, addresses));
                dispatch(generateNewAddressSuccess(address));
            } else {
                dispatch(generateNewAddressError());
            }
        });
    };
}

export function sendTransaction(seed, address, value, message) {
    // Convert to Trytes
    const messageTrytes = iota.utils.toTrytes(message);
    const tag = iota.utils.toTrytes('IOTA');
    const transfer = [
        {
            address: address,
            value: value,
            message: messageTrytes,
            tag: tag,
        },
    ];

    const outputsToCheck = transfer.map(transfer => {
        return { address: iota.utils.noChecksum(transfer.address) };
    });
    var expectedOutputsLength = outputsToCheck.length;
    if (!iota.valid.isTransfersArray(transfer)) {
        console.log('Invalid transfer array');
        return;
    }
    // Check to make sure user is not sending to an already used address
    filterSpentAddresses(outputsToCheck).then(filtered => {
        if (filtered.length !== expectedOutputsLength) {
            console.log('You cannot send to an already used address');
            return false;
        } else {
            // Send transfer with depth 4 and minWeightMagnitude 18
            console.log('Successfully get to send');
            iota.api.sendTransfer(seed, 4, 14, transfer, function(error, success) {
                if (!error) {
                    console.log('SUCCESSFULLY SENT TRANSFER: ', success);
                } else {
                    console.log('SOMETHING WENT WRONG: ', error);
                }
            });
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
