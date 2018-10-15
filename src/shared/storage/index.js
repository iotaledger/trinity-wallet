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

    static getObjectFromId(id) {
        return realm.objectForPrimaryKey('Account', id);
    }

    static get() {
        return realm.objects('Account');
    }

    static getAccountData(name) {
        const account = Account.getObjectFromId(name);

        return assign({}, account, {
            addresses: values(account.addresses),
            transactions: values(account.transactions)
        });
    }

    static getAccountsData() {
        const accounts = Account.get();

        return map(accounts, (account) => assign({}, account, {
            addresses: values(account.addresses),
            transactions: values(account.transactions)
        })
        );
    }

    static create({ accountName, addresses, transactions, type }) {
        realm.write(() => realm.create('Account', { name: accountName, addresses, transactions, type }));
    }

    static delete(name) {
        realm.write(() => realm.delete(Account.getObjectFromId(name)));
    }

    /**
     * Migrate account data under a new name
     *
     * @method migrate
     *
     * @param {string} from - Account name
     * @param {string} to - New account name
     */
    static migrate(from, to) {
        const accountData = Account.getAccountData(from);
        Account.create(assign({}, accountData, { accountName: to }));

        Account.delete(from);
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

const config = {
    schema: [
        Account,
        Address,
        Transaction,
        AddressSpendStatus,
        Wallet
    ],
    schemaVersion: SCHEMA_VERSION,
};

const realm = new Realm(config);

/**
 * Deletes all objects in storage and deletes storage file for provided config
 *
 * @method purge
 * @param {object} [storageConfig]
 *
 * @returns {Promise<any>}
 */
const purge = (storageConfig = config) => new Promise((resolve, reject) => {
   try {
       realm.write(() => realm.deleteAll());
       Realm.deleteFile(storageConfig);
       resolve();
   } catch (error) {
       reject(error);
   }
});

export {
    realm,
    purge,
    Account,
    Transaction,
    Address,
    AddressSpendStatus,
    Wallet
};
