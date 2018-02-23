import { expect } from 'chai';
import {
    accumulateBalance,
    getUnspentAddressesSync,
    getSpentAddressesWithPendingTransfersSync,
    getBalancesSync,
} from '../../../libs/iota/addresses';

describe('libs: iota/addresses', () => {
    describe('#getUnspentAddressesSync', () => {
        describe('when argument is not an object', () => {
            it('should always return an array', () => {
                const args = [null, undefined, '', {}, 0, -1];

                args.forEach((arg) => expect(getUnspentAddressesSync(arg)).to.eql([]));
            });
        });

        describe('when argument is an object', () => {
            it('should return an array of addresses with "spent" prop true', () => {
                const firstAddress = 'U'.repeat(81);
                const secondAddress = 'A'.repeat(81);
                const thirdAddress = 'B'.repeat(81);

                const addressData = {
                    [firstAddress]: { spent: false, balance: 0, index: 0 },
                    [secondAddress]: { spent: true, balance: 4, index: 5 },
                    [thirdAddress]: { spent: false, balance: 100, index: 100 },
                };

                expect(getUnspentAddressesSync(addressData)).to.eql([firstAddress, thirdAddress]);
            });
        });
    });

    describe('#getSpentAddressesWithPendingTransfersSync', () => {
        describe('when no address in transaction objects is found in addressData with "spent" prop true', () => {
            it('should return an empty array', () => {
                const fakeAddress = 'U'.repeat(81);

                const firstAddress = 'D'.repeat(81);
                const secondAddress = 'A'.repeat(81);
                const thirdAddress = 'B'.repeat(81);

                const addressData = {
                    [fakeAddress]: { spent: true, balance: 0, index: 0 },
                };

                const transfers = [
                    [{ currentIndex: 0, value: 0, lastIndex: 0, address: firstAddress, persistence: false }],
                    [
                        { currentIndex: 0, value: -50, lastIndex: 3, address: firstAddress },
                        { currentIndex: 1, value: 50, lastIndex: 3, address: secondAddress },
                        { currentIndex: 2, value: 0, lastIndex: 3, address: firstAddress },
                        { currentIndex: 3, value: 20, lastIndex: 3, address: thirdAddress },
                    ],
                ];

                expect(getSpentAddressesWithPendingTransfersSync(transfers, addressData)).to.eql([]);
            });
        });

        describe('when address in transaction objects is found in addressData with "spent" prop true', () => {
            it('should return an empty array if value on transfer is greater than or equal to zero and it is not a remainder object', () => {
                const firstAddress = 'D'.repeat(81);

                const addressData = {
                    [firstAddress]: { spent: true, balance: 0, index: 0 },
                };

                const transfers = [
                    [{ currentIndex: 1, value: 0, lastIndex: 1, address: firstAddress, persistence: false }],
                ];

                expect(getSpentAddressesWithPendingTransfersSync(transfers, addressData)).to.eql([]);
            });

            it('should return an empty array if value on transfer is less zero but transaction object is a remainder', () => {
                const address = 'A'.repeat(81);

                const addressData = {
                    [address]: { spent: true, balance: 4, index: 5 },
                };

                const transfers = [[{ currentIndex: 3, value: -30, lastIndex: 3, address }]];

                expect(getSpentAddressesWithPendingTransfersSync(transfers, addressData)).to.eql([]);
            });

            it('should return an array of addresses in transaction objects that are not remainders and have value less than zero', () => {
                const firstAddress = 'D'.repeat(81);
                const secondAddress = 'A'.repeat(81);
                const thirdAddress = 'B'.repeat(81);

                const addressData = {
                    [firstAddress]: { spent: true, balance: 0, index: 0 },
                };

                const transfers = [
                    [
                        { currentIndex: 0, value: -50, lastIndex: 3, address: firstAddress },
                        { currentIndex: 1, value: 50, lastIndex: 3, address: secondAddress },
                        { currentIndex: 2, value: 0, lastIndex: 3, address: firstAddress },
                        { currentIndex: 3, value: 20, lastIndex: 3, address: thirdAddress },
                    ],
                ];

                expect(getSpentAddressesWithPendingTransfersSync(transfers, addressData)).to.eql([firstAddress]);
            });
        });
    });

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

    describe('#getBalancesSync', () => {
        describe('when none of the items in first argument array is found in second argument dictionary', () => {
            it('should return an empty array', () => {
                const firstAddress = 'A'.repeat(81);
                const secondAddress = 'B'.repeat(81);

                const addresses = [firstAddress, secondAddress];

                const addressData = {
                    ['9'.repeat(81)]: { index: 100, balance: 10, spent: false },
                };

                expect(getBalancesSync(addresses, addressData)).to.eql([]);
            });
        });

        describe('when any item in first argument array is found in second argument dictionary', () => {
            it('should return an array with corrensponding balance "prop" value', () => {
                const firstAddress = 'A'.repeat(81);
                const secondAddress = 'B'.repeat(81);

                const addresses = [firstAddress, secondAddress];

                const addressData = {
                    [secondAddress]: { index: 100, balance: 10, spent: false },
                };

                expect(getBalancesSync(addresses, addressData)).to.eql([10]);
            });
        });
    });
});
