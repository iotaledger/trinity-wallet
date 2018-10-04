import kdbxweb from 'kdbxweb';
import { getHashFn } from 'libs/nativeModules';

/**
 * Use native Argon2 hashing
 */
// eslint-disable-next-line no-unused-vars
kdbxweb.CryptoEngine.argon2 = (password, salt, memory, iterations, length, parallelism, type, version) => {
    const argon2Hash = getHashFn();
    return argon2Hash(password.toString('utf8'), salt.toString('utf8'), {
        t_cost: iterations,
        m_cost: memory,
        parallelism,
        hashLength: length,
    })
        .then((hash) => {
            const hashBuffer = Buffer.from(hash, 'utf8');
            Promise.resolve(hashBuffer);
        })
        .catch((err) => {
            console.log(err); // eslint-disable-line no-console
        });
};

/**
 * Encrypt seed to .kdbx database format
 * @method createSeedVault
 *
 * @param {string} Seed - Seed to be encrypted
 * @param {string} Password - Password for encryption
 * @returns {string} Encrypted .kdbx binary data
 */
export const createSeedVault = async (seed, password) => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));
    const db = kdbxweb.Kdbx.create(credentials, 'Trinity');
    const entry = db.createEntry(db.getDefaultGroup());
    entry.fields.Seed = kdbxweb.ProtectedValue.fromString(seed);
    const chunk = await db.save();
    const chunkArray = new Uint8Array(chunk);
    return chunkArray;
};

/**
 * Get seed from vault
 * @method getSeedFromVault
 *
 * @param {string} seedVault - Encrypted binary KDBX database in base64 format
 * @param {string} Password - Password for decryption
 * @returns {array} Decrypted seed byte array
 */
export const getSeedFromVault = async (seedVault, password) => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));
    const seedVaultBuffer = new Uint8Array(seedVault);
    const db = await kdbxweb.Kdbx.load(seedVaultBuffer.buffer, credentials);
    console.log('db received');
    const seed = db.getDefaultGroup().entries[0].fields.Seed.getText();
    console.log('seed received');
    return seed;
};
