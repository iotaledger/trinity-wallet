import isNull from 'lodash/isNull';
import { getRandomBytes } from 'libs/crypto';
import { getRealmEncryptionKeyFromKeychain, setRealmEncryptionKeyInKeychain } from 'libs/keychain';

/**
 * Gets encryption key for realm.
 * - Checks keychain if there is already an encryption key stored for realm data.
 * - Returns encryption key stored in keychain (if exists).
 * - Otherwise generates a new one and stores it in keychain.
 *
 * @method getEncryptionKey
 * @returns {Promise}
 */
export const getEncryptionKey = () => {
    // Access keychain and check if there is an encryption key stored for realm
    return getRealmEncryptionKeyFromKeychain().then((key) => {
        // If there is no encryption key stored, generate a new one.
        if (isNull(key)) {
            return getRandomBytes(64).then((bytes) => setRealmEncryptionKeyInKeychain(bytes).then(() => bytes));
        }

        // If there is an encryption key stored for realm, return the key.
        return key;
    });
};
