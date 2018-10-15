import assign from 'lodash/assign';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import values from 'lodash/values';
import Realm from 'realm';
import {
    TransactionSchema,
    AddressSchema,
    AccountSchema,
    AddressSpendStatusSchema,
    WalletSchema
} from '../schema';

const SCHEMA_VERSION = 0;

class Account {
    static schema = AccountSchema;

    static getAccountData(name) {
        const account = realm.objectForPrimaryKey('Account', name);

        return assign({}, account, {
            addresses: values(account.addresses),
            transactions: values(account.transactions)
        });
    }

    static getAccountsData() {
        const accounts = realm.objects('Account');

        return map(accounts, (account) => assign({}, account, {
            addresses: values(account.addresses),
            transactions: values(account.transactions)
        })
        );
    }

    static create({ accountName, addresses, transactions, type }) {
        realm.write(() => realm.create('Account', { name: accountName, addresses, transactions, type }));
    }
}

class Transaction {
    static schema = TransactionSchema;
}

class Address {
    static schema = AddressSchema;
}

class AddressSpendStatus {
    static schema = AddressSpendStatusSchema;
}

class Wallet {
    static schema = WalletSchema;

     static get() {
        const data = realm.objects('Wallet');
        const shouldCreate = isEmpty(data);

        if (shouldCreate) {
            realm.write(() => realm.create('Wallet', {}));
        }

        return shouldCreate ? realm.objects('Wallet')[0] : data[0];
    }

    static setOnboardingComplete() {
         realm.write(() => {
             Wallet.get().onboardingComplete = true;
         });
    }
}

const realm = new Realm({
    path: '~/Desktop/Trinity',
    schema: [
        Account,
        Address,
        Transaction,
        AddressSpendStatus,
        Wallet
    ],
    schemaVersion: SCHEMA_VERSION,
});

export {
    realm,
    Account,
    Transaction,
    Address,
    AddressSpendStatus,
    Wallet
};
