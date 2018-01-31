import { expect } from 'chai';
import { prepareTransferArray, prepareInputs } from '../../libs/transfers';

describe.only('libs: transfers', () => {
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
            ['address', 'value', 'message', 'tag'].forEach(item => expect(item in result[0]).to.equal(true));
            expect(Object.keys(result[0]).length).to.equal(4);
        });

        it('should not have any other props other than address, value, message and tag props in the first element of the array', () => {
            const result = prepareTransferArray(...args);
            ['foo', 'baz'].forEach(item => expect(item in result[0]).to.equal(false));
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
            inputs.forEach(input => expect(input).to.have.keys('address', 'balance', 'keyIndex', 'security'));
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
    });
});
