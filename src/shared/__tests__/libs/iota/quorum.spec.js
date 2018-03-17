import { expect } from 'chai';
import { getMostCommon } from '../../../libs/iota/quorum';

// random objects for testing

var a = {
    testobj: 1,
    test: [
        {
            'nested objects and arrays': 'xyz',
        },
        {
            a: 0.01,
            b: 1,
            c: true,
            d: [false],
        },
    ],
};

var b = {
    w: 1,
    test: [
        {
            'nested objects and arrays': 'xyz',
        },
        {
            a: 0.01,
            b: 1,
            c: true,
            d: [true],
        },
    ],
};

var c = {
    w: 1,
    test: [
        {
            'nested objects and arrays': 'xyz',
        },
        {
            a: 0.01,
            b: 1,
            c: false,
            d: [false],
        },
    ],
};

var d = {
    w: 1,
    test: [
        {
            'nested objects and arrays': 'xyz',
        },
        {
            a: 0.0099,
            b: 1,
            c: false,
            d: [false],
        },
    ],
};

describe('libs: iota/quorum', () => {
    describe('#getMostCommon', () => {
        describe('when input is empty', () => {
            it('should return null', () => {
                const data = [];
                expect(getMostCommon(data)).to.equal(null);
            });
        });

        describe('when input has no duplicates', () => {
            it('should return any element', () => {
                const data = [a, b, c, d];
                expect(getMostCommon(data)).to.be.oneOf(data);
            });
        });

        describe('when input has multiple duplicates of same', () => {
            it('should return of of most common', () => {
                const data = [a, b, c, d, b, a];
                expect(getMostCommon(data)).to.be.oneOf([a, b]);
            });
        });

        describe('when input has only one most common', () => {
            it('should return most common', () => {
                const data = [a, b, c, d, b, a, d, d, d];
                expect(getMostCommon(data)).to.equal(d);
            });
        });
    });
});
