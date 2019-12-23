import values from 'lodash/values';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import * as Keychain from 'react-native-keychain';
import { getVersion } from 'react-native-device-info';
import { parse, serialise } from 'shared-modules/libs/utils';
import { trytesToTrits } from 'shared-modules/libs/iota/converter';
import { API_VERSION as MOONPAY_API_VERSION } from 'shared-modules/exchanges/MoonPay/api';
import Errors from 'shared-modules/libs/errors';
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
export const ALIAS_SALT = 'salt';
export const ALIAS_REALM = 'realm_enc_key';

/**
 * MoonPay credentials key alias
 */
export const ALIAS_MOONPAY_CREDENTIALS = 'moonpay_credentials';

/**
 * MoonPay keychain adapter
 */
export const MoonPayKeychainAdapter = {
    /**
     * Gets MoonPay credentials (jwt & csrf) from keychain
     *
     * @returns {Promise}
     */
    get() {
        return keychain.get(ALIAS_MOONPAY_CREDENTIALS).then((data) => {
            const nonce = get(data, 'nonce');
            const item = get(data, 'item');

            if (nonce && item) {
                return parse(item);
            }

            return null;
        });
    },
    /**
     * Sets MoonPay credentials (jwt & csrf) in keychain
     *
     * @param {object} credentials
     *
     * @returns {Promise}
     */
    set(credentials) {
        return keychain.set(ALIAS_MOONPAY_CREDENTIALS, MOONPAY_API_VERSION, serialise(credentials));
    },
    /**
     * Clears MoonPay credentials (jwt & csrf) in keychain
     *
     * @returns {Promise}
     */
    clear() {
        return keychain.clear(ALIAS_MOONPAY_CREDENTIALS);
    },
};

export const keychain = {
    /**
     * Gets keychain entry for provided alias
     *
     * @method get
     *
     * @param {string} alias
     *
     * @returns {Promise<object>}
     */
    get: (alias) => {
        return Keychain.getInternetCredentials(alias).then((credentials) => {
            if (isEmpty(credentials)) {
                return null;
            }

            const payload = {
                nonce: get(credentials, 'username'),
                item: get(credentials, 'password'),
            };

            return payload;
        });
    },
    /**
     * Clears keychain entry for provided alias
     *
     * @method clear
     *
     * @param {string} alias
     *
     * @returns {Promise}
     */
    clear: (alias) => {
        return Keychain.resetInternetCredentials(alias);
    },
    /**
     * Sets keychain entry for provided alias
     *
     * @method set
     *
     * @param {string} alias
     *
     * @returns {Promise}
     */
    set: (alias, nonce, item) => {
        return Keychain.setInternetCredentials(alias, nonce, item);
    },
};

/**
 * Decrypts data from keychain for provided alias
 *
 * @method getSecretBoxFromKeychainAndOpenIt
 *
 * @param {string} alias
 * @param {Uint8Array} keyUInt8
 *
 * @returns {Promise}
 */
export const getSecretBoxFromKeychainAndOpenIt = async (alias, keyUInt8) => {
    const secretBox = await keychain.get(alias);

    if (secretBox) {
        const box = await decodeBase64(secretBox.item);
        const nonce = await decodeBase64(secretBox.nonce);
        return await openSecretBox(box, nonce, keyUInt8);
    }

    return null;
};

/**
 * Hashes password
 *
 * @method hash
 *
 * @param {Uint8Array} password
 *
 * @returns {Promise}
 */
export const hash = async (password) => {
    const saltItem = await keychain.get(ALIAS_SALT);

    if (isNull(saltItem)) {
        throw new Error(Errors.MISSING_FROM_KEYCHAIN(ALIAS_SALT));
    }

    const salt = await decodeBase64(saltItem.item);
    return await generatePasswordHash(password, salt);
};

/**
 * Checks if provided prop has any entry (data) in keychain
 *
 * @method hasEntryInKeychain
 *
 * @param {string} prop
 *
 * @returns {Promise<boolean>}
 */
export const hasEntryInKeychain = (prop) => {
    return keychain.get(prop).then((entry) => !isEmpty(entry));
};

/**
 * Stores salt in keychain
 *
 * @method storeSaltInKeychain
 *
 * @param {Uint8Array} salt
 *
 * @returns {Promise}
 */
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

export const clearKeychain = async () => {
    await keychain.clear(ALIAS_SEEDS);
    await keychain.clear(ALIAS_AUTH);
    await keychain.clear(ALIAS_MOONPAY_CREDENTIALS);

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
    // Clear salt and store new salt in keychain
    await keychain.clear(ALIAS_SALT);
    await storeSaltInKeychain(salt);
    // Create a secret box with new password hash
    await createAndStoreBoxInKeychain(newPwdHash, seedInfo, ALIAS_SEEDS);
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
            if (typeof seedInfo[key] !== 'string') {
                return Promise.resolve();
            }
            updatedSeedInfo[await sha256(key)] = values(trytesToTrits(seedInfo[key]));
        }
        return updatedSeedInfo;
    };
    const seedInfo = await getSecretBoxFromKeychainAndOpenIt(ALIAS_SEEDS, pwdHash);
    const updatedSeedInfo = await updateSeedInfo(seedInfo);
    // Clear keychain for alias "seeds"
    await keychain.clear(ALIAS_SEEDS);
    // Create a secret box with new password hash
    await createAndStoreBoxInKeychain(pwdHash, updatedSeedInfo, ALIAS_SEEDS);
    return Promise.resolve();
};

export default keychain;
