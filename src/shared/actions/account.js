import { iota } from '../libs/iota';
import {
    addTransferValues,
    sortTransfers,
    formatAddressBalances,
    formatAddressBalancesNewSeed,
    calculateBalance,
    getIndexesWithBalanceChange,
} from '../libs/accountUtils';
import { setReady } from './tempAccount';
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
    {
        /*addresses: addresses*/
    }
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
                const transfers = sortTransfers(success);
                // Dispatch setAccountInfo action, set first use to false, and set ready to end loading
                Promise.resolve(dispatch(setAccountInfo(seedName, addressesWithBalance, transfers)))
                    .then(dispatch(setFirstUse(false)))
                    .then(dispatch(setReady()));
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

export function getAccountInfo(seed, seedName, seedIndex, accountInfo) {
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
                // If balance has changed for any addresses, get new transfers
                if (indexesWithBalanceChange.length > 0) {
                    iota.api.findTransactionObjects({ addresses: addresses }, (error, success) => {
                        dispatch(updateTransfers(success));
                    });
                }
                // Pair new balances to addresses to add to store
                addressesWithBalance = formatAddressBalances(addresses, newBalances);
                // Calculate balance
                const balance = calculateBalance(addressesWithBalance);

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

                Promise.resolve(dispatch(setAccountInfo(seedName, addressesWithBalance, transfers, balance))).then(
                    dispatch(setReady()),
                );
            } else {
                console.log('SOMETHING WENT WRONG: ', error);
            }
        });
    };
}

export function updateTransfers(seedName, addresses, transfers, balance) {
    return {
        type: 'UPDATE_TRANFERS',
        seedName,
        transfers,
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
