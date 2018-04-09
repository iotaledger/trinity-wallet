import isArray from 'lodash/isArray';
import { expect } from 'chai';
import {
    prepareTransferArray,
    extractTailTransferFromBundle,
    categorizeTransactionsByPersistence,
    getPendingTxTailsHashes,
    markTransfersConfirmed,
    hasNewTransfers,
    getHashesDiff,
} from '../../../libs/iota/transfers';

describe('libs: iota/transfers', () => {
    describe('#prepareTransferArray', () => {
        it('should return an array', () => {
            const args = ['foo', 1, 'message', 'U'.repeat(81)];
            expect(Array.isArray(prepareTransferArray(...args))).to.equal(true);
        });

        it('should only have address, value, message and tag props in any element of the array', () => {
            const args = ['foo', 0, 'message', 'U'.repeat(81)];
            const result = prepareTransferArray(...args);

            // Zero value transfers return two transfer objects
            ['address', 'value', 'message', 'tag'].forEach((item) => {
                expect(item in result[0]).to.equal(true);
                expect(item in result[1]).to.equal(true);
            });

            expect(Object.keys(result[0]).length).to.equal(4);
            expect(Object.keys(result[1]).length).to.equal(4);
        });

        it('should not have any other props other than address, value, message and tag props in any element of the array', () => {
            const args = ['foo', 0, 'message', 'U'.repeat(81)];
            const result = prepareTransferArray(...args);

            ['foo', 'baz'].forEach((item) => {
                expect(item in result[0]).to.equal(false);
                expect(item in result[1]).to.equal(false); // Zero value transfers return two transfer objects
            });
        });

        it('should return two transfer objects if value passed as second argument is 0', () => {
            const args = ['foo', 0, 'message', 'U'.repeat(81)];
            const result = prepareTransferArray(...args);

            expect(result.length).to.equal(2);
        });

        it('should return a single transfer object if value passed as second argument is not 0', () => {
            const args = ['foo', 1, 'message', 'U'.repeat(81)];
            const result = prepareTransferArray(...args);

            expect(result.length).to.equal(1);
        });

        it('should assign "firstOwnAddress" passed as fourth argument to second transfer object if value passed as second argument is 0', () => {
            const firstOwnAddress = 'U'.repeat(81);
            const args = ['foo', 0, 'message', firstOwnAddress];
            const result = prepareTransferArray(...args);

            expect(result[1].address).to.equal(firstOwnAddress);
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

    describe('#categorizeTransactionsByPersistence', () => {
        it('should always return an object with props "unconfirmed" and "confirmed"', () => {
            const args = [
                [undefined, undefined],
                [undefined, null],
                [null, null],
                [[], []],
                [{}, {}],
                ['', undefined],
                [0, 0],
                ['foo', undefined],
            ];

            args.forEach((arg) => {
                expect(categorizeTransactionsByPersistence(...arg)).to.have.keys(['confirmed', 'unconfirmed']);
            });
        });

        it('should map all those transactions to "confirmed" prop object that have corresponding states true', () => {
            const transactions = [{ bundle: 'foo' }, { bundle: 'baz' }];

            const states = [true, false];

            expect(categorizeTransactionsByPersistence(transactions, states).confirmed).to.eql([
                { bundle: 'foo' },
            ]);
        });

        it('should map all those transactions to "unconfirmed" prop object that have corresponding states false', () => {
            const tailTransactions = [{ bundle: 'foo' }, { bundle: 'baz' }];

            const states = [true, false];

            expect(categorizeTransactionsByPersistence(tailTransactions, states).unconfirmed).to.eql([{ bundle: 'baz' }]);
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

        describe('when argument passed is an object', () => {
            it('should return an empty array if no values have persistence false', () => {
                const args = { bundleOne: {}, bundleTwo: {} };

                expect(getPendingTxTailsHashes(args)).to.eql([]);
            });

            it('should return an array with hashes for elements with persistence false', () => {
                const args = {
                    bundleOne: { tailTransactions: [{ hash: '999' }, { hash: 'UUU' }], value: 100, persistence: false },
                    bundleTwo: { tailTransactions: [{ hash: 'XXX' }, { hash: 'YYY' }], value: 100, persistence: true }
                };

                expect(getPendingTxTailsHashes(args)).to.eql(['999', 'UUU']);
            });
        });
    });

    describe('#markTransfersConfirmed', () => {
        describe('when second argument passed is empty, null or undefined', () => {
            it('should return first argument', () => {
                expect(markTransfersConfirmed([{}], null)).to.eql([{}]);
                expect(markTransfersConfirmed([{}], undefined)).to.eql([{}]);
                expect(markTransfersConfirmed([{}], [])).to.eql([{}]);
            });
        });

        describe('when second argument passed is not an empty array', () => {
            it('should assign persistence true to those objects that have any tail transaction hash in second argument array', () => {
                const transfers = [
                    { persistence: false, tailTransactions: [{ hash: 'UUU' }] },
                    { persistence: false, tailTransactions: [{ hash: 'XXX' }] }
                ];

                const confirmedTransactionsHashes = ['XXX'];

                const result = [
                    { persistence: false, tailTransactions: [{ hash: 'UUU' }] },
                    { persistence: true, tailTransactions: [{ hash: 'XXX' }] }
                ];

                expect(markTransfersConfirmed(transfers, confirmedTransactionsHashes)).to.eql(result);
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

    describe('#getHashesDiff', () => {
        describe('when second argument size is not greater than first argument size', () => {
            let firstArgument;
            let secondArgument;

            beforeEach(() => {
                firstArgument = ['foo'];
                secondArgument = ['foo'];
            });

            describe('when fourth argument size is not greater than third argument size', () => {
                it('should return an empty array', () => {
                    expect(getHashesDiff(firstArgument, secondArgument, [], [])).to.eql([]);
                });
            });

            describe('when fourth argument size is greater than third argument size', () => {
                it('should return an array with difference of third and fourth arguments', () => {
                    expect(getHashesDiff(firstArgument, secondArgument, [], ['baz'])).to.eql(['baz']);
                });
            });
        });

        describe('when fourth argument size is not greater than third argument size', () => {
            let thirdArgument;
            let fourthArgument;

            beforeEach(() => {
                thirdArgument = ['foo'];
                fourthArgument = ['foo'];
            });

            describe('when second argument size is not greater than first argument size', () => {
                it('should return an empty array', () => {
                    expect(getHashesDiff([], [], thirdArgument, fourthArgument)).to.eql([]);
                });
            });

            describe('when second argument size is not greater than first argument size', () => {
                it('should return an array with difference of first and second arguments', () => {
                    expect(getHashesDiff([], ['baz'], thirdArgument, fourthArgument)).to.eql(['baz']);
                });
            });
        });

        describe('when second argument size is greater than first argument size', () => {
            let firstArgument;
            let secondArgument;

            beforeEach(() => {
                firstArgument = ['foo'];
                secondArgument = ['foo', 'foo', 'baz'];
            });

            describe('when fourth argument size is not greater than third argument size', () => {
                it('should return a unique array of difference between second and first argument', () => {
                    expect(getHashesDiff(firstArgument, secondArgument, [], [])).to.eql(['baz']);
                });
            });

            describe('when fourth argument size is greater than third argument size', () => {
                it('should return a unique array of difference between second and first argument and difference between fourth and third argument', () => {
                    expect(getHashesDiff(firstArgument, secondArgument, [], ['bar', 'bar'])).to.eql(['baz', 'bar']);
                });
            });
        });

        describe('when fourth argument size is greater than third argument size', () => {
            let thirdArgument;
            let fourthArgument;

            beforeEach(() => {
                thirdArgument = ['foo'];
                fourthArgument = ['foo', 'foo', 'baz'];
            });

            describe('when second argument size is not greater than first argument size', () => {
                it('should return a unique array of difference between fourth and third argument', () => {
                    expect(getHashesDiff([], [], thirdArgument, fourthArgument)).to.eql(['baz']);
                });
            });

            describe('when second argument size is greater than first argument size', () => {
                it('should return a unique array of difference between second and first argument and difference between fourth and third argument', () => {
                    expect(getHashesDiff([], ['bar'], thirdArgument, fourthArgument)).to.eql(['bar', 'baz']);
                });
            });
        });
    });
});
