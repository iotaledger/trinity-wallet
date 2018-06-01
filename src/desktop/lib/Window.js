const { ipcRenderer: ipc, shell, clipboard } = require('electron');
const packageFile = require('../package.json');
const machineUuid = require('machine-uuid');
const keytar = require('keytar');
const settings = require('electron-settings');
const Kerl = require('iota.lib.js/lib/crypto/kerl/kerl');
const Curl = require('iota.lib.js/lib/crypto/curl/curl');
const Converter = require('iota.lib.js/lib/crypto/converter/converter');
const currentWindow = require('electron').remote.getCurrentWindow();

const trytesTrits = [
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
    [0, 0, 0],
];

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

let onboardingSeed = null;
let onboardingGenerated = false;

const Electron = {
    clipboard: (content) => {
        if (content) {
            let clip =
                typeof content === 'string'
                    ? content
                    : Array.from(content)
                          .map((byte) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9'.charAt(byte % 27))
                          .join('');
            clipboard.writeText(clip);
            clip = null;
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

    gotoLatestRelease: () => {
        shell.openExternal(packageFile.url);
    },

    updateMenu: (attribute, value) => {
        ipc.send('menu.update', {
            attribute: attribute,
            value: value,
        });
    },

    enableMenu: () => {
        ipc.send('menu.enabled', true);
    },

    disableMenu: () => {
        ipc.send('menu.enabled', false);
    },

    requestDeepLink: () => {
        ipc.send('request.deepLink');
    },

    getActiveVersion() {
        return settings.get('trinity-version');
    },

    setActiveVersion(value) {
        return settings.set('trinity-version', value);
    },

    getStorage(key) {
        return settings.get(key);
    },

    setStorage(key, item) {
        return settings.set(key, item);
    },

    removeStorage(key) {
        return settings.delete(key);
    },

    clearStorage() {
        const keys = settings.getAll();
        Object.keys(keys).forEach((key) => this.removeStorage(key));
    },

    getAllStorage() {
        const data = settings.getAll();
        const keys = Object.keys(data).filter((key) => key.indexOf('reduxPersist') === 0);
        return keys;
    },

    readKeychain: () => {
        return keytar.getPassword('Trinity desktop wallet', 'trinity');
    },

    setKeychain: (content) => {
        return keytar.setPassword('Trinity desktop wallet', 'trinity', content);
    },

    getOS: () => {
        return process.platform;
    },

    minimize: () => {
        currentWindow.minimize();
    },

    maximize: () => {
        currentWindow.maximize();
    },

    close: () => {
        currentWindow.close();
    },

    showMenu: () => {
        ipc.send('menu.popup');
    },

    setOnboardingSeed: (seed, generated) => {
        onboardingSeed = seed;
        onboardingGenerated = generated ? true : false;
    },

    getOnboardingSeed: () => {
        return onboardingSeed;
    },

    getOnboardingGenerated: () => {
        return onboardingGenerated;
    },

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

    garbageCollect: () => {
        global.gc();
    },

    changeLanguage: (t) => {
        ipc.send('menu.language', {
            about: t('settings:about'),
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

global.Electron = Electron;
