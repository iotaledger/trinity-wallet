import { expect } from 'chai';
import {
    prepareTransferArray,
    prepareInputs,
    extractTailTransferFromBundle,
    getStartingSearchIndexToPrepareInputs,
} from '../../libs/transfers';

describe('libs: transfers', () => {
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

    describe('#prepareInputs', () => {
        it('should return an object with props inputs and totalBalance', () => {
            const result = prepareInputs({}, 0, 0);
            expect(result).to.have.keys(['inputs', 'totalBalance']);
            expect(Object.keys(result).length).to.equal(2);
        });

        it('should only choose addresses as inputs with balance greater than zero', () => {
            const addressesData = {
                foo: { index: 0, balance: 1 },
                baz: { index: 1, balance: 0 },
                bar: { index: 2, balance: 2 },
            };

            const result = prepareInputs(addressesData, 0, 1); // Threshold -> 1
            expect(result.inputs).to.eql([{ keyIndex: 0, balance: 1, address: 'foo', security: 2 }]);
        });

        it('should have address, balance, keyIndex and security props inside each input element', () => {
            const addressesData = {
                foo: { index: 0, balance: 1 },
                baz: { index: 1, balance: 0 },
                bar: { index: 2, balance: 2 },
            };

            const result = prepareInputs(addressesData, 0, 2); // Threshold -> 2
            const inputs = result.inputs;
            inputs.forEach((input) => expect(input).to.have.keys('address', 'balance', 'keyIndex', 'security'));
        });

        it('should have totalBalance always equal to sum of balances prop inside inputs', () => {
            const addressesData = {
                foo: { index: 0, balance: 1 },
                baz: { index: 1, balance: 0 },
                bar: { index: 2, balance: 2 },
            };

            const result = prepareInputs(addressesData, 0, 3); // Threshold -> 3
            expect(result.totalBalance).to.equal(3);
        });

        it('should have totalBalance always greater than or equal to threshold if total balances on addresses in greater than or equal to threshold', () => {
            const payloads = [
                {
                    data: {
                        foo: { index: 0, balance: 1 },
                        baz: { index: 1, balance: 0 },
                        bar: { index: 2, balance: 8 },
                    },
                    threshold: 3,
                },
                {
                    data: {
                        foo: { index: 0, balance: 10 },
                        baz: { index: 1, balance: 20 },
                        bar: { index: 2, balance: 8 },
                    },
                    threshold: 10,
                },
                {
                    data: {
                        foo: { index: 0, balance: 100 },
                        baz: { index: 1, balance: 20 },
                        bar: { index: 2, balance: 8 },
                    },
                    threshold: 100,
                },
            ];

            payloads.forEach((payload) => {
                const result = prepareInputs(payload.data, 0, payload.threshold);
                expect(result.totalBalance >= payload.threshold).to.equal(true);
            });
        });

        it('should have totalBalance always less than threshold if total balances on addresses in less than threshold', () => {
            const payloads = [
                {
                    data: {
                        foo: { index: 0, balance: 1 },
                        baz: { index: 1, balance: 0 },
                        bar: { index: 2, balance: 0 },
                    },
                    threshold: 3,
                },
                {
                    data: {
                        foo: { index: 0, balance: 10 },
                        baz: { index: 1, balance: 20 },
                        bar: { index: 2, balance: 8 },
                    },
                    threshold: 100,
                },
                {
                    data: {
                        foo: { index: 0, balance: 100 },
                        baz: { index: 1, balance: 20 },
                        bar: { index: 2, balance: 8 },
                    },
                    threshold: 500,
                },
            ];

            payloads.forEach((payload) => {
                const result = prepareInputs(payload.data, 0, payload.threshold);
                expect(result.totalBalance < payload.threshold).to.equal(true);
            });
        });

        it('should not include addresses with indexes smaller than start passed as second argument', () => {
            const payloads = [
                {
                    data: {
                        foo: { index: 0, balance: 1 },
                        baz: { index: 1, balance: 0 },
                        bar: { index: 2, balance: 0 },
                    },
                    threshold: 3,
                },
                {
                    data: {
                        foo: { index: 0, balance: 10 },
                        baz: { index: 1, balance: 20 },
                        bar: { index: 2, balance: 8 },
                    },
                    threshold: 100,
                },
                {
                    data: {
                        foo: { index: 0, balance: 100 },
                        baz: { index: 1, balance: 20 },
                        bar: { index: 2, balance: 8 },
                    },
                    threshold: 500,
                },
            ];

            payloads.forEach((payload) => {
                const result = prepareInputs(payload.data, 1, payload.threshold);
                result.inputs.forEach((input) => {
                    expect(input.keyIndex).to.not.equal(0);
                });
            });

            payloads.forEach((payload) => {
                const result = prepareInputs(payload.data, 2, payload.threshold);
                result.inputs.forEach((input) => {
                    expect(input.keyIndex === 0 || input.keyIndex === 1).to.not.equal(true);
                });
            });
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

    describe('#getStartingSearchIndexToPrepareInputs', () => {
        it('should return first index with balance prop greater than zero', () => {
            const args = {
                foo: { index: 52, balance: 100 },
                baz: { index: 50, balance: 0 },
                bar: { index: 49, balance: 10 },
                qux: { index: 51, balance: 5 },
            };

            expect(getStartingSearchIndexToPrepareInputs(args)).to.equal(49);
        });

        it('should return 0 if no object is found with balance greater than zero', () => {
            const args = {
                foo: { index: 52, balance: 0 },
                baz: { index: 50, balance: 0 },
                bar: { index: 49, balance: 0 },
                qux: { index: 51, balance: 0 },
            };

            expect(getStartingSearchIndexToPrepareInputs(args)).to.equal(0);
        });
    });
});
