'use strict';

import SeedStoreCore from 'libs/SeedStore/SeedStoreCore';
import trytes from '../../../__mocks__/samples/trytes.js';

global.Electron = {
    getPowFn: () => async () => 'N9UIMZQVDYWLXWGHLELNRCUUPMP',
};

describe('SeedStore core class', () => {
    test('performPow', async () => {
        const seedStore = new SeedStoreCore();
        const pow = await seedStore.performPow(
            trytes.value,
            'GSHUHUWAUUGQHHNAPRDPDJRKZFJNIAPFNTVAHZPUNDJWRHZSZASOERZURXZVEHN9OJVS9QNRGSJE99999',
            'LLJWVVZFXF9ZGFSBSHPCD9HOIFBCLXGRV9XWSQDTGOMSRGQQIVFVZKHLKTJJVFMXQTZVPNRNAQEPA9999',
            14,
        );

        expect(pow).toEqual('N9UIMZQVDYWLXWGHLELNRCUUPMP');
    });

    test('getDigest', async () => {
        const seedStore = new SeedStoreCore();
        const digest = await seedStore.getDigest(trytes.value[0]);
        expect(digest).toEqual('ASLHJ9EOPDSFODNLVHIHKUXPIOHUVIYNADKSWZZTWCTTQEHYNHNWBZKBTVQRCVHZT9FSMRCISOTF99999');
    });
});
