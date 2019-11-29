/* global Electron */
import { ALIAS_REALM, ALIAS_MAIN } from 'libs/constants';
import sjcl from 'sjcl';

// Maximum allowed account title
export const MAX_ACC_LENGTH = 250;

/**
 * Create random byte array
 * @param {number} Length - Random number array length.
 * @param {number} Max - Random byte max range
 * @returns {array} Random number array
 */
export const randomBytes = (size, max = 256) => {
    if (size !== parseInt(size, 10) || size < 0) {
        return false;
    }

    const rawBytes = new Uint8Array(size);

    const bytes = global.crypto.getRandomValues(rawBytes);

    for (let i = 0; i < bytes.length; i++) {
        while (bytes[i] >= 256 - (256 % max)) {
            bytes[i] = randomBytes(1, max)[0];
        }
    }

    return Array.from(bytes);
};

/**
 * Encrypt plain text
 * @param {any} contentPlain - Content to encrypt
 * @param {buffer} hash - Argon2 hash for encryption
 * @returns {string} Ecnrypted initialization vector + content
 */
export const encrypt = async (contentPlain, hash) => {
    const content = new TextEncoder().encode(JSON.stringify(contentPlain));

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ivHex = iv.toString();

    const algorithm = { name: 'AES-GCM', iv: iv };

    const key = await crypto.subtle.importKey('raw', hash, algorithm, false, ['encrypt']);

    const cipherBuffer = await crypto.subtle.encrypt(algorithm, key, content);
    const cipherArray = new Uint8Array(cipherBuffer);
    const cipherHex = cipherArray.toString();

    return `${ivHex}|${cipherHex}`;
};

/**
 * Decrypt cyphertext
 * @param {string} cipherText - Encrypted initialization vector + content
 * @param {buffer} hash - Argon2 hash for decryption
 * @returns {object} Derypted content
 */
export const decrypt = async (cipherText, hash) => {
    const cipherParts = cipherText.split('|');

    if (cipherParts.length !== 2 || typeof hash !== 'object') {
        throw new Error('Wrong password');
    }
    try {
        const ivArray = cipherParts[0].split(',');
        const iv = Uint8Array.from(ivArray);

        const algorithm = { name: 'AES-GCM', iv: iv };

        const key = await crypto.subtle.importKey('raw', hash, algorithm, false, ['decrypt']);

        const cipherArray = cipherParts[1].split(',');
        const cipher = Uint8Array.from(cipherArray);

        const plainBuffer = await crypto.subtle.decrypt(algorithm, key, cipher);

        const plainText = new TextDecoder().decode(plainBuffer);

        return JSON.parse(plainText);
    } catch (err) {
        throw new Error('Wrong password');
    }
};

/**
 * Sets up main account in keychain
 * @param {string} Password - Plain text password for decryption
 * @returns {boolean}
 */
export const initVault = async (password) => {
    try {
        const vault = await Electron.readKeychain(ALIAS_MAIN);
        const decryptedVault = vault === null ? {} : await decrypt(vault, password);

        const updatedVault = await encrypt(decryptedVault, password);

        await Electron.setKeychain(ALIAS_MAIN, updatedVault);

        return true;
    } catch (err) {
        throw err;
    }
};

/**
 * Set and store random salt to keychain
 */
export const initKeychain = async () => {
    await clearVault([ALIAS_REALM]);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = salt.toString();
    await Electron.setKeychain(`${ALIAS_MAIN}-salt`, saltHex);
};

/**
 * Check for valid vault key
 * @param {array} Key - Account decryption key
 * @returns {boolean | string}
 */
export const authorize = async (key) => {
    const vault = await Electron.readKeychain(ALIAS_MAIN);

    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        await decrypt(vault, key);
        return true;
    } catch (err) {
        throw err;
    }
};

/**
 * Clear the vault
 * @param {array} keepAccounts - Account names that should not be cleared
 * @returns {boolean} True if vault cleared
 */
export const clearVault = async (keepAccounts = []) => {
    const vault = await Electron.listKeychain();
    const accounts = Object.keys(vault);

    for (let i = 0; i < accounts.length; i++) {
        if (keepAccounts.indexOf(vault[i].account) < 0) {
            await Electron.removeKeychain(vault[i].account);
        }
    }

    return true;
};

/**
 * Hash text using SHA-256
 * @param {string} Password - Plain text to hash
 * @returns {string} SHA-256 hash
 */
export const sha256 = async (inputPlain) => {
    if (typeof inputPlain !== 'string' || inputPlain.length < 1) {
        return false;
    }

    const input = new TextEncoder().encode(inputPlain);
    const hash = await crypto.subtle.digest('SHA-256', input);
    const plainHash = bufferToHex(hash);

    return plainHash;
};

/**
 * Hash text using Argon2
 * @param {string} Password - Plain text to hash
 * @returns {string} Argon2 raw hash
 */
export const hash = async (inputPlain) => {
    if (typeof inputPlain !== 'string' || inputPlain.length < 1) {
        return false;
    }

    const saltHex = await Electron.readKeychain(`${ALIAS_MAIN}-salt`);

    if (!saltHex) {
        throw new Error('Keychain unavailable');
    }

    const saltArray = saltHex.split(',');
    const salt = Uint8Array.from(saltArray);

    const input = new TextEncoder().encode(inputPlain);

    const hash = await Electron.argon2(input, salt);

    return hash;
};

/**
 * Convert buffer to plain text
 * @param {buffer} - Input buffer
 * @returns {string} Output string
 */
const bufferToHex = (buffer) => {
    const view = new Uint8Array(buffer);
    let result = '';

    for (let i = 0; i < view.length; i++) {
        const value = view[i].toString(16);
        result += value.length === 1 ? '0' + value : value;
    }

    return result;
};

/**
 * Check for a valid activation code
 * @param {String} code - Target activation code
 * @param {String} uuid - UUID of the machine
 */
export const checkActivationCode = (code, uuid) => {
    const key = 'LURGzCPEHqhjvYLwAJXRv5Fc';
    return code === sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(key + uuid));
};
