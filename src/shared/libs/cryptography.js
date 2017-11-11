import { SInfo } from '../../mobile/exports';

export function storeInKeychain(key, seed, name, callback, alertFn) {
    getFromKeychain(key, value => {
        if (typeof value == 'undefined' || value === null) {
            var newSeedArray = [{ name: name, seed: seed }];
            newSeedArray = JSON.stringify(newSeedArray);
            store(newSeedArray);
        } else {
            var seedArray = JSON.parse(value);
            for (var item of seedArray) {
                if (item.name == name || item.seed == seed) {
                    alertFn(
                        'error',
                        'Seed already in use',
                        'This seed is already linked to your wallet. Please use a different one.',
                    );
                    console.log('Error: Same name or seed');
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
