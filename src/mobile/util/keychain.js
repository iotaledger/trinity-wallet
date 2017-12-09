import * as Keychain from 'react-native-keychain';

export default {
    get: () => {
        return new Promise((resolve, reject) => {
            Keychain.getGenericPassword()
                .then(credentials => resolve(credentials))
                .catch(err => reject(err));
        });
    },
    clear: () => {
        return new Promise((resolve, reject) => {
            Keychain.resetGenericPassword()
                .then(() => resolve())
                .catch(err => reject(err));
        });
    },
    set: (key, value) => {
        return new Promise((resolve, reject) => {
            Keychain.setGenericPassword(key, value)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    },
};
