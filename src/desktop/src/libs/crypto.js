/*global Electron*/
import { MAX_SEED_LENGTH } from 'libs/iota/utils';

/**
 * Create random byte array
 * @param {Number} length - The random number array size.
 * @ignore
 */
function randomBytes(size) {
    if (size !== parseInt(size, 10) || size < 0) {
        return false;
    }

    const rawBytes = new Uint8Array(size);

    const bytes = global.crypto.getRandomValues(rawBytes);

    return Array.from(bytes);
}

/**
 * Create random seed
 * @param {Number} length - Random seed length
 * @returns {String} Random seed
 */
export const createRandomSeed = (length = MAX_SEED_LENGTH) => {
    return randomBytes(length);
};

/**
 * Encrypt plain text
 * @param {String} Content - content to encrypt
 * @param {String} Password - plain text password to be used for encryption
 * @returns {String} -  Ecnrypted initialization vector + content
 */
const encrypt = async (contentPlain, passwordPlain) => {
    const content = new TextEncoder().encode(JSON.stringify(contentPlain));

    const password = new TextEncoder().encode(passwordPlain);
    const passwordhash = await crypto.subtle.digest('SHA-256', password);

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const algorithm = { name: 'AES-GCM', iv: iv };

    const key = await crypto.subtle.importKey('raw', passwordhash, algorithm, false, ['encrypt']);

    const cipherBuffer = await crypto.subtle.encrypt(algorithm, key, content);
    const cipherArray = new Uint8Array(cipherBuffer);
    const cipherHex = cipherArray.toString();

    const ivHex = iv.toString();

    return `${ivHex}|${cipherHex}`;
};

/**
 * Decrypt cyphertext
 * @param {String} Content - Encrypted initialization vector + content
 * @param {String} Password - Plain text password to be used for decryption
 * @returns {String} -  Derypted content
 */
const decrypt = async (cipherText, passwordPlain) => {
    const cipherParts = cipherText.split('|');

    if (cipherParts.length !== 2 || typeof passwordPlain !== 'string' || !passwordPlain.length) {
        throw new Error('Wrong password');
    }
    try {
        const password = new TextEncoder().encode(passwordPlain);
        const passwordHash = await crypto.subtle.digest('SHA-256', password);

        const ivArray = cipherParts[0].split(',');
        const iv = Uint8Array.from(ivArray);

        const algorithm = { name: 'AES-GCM', iv: iv };

        const key = await crypto.subtle.importKey('raw', passwordHash, algorithm, false, ['decrypt']);

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
 * Check for valid vault password
 * @param {String} Password - Plain text password to be used for decryption
 * @returns {String} - If exists, two factor authentication key
 */
export const vaultAuth = async (password) => {
    const vault = await Electron.readKeychain();
    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        const decryptedVault = await decrypt(vault, password);
        if (decryptedVault.twoFaKey) {
            return decryptedVault.twoFaKey;
        }
        return true;
    } catch (err) {
        throw err;
    }
};

/**
 * Update vault password
 * @param {String} PasswordCurrent - Current plain text password
 * @param {String} PasswordNew - New plain text password
 */
export const updatePassword = async (passwordCurrent, passwordNew) => {
    const vault = await Electron.readKeychain();
    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        const decryptedVault = await decrypt(vault, passwordCurrent);

        const updatedVault = await encrypt(decryptedVault, passwordNew);

        Electron.setKeychain(updatedVault);

        return true;
    } catch (err) {
        throw err;
    }
};

/**
 * Get seed from keychain
 * @param {String} Password - plain text password to be used for decryption
 * @param {String} SeedName - seed name to retreive from keychain
 * @param {Boolean} PlainText - should the seed be returned in plain ACII text
 * @returns {Array} -  Derypted seed
 */
export const getSeed = async (password, seedName, plainText) => {
    const vault = await Electron.readKeychain();
    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        const decryptedVault = await decrypt(vault, password);

        if (!decryptedVault.seeds || !decryptedVault.seeds[seedName]) {
            throw new Error('Incorrect seed index');
        } else {
            return plainText ? seedToHex(decryptedVault.seeds[seedName]) : decryptedVault.seeds[seedName];
        }
    } catch (err) {
        throw err;
    }
};

/**
 * Save seed to keychain
 * @param {String} Password - plain text password to be used for cryption
 * @param {String} SeedName - seed name to set to keychain
 * @param {Array} Seed - seed array
 * @param {Boolean} Overwrite - should the vault be overwritten
 */
export const setSeed = async (password, seedName, seed, overwrite) => {
    const vault = overwrite ? { seeds: {} } : await Electron.readKeychain();
    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        const decryptedVault = overwrite ? vault : await decrypt(vault, password);
        decryptedVault.seeds[seedName] = Array.from(seed);

        const updatedVault = await encrypt(decryptedVault, password);

        Electron.setKeychain(updatedVault);
    } catch (err) {
        throw err;
    }
};

/**
 * Set Two-Factor authentication key
 * @param {String} Password - plain text password to be used for decryption
 * @param {String} Key - two-factor authentication key
 */
export const setTwoFA = async (password, key) => {
    const vault = await Electron.readKeychain();
    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        const decryptedVault = await decrypt(vault, password);
        if (key) {
            decryptedVault.twoFaKey = key;
        } else {
            delete decryptedVault.twoFaKey;
        }

        const updatedVault = await encrypt(decryptedVault, password);

        Electron.setKeychain(updatedVault);
    } catch (err) {
        throw err;
    }
};

/**
 * Remove seed from keychain
 * @param {String} Password - plain text password to be used for decryption
 * @param {String} SeedName - seed name to remove from keychain
 */
export const removeSeed = async (password, seedName) => {
    const vault = await Electron.readKeychain();
    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        const decryptedVault = await decrypt(vault, password);
        delete decryptedVault.seeds[seedName];

        const updatedVault = await encrypt(decryptedVault, password);

        Electron.setKeychain(updatedVault);
    } catch (err) {
        throw err;
    }
};

/**
 * Remove seed from keychain
 * @param {String} Password - plain text password to be used for decryption
 * @param {String} SeedName - seed name to remove from keychain
 */
export const renameSeed = async (password, seedName, newSeedName) => {
    const vault = await Electron.readKeychain();
    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        const decryptedVault = await decrypt(vault, password);

        const seed = decryptedVault.seeds[seedName];
        delete decryptedVault.seeds[seedName];

        decryptedVault.seeds[newSeedName] = seed;

        const updatedVault = await encrypt(decryptedVault, password);

        Electron.setKeychain(updatedVault);
    } catch (err) {
        throw err;
    }
};

/**
 * Unique seed check
 * @param {String} Password - plain text password to be used for decryption
 * @param {Array} Seed - seed to check for
 * @returns {Boolean} is the seed is unique
 */
export const uniqueSeed = async (password, seed) => {
    const vault = await Electron.readKeychain();
    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        const decryptedVault = await decrypt(vault, password);

        if (!decryptedVault.seeds) {
            throw new Error('Vault error');
        }

        for (let i = 0; i < decryptedVault.seeds.length; i++) {
            if (
                decryptedVault.seeds[i].length === seed.length &&
                seed.every((v, i) => v % 27 === decryptedVault.seeds[i] % 27)
            ) {
                return false;
            }
        }
        return true;
    } catch (err) {
        throw err;
    }
};

/**
 * Hash text using SHA-256
 * @param {String} Password - plain text to hash
 * @returns {String} SHA-256 hash
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
 * Check for a valid activation code
 * @param {String} code - Target activation code
 * @param {String} uuid - UUID of the machine
 */
export const checkActivationCode = async (code, uuid) => {
    const key = 'LURGzCPEHqhjvYLwAJXRv5Fc';
    const hash = await sha256(key + uuid);
    return code === hash;
};

/**
 * Convert byte seed array to string
 * @param {Array} seed - Target seed array
 * @returns {String} plain text seed string
 */
const seedToHex = (bytes) => {
    return Array.from(bytes)
        .map((byte) => byteToChar(byte % 27))
        .join('');
};

/**
 * Convert single character byte to string
 * @param {Number} byte - Input byte
 * @returns {String} output character
 */
export const byteToChar = (byte) => {
    return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(byte % 27);
};

/**
 * Convert buffer to plain text
 * @param {Buffer} - Input buffer
 * @returns {String} output string
 */
const bufferToHex = (buffer) => {
    const hexCodes = [];
    const view = new DataView(buffer);
    for (let i = 0; i < view.byteLength; i += 4) {
        const value = view.getUint32(i);
        const stringValue = value.toString(16);
        const padding = '00000000';
        const paddedValue = (padding + stringValue).slice(-padding.length);
        hexCodes.push(paddedValue);
    }

    return hexCodes.join('');
};
