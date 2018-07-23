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
        parallelism: parallelism,
        type: type,
        version: version,
        salt: Buffer.from(salt),
        raw: true,
    });
};

/**
 * Encrypt seed to KDBX database format
 * @param {Array} Seeds - array of byte array seeds an their titles
 * @param {String} Password - plain text password for encryption
 * @returns {ArrayBuffer}  encrypted KDBX binary content
 */
const exportVault = async (seeds, password) => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));
    const db = kdbxweb.Kdbx.create(credentials, 'Trinity');

    for (let i = 0; i < seeds.length; i++) {
        const entry = db.createEntry(db.getDefaultGroup());
        entry.fields.Title = seeds[i].title || `IOTA Seed #${i + 1}`;
        entry.fields.Seed = kdbxweb.ProtectedValue.fromString(
            seeds[i].seed.map((byte) => '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(byte % 27)).join(''),
        );
    }

    const chunk = await db.save();

    return chunk;
};

/**
 * Get seed from encrypt KDBX database
 * @param {ArrayBuffer} Db - the encrypted binary KDBX database
 * @param {String} Password - plain text password for decryption
 * @returns {Array} array of decrypted byte array seeds
 */
const importVault = async (buffer, password) => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));

    const db = await kdbxweb.Kdbx.load(buffer, credentials);
    const entries = db.getDefaultGroup().entries;
    const seeds = [];

    for (let i = 0; i < entries.length; i++) {
        if (entries[i].fields.Seed) {
            seeds.push({
                title: entries[i].fields.Title || `Seed #${i + 1}`,
                seed: entries[i].fields.Seed.getText()
                    .split('')
                    .map((char) => '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char.toUpperCase()))
                    .filter((byte) => byte > -1),
            });
        }
    }

    return seeds;
};

const kdbx = {
    exportVault,
    importVault,
};

module.exports = kdbx;
