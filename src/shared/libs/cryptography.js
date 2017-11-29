import { SInfo } from '../../mobile/exports';

export function storeSeedInKeychain(key, seed, name, alertFn, callback) {
    getFromKeychain(key, value => {
        if (typeof value == 'undefined' || value === null) {
            var newSeedArray = [{ name: name, seed: seed }];
            newSeedArray = JSON.stringify(newSeedArray);
            store(newSeedArray);
        } else {
            var seedArray = JSON.parse(value);
            for (var item of seedArray) {
                if (item.name == name) {
                    alertFn(
                        'error',
                        'Account name already in use',
                        'This account name is already linked to your wallet. Please use a different one.',
                    );
                    return;
                } else if (item.seed == seed) {
                    alertFn(
                        'error',
                        'Seed already in use',
                        'This seed is already linked to your wallet. Please use a different one.',
                    );
                    return;
                }
            }
            var newSeed = { name: name, seed: seed };
            seedArray.push(newSeed);
            seedArray = JSON.stringify(seedArray);
            store(seedArray);
        }
    });

    function store(seeds) {
        SInfo.setItem(key, seeds, {
            sharedPreferencesName: 'mySharedPrefs',
            keychainService: 'myKeychain',
        });
        if (typeof callback === 'function') {
            callback();
        }
    }
}

export function replaceKeychainValue(key, value) {
    deleteFromKeyChain(key);
    storeValueInKeychain(key, value);
}

export function storeValueInKeychain(key, value) {
    const seedArray = JSON.stringify(value);
    SInfo.setItem(key, seedArray, {
        sharedPreferencesName: 'mySharedPrefs',
        keychainService: 'myKeychain',
    });
}

export function getFromKeychain(key, fn) {
    SInfo.getItem(key, {
        sharedPreferencesName: 'mySharedPrefs',
        keychainService: 'myKeychain',
    }).then(value => {
        fn(value);
    });
}

export function getSeed(value, index) {
    value = JSON.parse(value);
    return value[index].seed;
}

export function deleteSeed(value, password, seedIndex) {
    deleteFromKeyChain(password);
    let seeds = JSON.parse(value);
    seeds.splice(seedIndex, 1);
    seeds = JSON.stringify(seeds);
    SInfo.setItem(password, seeds, {
        sharedPreferencesName: 'mySharedPrefs',
        keychainService: 'myKeychain',
    });
}

export function getSeedName(value, index) {
    value = JSON.parse(value);
    return value[index].name;
}

export function deleteFromKeyChain(
    key,
    options = {
        sharedPreferencesName: 'mySharedPrefs',
        keychainService: 'myKeychain',
    },
) {
    return SInfo.deleteItem(key, options);
}

export function getAllItems(
    options = {
        sharedPreferencesName: 'mySharedPrefs',
        keychainService: 'myKeychain',
    },
) {
    return SInfo.getAllItems(options);
}
