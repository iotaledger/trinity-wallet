module.exports = ({ version }, stateMock) => {
    window.__STATE_MOCK__ = stateMock;
    window.Electron = {
        mode: 'cli',
        getOS: () => {
            return 'darwin';
        },
        getOnboardingSeed: () => {
            return new Array(81).fill(0);
        },
        getChecksum: () => {
            return 'ABC';
        },
        getVersion: () => {
            return version;
        },
        garbageCollect: () => {},
        setOnboardingSeed: () => {},
        readKeychain: async () => 'ABC,DEF',
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
        getOnboardingGenerated: () => new Array(81).fill(0),
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
    };
};
