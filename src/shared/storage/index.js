/* global Electron */
import assign from 'lodash/assign';
import each from 'lodash/each';
import filter from 'lodash/filter';
import find from 'lodash/find';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import merge from 'lodash/merge';
import orderBy from 'lodash/orderBy';
import size from 'lodash/size';
import some from 'lodash/some';
import { serialise, parse } from '../libs/utils';
import schemas, { getDeprecatedStoragePath, STORAGE_PATH as latestStoragePath, v0Schema, v1Schema } from '../schemas';
import { __MOBILE__, __TEST__ } from '../config';
import { preserveAddressLocalSpendStatus } from '../libs/iota/addresses';

// Initialise realm instance
let realm = {}; // eslint-disable-line import/no-mutable-exports

// Initialise Realm constructor as null and reinitialise after importing the correct (platform) Realm dependency
let Realm = null;

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

/**
 * Model for Account.
 */
class Account {
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
                addressData: map(account.addressData, (data) => parse(serialise(data))),
                transactions: map(account.transactions, (transaction) => parse(serialise(transaction))),
                meta: parse(serialise(account.meta)),
            }),
        );
    }

    /**
     * Orders accounts by indexes
     *
     * @method orderAccountsByIndex
     *
     * @returns {void}
     */
    static orderAccountsByIndex() {
        const orderedAccounts = orderBy(Account.getDataAsArray(), ['index']);

        if (some(orderedAccounts, (account, index) => index !== account.index)) {
            realm.write(() => {
                each(orderedAccounts, (account, index) => {
                    realm.create('Account', assign({}, account, { index }), true);
                });
            });
        }
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
                    : preserveAddressLocalSpendStatus(
                          map(existingData.addressData, (data) => assign({}, data)),
                          data.addressData,
                      ),
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
        realm.write(() => {
            const accountsBeforeDeletion = Account.getDataAsArray();
            const accountForDeletion = find(accountsBeforeDeletion, { name });

            if (accountForDeletion) {
                realm.delete(Account.getObjectForId(name));

                const accountsAfterDeletion = Account.getDataAsArray();
                const deletedAccountIndex = accountForDeletion.index;

                each(accountsAfterDeletion, (account) => {
                    realm.create(
                        'Account',
                        assign({}, account, {
                            index: account.index > deletedAccountIndex ? account.index - 1 : account.index,
                        }),
                        true,
                    );
                });
            }
        });
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
 * Model for node.
 */
class Node {
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
        return map(Node.data, (node) => parse(serialise(node)));
    }

    /**
     * Adds a custom node
     *
     * @method addCustomNode
     * @param {string} url Node URL
     */
    static addCustomNode(node, pow) {
        realm.write(() => {
            realm.create('Node', {
                url: node.url,
                custom: true,
                pow,
                password: node.password,
                token: node.token,
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
            const existingNodes = Node.getDataAsArray();
            const existingUrls = map(existingNodes, (node) => node.url);

            realm.write(() => {
                each(nodes, (node) => {
                    // If it's an existing node, just update properties.
                    if (includes(existingUrls, node.url)) {
                        realm.create('Node', node, true);
                    } else {
                        realm.create('Node', node);
                    }
                });

                const newNodesUrls = map(nodes, (node) => node.url);

                // Remove all nodes (non-custom only) that are not part of the new nodes
                const nodesToRemove = filter(
                    existingNodes,
                    (node) => node.custom === false && !includes(newNodesUrls, node.url),
                );

                each(nodesToRemove, (node) => {
                    realm.delete(Node.getObjectForId(node.url));
                });
            });
        }
    }
}

/**
 * Model for wallet data and settings.
 */
class Wallet {
    static version = Number(schemas[size(schemas) - 1].schemaVersion);

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
     * Wallet data (as plain object) for most recent version.
     */
    static get latestDataAsPlainObject() {
        const data = Wallet.latestData;

        return parse(serialise(data));
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
     *
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
     * Updates deep linking setting.
     *
     * @method updateDeepLinkingSetting
     * @param {boolean} payload
     */
    static updateDeepLinkingSetting() {
        realm.write(() => {
            const settings = Wallet.latestSettings;
            settings.deepLinking = !settings.deepLinking;
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
     * Updates system proxy settings.
     *
     * @method updateIgnoreProxySetting
     * @param {object} payload
     */
    static updateIgnoreProxySetting(enabled) {
        realm.write(() => {
            Wallet.latestSettings.ignoreProxy = enabled;
        });
    }

    /*
     * Updates quorum configuration.
     *
     * @method updateQuorumConfig
     *
     * @param {object} payload
     */
    static updateQuorumConfig(payload) {
        const existingConfig = Wallet.latestSettings.quorum;
        realm.write(() => {
            Wallet.latestSettings.quorum = assign({}, existingConfig, payload);
        });
    }

    /**
     * Updates node auto-switch setting
     *
     * @method updateNodeAutoSwitchSetting
     *
     * @param {boolean} payload
     */
    static updateNodeAutoSwitchSetting(payload) {
        realm.write(() => {
            Wallet.latestSettings.nodeAutoSwitch = payload;
        });
    }

    /**
     * Updates autoNodeList setting
     *
     * @method updateAutoNodeListSetting
     *
     * @param {boolean} payload
     */
    static updateAutoNodeListSetting(payload) {
        realm.write(() => {
            Wallet.latestSettings.autoNodeList = payload;
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
                    settings: { notifications: {}, quorum: {} },
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

            Realm.deleteFile(schemas[size(schemas) - 1]);

            resolve();
        } catch (error) {
            reject(error);
        }
    });

/**
 * Migrates realm from deprecated to latest storage path
 *
 * @method migrateToNewStoragePath
 *
 * @param {object} config - {{ encryptionKey: {array}, schemaVersion: {number}, path: {string}, schema: {array} }}
 *
 * @returns {undefined}
 */
const migrateToNewStoragePath = (config) => {
    const oldRealm = new Realm(config);

    const accountsData = oldRealm.objects('Account');
    const walletData = oldRealm.objectForPrimaryKey('Wallet', config.schemaVersion);
    const nodesData = oldRealm.objects('Node');

    const newRealm = new Realm(assign({}, config, { path: latestStoragePath }));

    newRealm.write(() => {
        if (!isEmpty(accountsData)) {
            each(accountsData, (data) => newRealm.create('Account', data));
        }

        if (!isEmpty(walletData)) {
            newRealm.create('Wallet', walletData);
        }

        if (!isEmpty(nodesData)) {
            each(nodesData, (node) => newRealm.create('Node', node));
        }
    });

    oldRealm.write(() => oldRealm.deleteAll());
};

/**
 * Initialises storage.
 *
 * @method initialise
 * @param {Promise} getEncryptionKeyPromise
 *
 * @returns {Promise}
 */
const initialise = (getEncryptionKeyPromise) => {
    Realm = getRealm();

    return getEncryptionKeyPromise().then((encryptionKey) => {
        let hasVersionZeroRealmAtDeprecatedPath = false;
        let hasVersionOneRealmAtDeprecatedPath = false;

        try {
            hasVersionZeroRealmAtDeprecatedPath =
                Realm.schemaVersion(getDeprecatedStoragePath(0), encryptionKey) !== -1;
        } catch (error) {}

        try {
            hasVersionOneRealmAtDeprecatedPath = Realm.schemaVersion(getDeprecatedStoragePath(1), encryptionKey) !== -1;
        } catch (error) {}

        const versionZeroConfig = {
            encryptionKey,
            schemaVersion: 0,
            path: getDeprecatedStoragePath(0),
            schema: v0Schema,
        };

        const versionOneConfig = {
            encryptionKey,
            schemaVersion: 1,
            path: getDeprecatedStoragePath(1),
            schema: v1Schema,
        };

        if (
            hasVersionZeroRealmAtDeprecatedPath &&
            // Make sure version one realm file doesn't exist
            // If both version zero and version one files exist,
            // that probably means that a user already migrated to version one schema but version zero file wasn't removed
            !hasVersionOneRealmAtDeprecatedPath
        ) {
            migrateToNewStoragePath(versionZeroConfig);
        }

        if (hasVersionOneRealmAtDeprecatedPath) {
            migrateToNewStoragePath(versionOneConfig);
        }

        // Realm.schemaVersion(path) creates unnecessary files at provided path
        try {
            Realm.deleteFile(versionZeroConfig);
        } catch (error) {}

        try {
            Realm.deleteFile(versionOneConfig);
        } catch (error) {}

        const schemasSize = size(schemas);
        let nextSchemaIndex = 0;

        try {
            const schemaVersion = Realm.schemaVersion(latestStoragePath, encryptionKey);
            nextSchemaIndex = schemaVersion === -1 ? schemas[schemasSize - 1].schemaVersion : schemaVersion;
        } catch (error) {}

        while (nextSchemaIndex < schemasSize) {
            const migratedRealm = new Realm(assign({}, schemas[nextSchemaIndex++], { encryptionKey }));
            migratedRealm.close();
        }

        realm = new Realm(assign({}, schemas[schemasSize - 1], { encryptionKey }));

        initialiseSync();

        return encryptionKey;
    });
};

/**
 * Initialises storage.
 *
 * @method initialiseSync
 *
 * @returns {Promise}
 */
const initialiseSync = () => {
    Wallet.createIfNotExists();
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

export { realm, initialise, initialiseSync, reinitialise, purge, Account, Node, Wallet };
