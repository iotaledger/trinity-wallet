import { expect } from 'chai';
import {
    getPendingTxTailsHashes,
    markTransfersConfirmed,
    accumulateBalance,
    mapBalancesToAddresses,
} from '../../libs/accountUtils';

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

    describe('#accumulateBalance', () => {
        describe('when argument is not an array', () => {
            it('should return 0', () => {
                const args = [null, undefined, '', {}, 0, 0.5];

                args.forEach(arg => expect(accumulateBalance(arg)).to.equal(0));
            });
        });

        describe('when argument is an array', () => {
            it('should return 0 if array is empty', () => {
                expect(accumulateBalance([])).to.equal(0);
            });

            it('should only calculates on numbers inside array', () => {
                expect(accumulateBalance(['foo', 'baz'])).to.equal(0);
            });

            it('should return total after summing up', () => {
                expect(accumulateBalance([0, 4, 10])).to.equal(14);
            });
        });
    });

    describe('#mapBalancesToAddresses', () => {
        describe('when balances passed as second arg not equals size of addresses passed as third arg', () => {
            it('should not assign balances to each address', () => {
                const addressData = {
                    foo: { balance: 10, spent: true, address: 'foo' },
                };

                expect(mapBalancesToAddresses(addressData, [0], [])).to.eql(addressData);
            });
        });

        describe('when addresses passed as third arg not equals size of keys of addressData passed as first arg', () => {
            it('should not assign balances to each address if size of ', () => {
                const addressData = {
                    foo: { balance: 10, spent: true, address: 'foo' },
                };

                // Balances length === addresses length
                expect(mapBalancesToAddresses(addressData, [0, 2], ['foo', 'baz'])).to.eql(addressData);
            });
        });

        describe('when addresses passed as third arg equals size of keys of addressData passed as first arg and balances passed as second arg ength equals addresses length', () => {
            it('should assign balances to each address if size of ', () => {
                const addressData = {
                    foo: { balance: 30, spent: true, address: 'foo' },
                    baz: { balance: 40, spent: false, address: 'baz' },
                    bar: { balance: 50, spent: true, address: 'bar' },
                };

                const returnValue = {
                    foo: { balance: 0, spent: true, address: 'foo' },
                    baz: { balance: 0, spent: false, address: 'baz' },
                    bar: { balance: 100, spent: true, address: 'bar' },
                };

                // Balances length === addresses length
                // AddressData keys length ==== addresses length
                expect(mapBalancesToAddresses(addressData, [0, 0, 100], ['foo', 'baz', 'bar'])).to.eql(returnValue);
            });
        });

        it('should assign balances to address if size of addresses passed as third arg not equals size of keys of addressData passed as first arg', () => {
            const addressData = {
                foo: { balance: 10, spent: true, address: 'foo' },
            };

            // Balances length === addresses length
            expect(mapBalancesToAddresses(addressData, [0, 2], ['foo', 'baz'])).to.eql(addressData);
        });

        describe('when argument is not an array', () => {
            it('should return 0', () => {
                const args = [null, undefined, '', {}, 0, 0.5];

                args.forEach(arg => expect(accumulateBalance(arg)).to.equal(0));
            });
        });

        describe('when argument is an array', () => {
            it('should return 0 if array is empty', () => {
                expect(accumulateBalance([])).to.equal(0);
            });

            it('should only calculates on numbers inside array', () => {
                expect(accumulateBalance(['foo', 'baz'])).to.equal(0);
            });

            it('should return total after summing up', () => {
                expect(accumulateBalance([0, 4, 10])).to.equal(14);
            });
        });
    });
});
