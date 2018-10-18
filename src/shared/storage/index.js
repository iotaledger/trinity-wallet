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
import { preserveAddressLocalSpendStatus } from '../reducers/accounts';

const SCHEMA_VERSION = 0;

class Account {
    static schema = AccountSchema;

    /**
     * Gets object for provided id (account name)
     * @method getObjectForId
     *
     * @param {string} id
     *
     * @returns {object}
     */
    static getObjectForId(id) {
        return realm.objectForPrimaryKey('Account', id);
    }

    /**
     * Gets objects for all stored accounts.
     * @method get
     *
     * @returns {Realm.Results<any>}
     */
    static get() {
        return realm.objects('Account');
    }

    /**
     * Gets account data for provided account name.
     * @method getAccountData
     *
     * @param {string} name
     */
    static getAccountData(name) {
        const account = Account.getObjectForId(name);

        return assign({}, account, {
            addressData: values(account.addressData),
            transactions: values(account.transactions)
        });
    }

    /**
     * Gets account data for all stored accounts.
     * @method getAccountsData
     *
     * @returns {array}
     */
    static getAccountsData() {
        const accounts = Account.get();

        return map(accounts, (account) => assign({}, account, {
            addressData: values(account.addressData),
            transactions: values(account.transactions)
        })
        );
    }

    /**
     * Creates account.
     * @method create
     *
     * @param {object} data
     */
    static create(data) {
        realm.write(() => realm.create('Account', data));
    }

    /**
     * Updates account.
     * @method updateTransactionsAndAddressData
     *
     * @param {string} name
     * @param {object} data
     */
    static update(name, data) {
        const existingAccountData = Account.getAccountData(name);
        const {
            addressData,
            ...rest
        } = data;

        const shouldUpdate = (value) => !isEmpty(value);

        const account = { name, ...rest };

        if (shouldUpdate(addressData)) {
            account.addressData = preserveAddressLocalSpendStatus(
                existingAccountData.addressData,
                addressData
            );
        }

        realm.write(() => realm.create('Account', account, true));
    }

    /**
     * Deletes account.
     * @method delete
     *
     * @param {string} name
     */
    static delete(name) {
        realm.write(() => realm.delete(Account.getObjectForId(name)));
    }

    /**
     * Migrate account data under a new name.
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
        return realm.objects('Wallet');
    }

    static getData() {
        const data = Wallet.get();
        return isEmpty(data) ? data : data[0];
    }

    static setOnboardingComplete() {
         realm.write(() => {
             Wallet.getData().onboardingComplete = true;
         });
    }

    static createIfNotExists() {
        const data = Wallet.get();
        const shouldCreate = isEmpty(data);

        if (shouldCreate) {
            realm.write(() => realm.create('Wallet', {}));
        }
    }
}

const config = {
    path: 'default.realm',
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

const initialise = () => new Promise((resolve, reject) => {
   try {
       Wallet.createIfNotExists();        
       resolve();
   } catch (error) {
       reject(error);
   }
});

export {
    realm,
    initialise,
    purge,
    Account,
    Transaction,
    Address,
    AddressSpendStatus,
    Wallet
};
