import { SInfo } from '../../mobile/exports';
import { parse, serialize } from '../libs/util';

export function checkKeychainForDuplicates(key, seed, name, error, success) {
    getFromKeychain(key, value => {
        if (typeof value === 'undefined' || value === null) {
            success();
        } else {
            var seedArray = parse(value);
            for (var item of seedArray) {
                if (item.name === name) {
                    error(
                        'error',
                        'Account name already in use',
                        'This account name is already linked to your wallet. Please use a different one.',
                    );
                    return;
                } else if (item.seed === seed) {
                    error(
                        'error',
                        'Seed already in use',
                        'This seed is already linked to your wallet. Please use a different one.',
                    );
                    return;
                }
            }
            success();
        }
    });
}

export function storeSeedInKeychain(key, seed, name) {
    getFromKeychain(key, value => {
        if (typeof value == 'undefined' || value === null) {
            var newSeedArray = [{ name: name, seed: seed }];
            newSeedArray = serialize(newSeedArray);
            store(newSeedArray);
        } else {
            var seedArray = parse(value);
            var newSeed = { name: name, seed: seed };
            seedArray.push(newSeed);
            seedArray = serialize(seedArray);
            store(seedArray);
        }
    });

    function store(seeds) {
        SInfo.setItem(key, seeds, {
            sharedPreferencesName: 'mySharedPrefs',
            keychainService: 'myKeychain',
        });
    }
}

export function replaceKeychainValue(key, value) {
    deleteFromKeyChain(key);
    storeValueInKeychain(key, value);
}

export function storeValueInKeychain(key, value) {
    const seedArray = serialize(value);
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
    const parsed = parse(value);

    return parsed[index] ? parsed[index].seed : '';
}

export function deleteSeed(value, password, seedIndex) {
    deleteFromKeyChain(password);
    let seeds = parse(value);
    seeds.splice(seedIndex, 1);
    seeds = serialize(seeds);
    SInfo.setItem(password, seeds, {
        sharedPreferencesName: 'mySharedPrefs',
        keychainService: 'myKeychain',
    });
}

export function getSeedName(value, index) {
    const parsed = parse(value);
    return parsed[index] ? parsed[index].name : '';
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
