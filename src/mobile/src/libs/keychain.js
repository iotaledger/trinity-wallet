import values from 'lodash/values';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import * as Keychain from 'react-native-keychain';
import { getVersion } from 'react-native-device-info';
import { serialise } from 'shared-modules/libs/utils';
import { trytesToTrits } from 'shared-modules/libs/iota/converter';
import {
    getNonce,
    createSecretBox,
    openSecretBox,
    encodeBase64,
    decodeBase64,
    generatePasswordHash,
    stringToUInt8,
    sha256,
} from 'libs/crypto';

export const ALIAS_SEEDS = 'seeds';
const ALIAS_AUTH = 'authKey';
const ALIAS_SALT = 'salt';
export const ALIAS_REALM = 'realm_enc_key';

export const keychain = {
    get: (alias) => {
        return new Promise((resolve, reject) => {
            Keychain.getInternetCredentials(alias)
                .then((credentials) => {
                    if (isEmpty(credentials)) {
                        resolve(null);
                    } else {
                        const payload = {
                            nonce: get(credentials, 'username'),
                            item: get(credentials, 'password'),
                        };

                        resolve(payload);
                    }
                })
                .catch((err) => reject(err));
        });
    },
    clear: (alias) => {
        return new Promise((resolve, reject) => {
            Keychain.resetInternetCredentials(alias)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    },
    set: (alias, nonce, item) => {
        return new Promise((resolve, reject) => {
            Keychain.setInternetCredentials(alias, nonce, item)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    },
};

export const getSecretBoxFromKeychainAndOpenIt = async (alias, keyUInt8) => {
    const secretBox = await keychain.get(alias);
    if (secretBox) {
        const box = await decodeBase64(secretBox.item);
        const nonce = await decodeBase64(secretBox.nonce);
        return await openSecretBox(box, nonce, keyUInt8);
    }
    return null;
};

export const hash = async (password) => {
    const saltItem = await keychain.get(ALIAS_SALT);
    const salt = await decodeBase64(saltItem.item);
    return await generatePasswordHash(password, salt);
};

export const doesSaltExistInKeychain = () => {
    return keychain.get(ALIAS_SALT).then((salt) => {
        if (!salt) {
            return false;
        }
        return true;
    });
};

export const storeSaltInKeychain = async (salt) => {
    const nonce64 = await encodeBase64(await getNonce());
    const salt64 = await encodeBase64(salt);
    await keychain.set(ALIAS_SALT, nonce64, salt64);
};

export const createAndStoreBoxInKeychain = async (key, message, alias) => {
    const nonce = await getNonce();
    const box = await encodeBase64(await createSecretBox(stringToUInt8(serialise(message)), nonce, key));
    const nonce64 = await encodeBase64(nonce);
    return await keychain.set(alias, nonce64, box);
};

export const authorize = async (pwdHash) => {
    await getSecretBoxFromKeychainAndOpenIt(ALIAS_SEEDS, pwdHash);
    return true;
};

export const getTwoFactorAuthKeyFromKeychain = async (pwdHash) => {
    return await getSecretBoxFromKeychainAndOpenIt(ALIAS_AUTH, pwdHash);
};

export const storeTwoFactorAuthKeyInKeychain = async (pwdHash, authKey) => {
    // Should only allow storing two factor authkey if the user has an account
    const info = await keychain.get(ALIAS_SEEDS);
    const shouldNotAllow = !info;

    if (!isString(authKey)) {
        throw new Error('Invalid two factor authentication key.');
    } else if (shouldNotAllow) {
        throw new Error('Cannot store two factor authentication key.');
    }
    return await createAndStoreBoxInKeychain(pwdHash, authKey, ALIAS_AUTH);
};

export const deleteTwoFactorAuthKeyFromKeychain = async () => {
    return await keychain.clear(ALIAS_AUTH);
};

export const clearKeychain = async () => {
    await keychain.clear(ALIAS_SEEDS);
    await keychain.clear(ALIAS_AUTH);

    return await keychain.clear(ALIAS_SALT);
};

/**
 * Gets realm encryption key.
 *
 * @method getRealmEncryptionKeyFromKeychain
 * @returns {Promise}
 */
export const getRealmEncryptionKeyFromKeychain = () => {
    return keychain.get(ALIAS_REALM).then((data) => {
        const nonce = get(data, 'nonce');
        const item = get(data, 'item');

        if (nonce && item) {
            return decodeBase64(item);
        }

        return null;
    });
};

/**
 * Sets realm encryption key.
 *
 * @method setRealmEncryptionKeyInKeychain
 * @param {array} encryptionKey
 *
 * @returns {Promise}
 */
export const setRealmEncryptionKeyInKeychain = (encryptionKey) => {
    return encodeBase64(encryptionKey).then((encodedEncryptionKey) =>
        keychain.set(ALIAS_REALM, `Trinity-${getVersion()}`, encodedEncryptionKey),
    );
};

/**
 * Changes wallet password.
 *
 * @method changePassword
 * @param {array} oldPwdHash
 * @param {array} newPwdHash
 * @param {array} salt
 *
 * @returns {Promise}
 */
export const changePassword = async (oldPwdHash, newPwdHash, salt) => {
    const seedInfo = await getSecretBoxFromKeychainAndOpenIt(ALIAS_SEEDS, oldPwdHash);
    // Clear keychain for alias "seeds"
    await keychain.clear(ALIAS_SEEDS);
    const authKey = await getTwoFactorAuthKeyFromKeychain(oldPwdHash);
    if (authKey) {
        await keychain.clear(ALIAS_AUTH);
    }
    // Clear salt and store new salt in keychain
    await keychain.clear(ALIAS_SALT);
    await storeSaltInKeychain(salt);
    // Create a secret box with new password hash
    await createAndStoreBoxInKeychain(newPwdHash, seedInfo, ALIAS_SEEDS);
    // Only update keychain with authKey alias if wallet has a twoFa key
    if (authKey) {
        return await storeTwoFactorAuthKeyInKeychain(newPwdHash, authKey);
    }
    return Promise.resolve();
};

/**
 * Migrates seed storage to new approach introduced in build 43.
 * FIXME: To be deprecated
 *
 * @method migrateSeedStorage
 * @param {array} oldPwdHash
 * @param {array} newPwdHash
 * @param {array} salt
 *
 * @returns {Promise}
 */
export const migrateSeedStorage = async (pwdHash) => {
    const updateSeedInfo = async (seedInfo) => {
        const updatedSeedInfo = {};
        for (const key in seedInfo) {
            updatedSeedInfo[await sha256(key)] = values(trytesToTrits(seedInfo[key]));
        }
        return updatedSeedInfo;
    };
    const seedInfo = await getSecretBoxFromKeychainAndOpenIt(ALIAS_SEEDS, pwdHash);
    const updatedSeedInfo = await updateSeedInfo(seedInfo);
    // Clear keychain for alias "seeds"
    await keychain.clear(ALIAS_SEEDS);
    const authKey = await getTwoFactorAuthKeyFromKeychain(pwdHash);
    if (authKey) {
        await keychain.clear(ALIAS_AUTH);
    }
    // Create a secret box with new password hash
    await createAndStoreBoxInKeychain(pwdHash, updatedSeedInfo, ALIAS_SEEDS);
    // Only update keychain with authKey alias if wallet has a twoFa key
    if (authKey) {
        return await storeTwoFactorAuthKeyInKeychain(pwdHash, authKey);
    }
    return Promise.resolve();
};

export default keychain;
