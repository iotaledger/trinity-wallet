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
 * @param {string} Seed - Seed to be encrypted
 * @param {string} Password - Password for encryption
 * @returns {arrayBuffer} Encrypted .kdbx binary data
 */
const createSeedVault = async (seed, password) => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));
    const db = kdbxweb.Kdbx.create(credentials, 'Trinity');
    const entry = db.createEntry(db.getDefaultGroup());
    entry.fields.Seed = kdbxweb.ProtectedValue.fromString(seed);
    const chunk = await db.save();
    return chunk;
};

rnBridge.channel.on('message', async (msg) => {
    if (msg.slice(0, 81).match(/^[A-Z9]+$/)) {
        const [seed, password] = msg.split(':');
        const vault = await createSeedVault(seed, password);
        const vaultUint8 = new Uint8Array(vault);
        return rnBridge.channel.send(vaultUint8);
    }
});
