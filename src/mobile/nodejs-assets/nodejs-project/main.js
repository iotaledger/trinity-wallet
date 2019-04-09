// Temporary solution until Argon2 support is added to Java lib

const rnBridge = require('rn-bridge'); // eslint-disable-line import/no-unresolved
const argon2 = require('argon2');
const kdbxweb = require('kdbxweb');

/**
 * Bind kdbxweb and argon2
 */
kdbxweb.CryptoEngine.argon2 = (password, salt, memory, iterations, length, parallelism, type, version) => {
    return argon2.hash(password, {
        hashLength: length,
        timeCost: iterations,
        memoryCost: memory,
        parallelism,
        type,
        version,
        salt: Buffer.from(salt),
        raw: true,
    });
};

/**
 * Encrypt seed to .kdbx database format
 * @method createSeedVault
 *
 * @param {string} seed - Seed to be encrypted
 * @param {string} title - Account name
 * @param {string} password - Password for encryption
 * @returns {arrayBuffer} Encrypted .kdbx binary data
 */
const createSeedVault = async (seed, title, password) => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));
    const db = kdbxweb.Kdbx.create(credentials, 'Trinity');
    const entry = db.createEntry(db.getDefaultGroup());

    entry.fields.Title = title;
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
 * @returns {string} Serialised decrypted seed byte array and title
 */
const getSeedFromVault = async (buffer, password) => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));
    const db = await kdbxweb.Kdbx.load(buffer, credentials);

    const entry = db.getDefaultGroup().entries[0];

    const seed = entry.fields.Seed.getText();
    const title = entry.fields.Title;

    return JSON.stringify({ seed, title });
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

rnBridge.channel.on('message', async (msg) => {
    const message = msg.slice(7);
    const password = getPassword(message.split('~'));
    if (msg.slice(0, 7).match('export~')) {
        // data -> { seed, title }
        const data = JSON.parse(message.split('~')[0]);

        if (typeof data.seed !== 'string' || typeof data.title !== 'string') {
            return rnBridge.channel.send('error');
        }

        const vault = await createSeedVault(data.seed, data.title, password);
        const vaultUint8 = new Uint8Array(vault);
        return rnBridge.channel.send(vaultUint8);
    } else if (msg.slice(0, 7).match('import~')) {
        const bufferString = message.split('~')[0];
        const buffer = new Uint8Array(bufferString.split(',').map((num) => parseInt(num)));
        try {
            return rnBridge.channel.send(await getSeedFromVault(buffer.buffer, password));
        } catch (err) {
            return rnBridge.channel.send('error');
        }
    }
});
