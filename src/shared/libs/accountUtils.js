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
