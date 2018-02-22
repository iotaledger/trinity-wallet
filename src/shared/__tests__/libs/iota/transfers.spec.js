import isArray from 'lodash/isArray';
import { expect } from 'chai';
import {
    prepareTransferArray,
    extractTailTransferFromBundle,
    getPendingTxTailsHashes,
    markTransfersConfirmed,
    hasNewTransfers,
    findBundlesFromTransfers,
} from '../../../libs/iota/transfers';

describe('libs: iota/transfers', () => {
    describe('#prepareTransferArray', () => {
        let args;

        beforeEach(() => {
            args = ['foo', 0, 'message'];
        });

        it('should return an array', () => {
            expect(Array.isArray(prepareTransferArray(...args))).to.equal(true);
        });

        it('should only have address, value, message and tag props in the first element of the array', () => {
            const result = prepareTransferArray(...args);
            ['address', 'value', 'message', 'tag'].forEach((item) => expect(item in result[0]).to.equal(true));
            expect(Object.keys(result[0]).length).to.equal(4);
        });

        it('should not have any other props other than address, value, message and tag props in the first element of the array', () => {
            const result = prepareTransferArray(...args);
            ['foo', 'baz'].forEach((item) => expect(item in result[0]).to.equal(false));
        });
    });

    describe('#extractTailTransferFromBundle', () => {
        describe('when not passed a valid bundle', () => {
            it('should always return an object', () => {
                const args = [undefined, null, [], {}, 'foo', 0];

                args.forEach((arg) => {
                    const result = extractTailTransferFromBundle(arg);
                    expect(typeof result).to.equal('object');
                    expect(Array.isArray(result)).to.equal(false);
                    expect(result === null).to.equal(false);
                    expect(result === undefined).to.equal(false);
                });
            });
        });

        describe('when passed a valid bundle', () => {
            it('should return an object with currentIndex prop equals 0', () => {
                const bundle = Array.from(Array(5), (x, idx) => ({ currentIndex: idx }));

                expect(extractTailTransferFromBundle(bundle)).to.eql({ currentIndex: 0 });
            });

            it('should return an empty object if there is no item with prop currentIndex 0', () => {
                const bundle = Array.from(Array(5), (x, idx) => ({ currentIndex: idx + 1 }));

                expect(extractTailTransferFromBundle(bundle)).to.eql({});
            });
        });
    });

    describe('#getPendingTxTailsHashes', () => {
        describe('when argument passed is empty, null or undefined', () => {
            it('should return an empty array', () => {
                expect(getPendingTxTailsHashes([])).to.eql([]);
                expect(getPendingTxTailsHashes(undefined)).to.eql([]);
                expect(getPendingTxTailsHashes(null)).to.eql([]);
            });
        });

        describe('when argument passed is an array', () => {
            it('should return an empty array if no element is found with persistence false and currentIndex 0', () => {
                const args = [[{}, {}], [{}], [{}]];

                expect(getPendingTxTailsHashes(args)).to.eql([]);
            });

            it('should return an array with hashes for elements with persistence false and currentIndex 0', () => {
                const args = [
                    [{ currentIndex: 0, persistence: true, hash: 'foo' }],
                    [{ currentIndex: 0, persistence: false, hash: 'baz' }],
                ];

                expect(getPendingTxTailsHashes(args)).to.eql(['baz']);
            });
        });
    });

    describe('#markTransfersConfirmed', () => {
        describe('when second argument passed is empty, null or undefined', () => {
            it('should return first argument', () => {
                expect(markTransfersConfirmed([[{}]], null)).to.eql([[{}]]);
                expect(markTransfersConfirmed([[{}]], undefined)).to.eql([[{}]]);
                expect(markTransfersConfirmed([[{}]], [])).to.eql([[{}]]);
            });
        });

        describe('when second argument passed is an array of strings', () => {
            describe('when includes hash', () => {
                it('should assign persistence true to all tx objects', () => {
                    const transfers = [
                        [
                            { currentIndex: 1, hash: 'foo', persistence: false },
                            { currentIndex: 2, hash: 'baz', persistence: false },
                        ],
                        [
                            { currentIndex: 0, hash: 'waldo', persistence: false },
                            { currentIndex: 1, hash: 'bar', persistence: false },
                        ],
                    ];

                    const tailsHashes = ['foo', 'waldo'];

                    const result = [
                        [
                            { currentIndex: 1, hash: 'foo', persistence: false },
                            { currentIndex: 2, hash: 'baz', persistence: false },
                        ],
                        [
                            { currentIndex: 0, hash: 'waldo', persistence: true },
                            { currentIndex: 1, hash: 'bar', persistence: true },
                        ],
                    ];

                    expect(markTransfersConfirmed(transfers, tailsHashes)).to.eql(result);
                });
            });
        });
    });

    describe('#hasNewTransfers', () => {
        it('should return true if second argument size is greater than first argument size', () => {
            expect(hasNewTransfers([], [1])).to.equal(true);
        });

        it('should return false if second argument size is greater than first argument size', () => {
            expect(hasNewTransfers({}, { foo: 'bar' })).to.equal(false);
            expect(hasNewTransfers([], [])).to.equal(false);
            expect(hasNewTransfers([1], [])).to.equal(false);
            expect(hasNewTransfers(null, [])).to.equal(false);
            expect(hasNewTransfers(null, undefined)).to.equal(false);
            expect(hasNewTransfers(0, 10)).to.equal(false);
        });
    });

    describe('#findBundlesFromTransfers', () => {
        it('should always return an array', () => {
            expect(isArray(findBundlesFromTransfers())).to.equal(true);
            expect(isArray(findBundlesFromTransfers(null, undefined))).to.equal(true);
            expect(isArray(findBundlesFromTransfers({}, {}))).to.equal(true);
            expect(isArray(findBundlesFromTransfers('', []))).to.equal(true);
            expect(isArray(findBundlesFromTransfers(1, 2))).to.equal(true);
        });

        it('should return bundles that have first element with "bundle" prop equals first argument', () => {
            const transfers = [
                [{ bundle: 'foo', currentIndex: 0 }, { bundle: 'foo', currentIndex: 1 }],
                [{ bundle: 'baz', currentIndex: 0 }, { bundle: 'baz', currentIndex: 1 }],
                [{ bundle: 'quz', currentIndex: 0 }, { bundle: 'quz', currentIndex: 1 }],
                [{ bundle: 'bar', currentIndex: 0 }, { bundle: 'bar', currentIndex: 1 }],
            ];

            const expected = [[{ bundle: 'foo', currentIndex: 0 }, { bundle: 'foo', currentIndex: 1 }]];

            expect(findBundlesFromTransfers('foo', transfers)).to.eql(expected);
        });
    });
});
