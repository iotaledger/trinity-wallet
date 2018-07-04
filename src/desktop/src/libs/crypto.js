/*global Electron*/
import { MAX_SEED_LENGTH } from 'libs/iota/utils';

const ACC_PREFIX = 'account';

export const ACC_MAIN = 'Trinity';
export const MAX_ACC_LENGTH = 250;

/**
 * Create random byte array
 * @param {Number} length - Random number array length.
 * @returns {Array} Random number array
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
 * @returns {Array} Random byte array seed
 */
export const createRandomSeed = (length = MAX_SEED_LENGTH) => {
    return randomBytes(length);
};

/**
 * Encrypt plain text
 * @param {Any} Content - Content to encrypt
 * @param {String} Password - Plain text password for encryption
 * @returns {String} Ecnrypted initialization vector + content
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
 * @param {String} Password - Plain text password for decryption
 * @returns {Any} Derypted content
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
 * @param {String} Password - Plain text password for decryption
 * @returns {String} Two factor authentication key
 */
export const vaultAuth = async (password) => {
    const vault = await Electron.readKeychain(ACC_MAIN);
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
 * Clear the vault
 * @param {String} Password - Plain text password for decryption
 * @returns {Boolean} True if vault cleared
 */
export const clearVault = async (password) => {
    await vaultAuth(password);

    const vault = await Electron.listKeychain();

    const accounts = Object.keys(vault);

    for (let i = 0; i < accounts.length; i++) {
        await Electron.removeKeychain(vault[i].account);
    }

    return true;
};

/**
 * Update vault password
 * @param {String} PasswordCurrent - Current plain text password
 * @param {String} PasswordNew - New plain text password
 * @returns {Boolean} True if password updated
 */
export const updatePassword = async (passwordCurrent, passwordNew) => {
    const vault = await Electron.listKeychain();
    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        const accounts = Object.keys(vault);

        if (!accounts.length) {
            return true;
        }

        for (let i = 0; i < accounts.length; i++) {
            const account = vault[i];

            const decryptedVault = await decrypt(account.password, passwordCurrent);
            const encryptedVault = await encrypt(decryptedVault, passwordNew);

            Electron.setKeychain(account.account, encryptedVault);
        }

        return true;
    } catch (err) {
        throw err;
    }
};

/**
 * Get seed from keychain
 * @param {String} Password - Plain text password for decryption
 * @param {String} SeedName - Seed name to retreive from keychain
 * @param {Boolean} PlainText - Should the seed be returned in plain ACII text
 * @returns {Array} Derypted seed
 */
export const getSeed = async (password, seedName, plainText) => {
    const seedNameHash = await hashSeedName(seedName);

    const vault = await Electron.readKeychain(seedNameHash);
    if (!vault) {
        throw new Error('Incorrect seed name');
    }
    try {
        const decryptedVault = await decrypt(vault, password);
        return plainText ? seedToHex(decryptedVault) : decryptedVault;
    } catch (err) {
        throw err;
    }
};

/**
 * Save seed to keychain
 * @param {String} Password - Plain text password for encryption
 * @param {String} SeedName - Seed name to set to keychain
 * @param {Array} Seed - Seed array
 * @returns {Boolean} True if seed is saved to keychain
 */
export const setSeed = async (password, seedName, seed) => {
    try {
        const seedNameHash = await hashSeedName(seedName);
        const vault = await encrypt(Array.from(seed), password);

        Electron.setKeychain(seedNameHash, vault);

        return true;
    } catch (err) {
        throw err;
    }
};

/**
 * Set Two-Factor authentication key
 * @param {String} Password - Plain text password for decryption
 * @param {String} Key - Two-factor authentication key
 * @returns {Boolean} True if Two-Factor key is set
 */
export const setTwoFA = async (password, key) => {
    try {
        const vault = await Electron.readKeychain(ACC_MAIN);
        const decryptedVault = vault === null ? {} : await decrypt(vault, password);

        if (key) {
            decryptedVault.twoFaKey = key;
        } else {
            delete decryptedVault.twoFaKey;
        }

        const updatedVault = await encrypt(decryptedVault, password);

        Electron.setKeychain('Trinity', updatedVault);

        return true;
    } catch (err) {
        throw err;
    }
};

/**
 * Remove seed from keychain
 * @param {String} Password - Plain text password for decryption
 * @param {String} SeedName - Seed name to remove from keychain
 * @returns {Boolean} True seed is removed
 */
export const removeSeed = async (password, seedName) => {
    try {
        const seedNameHash = await hashSeedName(seedName);

        const isRemoved = await Electron.removeKeychain(seedNameHash);
        if (!isRemoved) {
            throw new Error('Incorrect seed name');
        }

        return true;
    } catch (err) {
        throw err;
    }
};

/**
 * Rename seed in keychain
 * @param {String} Password - Plain text password for decryption
 * @param {String} OldName - Current seed name
 * @param {String} NewName - New seed name
 * @returns {Boolean} True if seed is renamed
 */
export const renameSeed = async (password, seedName, newSeedName) => {
    const seedNameHash = await hashSeedName(seedName);
    const newNameHash = await hashSeedName(newSeedName);

    const vault = await Electron.readKeychain(seedNameHash);

    if (!vault) {
        throw new Error('Incorrect seed name');
    }

    try {
        await decrypt(vault, password);
        Electron.removeKeychain(seedNameHash);
        Electron.setKeychain(newNameHash, vault);

        return true;
    } catch (err) {
        throw err;
    }
};

/**
 * Unique seed check
 * @param {String} Password - Plain text password for decryption
 * @param {Array} Seed - Seed to check
 * @returns {Boolean} True if seed is unique
 */
export const uniqueSeed = async (password, seed) => {
    const vault = await Electron.listKeychain();
    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        const accounts = vault.filter((acc) => acc.account !== ACC_MAIN);

        for (let i = 0; i < accounts.length; i++) {
            const account = vault[i];
            const vaultSeed = await decrypt(account.password, password);
            if (vaultSeed.length === seed.length && seed.every((v, x) => v % 27 === vaultSeed[x] % 27)) {
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
 * Hash seed name using SHA-256
 * @param {String} SeedName - plain text to hash
 * @returns {String} SHA-256 hash
 */
const hashSeedName = async (seedName) => {
    const prefixName = `${ACC_PREFIX}-${seedName}`;
    const hash = await sha256(prefixName);
    return hash;
};

/**
 * Check for a valid activation code
 * @param {String} code - Target activation code
 * @param {String} uuid - UUID of the machine
 * @returns {Boolean} True if activation code correct
 */
export const checkActivationCode = async (code, uuid) => {
    const key = 'LURGzCPEHqhjvYLwAJXRv5Fc';
    const hash = await sha256(key + uuid);
    return code === hash;
};

/**
 * Convert byte seed array to string
 * @param {Array} seed - Target seed array
 * @returns {String} Plain text seed string
 */
const seedToHex = (bytes) => {
    return Array.from(bytes)
        .map((byte) => byteToChar(byte % 27))
        .join('');
};

/**
 * Convert single character byte to string
 * @param {Number} byte - Input byte
 * @returns {String} Output character
 */
export const byteToChar = (byte) => {
    return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(byte % 27);
};

/**
 * Convert buffer to plain text
 * @param {Buffer} - Input buffer
 * @returns {String} Output string
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
