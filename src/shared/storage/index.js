/* global Electron */
import assign from 'lodash/assign';
import each from 'lodash/each';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import values from 'lodash/values';
import size from 'lodash/size';
import {
    TransactionSchema,
    AddressSchema,
    AccountSchema,
    AccountInfoDuringSetupSchema,
    AccountMetaSchema,
    AddressSpendStatusSchema,
    WalletSchema,
    NodeSchema,
    NotificationsSettingsSchema,
    WalletSettingsSchema,
    WalletVersionsSchema,
    ErrorLogSchema,
} from '../schema';
import { __MOBILE__, __TEST__, __DEV__ } from '../config';
import { preserveAddressLocalSpendStatus } from '../libs/iota/addresses';

const SCHEMA_VERSION = 1;

const getStoragePath = (schemaVersion = SCHEMA_VERSION) =>
    __MOBILE__ || __TEST__
        ? `trinity-${schemaVersion}.realm`
        : `${Electron.getUserDataPath()}/trinity${__DEV__ ? '-dev' : ''}-${schemaVersion}.realm`;

// Initialise realm instance
let realm = {}; // eslint-disable-line import/no-mutable-exports

/**
 * Imports Realm dependency
 *
 * @method getRealm
 * @returns {object}
 */
export const getRealm = () => {
    if (__TEST__ || !isUndefined(process.env.JEST_WORKER_ID)) {
        return require('../libs/originalRequire')('realm');
    }

    if (__MOBILE__) {
        return global.Realm;
    }

    return Electron.getRealm();
};

const Realm = getRealm();

/**
 * Model for Account.
 */
class Account {
    static schema = AccountSchema;

    /**
     * Gets object for provided id (account name)
     *
     * @method getObjectForId
     * @param {string} id
     *
     * @returns {object}
     */
    static getObjectForId(id) {
        return realm.objectForPrimaryKey('Account', id);
    }

    /**
     * Gets objects for all stored accounts.
     *
     * @returns {Realm.Results<any>}
     */
    static get data() {
        return realm.objects('Account');
    }

    /**
     * Gets account data for all stored accounts.
     * @method getDataAsArray
     *
     * @returns {array}
     */
    static getDataAsArray() {
        const accounts = Account.data;

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
     * Creates multiple accounts.
     * @method createMultiple
     *
     * @param {object} data
     */
    static createMultiple(accountsData) {
        realm.write(() => {
            each(accountsData, (data) => realm.create('Account', data));
        });
    }

    /**
     * Creates an account if it does not already exist.
     *
     * @method createIfNotExists
     * @param {string} name
     * @param {object} data
     */
    static createIfNotExists(name, data) {
        const shouldCreate = isEmpty(Account.getObjectForId(name));

        if (shouldCreate) {
            Account.create(assign({}, data, { name }));
        }
    }

    /**
     * Updates account.
     * @method updateTransactionsAndAddressData
     *
     * @param {string} name
     * @param {object} data
     */
    static update(name, data) {
        realm.write(() => {
            const existingData = Account.getObjectForId(name);
            const updatedData = assign({}, existingData, {
                ...data,
                name,
                addressData: isEmpty(data.addressData)
                    ? existingData.addressData
                    : preserveAddressLocalSpendStatus(values(existingData.addressData), data.addressData),
            });

            realm.create('Account', updatedData, true);
        });
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
        const accountData = Account.getObjectForId(from);

        realm.write(() => {
            // Create account with new name.
            realm.create('Account', assign({}, accountData, { name: to }));
            // Delete account with old name.
            realm.delete(accountData);
        });
    }
}

/**
 * Model for Address.
 */
class Address {
    static schema = AddressSchema;
}

/**
 * Model for Address spent status.
 */
class AddressSpendStatus {
    static schema = AddressSpendStatusSchema;
}

/**
 * Model for node.
 */
class Node {
    static schema = NodeSchema;

    /**
     * Gets object for provided id (url)
     *
     * @method getObjectForId
     * @param {string} id
     *
     * @returns {object}
     */
    static getObjectForId(id) {
        return realm.objectForPrimaryKey('Node', id);
    }

    /**
     * Returns a list of nodes
     *
     * @return {Realm.Results}
     */
    static get data() {
        return realm.objects('Node');
    }

    /**
     * Returns nodes as array
     *
     * @method getDataAsArray
     *
     * @return {array}
     */
    static getDataAsArray() {
        return map(Node.data, (node) => assign({}, node));
    }

    /**
     * Adds a custom node
     *
     * @method addCustomNode
     * @param {string} url Node URL
     */
    static addCustomNode(url, pow) {
        realm.write(() => {
            realm.create('Node', {
                url,
                custom: true,
                pow,
            });
        });
    }

    /**
     * Removes a node.
     *
     * @method delete
     * @param {string} url
     */
    static delete(url) {
        const node = Node.getObjectForId(url);

        realm.write(() => realm.delete(node));
    }

    /**
     *
     * @method addNodes
     * @param {array} nodes
     */
    static addNodes(nodes) {
        if (size(nodes)) {
            const existingUrls = map(Node.getDataAsArray(), (node) => node.url);

            realm.write(() => {
                each(nodes, (node) => {
                    // If it's an existing node, just update properties.
                    if (includes(existingUrls, node.url)) {
                        realm.create('Node', node, true);
                    } else {
                        realm.create('Node', node);
                    }
                });
            });
        }
    }
}

/**
 * Model for transaction.
 */
class Transaction {
    static schema = TransactionSchema;
}

/**
 * Model for wallet data and settings.
 */
class Wallet {
    static schema = WalletSchema;
    static version = Number(SCHEMA_VERSION);

    /**
     * Gets object for provided id (version)
     *
     * @method getObjectForId
     * @param {number} id
     *
     * @returns {object}
     */
    static getObjectForId(id = Wallet.version) {
        return realm.objectForPrimaryKey('Wallet', id);
    }

    /**
     * Gets wallet data.
     *
     * @return {Realm.Results}
     */
    static get data() {
        return realm.objects('Wallet');
    }

    /**
     * Wallet settings for most recent version.
     */
    static get latestSettings() {
        const dataForCurrentVersion = Wallet.getObjectForId();

        return dataForCurrentVersion.settings;
    }

    /**
     * Wallet data for most recent version.
     */
    static get latestData() {
        return Wallet.getObjectForId();
    }

    /**
     * Sets onboarding complete for wallet.
     * @method setOnboardingComplete
     */
    static setOnboardingComplete() {
        realm.write(() => {
            Wallet.latestData.onboardingComplete = true;
        });
    }

    /**
     * Updates remote proof of work setting.
     *
     * @method updateRemotePoWSetting
     * @param {boolean} payload
     */
    static updateRemotePowSetting(payload) {
        realm.write(() => {
            Wallet.latestSettings.remotePoW = payload;
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
            Wallet.latestSettings.autoPromotion = payload;
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
            Wallet.latestSettings.autoNodeSwitching = payload;
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
            Wallet.latestSettings.lockScreenTimeout = payload;
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
            Wallet.latestSettings.locale = payload;
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
            Wallet.latestSettings.mode = payload;
        });
    }

    /**
     * Updates wallet's node.
     *
     * @method updateNode
     * @param {string} payload
     */
    static updateNode(payload) {
        realm.write(() => {
            Wallet.latestSettings.node = payload;
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
            Wallet.latestSettings.language = payload;
        });
    }

    /**
     * Updates currency related data (conversionRate, currency, availableCurrencies)
     *
     * @method updateCurrencyData
     * @param {object} payload
     */
    static updateCurrencyData(payload) {
        const { conversionRate, currency, availableCurrencies } = payload;

        realm.write(() => {
            Wallet.latestSettings.currency = currency;
            Wallet.latestSettings.conversionRate = conversionRate;
            Wallet.latestSettings.availableCurrencies = availableCurrencies;
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
            Wallet.latestSettings.themeName = payload;
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
            Wallet.latestSettings.node = payload;
            Wallet.latestSettings.hasRandomizedNode = true;
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
            Wallet.latestSettings.is2FAEnabled = payload;
        });
    }

    /**
     * Updates finger print authentication configuration.
     *
     * @method updateFingerprintAuthenticationSetting
     * @param {boolean} payload
     */
    static updateFingerprintAuthenticationSetting(payload) {
        realm.write(() => {
            Wallet.latestSettings.isFingerprintEnabled = payload;
        });
    }

    /**
     * Sets app versions.
     *
     * @method setAppVersions
     * @param {object} payload
     */
    static setVersions(payload) {
        realm.write(() => {
            Wallet.latestSettings.versions = payload;
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
            Wallet.latestSettings.acceptedTerms = true;
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
            Wallet.latestSettings.acceptedPrivacy = true;
        });
    }

    /**
     * Updates configuration for showing/hiding empty transactions.
     *
     * @method toggleEmptyTransactionsDisplay
     */
    static toggleEmptyTransactionsDisplay() {
        realm.write(() => {
            const settings = Wallet.latestSettings;

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
            Wallet.latestSettings.completedForcedPasswordUpdate = true;
        });
    }

    /**
     * Sets migration (AsyncStorage to Realm) status.
     *
     * @method setRealmMigrationStatus
     * @param {bool} payload
     */
    static setRealmMigrationStatus(payload) {
        realm.write(() => {
            Wallet.latestSettings.completedMigration = payload;
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
            Wallet.latestSettings.completedByteTritSweep = payload;
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
            Wallet.latestSettings.isTrayEnabled = payload;
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
            Wallet.latestSettings.notifications[type] = enabled;
        });
    }

    /**
     * Updates error log.
     *
     * @method updateErrorLog
     * @param {object | array} payload
     */
    static updateErrorLog(payload) {
        realm.write(() => {
            if (isArray(payload)) {
                each(payload, (value) => Wallet.latestData.errorLog.push(value));
            } else {
                Wallet.latestData.errorLog.push(payload);
            }
        });
    }

    /**
     * Clears error log.
     *
     * @method clearErrorLog
     */
    static clearErrorLog() {
        realm.write(() => {
            Wallet.latestData.errorLog = [];
        });
    }

    /**
     * Updates account information during account setup.
     * @method updateAccountInfoDuringSetup
     *
     * @param {object} payload
     */
    static updateAccountInfoDuringSetup(payload) {
        realm.write(() => {
            const data = Wallet.latestData;
            data.accountInfoDuringSetup = assign({}, data.accountInfoDuringSetup, payload);
        });
    }

    /**
     * Adds new account and removes temporarily stored account info during setup
     *
     * @method addAccount
     *
     * @param {object} accountData
     */
    static addAccount(accountData) {
        realm.write(() => {
            const data = Wallet.latestData;
            data.accountInfoDuringSetup = { name: '', meta: {}, usedExistingSeed: false };
            realm.create('Account', accountData);
        });
    }

    /**
     * Creates a wallet object if it does not already exist.
     * @method createIfNotExists
     */
    static createIfNotExists() {
        const shouldCreate = isEmpty(Wallet.getObjectForId());

        if (shouldCreate) {
            realm.write(() =>
                realm.create('Wallet', {
                    version: Wallet.version,
                    settings: { notifications: {} },
                    accountInfoDuringSetup: { meta: {} },
                }),
            );
        }
    }

    /**
     * Updates latest (most recent version) wallet data.
     *
     * @method updateLatest
     * @param {object} data
     */
    static updateLatest(data) {
        realm.write(() =>
            realm.create(
                'Wallet',
                {
                    version: Wallet.version,
                    ...merge({}, Wallet.latestData, data),
                },
                true,
            ),
        );
    }
}

/**
 * Model for error logs.
 */
class ErrorLog {
    static schema = ErrorLogSchema;
}

/**
 * Realm storage default configuration.
 */
export const config = {
    path: getStoragePath(),
    schema: [
        AccountSchema,
        AddressSchema,
        AddressSpendStatusSchema,
        AccountInfoDuringSetupSchema,
        AccountMetaSchema,
        ErrorLogSchema,
        NodeSchema,
        NotificationsSettingsSchema,
        TransactionSchema,
        WalletSettingsSchema,
        WalletVersionsSchema,
        WalletSchema,
    ],
    schemaVersion: SCHEMA_VERSION,
};

/**
 * Deletes all objects in storage and deletes storage file for provided config
 *
 * @method purge
 *
 * @returns {Promise<any>}
 */
const purge = () =>
    new Promise((resolve, reject) => {
        try {
            realm.removeAllListeners();
            realm.write(() => realm.deleteAll());
            resolve();
        } catch (error) {
            reject(error);
        }
    });

/**
 * Initialises storage.
 *
 * @method initialise
 * @param {Promise} getEncryptionKeyPromise
 *
 * @returns {Promise}
 */
const initialise = (getEncryptionKeyPromise) =>
    getEncryptionKeyPromise().then((encryptionKey) => {
        realm = new Realm(assign({}, config, { encryptionKey }));
        initialiseSync(encryptionKey);
    });

/**
 * Initialises storage.
 *
 * @method initialiseSync
 *
 * @param {array} encryptionKey
 *
 * @returns {Promise}
 */
const initialiseSync = (encryptionKey) => {
    Wallet.createIfNotExists();
    let hasVersionZeroRealm = false;

    try {
        hasVersionZeroRealm = Realm.schemaVersion(getStoragePath(0), encryptionKey) !== -1;
    } catch (error) {}

    // FIXME (laumair) - Realm migration setup needs improvement.
    // This is just a quick way to migrate realm data from schema version 0 to 1
    // Schema version 1 adds (missing) "completed" property to AccountInfoDuringSetup schema
    // If onboarding is interrupted on loading (without "completed" property), the wallet throws continuous exceptions
    // See #isSettingUpNewAccount in shared/selectors/accounts
    if (realm.schemaVersion >= 1 && hasVersionZeroRealm) {
        const schema = map(config.schema, (object) => {
            // Omit "completed" property from AccountInfoDuringSetup schema because it wasn't defined in schema version 0
            if (object.name === 'AccountInfoDuringSetup') {
                return omit(object, ['properties.completed']);
            }

            return object;
        });

        const versionZeroConfig = assign({}, config, {
            encryptionKey,
            schemaVersion: 0,
            path: getStoragePath(0),
            schema,
        });

        const oldRealm = new Realm(versionZeroConfig);

        const accountsData = oldRealm.objects('Account');
        const versionZeroWalletData = oldRealm.objectForPrimaryKey('Wallet', 0);
        const nodesData = oldRealm.objects('Node');

        if (!isEmpty(accountsData)) {
            Account.createMultiple(accountsData);
        }

        if (!isEmpty(versionZeroWalletData)) {
            Wallet.updateLatest(
                assign(
                    {},
                    versionZeroWalletData,
                    // Use latest schema version
                    { version: Wallet.version },
                ),
            );

            // Check if accountInfoDuringSetup.name was set in scheme version 0
            // If it was set, then that means there exists an account that hasn't been loaded properly in the wallet
            // It also means that "completed" property isn't set to true
            if (!isEmpty(versionZeroWalletData.accountInfoDuringSetup.name)) {
                Wallet.updateAccountInfoDuringSetup({ completed: true });
            }
        }

        if (!isEmpty(nodesData)) {
            Node.addNodes(nodesData);
        }

        oldRealm.write(() => oldRealm.deleteAll());

        Realm.deleteFile(versionZeroConfig);
    }
};

/**
 * Purges persisted data and reinitialises storage.
 *
 * @method reinitialise
 * @param {Promise<function>}
 *
 * @returns {Promise}
 */
const reinitialise = (getEncryptionKeyPromise) => purge().then(() => initialise(getEncryptionKeyPromise));

export {
    realm,
    initialise,
    initialiseSync,
    reinitialise,
    purge,
    Account,
    ErrorLog,
    Transaction,
    Address,
    AddressSpendStatus,
    Node,
    Wallet,
};
