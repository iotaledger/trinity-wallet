/* global Electron */
import { MAX_SEED_LENGTH } from 'libs/iota/utils';

// Prefix for seed account titles stored in the vault
const ACC_PREFIX = 'account';

// Title of main vault entry  containing 2fa keys
export const ACC_MAIN = 'Trinity';
// Maximum allowed account title
export const MAX_ACC_LENGTH = 250;

/**
 * Create random byte array
 * @param {number} Length - Random number array length.
 * @param {number} Max - Random byte max range
 * @returns {array} Random number array
 */
function randomBytes(size, max) {
    if (size !== parseInt(size, 10) || size < 0) {
        return false;
    }

    const rawBytes = new Uint8Array(size);

    const bytes = global.crypto.getRandomValues(rawBytes);

    for (let i = 0; i < bytes.length; i++) {
        while (bytes[i] >= 256 - 256 % max) {
            bytes[i] = randomBytes(1, max)[0];
        }
    }

    return Array.from(bytes);
}

/**
 * Create random seed
 * @param {number} length - Random seed length
 * @returns {array} Random byte array seed
 */
export const createRandomSeed = (length = MAX_SEED_LENGTH) => {
    return randomBytes(length, 27);
};

/**
 * Encrypt plain text
 * @param {any} Content - Content to encrypt
 * @param {string} Password - Plain text password for encryption
 * @returns {string} Ecnrypted initialization vector + content
 */
const encrypt = async (contentPlain, passwordPlain) => {
    const content = new TextEncoder().encode(JSON.stringify(contentPlain));

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = salt.toString();

    const password = new TextEncoder().encode(passwordPlain);
    const passwordHash = await Electron.argon2(password, salt);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ivHex = iv.toString();

    const algorithm = { name: 'AES-GCM', iv: iv };

    const key = await crypto.subtle.importKey('raw', passwordHash, algorithm, false, ['encrypt']);

    const cipherBuffer = await crypto.subtle.encrypt(algorithm, key, content);
    const cipherArray = new Uint8Array(cipherBuffer);
    const cipherHex = cipherArray.toString();

    return `${ivHex}|${cipherHex}|${saltHex}`;
};

/**
 * Decrypt cyphertext
 * @param {string} Content - Encrypted initialization vector + content
 * @param {string} Password - Plain text password for decryption
 * @returns {any} Derypted content
 */
const decrypt = async (cipherText, passwordPlain) => {
    const cipherParts = cipherText.split('|');

    if (cipherParts.length !== 3 || typeof passwordPlain !== 'string' || !passwordPlain.length) {
        throw new Error('Wrong password');
    }
    try {
        const saltArray = cipherParts[2].split(',');
        const salt = Uint8Array.from(saltArray);

        const password = new TextEncoder().encode(passwordPlain);
        const passwordHash = await Electron.argon2(password, salt);

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
 * @param {string} Password - Plain text password for decryption
 * @returns {string} Two factor authentication key
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
 * @param {string} Password - Plain text password for decryption
 * @param {boolean} Reset - Should the vault be reset without authentication
 * @returns {boolean} True if vault cleared
 */
export const clearVault = async (password, reset) => {
    if (!reset) {
        await vaultAuth(password);
    }

    const vault = await Electron.listKeychain();

    const accounts = Object.keys(vault);

    for (let i = 0; i < accounts.length; i++) {
        await Electron.removeKeychain(vault[i].account);
    }

    return true;
};

/**
 * Update vault password
 * @param {string} PasswordCurrent - Current plain text password
 * @param {string} PasswordNew - New plain text password
 * @returns {boolean} Password updated success state
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
 * @param {string} Password - Plain text password for decryption
 * @param {string} SeedName - Seed name to retreive from keychain
 * @param {boolean} PlainText - Should the seed be returned in plain ACII text
 * @returns {array} Derypted seed
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
 * @param {string} Password - Plain text password for encryption
 * @param {string} SeedName - Seed name to set to keychain
 * @param {array} Seed - Seed array
 * @returns {boolean} Seed saved to keychain success state
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
 * @param {string} Password - Plain text password for decryption
 * @param {string} Key - Two-factor authentication key
 * @returns {boolean} Two-Factor key set success state
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
 * @param {string} Password - Plain text password for decryption
 * @param {string} SeedName - Seed name to remove from keychain
 * @returns {boolean} Seed removed success state
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
 * @param {string} Password - Plain text password for decryption
 * @param {string} OldName - Current seed name
 * @param {string} NewName - New seed name
 * @returns {boolean} Seed renamed success state
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
 * @param {string} Password - Plain text password for decryption
 * @param {array} Seed - Seed to check
 * @returns {boolean} If Seed is unique
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
 * Hash seed name using SHA-256
 * @param {string} SeedName - Plain text to hash
 * @returns {string} SHA-256 hash
 */
const hashSeedName = async (seedName) => {
    const prefixName = `${ACC_PREFIX}-${seedName}`;
    const hash = await sha256(prefixName);
    return hash;
};

/**
 * Convert byte seed array to string
 * @param {array} seed - Target seed array
 * @returns {string} Plain text seed string
 */
const seedToHex = (bytes) => {
    return Array.from(bytes)
        .map((byte) => byteToChar(byte % 27))
        .join('');
};

/**
 * Convert single character byte to string
 * @param {number} byte - Input byte
 * @returns {string} Output character
 */
export const byteToChar = (byte) => {
    return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(byte % 27);
};

/**
 * Convert buffer to plain text
 * @param {buffer} - Input buffer
 * @returns {string} Output string
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
