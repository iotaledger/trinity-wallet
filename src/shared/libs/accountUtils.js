import get from 'lodash/get';
import map from 'lodash/map';
import filter from 'lodash/filter';
import pick from 'lodash/pick';

/*
 @param: account
 {
    'latestAddress': '',
    'addresses': [],
    'transfers': [],
    'inputs': [],
    'balance': 0
 }
 */
export default {
    /*
        return type: string
        Returns the latest address
     */
    getLatestAddress: account => get(account, 'latestAddress'),
    /*
     return type: number
     Returns the current balance
     */
    getCurrentBalance: account => get(account, 'balance'),
    /*
      return type: array
      E.g: ['Address # 01', 'Address # 02']
      Return array of addresses strings
     */
    getAddressesOnly: account => get(account, 'addresses'),
    /*
        return type: array
        E.g [{ address: 'Address # 01', balance: 10, time: 123034  }]
        Returns array of transfer objects with addresses and timestamp
     */
    getAddressesWithAnyBalance: account => {
        const normalizedTransfers = transfer => {
            // In case other properties from transfer
            // object are required, we'll just need to add
            // the relevant property name.
            // E.g: trunkTransaction, bundle etc.
            const relevantProps = ['address', 'value', 'timestamp'];

            const props = pick(get(transfer, '[0]'), relevantProps);

            return {
                address: get(props, 'address'),
                balance: get(props, 'value'),
                time: get(props, 'timestamp'),
            };
        };

        return map(get(account, 'transfers'), normalizedTransfers);
    },
    /*
     return type: array
     E.g [{ address: 'Address # 01', balance: 10, time: 123034  }]
     Returns array of transfer objects with only addresses with non zero balance
     */
    getAddressesWithNonZeroBalance: account => {
        const normalizedTransfers = transfer => {
            // In case other properties from transfer
            // object are required, we'll just need to add
            // the relevant property name.
            // E.g: trunkTransaction, bundle etc.
            const relevantProps = ['address', 'value', 'timestamp'];

            const props = pick(get(transfer, '[0]'), relevantProps);

            return {
                address: get(props, 'address'),
                balance: get(props, 'value'),
                time: get(props, 'timestamp'),
            };
        };

        const normalized = map(get(account, 'transfers'), normalizedTransfers);
        return filter(normalized, v => v.balance > 0);
    },
};

export const formatAddressBalances = (addresses, balances) => {
    var addressesWithBalance = Object.assign({}, ...addresses.map((n, index) => ({ [n]: balances[index] })));
    return addressesWithBalance;
};

export const formatAddressBalancesNewSeed = data => {
    var addresses = data.addresses;
    var addressesWithBalance = Object.assign({}, ...addresses.map(n => ({ [n]: 0 })));
    for (var i = 0; i < data.inputs.length; i++) {
        addressesWithBalance[data.inputs[i].address] = data.inputs[i].balance;
    }
    return addressesWithBalance;
};

export const groupTransfersByBundle = transfers => {
    let groupedTransfers = [];
    transfers.forEach(tx => {
        if (!groupedTransfers.length) {
            groupedTransfers.push([tx]);
        } else {
            const i = groupedTransfers.findIndex(bundle => bundle[0].bundle === tx.bundle);
            if (i !== -1) {
                groupedTransfers[i].push(tx);
            } else {
                groupedTransfers.push([tx]);
            }
        }
    });
    // Order arrays of transfer object(s) by currentIndex
    groupedTransfers.forEach(arr => {
        arr.sort(function(a, b) {
            return a.currentIndex - b.currentIndex;
        });
    });
    return groupedTransfers;
};
export const formatTransfers = (transfers, addresses) => {
    // Order transfers from oldest to newest
    let sortedTransfers = transfers.sort((a, b) => {
        if (a[0].timestamp > b[0].timestamp) {
            return -1;
        }
        if (a[0].timestamp < b[0].timestamp) {
            return 1;
        }
        return 0;
    });

    // add transaction values to transactions
    sortedTransfers = addTransferValues(sortedTransfers, addresses);
    return sortedTransfers;
};

export const addTransferValues = (transfers, addresses) => {
    // Add transaction value property to each transaction object
    // FIXME: We should never mutate parameters at any level.
    return transfers.map(arr => {
        /* eslint-disable no-param-reassign */
        arr[0].transferValue = 0;
        arr.map(obj => {
            if (addresses.includes(obj.address)) {
                arr[0].transferValue += obj.value;
            }

            /* eslint-enable no-param-reassign */
            return obj;
        });

        return arr;
    });
};

export const calculateBalance = data => {
    let balance = 0;
    if (Object.keys(data).length > 0) {
        balance = Object.values(data).reduce((a, b) => a + b);
    }
    return balance;
};

export const getIndexesWithBalanceChange = (a, b) => {
    let indexes = [];
    for (var i = 0; i < a.length; i++) {
        if (a[i] != b[i]) {
            indexes.push(i);
        }
    }
    return indexes;
};
