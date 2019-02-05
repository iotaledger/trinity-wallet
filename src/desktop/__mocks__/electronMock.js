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
        readKeychain: async () => {},
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
        getAllStorage: () => {
            const keys = Object.keys(window.__STATE_MOCK__).map((key) => `reduxPersist:${key}`);
            return keys;
        },
        getStorage: (key) => JSON.stringify(window.__STATE_MOCK__[key.replace('reduxPersist:', '')]),
        getOnboardingGenerated: () => new Array(81).fill(0),
    };

    window.__STATE_MOCK__ = stateMock;
};
