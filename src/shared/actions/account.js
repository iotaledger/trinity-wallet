import { iota } from '../libs/iota';
import { getSelectedAccount } from '../selectors/account';
import {
    addTransferValues,
    formatTransfers,
    formatAddressBalances,
    formatAddressBalancesNewSeed,
    calculateBalance,
    getIndexesWithBalanceChange,
    groupTransfersByBundle,
    getAddressesWithChangedBalance,
    mergeLatestTransfersInOld,
    deduplicateBundles,
} from '../libs/accountUtils';
import { setReady, getTransfersRequest, getTransfersSuccess } from './tempAccount';
import { generateAlert } from '../actions/alerts';
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

export function addAccountName(seedName) {
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

export const getAccountInfoNewSeedAsync = (seed, seedName) => {
    return async dispatch => {
        const address = await iota.api.getNewAddressAsync(seed);
        //console.log('ADDRESS:', address);
        const accountData = await iota.api.getAccountDataAsync(seed);
        //console.log('ACCOUNT', accountData);
        const addressesWithBalance = formatAddressBalancesNewSeed(accountData);
        const balance = calculateBalance(addressesWithBalance);
        const transfers = formatTransfers(accountData.transfers, accountData.addresses);
        dispatch(setAccountInfo(seedName, addressesWithBalance, transfers, balance));
        dispatch(setReady());
    };
};

export function getFullAccountInfo(seed, seedName, cb) {
    return dispatch => {
        iota.api.getAccountData(seed, (error, success) => {
            if (!error) {
                // Combine addresses and balances
                const addressesWithBalance = formatAddressBalancesNewSeed(success);
                const transfersWithoutDuplicateBundles = deduplicateBundles(success.transfers);
                const transfers = formatTransfers(transfersWithoutDuplicateBundles, success.addresses);
                const balance = calculateBalance(addressesWithBalance);
                // Dispatch setAccountInfo action, set first use to false, and set ready to end loading
                dispatch(setAccountInfo(seedName, addressesWithBalance, transfers, balance));
                cb(null, success);
            } else {
                cb(error);
                console.log(error);
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

export function getAccountInfo(seedName, seedIndex, accountInfo, cb) {
    return dispatch => {
        // Current addresses and their balances
        let addressesWithBalance = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
        // Current transfers
        const transfers = accountInfo[Object.keys(accountInfo)[seedIndex]].transfers;
        // Array of old balances
        const oldBalances = Object.values(addressesWithBalance).map(x => x.balance);
        // Array of address spend status
        const addressesSpendStatus = Object.values(addressesWithBalance).map(x => x.spent);
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
                addressesWithBalance = formatAddressBalances(addresses, newBalances, addressesSpendStatus);
                // Calculate balance
                const balance = calculateBalance(addressesWithBalance);

                if (indexesWithBalanceChange.length > 0) {
                    // Grab addresses where balance was updated.
                    // Use these addresses to fetch latest transactions objects.
                    const addressesWithChangedBalance = getAddressesWithChangedBalance(
                        addresses,
                        indexesWithBalanceChange,
                    );
                    dispatch(getTransfersRequest());
                    Promise.resolve(dispatch(setAccountInfo(seedName, addressesWithBalance, transfers, balance))).then(
                        dispatch(getTransfers(seedName, addressesWithChangedBalance)),
                    );
                } else {
                    cb(null, success);
                    // Set account info, then finish loading
                    dispatch(setAccountInfo(seedName, addressesWithBalance, transfers, balance));
                }
            } else {
                cb(error);
                console.log(error);
                dispatch(
                    generateAlert(
                        'error',
                        'Invalid Response',
                        'The node returned an invalid response while getting balance.',
                    ),
                );
            }
        });
    };
}

export function getTransfers(seedName, addresses) {
    return (dispatch, getState) => {
        iota.api.findTransactionObjects({ addresses }, (error, success) => {
            if (!error) {
                // Get full bundles
                const bundles = [...new Set(success.map(tx => tx.bundle))];
                iota.api.findTransactionObjects({ bundles }, (error, success) => {
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
                                const selectedAccount = getSelectedAccount(seedName, getState().account.accountInfo);
                                const oldTransfers = selectedAccount.transfers;

                                transfers = mergeLatestTransfersInOld(oldTransfers, transfers);
                                transfers = formatTransfers(transfers, addresses);
                                // Update transfers then set ready
                                Promise.resolve(dispatch(updateTransfers(seedName, transfers))).then(
                                    dispatch(setReady()),
                                );
                                dispatch(getTransfersSuccess());
                            } else {
                                console.log('SOMETHING WENT WRONG: ', error);
                                dispatch(
                                    generateAlert(
                                        'error',
                                        'Invalid Response',
                                        'The node returned an invalid response while getting transfers.',
                                    ),
                                );
                            }
                        });
                    } else {
                        console.log('SOMETHING WENT WRONG: ', error);
                        dispatch(
                            generateAlert(
                                'error',
                                'Invalid Response',
                                'The node returned an invalid response while getting transfers.',
                            ),
                        );
                    }
                });
            } else {
                console.log('SOMETHING WENT WRONG: ', error);
                dispatch(
                    generateAlert(
                        'error',
                        'Invalid Response',
                        'The node returned an invalid response while getting transfers.',
                    ),
                );
            }
        });
    };
}

export function addPendingTransfer(seedName, transfers, success) {
    return dispatch => {
        success[0].transferValue = -success[0].value;
        success[0].persistence = false;
        // Add pending transfer at front of transfers array
        transfers.unshift(success);
        dispatch(updateTransfers(seedName, transfers));
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

export function changeAccountName(accountInfo, accountNames) {
    return {
        type: 'CHANGE_ACCOUNT_NAME',
        accountInfo,
        accountNames,
    };
}

export function removeAccount(accountInfo, accountNames) {
    return {
        type: 'REMOVE_ACCOUNT',
        accountInfo,
        accountNames,
    };
}
