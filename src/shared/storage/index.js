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
    WalletSchema,
    NodeSchema,
    NotificationsSettingsSchema,
    WalletSettingsSchema,
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
            transactions: values(account.transactions),
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

        return map(accounts, (account) =>
            assign({}, account, {
                addressData: values(account.addressData),
                transactions: values(account.transactions),
            }),
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
        const { addressData, ...rest } = data;

        const shouldUpdate = (value) => !isEmpty(value);

        const account = { name, ...rest };

        if (shouldUpdate(addressData)) {
            account.addressData = preserveAddressLocalSpendStatus(existingAccountData.addressData, addressData);
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

class Address {
    static schema = AddressSchema;
}

class AddressSpendStatus {
    static schema = AddressSpendStatusSchema;
}

class Node {
    static schema = NodeSchema;

    /**
     * Returns a list of nodes
     * @return {Realm.Results}
     */
    static getNodes() {
        return realm.objects('Node');
    }

    /**
     * Returns the list of nodes that support remote PoW
     * @return {Realm.Results}
     */
    static getRemotePowNodes() {
        return this.getNodes().filtered('remotePow == true');
    }

    /**
     * Adds a custom node
     * @param {string} url Node URL
     */
    static addCustomNode(url) {
        realm.write(() => {
            realm.create('Node', {
                url: url,
                custom: true,
                // TODO: Where should we check for remote PoW support?
            });
        });
    }

    /**
     * Deletes all custom nodes
     * @param  {string} url New node URL
     */
    static deleteAllCustomNodes() {
        const customNodes = this.getNodes().filtered('custom == true');
        realm.write(() => {
            realm.delete(customNodes);
        });
    }

    /**
     * Updates the 'remotePow' property of an existing node
     * @param  {string} url                URL of the node to be updated
     * @param  {boolean} supportsRemotePow Whether the node supports remote PoW
     */
    static updateRemotePowSupport(url, supportsRemotePow) {
        realm.write(() => {
            realm.create(
                'Node',
                {
                    url: url,
                    remotePow: supportsRemotePow,
                },
                true,
            );
        });
    }
}

class NotificationsSettings {
    static schema = NotificationsSettingsSchema;
}

class Transaction {
    static schema = TransactionSchema;
}

class Wallet {
    static schema = WalletSchema;

    static get() {
        return realm.objects('Wallet');
    }

    static get data() {
        const data = Wallet.get();
        return isEmpty(data) ? data : data[0];
    }

    static get settings() {
        return Wallet.data.settings;
    }

    static setOnboardingComplete() {
        realm.write(() => {
            Wallet.data.onboardingComplete = true;
        });
    }

    /**
     * Updates remote proof of work setting.
     *
     * @method updateRemotePoWSetting
     * @param {boolean} payload
     */
    static updateRemotePoWSetting(payload) {
        realm.write(() => {
            Wallet.settings.remotePoW = payload;
        });
    }

    /**
     * Updates auto-promotion setting.
     *
     * @method updateAutoPromotionSetting
     * @param {boolean} payload
     */
    static updateAutoPromotionSetting(payload) {
        realm.write(() => {
            Wallet.settings.autoPromotion = payload;
        });
    }

    /**
     * Updates auto node switching configuration.
     *
     * @method updateAutoNodeSwitchingSetting
     * @param {boolean} payload
     */
    static updateAutoNodeSwitchingSetting(payload) {
        realm.write(() => {
            Wallet.settings.autoNodeSwitching = payload;
        });
    }

    /**
     * Updates lock screen timeout.
     *
     * @method updateLockScreenTimeout
     * @param {number} payload
     */
    static updateLockScreenTimeout(payload) {
        realm.write(() => {
            Wallet.settings.lockScreenTimeout = payload;
        });
    }

    /**
     * Updates active locale.
     *
     * @method updateLocale
     * @param {string} payload
     */
    static updateLocale(payload) {
        realm.write(() => {
            Wallet.settings.locale = payload;
        });
    }

    /**
     * Updates wallet's mode.
     *
     * @method updateMode
     * @param {string} payload
     */
    static updateMode(payload) {
        realm.write(() => {
            Wallet.settings.mode = payload;
        });
    }

    /**
     * Updates wallet's language.
     *
     * @method updateLanguage
     * @param {string} payload
     */
    static updateLanguage(payload) {
        realm.write(() => {
            Wallet.settings.language = payload;
        });
    }

    /**
     * Updates currency related data (conversionRate, currency, availableCurrencies)
     *
     * @method setCurrencyData
     * @param {object} payload
     */
    static setCurrencyData(payload) {
        const { conversionRate, currency, availableCurrencies } = payload;

        realm.write(() => {
            Wallet.settings.currency = currency;
            Wallet.settings.conversionRate = conversionRate;
            Wallet.settings.availableCurrencies = availableCurrencies;
        });
    }

    /**
     * Updates wallet's theme.
     *
     * @method updateTheme
     * @param {string} payload
     */
    static updateTheme(payload) {
        realm.write(() => {
            Wallet.settings.themeName = payload;
        });
    }

    /**
     * Sets a randomly selected node.
     *
     * @method setRandomlySelectedNode
     * @param {string} payload
     */
    static setRandomlySelectedNode(payload) {
        realm.write(() => {
            Wallet.settings.node = payload;
            Wallet.settings.hasRandomizedNode = true;
        });
    }

    /**
     * Updates two factor authentication configuration.
     *
     * @method update2FASetting
     * @param {boolean} payload
     */
    static update2FASetting(payload) {
        realm.write(() => {
            Wallet.settings.is2FAEnabled = payload;
        });
    }

    /**
     * Updates finger print authentication configuration.
     *
     * @method updateFingerPrintAuthenticationSetting
     * @param {boolean} payload
     */
    static updateFingerPrintAuthenticationSetting(payload) {
        realm.write(() => {
            Wallet.settings.isFingerprintEnabled = payload;
        });
    }

    /**
     * Sets app versions.
     *
     * @method setAppVersions
     * @param {object} payload
     */
    static setVersions(payload) {
        const { buildNumber, version } = payload;

        realm.write(() => {
            Wallet.settings.buildNumber = buildNumber;
            Wallet.settings.version = version;
        });
    }

    /**
     * Sets acceptedTerms to true when user has accepted terms and conditions.
     *
     * @method acceptTerms
     * @param {object} payload
     */
    static acceptTerms() {
        realm.write(() => {
            Wallet.settings.acceptedTerms = true;
        });
    }

    /**
     * Sets acceptedPrivacy to true when user has accepted privacy policy.
     *
     * @method acceptPrivacyPolicy
     * @param {object} payload
     */
    static acceptPrivacyPolicy() {
        realm.write(() => {
            Wallet.settings.acceptedPrivacy = true;
        });
    }

    /**
     * Updates configuration for showing/hiding empty transactions.
     *
     * @method toggleEmptyTransactionsDisplay
     */
    static toggleEmptyTransactionsDisplay() {
        realm.write(() => {
            const settings = Wallet.settings;

            settings.hideEmptyTransactions = !settings.hideEmptyTransactions;
        });
    }

    /**
     * Sets to true on forced password update.
     *
     * @method completeForcedPasswordUpdate
     */
    static completeForcedPasswordUpdate() {
        realm.write(() => {
            Wallet.settings.completedForcedPasswordUpdate = true;
        });
    }

    /**
     * Updates byte-trit sweep setting.
     *
     * @method updateByteTritSweepSetting
     * @param {boolean} payload
     */
    static updateByteTritSweepSetting(payload) {
        realm.write(() => {
            Wallet.settings.completedByteTritSweep = payload;
        });
    }

    /**
     * Updates tray app configuration (desktop wallet)
     *
     * @method updateTraySetting
     * @param {boolean} payload
     */
    static updateTraySetting(payload) {
        realm.write(() => {
            Wallet.settings.isTrayEnabled = payload;
        });
    }

    /**
     * Updates notifications configuration.
     *
     * @method updateNotificationsSetting
     * @param {object} payload
     */
    static updateNotificationsSetting(payload) {
        const { type, enabled } = payload;

        realm.write(() => {
            Wallet.settings.notifications[type] = enabled;
        });
    }

    static createIfNotExists() {
        const data = Wallet.get();
        const shouldCreate = isEmpty(data);

        if (shouldCreate) {
            realm.write(() => realm.create('Wallet', { settings: { notifications: {} } }));
        }
    }
}

class WalletSettings {
    static schema = WalletSettingsSchema;
}

/**
 * Realm storage default configuration.
 */
const config = {
    schema: [Account, Address, AddressSpendStatus, Node, NotificationsSettings, Transaction, WalletSettings, Wallet],
    schemaVersion: SCHEMA_VERSION,
};

// Initialise realm instance
const realm = new Realm(config);

/**
 * Deletes all objects in storage and deletes storage file for provided config
 *
 * @method purge
 * @param {object} [storageConfig]
 *
 * @returns {Promise<any>}
 */
const purge = (storageConfig = config) =>
    new Promise((resolve, reject) => {
        try {
            realm.write(() => realm.deleteAll());
            Realm.deleteFile(storageConfig);
            resolve();
        } catch (error) {
            reject(error);
        }
    });

const initialise = () =>
    new Promise((resolve, reject) => {
        try {
            Wallet.createIfNotExists();
            resolve();
        } catch (error) {
            reject(error);
        }
    });

/**
 * Purges persisted data and reinitialises storage.
 *
 * @method reinitialise
 * @param {object} config
 */
const reinitialise = (config) => purge(config).then(() => initialise());

export { realm, initialise, reinitialise, purge, Account, Transaction, Address, AddressSpendStatus, Wallet };
