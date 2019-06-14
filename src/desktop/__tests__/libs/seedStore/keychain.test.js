'use strict';

import Keychain from 'libs/SeedStore/Keychain';
import { passwordMock, vaultMock, seedTrytesMock, seedBytesMock } from '../../../__mocks__/samples/keychain';

const genFn = jest.fn();

global.Electron = {
    setKeychain: jest.fn(),
    readKeychain: () => vaultMock,
    removeKeychain: jest.fn(() => true),
    listKeychain: () => [
        {
            account: 'Foo',
            password: vaultMock,
        },
    ],
    genFn: (seed, index, security, total) => genFn(seed.slice(0), index, security, total),
    garbageCollect: jest.fn(),
};

describe('Keychain SeedStore class', () => {
    test('get if seed is available for read', async () => {
        expect(Keychain.isSeedAvailable).toBeTruthy();
    });

    test('Get if seedStore supports messages', async () => {
        expect(Keychain.isMessageAvailable).toBeTruthy();
    });

    test('Get max inputs', async () => {
        const seedVault = await new Keychain(passwordMock);

        expect(seedVault.getMaxInputs()).toEqual(0);
    });

    test('Create new account', async () => {
        const seedVault = await new Keychain(passwordMock);

        await seedVault.addAccount('Foo', null);
        expect(global.Electron.setKeychain).toBeCalledWith(
            'c1748467618c2905e23c0822028dc9687b63d841fb36d99c2f909a551db7e65b',
            expect.stringMatching(/[0-9]+(,[0-9]+){11}\|[0-9]+(,[0-9]+)*/),
        );
    });

    test('Remove account', async () => {
        const seedVault = await new Keychain(passwordMock, 'Foo');

        await seedVault.removeAccount();
        expect(global.Electron.removeKeychain).toBeCalledWith(
            'c1748467618c2905e23c0822028dc9687b63d841fb36d99c2f909a551db7e65b',
        );
    });

    test('Rename account', async () => {
        const seedVault = await new Keychain(passwordMock, 'Foo');

        await seedVault.renameAccount('Bar');

        expect(global.Electron.removeKeychain).toBeCalledWith(
            'c1748467618c2905e23c0822028dc9687b63d841fb36d99c2f909a551db7e65b',
        );

        expect(global.Electron.setKeychain).toBeCalledWith(
            '972c482d5b7432bb70e9b0263de3d6f8f782531abf2174a36b11f11adb8d8f4f',
            expect.stringMatching(/[0-9]+(,[0-9]+){11}\|[0-9]+(,[0-9]+)*/),
        );
    });

    test('Update password', async () => {
        await Keychain.updatePassword(passwordMock, passwordMock);

        expect(global.Electron.setKeychain).toBeCalledWith(
            'Foo',
            expect.stringMatching(/[0-9]+(,[0-9]+){11}\|[0-9]+(,[0-9]+)*/),
        );
    });

    test('Get seed in bytes form', async () => {
        const seedVault = await new Keychain(passwordMock, 'Foo');

        const seed = await seedVault.getSeed();
        expect(seed).toEqual(seedBytesMock);
    });

    test('Get seed in trytes form', async () => {
        const seedVault = await new Keychain(passwordMock, 'Foo');

        const seed = await seedVault.getSeed(true);
        expect(seed).toEqual(seedTrytesMock);
    });

    test('Generate address and call garbage collector', async () => {
        const seedVault = await new Keychain(passwordMock, 'Foo');

        await seedVault.generateAddress({
            index: 1,
            security: 2,
            total: 1,
        });

        expect(genFn).toBeCalledWith(seedTrytesMock, 1, 2, 1);
        expect(global.Electron.garbageCollect).toHaveBeenCalledTimes(1);
    });
});
