import kdbxweb from 'kdbxweb';
import { getHashFn } from 'libs/nativeModules';
import base64js from 'base64-js';

/**
 * Bind kdbxweb and argon2
 */
// eslint-disable-next-line no-unused-vars
kdbxweb.CryptoEngine.argon2 = (password, salt, memory, iterations, length, parallelism, type, version) => {
    const argon2Hash = getHashFn();
    return argon2Hash(base64js.fromByteArray(password), base64js.fromByteArray(salt), {
        t_cost: iterations,
        m_cost: memory,
        parallelism,
        hashLength: length,
    })
        .then((hash) => {
            const hashBuffer = base64js.toByteArray(hash);
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
 * @returns {arrayBuffer} Encrypted .kdbx binary data
 */
export const createSeedVault = async (seed, password) => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));
    const db = kdbxweb.Kdbx.create(credentials, 'Trinity');
    const entry = db.createEntry(db.getDefaultGroup());
    entry.fields.Seed = kdbxweb.ProtectedValue.fromString(seed);
    const chunk = await db.save();
    return chunk;
};

/**
 * Get seed from vault
 * @method getSeedFromVault
 *
 * @param {arrayBuffer} Db - Encrypted binary KDBX database
 * @param {string} Password - Password for decryption
 * @returns {array} Decrypted seed byte array
 */
export const getSeedFromVault = async (buffer, password) => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));
    const db = await kdbxweb.Kdbx.load(buffer, credentials);
    const seed = db.getDefaultGroup().entries[0].fields.Seed.getText();
    return seed;
};

/**
 * Gets password from message passed to channel
 * @method getPassword
 *
 * @param {array} message - Message passed to channel
 * @returns {string} Password
 */
const getPassword = (arr) => {
    let password = '';
    if (arr.length > 2) {
        for (let i = 1; i < arr.length - 1; i++) {
            password += arr[i];
        }
        return password;
    }
    return arr[1];
};

/*
rnBridge.channel.on('message', async (msg) => {
    const message = msg.slice(7);
    const password = getPassword(message.split(':'));
    if (msg.slice(0, 7).match('export:')) {
        const seed = message.split(':')[0];
        const vault = await createSeedVault(seed, password);
        const vaultUint8 = new Uint8Array(vault);
        return rnBridge.channel.send(vaultUint8);
    } else if (msg.slice(0, 7).match('import:')) {
        const bufferString = message.split(':')[0];
        const buffer = new Uint8Array(bufferString.split(',').map((num) => parseInt(num)));
        try {
            return rnBridge.channel.send(await getSeedFromVault(buffer.buffer, password));
        } catch (err) {
            return rnBridge.channel.send('error');
        }
    }
});
*/
