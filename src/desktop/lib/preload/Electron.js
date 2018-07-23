const { ipcRenderer: ipc, shell, clipboard } = require('electron');
const { dialog } = require('electron').remote;
const currentWindow = require('electron').remote.getCurrentWindow();
const packageFile = require('../../package.json');
const machineUuid = require('machine-uuid');
const keytar = require('keytar');
const fs = require('fs');
const settings = require('electron-settings');
const Kerl = require('iota.lib.js/lib/crypto/kerl/kerl');
const Curl = require('iota.lib.js/lib/crypto/curl/curl');
const Converter = require('iota.lib.js/lib/crypto/converter/converter');
const kdbx = require('../kdbx');

const trytesTrits = [
    [0, 0, 0],
    [1, 0, 0],
    [-1, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
    [-1, -1, 1],
    [0, -1, 1],
    [1, -1, 1],
    [-1, 0, 1],
    [0, 0, 1],
    [1, 0, 1],
    [-1, 1, 1],
    [0, 1, 1],
    [1, 1, 1],
    [-1, -1, -1],
    [0, -1, -1],
    [1, -1, -1],
    [-1, 0, -1],
    [0, 0, -1],
    [1, 0, -1],
    [-1, 1, -1],
    [0, 1, -1],
    [1, 1, -1],
    [-1, -1, 0],
    [0, -1, 0],
    [1, -1, 0],
    [-1, 0, 0],
];

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

let onboardingSeed = null;
let onboardingGenerated = false;

/**
 * Global Electron helper for native support
 */
const Electron = {
    /**
     * Set clipboard value, in case of Seed array, trigger Garbae Collector
     * @param {String|Array} Content - Target content
     */
    clipboard: (content) => {
        if (content) {
            const clip =
                typeof content === 'string'
                    ? content
                    : Array.from(content)
                          .map((byte) => '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(byte % 27))
                          .join('');
            clipboard.writeText(clip);
            if (typeof content !== 'string') {
                global.gc();
            }
        } else {
            clipboard.clear();
        }
    },

    getUuid() {
        return machineUuid();
    },

    /**
     * Open default Trinity wallet url
     */
    gotoLatestRelease: () => {
        shell.openExternal(packageFile.url);
    },

    /**
     * Proxy native menu attribute settings
     * @param {String} Attribute - Target attribute
     * @param {Any} Value - target attribute value
     * @returns {undefined}
     */
    updateMenu: (attribute, value) => {
        ipc.send('menu.update', {
            attribute: attribute,
            value: value,
        });
    },

    /**
     * Proxy deep link value to main process
     * @returns {undefined}
     */
    requestDeepLink: () => {
        ipc.send('request.deepLink');
    },

    /**
     * Get local storage item by item key
     * @param {String} Key - Target item key
     * @returns {Any} Storage item value
     */
    getStorage(key) {
        return settings.get(key);
    },

    /**
     * Set local storage item by item key
     * @param {String} Key - Target item key
     * @param {Any} Storage - Target item value
     * @returns {Boolean} If item update is succefull
     */
    setStorage(key, item) {
        return settings.set(key, item);
    },

    /**
     * Remove local storage item by item key
     * @param {String} Key - Target item key
     * @returns {Boolean} If item removal is succefull
     */
    removeStorage(key) {
        return settings.delete(key);
    },

    /**
     * Remove all local storage items
     * @returns {undefined}
     */
    clearStorage() {
        const keys = settings.getAll();
        Object.keys(keys).forEach((key) => this.removeStorage(key));
    },

    /**
     * Get all local storage item keys
     * @returns {Array} Storage item keys
     */
    getAllStorage() {
        const data = settings.getAll();
        const keys = Object.keys(data).filter((key) => key.indexOf('reduxPersist') === 0);
        return keys;
    },

    /**
     * Get all keychain account entries
     * @returns {Promise} Promise resolves in an Array of entries
     */
    listKeychain: () => {
        return keytar.findCredentials('Trinity wallet');
    },

    /**
     * Get keychain account entry by account name
     * @param accountName - Target account name
     * @returns {Promise} Promise resolves in a account Object
     */
    readKeychain: (accountName) => {
        return keytar.getPassword('Trinity wallet', accountName);
    },

    /**
     * Set keychain account entry by account name
     * @param accountName - Target account name
     * @param content - Target account content
     * @returns {Promise} Promise resolves in a success Boolean
     */
    setKeychain: (accountName, content) => {
        return keytar.setPassword('Trinity wallet', accountName, content);
    },

    /**
     * Remove keychain account by account name
     * @param accountName - Target account name
     * @returns {Promise} Promise resolves in a success Boolean
     */
    removeKeychain: (accountName) => {
        return keytar.deletePassword('Trinity wallet', accountName);
    },

    /**
     * Get currrent operating system
     * @returns {String} - Operating system code win32|linux|darwin
     */
    getOS: () => {
        return process.platform;
    },

    /**
     * Minimize Wallet window
     * @returns {undefined}
     */
    minimize: () => {
        currentWindow.minimize();
    },

    /**
     * Toggle Wallet window maximize state
     * @returns {undefined}
     */
    maximize: () => {
        if (currentWindow.isMaximized()) {
            currentWindow.unmaximize();
        } else {
            currentWindow.maximize();
        }
    },

    /**
     * Close current wallet windoow
     * @returns {undefined}
     */
    close: () => {
        currentWindow.close();
    },

    /**
     * Trigger native menu visibility on Windows platforms
     * @returns {undefined}
     */
    showMenu: () => {
        ipc.send('menu.popup');
    },

    /**
     * Set onboarding seed variable to bypass Redux
     * @param {Array} Seed - Target seed byte array
     * @param {Boolean} isGenerated - Is the seed generated using Trinity
     * @returns {undefined}
     */
    setOnboardingSeed: (seed, isGenerated) => {
        onboardingSeed = seed;
        onboardingGenerated = isGenerated ? true : false;
    },

    /**
     * Get onboarding seed value
     * @param {Boolean} plainText - If should return plain text seed
     * @returns {Array|String} - onbaording seed
     */
    getOnboardingSeed: (plainText) => {
        return plainText
            ? onboardingSeed.map((byte) => '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(byte % 27)).join('')
            : onboardingSeed;
    },

    /**
     * Get onboarding seed generated in Trinity state
     * @returns {Boolean} - is seed generated
     */
    getOnboardingGenerated: () => {
        return onboardingGenerated;
    },

    /**
     * Calculate seed checksum
     * @param {Array} bytes  - target seed byte array
     * @returns {String} - seed checksum
     */
    getChecksum: (bytes) => {
        let trits = [];

        for (let i = 0; i < bytes.length; i++) {
            trits = trits.concat(trytesTrits[bytes[i] % 27]);
        }

        const kerl = new Kerl();
        const checksumTrits = [];
        kerl.initialize();
        kerl.absorb(trits, 0, trits.length);
        kerl.squeeze(checksumTrits, 0, Curl.HASH_LENGTH);

        const checksum = Converter.trytes(checksumTrits.slice(-9));

        return checksum;
    },

    /**
     * Trigger Garbage Collector
     * @returns {undefined}
     */
    garbageCollect: () => {
        global.gc();
    },

    /**
     * Export SeedVault file
     * @param {array} - Seed object array
     * @param {string} - Plain text password to use for SeedVault
     * @returns {undefined}
     */
    exportSeeds: async (seeds, password) => {
        try {
            const content = await kdbx.exportVault(seeds, password);
            const now = new Date();

            const path = await dialog.showSaveDialog(currentWindow, {
                title: 'Export keyfile',
                defaultPath: `trinity-${now
                    .toISOString()
                    .slice(0, 16)
                    .replace(/[-:]/g, '')
                    .replace('T', '-')}.kdbx`,
                buttonLabel: 'Export',
            });

            if (!path) {
                throw Error('Export cancelled');
            }

            fs.writeFileSync(path, new Buffer(content));

            return false;
        } catch (error) {
            return error.message;
        }
    },

    /**
     * Decrypt SeedVault file
     * @param {Buffer} buffer - SeedVault file content
     * @param {string} - Plain text password for SeedVailt decryption
     * @returns {Array} - Seed object array
     */
    importSeed: async (buffer, password) => {
        const seeds = await kdbx.importVault(buffer, password);
        return seeds;
    },

    /**
     * Set native menu locales
     * @param {function} t - i18n locale helper
     * @returns {undefiend}
     */
    changeLanguage: (t) => {
        ipc.send('menu.language', {
            about: t('settings:aboutTrinity'),
            checkUpdate: t('checkForUpdates'),
            sendFeedback: 'Send feedback',
            settings: capitalize(t('home:settings')),
            accountSettings: t('settings:accountManagement'),
            newAccount: t('accountManagement:addNewAccount'),
            language: t('languageSetup:language'),
            node: t('node'),
            currency: t('settings:currency'),
            theme: t('settings:theme'),
            twoFA: t('settings:twoFA'),
            changePassword: t('settings:changePassword'),
            advanced: t('settings:advanced'),
            hide: t('settings:hide'),
            hideOthers: t('settings:hideOthers'),
            showAll: t('settings:showAll'),
            quit: t('settings:quit'),
            edit: t('settings:edit'),
            undo: t('settings:undo'),
            redo: t('settings:redo'),
            cut: t('settings:cut'),
            copy: t('settings:copy'),
            paste: t('settings:paste'),
            selectAll: t('settings:selectAll'),
            account: t('account'),
            balance: capitalize(t('home:balance')),
            send: capitalize(t('home:send')),
            receive: capitalize(t('home:receive')),
            history: capitalize(t('home:history')),
            logout: t('settings:logout'),
            logoutConfirm: t('logoutConfirmationModal:logoutConfirmation'),
            yes: t('yes'),
            no: t('no'),
        });
    },

    /**
     * Add native window wallet event listener
     * @param {string} event - Target event name
     * @param {function} callback - Event trigger callback
     * @returns {undefiend}
     */
    onEvent: function(event, callback) {
        let listeners = this._eventListeners[event];
        if (!listeners) {
            listeners = this._eventListeners[event] = [];
            ipc.on(event, (e, args) => {
                listeners.forEach((call) => {
                    call(args);
                });
            });
        }
        listeners.push(callback);
    },

    /**
     * Remove native window wallet event listener
     * @param {string} event - Target event name
     * @param {function} callback - Event trigger callback
     * @returns {undefiend}
     */
    removeEvent: function(event, callback) {
        const listeners = this._eventListeners[event];
        listeners.forEach((call, index) => {
            if (call === callback) {
                listeners.splice(index, 1);
            }
        });
    },

    _eventListeners: {},
};

module.exports = Electron;
