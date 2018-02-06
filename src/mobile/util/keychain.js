import assign from 'lodash/assign';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import some from 'lodash/some';
import map from 'lodash/map';
import isString from 'lodash/isString';
import filter from 'lodash/filter';
import { serialize, parse } from '../../shared/libs/util';
import * as Keychain from 'react-native-keychain';

const keychain = {
    get: () => {
        return new Promise((resolve, reject) => {
            Keychain.getGenericPassword()
                .then(credentials => {
                    if (isEmpty(credentials)) {
                        resolve(null);
                    } else {
                        const payload = {
                            password: get(credentials, 'username'),
                            data: get(credentials, 'password'),
                            service: get(credentials, 'service'),
                        };

                        resolve(payload);
                    }
                })
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
    const existingInfo = await keychain.get();
    const existingData = get(existingInfo, 'data');

    // In case this is the first seed with account name
    // Set the new seed with account name
    if (isEmpty(existingData)) {
        const info = { accounts: [{ seed, name }], shared: { twoFactorAuthKey: null } };
        return keychain.set(password, serialize(info));
    }

    const parsed = parse(existingData);

    const updatedKeychainInfo = assign({}, parsed, {
        accounts: [...get(parsed, 'accounts'), { seed, name }],
    });

    return keychain.set(password, serialize(updatedKeychainInfo));
};

export const storeTwoFactorAuthKeyInKeychain = async key => {
    const info = await keychain.get();

    const { password, data } = info;

    // Should only allow storing two factor authentication key
    // if a user has an account and is logged in.
    const shouldNotAllow = !password || !data;

    if (!isString(key)) {
        throw new Error('Invalid two factor authentication key.');
    } else if (shouldNotAllow) {
        throw new Error('Cannot store two factor authentication key. No account information found in keychain.');
    }

    const parsed = parse(data);
    const withTwoFactorAuthKey = assign({}, parsed, {
        shared: {
            twoFactorAuthKey: key,
        },
    });

    return keychain.set(password, serialize(withTwoFactorAuthKey));
};

export const getTwoFactorAuthKeyFromKeychain = async () => {
    const info = await keychain.get();

    const { data } = info;

    return get(parse(data), 'shared.twoFactorAuthKey');
};

export const getPasswordFromKeychain = async () => {
    const info = await keychain.get();

    return get(info, 'password');
};

export const hasDuplicateAccountName = (data, name) => {
    const parsed = parse(data);
    const hasDuplicate = d => get(d, 'name') === name;

    return some(get(parsed, 'accounts'), hasDuplicate);
};

export const hasDuplicateSeed = (data, seed) => {
    const parsed = parse(data);
    const hasDuplicate = d => get(d, 'seed') === seed;

    return some(get(parsed, 'accounts'), hasDuplicate);
};

export const getSeed = (value, index) => {
    const parsed = parse(value);
    const accounts = get(parsed, 'accounts');

    // Should check seed prop - Dangerous
    return accounts[index] ? accounts[index].seed : '';
};

export const updateAccountNameInKeychain = async (replaceAtIndex, newAccountName, password) => {
    const info = await keychain.get();
    const data = get(info, 'data');

    if (data) {
        const parsed = parse(data);
        const replace = (d, i) => {
            if (i === replaceAtIndex) {
                return {
                    ...d,
                    name: newAccountName,
                };
            }

            return d;
        };

        const updatedAccountInfo = map(get(parsed, 'accounts'), replace);

        return keychain.set(
            password,
            serialize(
                assign({}, parsed, {
                    accounts: updatedAccountInfo,
                }),
            ),
        );
    }

    return Promise.reject(new Error('Something went wrong while updating account name.'));
};

export const deleteFromKeychain = async (deleteFromIndex, password) => {
    const info = await keychain.get();
    const data = get(info, 'data');

    if (data) {
        const parsed = parse(data);
        const remove = (d, i) => i !== deleteFromIndex;
        const updatedAccountInfo = filter(get(parsed, 'accounts'), remove);

        return keychain.set(
            password,
            serialize(
                assign({}, parsed, {
                    accounts: updatedAccountInfo,
                }),
            ),
        );
    }

    return Promise.reject(new Error('Something went wrong while deleting from keychain.'));
};

export default keychain;
