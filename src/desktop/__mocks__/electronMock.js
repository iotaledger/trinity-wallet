module.exports = ({ version }, stateMock) => {
    window.__STATE_MOCK__ = stateMock;
    window.Electron = {
        mode: 'cli',
        getOS: () => {
            return 'darwin';
        },
        getOnboardingSeed: () => {
            return window.onboardingSeed;
        },
        getChecksum: () => {
            return 'ABC';
        },
        getVersion: () => {
            return version;
        },
        garbageCollect: () => {},
        setOnboardingSeed: (seed, isGenerated) => {
            window.onboardingSeed = seed;
            window.isGenerated = isGenerated;
        },
        listKeychain: () => [],
        setKeychain: () => {},
        readKeychain: async (target) => (target === 'realm_enc_key' || target.indexOf('-salt') > -1 ? 'ABC,DEF' : null),
        getUuid: async () => '',
        changeLanguage: () => {},
        onEvent: () => {},
        removeEvent: () => {},
        showMenu: () => {},
        updateMenu: () => {},
        requestDeepLink: () => {},
        setStorage: async () => {},
        ledger: {
            addListener: () => {},
            removeListener: () => {},
        },
        getAllStorage: () => window.__STATE_MOCK__,
        getUserDataPath: () => '',
        getStorage: (key) => JSON.stringify(window.__STATE_MOCK__[key.replace('reduxPersist:', '')]),
        getOnboardingGenerated: () => window.isGenerated,
        getRealm: () =>
            class Realm {
                constructor() {}
                addListener() {}
                objectForPrimaryKey() {}
                schemaVersion() {
                    return -1;
                }
                objects() {}
                create() {}
                write() {}
                close() {}
            },
        setTray: () => {},
        focus: () => {},
        argon2: () => new Uint8Array(32).fill(0),
    };
};
