import assign from 'lodash/assign';
import each from 'lodash/each';
import filter from 'lodash/filter';
import map from 'lodash/map';
import head from 'lodash/head';
import merge from 'lodash/merge';
import random from 'lodash/random';
import reduce from 'lodash/reduce';
import { expect } from 'chai';
import sinon from 'sinon';
import {
    prepareInputs,
    getInputs,
    isValidInput
} from '../../../libs/iota/inputs';
import { iota, SwitchingConfig } from '../../../libs/iota/index';

describe('libs: iota/inputs', () => {
    before(() => {
        SwitchingConfig.autoSwitch = false;
    });

    after(() => {
        SwitchingConfig.autoSwitch = true;
    });

    describe('#prepareInputs', () => {
        let addressData;

        before(() => {
            addressData = {
                AAA: { index: 0, balance: 1, spent: { local: false, remote: false } },
                BBB: { index: 1, balance: 2, spent: { local: false, remote: false } },
                CCC: { index: 2, balance: 0, spent: { local: false, remote: false } },
                DDD: { index: 3, balance: 99, spent: { local: false, remote: false } },
                EEE: { index: 4, balance: 0, spent: { local: false, remote: false } },
                FFF: { index: 5, balance: 50, spent: { local: false, remote: false } },
                GGG: { index: 6, balance: 30, spent: { local: false, remote: false } },
                HHH: { index: 7, balance: 6, spent: { local: false, remote: false } },
                III: { index: 8, balance: 7, spent: { local: false, remote: false } },
                JJJ: { index: 9, balance: 1, spent: { local: false, remote: false } },
            };
        });

        describe('when has insufficient balance on inputs', () => {
            it('should throw with an error "Insufficient balance."', () => {
                try {
                    prepareInputs(addressData, 10000);
                } catch (e) {
                    expect(e.message).to.eql('Insufficient balance.');
                }
            });
        });

        describe('when provided threshold is zero', () => {
            it('should throw with an error "Inputs threshold cannot be zero."', () => {
                try {
                    prepareInputs(addressData, 0);
                } catch (e) {
                    expect(e.message).to.eql('Inputs threshold cannot be zero.');
                }
            });
        });

        describe('when provided limit is zero', () => {
            it('should throw with an error "Inputs limit cannot be zero."', () => {
                try {
                    prepareInputs(addressData, 10, 0);
                } catch (e) {
                    expect(e.message).to.eql('Inputs limit cannot be zero.');
                }
            });
        });

        describe('when limit is provided', () => {
            it('should not select inputs with size greater than the limit', () => {
                const limit = random(1, 4);
                const threshold = random(
                    1,
                    reduce(addressData, (balance, data) => balance + data.balance, 0)
                );

                try {
                    const result = prepareInputs(addressData, threshold, limit);

                    expect(result.inputs.length <= limit).to.equal(true);
                } catch (e) {
                    // If inputs cannot be selected within a specified limit, test the error message
                    expect(e.message).to.equal('Cannot find inputs with provided limit.');
                }

            });

            describe('when provided threshold has an exact match for balance of any address', () => {
                it('should return a single input with exact balance', () => {
                    each(addressData, (data) => {
                        if (data.balance > 0) {
                            const result = prepareInputs(addressData, data.balance);

                            // Input length should be one
                            expect(result.inputs.length).to.equal(1);

                            const input = head(result.inputs);

                            // Balance should be exactly equal to threshold
                            expect(input.balance).to.equal(data.balance);
                            expect(input.security).to.equal(2);

                            const inputsWithDuplicateBalance = filter(addressData, (d) => d.balance === data.balance);

                            // If there are multiple addresses with same balance, it should choose any address
                            expect(map(inputsWithDuplicateBalance, (value) => value.index)).to.include(input.keyIndex);

                            expect(result.balance).to.eql(data.balance);
                        }
                    });
                });
            });

            // TODO: Test when provided threshold does not have an exact match for balance of any address
        });

        describe('when limit is not provided (limit === null)', () => {
            let inputsMap;

            before(() => {
                inputsMap = {
                    28: [{ address: 'GGG', keyIndex: 6, security: 2, balance: 30 }],
                    110: [
                        { address: 'DDD', keyIndex: 3, security: 2, balance: 99 },
                        { address: 'III', keyIndex: 8, security: 2, balance: 7 },
                        { address: 'BBB', keyIndex: 1, security: 2, balance: 2 },
                        { address: 'AAA', keyIndex: 0, security: 2, balance: 1 },
                        { address: 'JJJ', keyIndex: 9, security: 2, balance: 1 },
                    ],
                    3: [
                        { address: 'BBB', keyIndex: 1, security: 2, balance: 2 },
                        { address: 'AAA', keyIndex: 0, security: 2, balance: 1 },
                    ],
                    48: [{ address: 'FFF', keyIndex: 5, security: 2, balance: 50 }],
                    5: [{ address: 'HHH', keyIndex: 7, security: 2, balance: 6 }],
                };
            });

            it('should choose inputs by optimal value', () => {
                each(inputsMap, (inputs, threshold) => {
                    const result = prepareInputs(addressData, threshold, null);

                    expect(result.inputs).to.eql(inputs);
                    expect(result.balance).to.eql(reduce(inputs, (total, input) => total + input.balance, 0));
                });

            });
        });
    });

    describe('#getInputs', () => {
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
                spent: {
                    local: true,
                    remote: true,
                },
                index: 0,
            },
            ['B'.repeat(81)]: {
                balance: 1,
                spent: {
                    local: true,
                    remote: true,
                },
                index: 1,
            },
            ['C'.repeat(81)]: {
                balance: 4,
                spent: {
                    local: false,
                    remote: false,
                },
                index: 2,
            },
            ['D'.repeat(81)]: {
                balance: 10,
                spent: {
                    local: false,
                    remote: false,
                },
                index: 3,
            },
        };

        describe('when all addresses are unspent', () => {
            it('should choose input addresses with enough balance', () => {
                const wereAddressesSpentFrom = sinon
                    .stub(iota.api, 'wereAddressesSpentFrom')
                    .yields(null, [false, false, false]);

                return getInputs()(
                    merge({}, addressData, { ['B'.repeat(81)]: { spent: { local: false } } }),
                    [],
                    [],
                    1,
                    13,
                    null,
                ).then((inputs) => {
                    expect(inputs.inputs).to.eql([
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
        });

        describe('when address is marked spent locally', () => {
            it('should omit address from the final inputs', () => {
                const wereAddressesSpentFrom = sinon
                    .stub(iota.api, 'wereAddressesSpentFrom')
                    .yields(null, [false, false, false]);

                return getInputs()(addressData, [], [], 1, 13, null).then((inputs) => {
                    expect(inputs.inputs).to.eql([
                        {
                            address: 'C'.repeat(81),
                            balance: 4,
                            keyIndex: 2,
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

            it('should keep the spent address in "spentAddresses"', () => {
                const wereAddressesSpentFrom = sinon
                    .stub(iota.api, 'wereAddressesSpentFrom')
                    .yields(null, [false, false, false]);

                return getInputs()(addressData, [], [], 1, 13, null).then((inputs) => {
                    expect(inputs.spentAddresses).to.eql(['B'.repeat(81)]);

                    wereAddressesSpentFrom.restore();
                });
            });
        });

        describe('when address is marked unspent locally', () => {
            describe('when address is used as an input in local transactions history', () => {
                it('should omit address from the final inputs', () => {
                    const wereAddressesSpentFrom = sinon
                        .stub(iota.api, 'wereAddressesSpentFrom')
                        .yields(null, [false, false, false]);

                    return getInputs()(
                        merge({}, addressData, {
                            ['B'.repeat(81)]: {
                                spent: { local: false },
                            },
                        }),
                        [{ inputs: [{ address: 'B'.repeat(81) }] }],
                        [],
                        1,
                        13,
                        null,
                    ).then((inputs) => {
                        expect(inputs.inputs).to.eql([
                            {
                                address: 'C'.repeat(81),
                                balance: 4,
                                keyIndex: 2,
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

                it('should keep the spent address in "spentAddresses"', () => {
                    const wereAddressesSpentFrom = sinon
                        .stub(iota.api, 'wereAddressesSpentFrom')
                        .yields(null, [false, false, false]);

                    return getInputs()(
                        merge({}, addressData, {
                            ['B'.repeat(81)]: {
                                spent: { local: false },
                            },
                        }),
                        [{ inputs: [{ address: 'B'.repeat(81) }] }],
                        [],
                        1,
                        13,
                        null,
                    ).then((inputs) => {
                        expect(inputs.spentAddresses).to.eql(['B'.repeat(81)]);

                        wereAddressesSpentFrom.restore();
                    });
                });
            });

            describe('when address is not used as an input in local transactions history', () => {
                describe('when wereAddressesSpentFrom resolves address as spent', () => {
                    it('should omit address from the final inputs', () => {
                        const wereAddressesSpentFrom = sinon
                            .stub(iota.api, 'wereAddressesSpentFrom')
                            .yields(null, [true, true, true]);

                        return getInputs()(
                            merge({}, addressData, {
                                ['B'.repeat(81)]: {
                                    spent: { local: false },
                                },
                            }),
                            [],
                            [],
                            1,
                            13,
                            null,
                        ).then((inputs) => {
                            expect(inputs.inputs).to.eql([]);

                            wereAddressesSpentFrom.restore();
                        });
                    });

                    it('should keep the spent address in "spentAddresses"', () => {
                        const wereAddressesSpentFrom = sinon
                            .stub(iota.api, 'wereAddressesSpentFrom')
                            .yields(null, [true, true, true]);

                        return getInputs()(
                            merge({}, addressData, {
                                ['B'.repeat(81)]: {
                                    spent: { local: false },
                                },
                            }),
                            [],
                            [],
                            1,
                            13,
                            null,
                        ).then((inputs) => {
                            expect(inputs.spentAddresses).to.eql(['B'.repeat(81), 'C'.repeat(81), 'D'.repeat(81)]);

                            wereAddressesSpentFrom.restore();
                        });
                    });
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

                return getInputs()(
                    merge({}, addressData, {
                        ['B'.repeat(81)]: {
                            spent: { local: false },
                        },
                    }),
                    [],
                    pendingTransfers,
                    1,
                    13,
                    null,
                ).then((inputs) => {
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

                return getInputs()(
                    merge({}, addressData, { ['B'.repeat(81)]: { spent: { local: false } } }),
                    [],
                    pendingTransfers,
                    1,
                    13,
                    null,
                ).then((inputs) => {
                    expect(inputs.addressesWithIncomingTransfers).to.eql(['C'.repeat(81)]);

                    wereAddressesSpentFrom.restore();
                });
            });
        });
    });

    describe('#isValidInput', () => {
        let validInput;

        before(() => {
            validInput = {
                address: 'U'.repeat(81),
                balance: 10,
                keyIndex: 3,
                security: 2,
            };
        });

        describe('when input is not an object', () => {
            it('should return false', () => {
                [[], 0.1, 1, undefined, null, ''].forEach((item) => {
                    expect(isValidInput(item)).to.eql(false);
                });
            });
        });

        describe('when input is an object', () => {
            describe('when "address" is invalid is not valid trytes', () => {
                it('should return false', () => {
                    const invalidAddress = `a${'U'.repeat(80)}`;

                    expect(isValidInput(assign({}, validInput, { address: invalidAddress }))).to.eql(false);
                });
            });

            describe('when "balance" is not a number', () => {
                it('should return false', () => {
                    expect(isValidInput(assign({}, validInput, { balance: undefined }))).to.eql(false);
                });
            });

            describe('when "security" is not a number', () => {
                it('should return false', () => {
                    expect(isValidInput(assign({}, validInput, { security: '' }))).to.eql(false);
                });
            });

            describe('when "keyIndex" is not a number', () => {
                it('should return false', () => {
                    expect(isValidInput(assign({}, validInput, { keyIndex: [] }))).to.eql(false);
                });
            });

            describe('when "keyIndex" is a number and is less than 0', () => {
                it('should return false', () => {
                    expect(isValidInput(assign({}, validInput, { keyIndex: -1 }))).to.eql(false);
                });
            });

            describe('when "keyIndex" is a number and is greater than or equals 0, "balance" is number, "security" is number and address is valid trytes', () => {
                it('should return true', () => {
                    expect(isValidInput(validInput)).to.eql(true);
                });
            });
        });
    });
});
