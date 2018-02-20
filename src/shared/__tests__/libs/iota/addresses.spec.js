import { expect } from 'chai';
import { accumulateBalance, mapBalancesToAddresses } from '../../../libs/iota/addresses';

describe('libs: iota/addresses', () => {
    describe('#accumulateBalance', () => {
        describe('when argument is not an array', () => {
            it('should return 0', () => {
                const args = [null, undefined, '', {}, 0, 0.5];

                args.forEach((arg) => expect(accumulateBalance(arg)).to.equal(0));
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
    });
});
