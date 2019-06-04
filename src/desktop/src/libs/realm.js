/* global Electron */
import { randomBytes } from './crypto';
import { ALIAS_REALM } from './constants';
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
    return Electron.readKeychain(ALIAS_REALM).then((encryptionKey) => {
        if (encryptionKey === null || encryptionKey.split(',').length !== 64) {
            const key = Uint8Array.from(randomBytes(64));

            return Electron.setKeychain(ALIAS_REALM, key.toString()).then(() => key);
        }

        return Uint8Array.from(encryptionKey.split(','));
    });
};
