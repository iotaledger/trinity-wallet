import { expect } from 'chai';
import { getPendingTxTailsHashes, markTransfersConfirmed } from '../../libs/accountUtils';

describe('libs: accountUtils', () => {
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
                it('should assign persistence true to tx objects with currentIndex 0', () => {
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
                            { currentIndex: 1, hash: 'bar', persistence: false },
                        ],
                    ];

                    expect(markTransfersConfirmed(transfers, tailsHashes)).to.eql(result);
                });
            });
        });
    });
});
