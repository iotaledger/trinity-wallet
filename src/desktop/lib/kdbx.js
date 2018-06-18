const argon2 = require('argon2');
const kdbxweb = require('kdbxweb');

kdbxweb.CryptoEngine.argon2 = argon2;

const exportVault = async (seed, password) => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));
    const db = kdbxweb.Kdbx.create(credentials, 'Trinity');
    const entry = db.createEntry(db.getDefaultGroup());

    entry.fields.Title = 'IOTA seed';
    entry.fields.Password = seed.map((byte) => '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(byte % 27)).join('');

    const chunk = await db.save();

    return chunk;
};

const importVault = async (buffer, password) => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));

    const db = await kdbxweb.Kdbx.load(buffer, credentials);

    const entry = db.getDefaultGroup().entries[0];

    return entry.fields.Password.split('').map((char) => '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char.toUpperCase()));
};

const kdbx = {
    exportVault,
    importVault,
};

module.exports = kdbx;
