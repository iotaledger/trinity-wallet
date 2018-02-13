import sjcl from 'sjcl';
import { createRandomSeed as createRandomSeedWrapped, MAX_SEED_LENGTH } from 'libs/util';

/**
 * Create random bytes array
 * @param {Number} length - The random number array size.
 * @ignore
 */
function randomBytes(size) {
    if (size > 65536 || size < 0) {
        return false;
    }

    const rawBytes = new global.Uint8Array(size);

    global.crypto.getRandomValues(rawBytes);

    const bytes = Buffer.from(rawBytes.buffer);

    return bytes;
}

/**
 * Create random seed
 * @param {Number} length - The random seed length
 * @returns {String} Random seed string
 */
export const createRandomSeed = (length = MAX_SEED_LENGTH) => {
    return createRandomSeedWrapped(randomBytes, length);
};

/**
 * Save and dencrypt seed data to local storage
 * @param {String} password - Storage encryption password
 * @param {Object} seeds - Seed data
 */
export const securelyPersistSeeds = (password, seeds) => {
    localStorage.setItem('trinity', sjcl.encrypt(password, JSON.stringify(seeds)));
};

/**
 * Get and decrypt seed data from local storage
 * @param {String} password - Storage encryption password
 * @returns {Object} Decrypted seed data
 */
export const getSecurelyPersistedSeeds = (password) => {
    const encryptedSeeds = localStorage.getItem('trinity');
    if (!encryptedSeeds) {
        return {};
    }
    const decryptedSeeds = sjcl.decrypt(password, encryptedSeeds);
    return JSON.parse(decryptedSeeds);
};
