import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import some from 'lodash/some';
import { serialize, parse } from '../../shared/libs/util';
import * as Keychain from 'react-native-keychain';

const keychain = {
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

export const storeSeedInKeychain = async (password, seed, name) => {
    const data = await keychain.get();
    const info = { seed, name };

    if (isEmpty(data)) {
        const seedArray = [info];
        return keychain.set(password, serialize(seedArray));
    }

    const existingSeedArray = parse(data.password);
    const updatedKeychainInfo = [...existingSeedArray, info]; // Might need to check type
    return keychain.set(password, serialize(updatedKeychainInfo));
};

export const hasDuplicateAccountName = (data, name) => {
    const parsed = parse(data);
    const hasDuplicate = d => get(d, 'name') === name;

    return some(parsed, hasDuplicate);
};

export const hasDuplicateSeed = (data, seed) => {
    const parsed = parse(data);
    const hasDuplicate = d => get(d, 'seed') === seed;

    return some(parsed, hasDuplicate);
};

export function getSeed(value, index) {
    const parsed = parse(value);

    return parsed[index] ? parsed[index].seed : '';
}

export default keychain;
