import { iota } from '../libs/iota';
import {
    addTransferValues,
    formatTransfers,
    formatAddressBalances,
    formatAddressBalancesNewSeed,
    calculateBalance,
    getIndexesWithBalanceChange,
    groupTransfersByBundle,
} from '../libs/accountUtils';
import { setReady, getTransfersRequest, getTransfersSuccess } from './tempAccount';
/* eslint-disable import/prefer-default-export */

export function setFirstUse(boolean) {
    return {
        type: 'SET_FIRST_USE',
        payload: boolean,
    };
}

export function setOnboardingComplete(boolean) {
    return {
        type: 'SET_ONBOARDING_COMPLETE',
        payload: boolean,
    };
}

export function increaseSeedCount() {
    return {
        type: 'INCREASE_SEED_COUNT',
    };
}

export function addSeedName(seedName) {
    return {
        type: 'ADD_SEED_NAME',
        seedName: seedName,
    };
}

export function addAddresses(seedName, addresses) {
    return {
        type: 'ADD_ADDRESSES',
        seedName: seedName,
        addresses: addresses,
    };
}

export function getAccountInfoNewSeed(seed, seedName) {
    return dispatch => {
        iota.api.getAccountData(seed, (error, success) => {
            if (!error) {
                // Combine addresses and balances
                const addressesWithBalance = formatAddressBalancesNewSeed(success);
                // Calculate balance
                const balance = calculateBalance(addressesWithBalance);
                // Sort tranfers and add transfer values
                const transfers = formatTransfers(success.transfers, success.addresses);
                // Dispatch setAccountInfo action, set first use to false, and set ready to end loading
                Promise.resolve(dispatch(setAccountInfo(seedName, addressesWithBalance, transfers))).then(
                    dispatch(setReady()),
                );
            } else {
                console.log('SOMETHING WENT WRONG: ', error);
            }
        });
    };
}

export function setBalance(addressesWithBalance) {
    const balance = calculateBalance(addressesWithBalance);
    return {
        type: 'SET_BALANCE',
        payload: balance,
    };
}

export function getAccountInfo(seedName, seedIndex, accountInfo) {
    return dispatch => {
        // Current addresses and ther balances
        let addressesWithBalance = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
        // Current transfers
        let transfers = accountInfo[Object.keys(accountInfo)[seedIndex]].transfers;
        // Array of old balances
        const oldBalances = Object.values(addressesWithBalance);
        // Array of current addresses
        const addresses = Object.keys(addressesWithBalance);
        // Get updated balances for current addresses
        iota.api.getBalances(addresses, 1, (error, success) => {
            if (!error) {
                // Array of updated balances
                let newBalances = success.balances;
                newBalances = newBalances.map(Number);
                // Get address indexes where balance has changed
                const indexesWithBalanceChange = getIndexesWithBalanceChange(newBalances, oldBalances);
                // Pair new balances to addresses to add to store
                addressesWithBalance = formatAddressBalances(addresses, newBalances);

                // Calculate balance
                const balance = calculateBalance(addressesWithBalance);
                console.log(indexesWithBalanceChange);
                // If balance has changed for any addresses, get updated transaction objects
                {
                    /* TODO: Only check check addresses where balance has changed */
                }
                if (indexesWithBalanceChange.length > 0) {
                    dispatch(getTransfersRequest());
                    Promise.resolve(dispatch(setAccountInfo(seedName, addressesWithBalance, transfers, balance))).then(
                        dispatch(getTransfers(seedName, addresses)),
                    );
                } else {
                    // Set account info, then finish loading
                    Promise.resolve(dispatch(setAccountInfo(seedName, addressesWithBalance, transfers, balance))).then(
                        dispatch(setReady()),
                    );
                }
                // Additional check in case user has account activity in another wallet
                {
                    /*var index = addressesWithBalance.length;
                iota.api.getTransfers(seed, [{'start': index}], (error, success) => {
                    if(!error) {
                      console.log(success)
                    } else {
                      console.log(error)
                    }
                })*/
                }
            } else {
                console.log('SOMETHING WENT WRONG: ', error);
            }
        });
    };
}

export function getTransfers(seedName, addresses) {
    return dispatch => {
        iota.api.findTransactionObjects({ addresses: addresses }, (error, success) => {
            if (!error) {
                // Get full bundles
                var bundles = [...new Set(success.map(tx => tx.bundle))];
                iota.api.findTransactionObjects({ bundles: bundles }, (error, success) => {
                    if (!error) {
                        // Add persistence to transaction objects
                        iota.api.getLatestInclusion(success.map(tx => tx.hash), (error, inclusionStates) => {
                            if (!error) {
                                success.map((tx, i) => {
                                    tx.persistence = inclusionStates[i];
                                    return tx;
                                });
                                // Group transfers into bundles
                                let transfers = groupTransfersByBundle(success);
                                // Sort transfers and add transfer value
                                transfers = formatTransfers(transfers, addresses);
                                // Update transfers then set ready
                                Promise.resolve(dispatch(updateTransfers(seedName, transfers))).then(
                                    dispatch(setReady()),
                                );
                                dispatch(getTransfersSuccess());
                            } else {
                                console.log('SOMETHING WENT WRONG: ', error);
                            }
                        });
                    } else {
                        console.log('SOMETHING WENT WRONG: ', error);
                    }
                });
            } else {
                console.log('SOMETHING WENT WRONG: ', error);
            }
        });
    };
}

export function updateTransfers(seedName, transfers) {
    return {
        type: 'UPDATE_TRANSFERS',
        seedName,
        transfers,
    };
}

export function updateAddresses(seedName, addresses) {
    return {
        type: 'UPDATE_ADDRESSES',
        seedName,
        addresses,
    };
}

export function setAccountInfo(seedName, addresses, transfers, balance) {
    return {
        type: 'SET_ACCOUNT_INFO',
        seedName,
        addresses,
        transfers,
        balance,
    };
}

export function updateAccountInfo(seedName, addresses, transfers, balance) {
    return {
        type: 'UPDATE_ACCOUNT_INFO',
        seedName,
        addresses,
        transfers,
        balance,
    };
}
