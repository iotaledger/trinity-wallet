import { expect } from 'chai';
import sinon from 'sinon';
import {
    prepareInputs,
    getStartingSearchIndexToPrepareInputs,
    getUnspentInputs,
    getSpentAddressesFromTransactions,
} from '../../../libs/iota/inputs';
import { iota, SwitchingConfig } from '../../../libs/iota/index';
import * as mockTransactions from '../../__samples__/transactions';

describe('libs: iota/inputs', () => {
    before(() => {
        SwitchingConfig.autoSwitch = false;
    });

    after(() => {
        SwitchingConfig.autoSwitch = true;
    });

    describe('#prepareInputs', () => {
        it('should return an object with props inputs and availableBalance', () => {
            const result = prepareInputs({}, 0, 0);
            expect(result).to.have.keys(['inputs', 'availableBalance']);
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

        it('should have availableBalance always equal to sum of balances prop inside inputs', () => {
            const addressesData = {
                foo: { index: 0, balance: 1 },
                baz: { index: 1, balance: 0 },
                bar: { index: 2, balance: 2 },
            };

            const result = prepareInputs(addressesData, 0, 3); // Threshold -> 3
            expect(result.availableBalance).to.equal(3);
        });

        it('should have availableBalance always greater than or equal to threshold if total balances on addresses in greater than or equal to threshold', () => {
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
                expect(result.availableBalance >= payload.threshold).to.equal(true);
            });
        });

        it('should have availableBalance always less than threshold if total balances on addresses in less than threshold', () => {
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
                expect(result.availableBalance < payload.threshold).to.equal(true);
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

    describe('#getUnspentInputs', () => {
        let sandbox;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();

            sandbox.stub(iota.api, 'getNodeInfo').yields(null, {});
        });

        afterEach(() => {
            sandbox.restore();
        });

        const addressData = {
            ['A'.repeat(81)]: {
                balance: 0,
                spent: true,
                index: 0,
            },
            ['B'.repeat(81)]: {
                balance: 1,
                spent: false,
                index: 1,
            },
            ['C'.repeat(81)]: {
                balance: 4,
                spent: false,
                index: 2,
            },
            ['D'.repeat(81)]: {
                balance: 10,
                spent: true,
                index: 3,
            },
        };

        describe('when all addresses are unspent', () => {
            it('should choose input addresses with enough balance', () => {
                const wereAddressesSpentFrom = sinon
                    .stub(iota.api, 'wereAddressesSpentFrom')
                    .yields(null, [false, false, false]);

                return getUnspentInputs(addressData, [], [], 1, 13, null).then((inputs) => {
                    expect(inputs.inputs).to.eql([
                        {
                            address:
                                'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                            balance: 1,
                            keyIndex: 1,
                            security: 2,
                        },
                        {
                            address:
                                'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
                            balance: 4,
                            keyIndex: 2,
                            security: 2,
                        },
                        {
                            address:
                                'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
                            balance: 10,
                            keyIndex: 3,
                            security: 2,
                        },
                    ]);

                    wereAddressesSpentFrom.restore();
                });
            });
        });

        describe('when any of the address is spent', () => {
            it('should omit address from the final inputs', () => {
                const wereAddressesSpentFrom = sinon
                    .stub(iota.api, 'wereAddressesSpentFrom')
                    .yields(null, [false, true, false]);

                return getUnspentInputs(addressData, ['B'.repeat(81)], [], 1, 13, null).then((inputs) => {
                    expect(inputs.inputs).to.eql([
                        {
                            address: 'D'.repeat(81),
                            balance: 10,
                            keyIndex: 3,
                            security: 2,
                        },
                    ]);

                    wereAddressesSpentFrom.restore();
                });
            });

            it('should keep the spent address in "spentAddresses"', () => {
                const wereAddressesSpentFrom = sinon
                    .stub(iota.api, 'wereAddressesSpentFrom')
                    .yields(null, [false, true, false]);

                return getUnspentInputs(addressData, ['B'.repeat(81)], [], 1, 13, null).then((inputs) => {
                    expect(inputs.spentAddresses).to.eql([
                        {
                            address: 'B'.repeat(81),
                            balance: 1,
                            keyIndex: 1,
                            security: 2,
                        },
                        {
                            address: 'C'.repeat(81),
                            balance: 4,
                            keyIndex: 2,
                            security: 2,
                        },
                    ]);

                    wereAddressesSpentFrom.restore();
                });
            });
        });

        describe('when any of the address has pending transfers', () => {
            it('should omit address from the final inputs', () => {
                const wereAddressesSpentFrom = sinon
                    .stub(iota.api, 'wereAddressesSpentFrom')
                    .yields(null, [false, false, false]);
                const pendingTransfers = [
                    {
                        inputs: [{ address: 'E'.repeat(81), value: -5 }],
                        outputs: [{ address: 'C'.repeat(81), value: 5 }],
                    },
                ];

                return getUnspentInputs(addressData, [], pendingTransfers, 1, 13, null).then((inputs) => {
                    expect(inputs.inputs).to.eql([
                        {
                            address: 'B'.repeat(81),
                            balance: 1,
                            keyIndex: 1,
                            security: 2,
                        },
                        {
                            address: 'D'.repeat(81),
                            balance: 10,
                            keyIndex: 3,
                            security: 2,
                        },
                    ]);

                    wereAddressesSpentFrom.restore();
                });
            });

            it('should keep the address in "addressesWithIncomingTransfers"', () => {
                const wereAddressesSpentFrom = sinon
                    .stub(iota.api, 'wereAddressesSpentFrom')
                    .yields(null, [false, false, false]);
                const pendingTransfers = [
                    {
                        inputs: [{ address: 'E'.repeat(81), value: -5 }],
                        outputs: [{ address: 'C'.repeat(81), value: 5 }],
                    },
                ];

                return getUnspentInputs(addressData, [], pendingTransfers, 1, 13, null).then((inputs) => {
                    expect(inputs.addressesWithIncomingTransfers).to.eql([
                        {
                            address: 'C'.repeat(81),
                            balance: 4,
                            keyIndex: 2,
                            security: 2,
                        },
                    ]);

                    wereAddressesSpentFrom.restore();
                });
            });
        });
    });

    describe('#getSpentAddressesFromTransactions', () => {
        it('should return addresses used as inputs', () => {
            expect(getSpentAddressesFromTransactions(mockTransactions.normalizedBundles)).to.eql([
                'SRWJECVJMNGLRTRNUBRBWOFWKXHWFOWXSZIARUSCAGQRMQNDOFJKJYRUIBCMQWIUTHSMQEYW9ZK9QBXAC',
                'PEAQU9KBPVHYXLQIUHECEMVLVSLK9QWVITCNPCVXVOL9COKMODBWYBUNTQXT9DMXUBYUFNVOLBCVUIKRX',
            ]);
        });
    });
});
