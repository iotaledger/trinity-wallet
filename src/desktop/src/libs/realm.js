/* global Electron */
import base64 from 'base64-js';
import { randomBytes } from './crypto';

const ALIAS_REALM = 'realm_enc_key';
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
        if (encryptionKey === null) {
            return Promise.resolve(randomBytes(64)).then((bytes) =>
                Electron.setKeychain(ALIAS_REALM, base64.fromByteArray(encryptionKey)).then(
                    () => new Uint8Array(bytes),
                ),
            );
        }

        return base64.toByteArray(encryptionKey);
    });
};
