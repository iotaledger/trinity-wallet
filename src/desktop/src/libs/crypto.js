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
 * Save and encrypt seed data to local storage
 * @param {String} oldPassword - Storage encryption currrent password
 * @param {String} newPassword - Storage encryption new password
 * @param {Object} content - Enrcypted content. Defaults to current content, if exists
 */
export const setVault = (oldPassword, newPassword, content) => {
    const vault = localStorage.getItem('trinity');
    if (vault) {
        try {
            const decryptedVault = JSON.parse(sjcl.decrypt(oldPassword, vault));
            if (!content) {
                content = decryptedVault;
            }
        } catch (err) {
            throw new Error('Incorrect password');
        }
    } else if (!content) {
        throw new Error('Empty content');
    }
    localStorage.setItem('trinity', sjcl.encrypt(newPassword, JSON.stringify(content)));
};

/**
 * Get and decrypt seed data from local storage
 * @param {String} password - Storage encryption password
 * @param {Bool} leaveKey - Should two-factor be left on response
 * @returns {Object} Decrypted seed data
 */
export const getVault = (password) => {
    const vault = localStorage.getItem('trinity');
    if (!vault) {
        throw new Error('Local storage not available');
    }
    const decryptedVault = JSON.parse(sjcl.decrypt(password, vault));
    return decryptedVault;
};

/**
 * Save and encrypt seed data to local storage
 * @param {String} password - Storage encryption password
 * @param {String} key - Two-factor authorisation key
 */
export const setKey = (password, key) => {
    const seedData = getVault(password);
    seedData.twoFAkey = key;
    localStorage.setItem('trinity', sjcl.encrypt(password, JSON.stringify(seedData)));
};

/**
 * Get and decrypt seed data from local storage
 * @param {String} password - Storage encryption password
 * @returns {String} Decrypted two-factor private key
 */
export const getKey = (password) => {
    const seedData = getVault(password);
    return seedData.twoFAkey;
};

/**
 * Save and encrypt seed data to local storage
 * @param {String} password - Storage encryption password
 * @param {String} key - Two-factor authorisation key
 */
export const removeKey = (password, key) => {
    const seedData = getVault(password);

    if (seedData.twoFAkey === key) {
        delete seedData.twoFAkey;
        localStorage.setItem('trinity', sjcl.encrypt(password, JSON.stringify(seedData)));
    } else {
        throw new Error('Two-factor key mismatch');
    }
};
