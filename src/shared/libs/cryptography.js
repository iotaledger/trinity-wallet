import { SInfo } from '../../mobile/exports';

export function storeInKeychain(key, value) {
    SInfo.setItem(key, value, {
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

export function deleteFromKeyChain(
    key,
    options = {
        sharedPreferencesName: 'mySharedPrefs',
        keychainService: 'myKeychain',
    },
) {
    return SInfo.deleteItem(key, options);
}
