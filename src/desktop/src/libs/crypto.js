/*global Electron*/
import sjcl from 'sjcl';
import { createRandomSeed as createRandomSeedWrapped, MAX_SEED_LENGTH } from 'libs/iota/utils';

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
 * @param {String} password - Storage encryption currrent password
 * @param {Object} content - Enrcypted content. Defaults to current content, if exists
 * @param {Boolean} rewrite - Should the vault be owerritten ignoring existing state
 */
export const setVault = async (password, content, rewrite) => {
    if (!rewrite) {
        const vault = await Electron.readKeychain();
        if (vault) {
            try {
                const decryptedVault = JSON.parse(sjcl.decrypt(password, vault));
                content = Object.assign({}, decryptedVault, content);
            } catch (err) {
                throw new Error('Incorrect password');
            }
        } else if (!content) {
            throw new Error('Empty content');
        }
    }

    await Electron.setKeychain(sjcl.encrypt(password, JSON.stringify(content)));
    return true;
};

/**
 * Get and decrypt seed data from local storage
 * @param {String} password - Storage encryption password
 * @returns {Object} Decrypted seed data
 */
export const getVault = async (password) => {
    const vault = await Electron.readKeychain();
    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        const decryptedVault = JSON.parse(sjcl.decrypt(password, vault));
        return decryptedVault;
    } catch (err) {
        throw err;
    }
};

/**
 * Get and decrypt seed data from local storage
 * @param {Number} index - Target seed item index
 * @param {String} password - Storage encryption password
 * @returns {String} - Decrypted seed
 */
export const getSeed = async (index, password) => {
    const vault = await getVault(password);
    if (!vault.seeds[index]) {
        throw new Error('Incorrect seed index');
    } else {
        return vault.seeds[index];
    }
};

/**
 * Set and encrypt new seed data from local storage
 * @param {Number} index - Target seed item index
 * @param {String} password - Storage encryption password
 * @returns {String} - Decrypted seed
 */
export const setSeed = async (password, seed) => {
    const vault = await getVault(password);
    vault.seeds.push(seed);
    setVault(password, { seeds: vault.seeds });
};

/**
 * Get and decrypt seed data from local storage
 * @param {String} password - Storage encryption password
 * @returns {Object} Decrypted seed data
 */
export const updateVaultPassword = async (passwordOld, passwordNew) => {
    const vault = await Electron.readKeychain();
    if (!vault) {
        throw new Error('Local storage not available');
    }
    try {
        const decryptedVault = JSON.parse(sjcl.decrypt(passwordOld, vault));
        await Electron.setKeychain(sjcl.encrypt(passwordNew, JSON.stringify(decryptedVault)));
        return true;
    } catch (err) {
        throw new Error('Incorrect password');
    }
};

/**
 * Save and encrypt two-factor authentication key
 * @param {String} password - Storage encryption password
 * @param {String} key - Two-factor authorisation key
 */
export const setTwoFA = async (password, key) => {
    const vault = await getVault(password);
    vault.twoFAkey = key;
    await setVault(password, vault);
};

/**
 * Get and decrypt two-factor-authentication key
 * @param {String} password - Storage encryption password
 * @returns {String} Decrypted two-factor private key
 */
export const getTwoFA = async (password) => {
    const vault = await getVault(password);
    return vault.twoFAkey;
};

/**
 * Remove two-factor authentication key
 * @param {String} password - Storage encryption password
 * @param {String} key - Two-factor authorisation key
 */
export const removeTwoFA = async (password, key) => {
    const vault = await getVault(password);

    if (vault.twoFAkey === key) {
        delete vault.twoFAkey;
        await Electron.setKeychain(sjcl.encrypt(password, JSON.stringify(vault)));
    } else {
        throw new Error('Two-factor key mismatch');
    }
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
