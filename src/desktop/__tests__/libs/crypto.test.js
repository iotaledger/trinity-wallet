'use strict';

import { ACC_MAIN, randomBytes, sha256, hash, encrypt, decrypt, setTwoFA, initKeychain, authorize } from 'libs/crypto';

global.Electron = {
    readKeychain: (target) =>
        target === `${ACC_MAIN}-salt`
            ? '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
            : // Decrypted content "null" with password "Foo" and 0's salt
              '105,169,81,123,104,60,109,30,149,247,189,101|40,146,181,177,0,87,149,32,255,222,7,240,190,94,250,244,104,219',
    setKeychain: jest.fn(),
    listKeychain: () => {
        return {};
    },
    argon2: jest.fn(),
};

// argon2 hash for "Foo"
// prettier-ignore
const passwordMock = new Uint8Array([229, 34, 107, 56, 71, 11, 182, 241, 127, 92, 0, 156, 41, 105, 164, 24, 93, 254, 1, 51, 230, 65, 153, 110, 234, 31, 201, 159, 59, 148, 64, 161])

describe('Crypto helper lib', () => {
    describe('random bytes', () => {
        test('Return correct length array', () => {
            const size = 81;
            expect(randomBytes(size, 27)).toHaveLength(size);
        });

        test('Correctly limit item maximum values', () => {
            const maxRange = 27;
            const maxValue = 256 - (256 % maxRange);
            const bytes = randomBytes(81, maxRange);
            for (let i = 0; i < bytes.length; i++) {
                expect(bytes[i]).toBeLessThan(maxValue);
            }
        });
    });

    describe('encrypt/decrypt', () => {
        test('Encrypt and decrypt secret', async () => {
            const encrypted = await encrypt('Foo', passwordMock);
            expect(encrypted.split(',')).toHaveLength(32);

            const decrypted = await decrypt(encrypted, passwordMock);
            expect(decrypted).toEqual('Foo');
        });
    });

    describe('setTwoFA', () => {
        test('Set two-factor key', async () => {
            await setTwoFA(passwordMock, '1234');
            expect(Electron.setKeychain).toBeCalledWith(
                ACC_MAIN,
                expect.stringMatching(/[0-9]+(,[0-9]+){11}\|[0-9]+(,[0-9]+){34}/),
            );
        });
    });

    describe('initKeychain', () => {
        test('Initialize keychain', async () => {
            await initKeychain();
            expect(Electron.setKeychain).toBeCalledWith(
                `${ACC_MAIN}-salt`,
                expect.stringMatching(/[0-9]+(,[0-9]+){15}/),
            );
        });
    });

    describe('authorize', () => {
        test('Authorize succesfully', async () => {
            const authorised = await authorize(passwordMock);
            expect(authorised).toBeTruthy();
        });

        test('Authorize unsuccesfully', async () => {
            await expect(authorize(new Uint8Array(Array(32).fill(0)))).rejects.toThrow('Wrong password');
        });
    });

    describe('hash', () => {
        test('Call Argon2 correctly', async () => {
            await hash('Foo');
            expect(Electron.argon2).toBeCalledWith(new Uint8Array([70, 111, 111]), new Uint8Array(Array(16).fill(0)));
        });
    });

    describe('sha256', () => {
        test('Return valid sha256 hash', async () => {
            const output = await sha256('Foo');
            expect(output).toEqual('1cbec737f863e4922cee63cc2ebbfaafcd1cff8b790d8cfd2e6a5d550b648afa');
        });
    });
});
