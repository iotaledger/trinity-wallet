'use strict';

import { ACC_MAIN, randomBytes, sha256, hash, encrypt, decrypt, initKeychain, authorize } from 'libs/crypto';
import { passwordMock, saltMock, vaultMock } from '../../__mocks__/samples/keychain';

global.Electron = {
    readKeychain: (target) => (target === `${ACC_MAIN}-salt` ? saltMock : vaultMock),
    setKeychain: jest.fn(),
    listKeychain: () => {
        return {};
    },
    argon2: jest.fn(),
};

describe('Crypto helper lib', () => {
    describe('random bytes', () => {
        test('Return correct length array', () => {
            const size = 81;
            expect(randomBytes(size, 27)).toHaveLength(size);
        });

        test('Correctly limit item maximum values', () => {
            const maxRange = 27;
            const maxValue = 256 - 256 % maxRange;
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

    describe('initKeychain', () => {
        test('Initialize keychain', async () => {
            await initKeychain();
            expect(global.Electron.setKeychain).toBeCalledWith(
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
            expect(global.Electron.argon2).toBeCalledWith(
                new Uint8Array([70, 111, 111]),
                new Uint8Array(Array(16).fill(0)),
            );
        });
    });

    describe('sha256', () => {
        test('Return valid sha256 hash', async () => {
            const output = await sha256('Foo');
            expect(output).toEqual('1cbec737f863e4922cee63cc2ebbfaafcd1cff8b790d8cfd2e6a5d550b648afa');
        });
    });
});
