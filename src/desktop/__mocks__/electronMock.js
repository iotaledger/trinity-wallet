module.exports = ({ version }, stateMock) => {
    window.__STATE_MOCK__ = stateMock;
    window.__STATE_MOCK__.wallet.password = new Uint8Array(window.__STATE_MOCK__.wallet.password);
    window.Electron = {
        mode: 'cli',
        getOS: () => {
            return 'darwin';
        },
        getAllStorage: () => window.__STATE_MOCK__,
        getChecksum: () => {
            return 'ABC';
        },
        getVersion: () => {
            return version;
        },
        argon2: () => new Uint8Array(32).fill(0),
        garbageCollect: () => {},
        setOnboardingSeed: (_seed, isGenerated) => {
            window.onboardingSeed = Array(81).fill(0);
            window.isGenerated = isGenerated;
        },
        getOnboardingSeed: () => window.onboardingSeed,
        getOnboardingGenerated: () => window.isGenerated,
        getStorage: (key) => JSON.stringify(window.__STATE_MOCK__[key.replace('reduxPersist:', '')]),
        readKeychain: async (target) =>
            window.__STATE_MOCK__.wallet.ready || target === 'realm_enc_key' || target.indexOf('-salt') > -1
                ? '154,69,196,133,104,143,124,56,137,178,155,235|213,183,203,0,35,11,22,63,233,173,222,70,67,202,26,202,155,248,70,178,253,82,156,117,169,199,123,22,108,42,87,179,164,59,43,109,6,165,2,74,7,152,94,50,67,32,115,101,84,30,205,161,89,94,74,51,154,235,72,132,45,91,178,14,218,82,238,104,39,140,20,245,102,125,126,59,79,74,243,181,83,236,2,169,203,56,215,147,71,202,243,76,17,80,86,66,251,139,79,244,52,48,225,177,199,226,84,21,227,167,124,149,86,12,96,136,115,58,86,101,130,69,10,65,88,30,196,120,16,169,63,26,15,197,30,193,161,74,29,92,59,195,200,30,231,71,225,138,13,86,43,52,253,140,146,22,20,195,55,34,37,212,180,44,56,241,35,30,75,95,216,164,167,81,43,201,144,195,63'
                : null,
        genFn: () => {
            return Array(243)
                .fill(0)
                .map((_i, i) => (i % 3 === 0 ? 1 : 0));
        },
        ledger: {
            addListener: () => {},
            removeListener: () => {},
        },
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
        getUserDataPath: () => '',
        getUuid: async () => '',
        listKeychain: () => [],
        setKeychain: () => {},
        changeLanguage: () => {},
        onEvent: () => {},
        removeEvent: () => {},
        showMenu: () => {},
        updateMenu: () => {},
        requestDeepLink: () => {},
        setStorage: async () => {},
        setTray: () => {},
        focus: () => {},
    };
};
