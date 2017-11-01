import { iota } from '../libs/iota';
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
        addresses: addresses,
    };
}

export function addAddresses(seedName, addresses) {
    return {
        type: 'ADD_ADDRESSES',
        seedName: seedName,
        addresses: addresses,
    };
}

export function getAccountInfoFirstUse(seed) {
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

export function getBalances(addresses) {
    iota.api.getBalances(addresses, 1, (error, success) => {
        if (!error) {
            console.log(success);
        } else {
            console.log(error);
        }
    });
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
