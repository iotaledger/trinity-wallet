import { expect } from 'chai';
import {
    accumulateBalance,
    getUnspentAddressesSync,
    getSpentAddressesWithPendingTransfersSync,
    getBalancesSync,
    filterAddressesWithIncomingTransfers,
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
        describe('when no input address in transactions is found in addressData with "spent" prop true', () => {
            it('should return an empty array', () => {
                const fakeAddress = 'U'.repeat(81);

                const firstAddress = 'D'.repeat(81);
                const secondAddress = 'A'.repeat(81);
                const thirdAddress = 'B'.repeat(81);

                const addressData = {
                    [fakeAddress]: { spent: true, balance: 0, index: 0 },
                };

                const transfers = [
                    {
                        persistence: false,
                        tailTransactions: [{ hash: 'XXX' }],
                        inputs: [{ address: firstAddress }],
                        outputs: [{ address: secondAddress }],
                    },
                    {
                        persistence: false,
                        tailTransactions: [{ hash: 'YYY' }],
                        inputs: [{ address: secondAddress }],
                        outputs: [{ address: thirdAddress }],
                    },
                ];

                expect(getSpentAddressesWithPendingTransfersSync(transfers, addressData)).to.eql([]);
            });
        });

        describe('when input address in transactions is found in addressData with "spent" prop true', () => {
            it('should return an array of input addresses', () => {
                const firstAddress = 'D'.repeat(81);
                const secondAddress = 'A'.repeat(81);
                const thirdAddress = 'B'.repeat(81);

                const addressData = {
                    [firstAddress]: { spent: true, balance: 0, index: 0 },
                };

                const transfers = [
                    {
                        persistence: false,
                        tailTransactions: [{ hash: 'XXX' }],
                        inputs: [{ address: firstAddress }],
                        outputs: [{ address: secondAddress }],
                    },
                    {
                        persistence: false,
                        tailTransactions: [{ hash: 'YYY' }],
                        inputs: [{ address: secondAddress }],
                        outputs: [{ address: thirdAddress }],
                    },
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

    describe('#filterAddressesWithIncomingTransfers', () => {
        describe('when inputs passed as first argument is an empty array', () => {
            it('should return inputs passed as first argument', () => {
                expect(filterAddressesWithIncomingTransfers([], [{}, {}])).to.eql([]);
            });
        });

        describe('when pendingValueTransfers passed as second argument is an empty array', () => {
            it('should return inputs passed as first argument', () => {
                expect(filterAddressesWithIncomingTransfers([{}], [])).to.eql([{}]);
            });
        });

        describe('when inputs passed as first argument is not an empty array and pendingValueTransfers passed as second argument is not an empty array', () => {
            let pendingTransfers;

            beforeEach(() => {
                pendingTransfers = [
                    {
                        transferValue: -100,
                        incoming: false,
                        inputs: [{ address: 'A'.repeat(81), value: -100 }],
                        outputs: [
                            // Change address
                            { address: 'C'.repeat(81), value: 20 },
                            { address: 'U'.repeat(81), value: 80 },
                        ],
                        persistence: false,
                    },
                    {
                        transferValue: -50,
                        incoming: true,
                        inputs: [{ address: 'D'.repeat(81), value: -40 }],
                        outputs: [{ address: 'E'.repeat(81), value: 30 }, { address: 'Y'.repeat(81), value: 10 }],
                        persistence: false,
                    },
                ];
            });

            it('should filter inputs that have pending incoming value transfers', () => {
                const inputs = [{ address: 'E'.repeat(81) }, { address: 'F'.repeat(81) }];

                expect(filterAddressesWithIncomingTransfers(inputs, pendingTransfers)).to.eql([
                    { address: 'F'.repeat(81) },
                ]);
            });

            it('should filter inputs that have pending outgoing value transfers on change addresses', () => {
                const inputs = [{ address: 'C'.repeat(81) }, { address: 'F'.repeat(81) }];

                expect(filterAddressesWithIncomingTransfers(inputs, pendingTransfers)).to.eql([
                    { address: 'F'.repeat(81) },
                ]);
            });
        });
    });
});
