import { iota } from '../libs/iota';
import {
    addTransferValues,
    sortTransfers,
    formatAddressBalances,
    formatAddressBalancesFirstUse,
    calculateBalance,
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

export function getAccountInfoFirstUse(seed, seedName) {
    return dispatch => {
        iota.api.getAccountData(seed, (error, success) => {
            if (!error) {
                const addressesWithBalance = formatAddressBalancesFirstUse(success);
                const balance = calculateBalance(addressesWithBalance);
                const transfers = sortTransfers(success);
                Promise.resolve(dispatch(setAccountInfo('MAIN WALLET', addressesWithBalance, transfers, balance))).then(
                    dispatch(setReady()),
                );
            } else {
                console.log('SOMETHING WENT WRONG: ', error);
            }
        });
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
