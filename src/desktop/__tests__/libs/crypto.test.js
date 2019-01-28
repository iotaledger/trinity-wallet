'use strict';

import { randomBytes } from 'libs/crypto';

global.crypto = {
    getRandomValues: (arr) => arr.map(() => Math.floor(Math.random() * 256)),
};

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
});
