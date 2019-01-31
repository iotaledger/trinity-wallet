'use strict';

import Ledger from 'libs/SeedStore/Ledger';

const getAddress = jest.fn((index) => ['ABC', 'DEF', 'EFG'][index]);

global.Electron = {
    ledger: {
        selectSeed: jest.fn(() => {
            return {
                getAddress,
            };
        }),
    },
};

describe('Ledger SeedStore class', () => {
    test('get if seed is available for read', async () => {
        expect(Ledger.isSeedAvailable).toBeFalsy();
    });

    test('get if seedStore supports messages', async () => {
        expect(Ledger.isMessageAvailable).toBeFalsy();
    });

    test('get max inputs', async () => {
        const seedVault = await new Ledger();

        expect(seedVault.maxInputs).toEqual(2);
    });

    test('Get seed object', async () => {
        const seedVault = await new Ledger(null, null, { index: 0, indexAddress: 'ABC' });

        await seedVault.getSeed(2);
        expect(getAddress).toBeCalledWith(0);
        expect(global.Electron.ledger.selectSeed).toBeCalledWith(0, 0, 2);
    });

    test('Generate single address', async () => {
        const seedVault = await new Ledger(null, null, { index: 0, indexAddress: 'ABC' });

        const address = await seedVault.generateAddress({ security: 2, index: 2 });
        expect(address).toEqual('EFG');
    });

    test('Generate multiple addresses', async () => {
        const seedVault = await new Ledger(null, null, { index: 0, indexAddress: 'ABC' });

        const address = await seedVault.generateAddress({ security: 2, index: 1, total: 2 });
        expect(address).toEqual(['DEF', 'EFG']);
    });
});
