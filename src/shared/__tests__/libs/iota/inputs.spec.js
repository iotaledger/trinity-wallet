import assign from 'lodash/assign';
import each from 'lodash/each';
import filter from 'lodash/filter';
import map from 'lodash/map';
import head from 'lodash/head';
import random from 'lodash/random';
import reduce from 'lodash/reduce';
import { expect } from 'chai';
import nock from 'nock';
import { prepareInputs, getInputs, isValidInput } from '../../../libs/iota/inputs';
import { SwitchingConfig } from '../../../libs/iota/index';
import { IRI_API_VERSION } from '../../../config';

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
            it('should throw an error with message "Insufficient balance."', () => {
                expect(prepareInputs.bind(null, addressData, 10000)).to.throw('Insufficient balance.');
            });
        });

        describe('when provided threshold is zero', () => {
            it('should throw an error with message "Inputs threshold cannot be zero."', () => {
                expect(prepareInputs.bind(null, addressData, 0)).to.throw('Inputs threshold cannot be zero.');
            });
        });

        describe('when provided maxInputs is not a number', () => {
            it('should throw an error with message "Invalid max inputs provided."', () => {
                expect(prepareInputs.bind(null, addressData, 10, null)).to.throw('Invalid max inputs provided.');
            });
        });

        describe('when maxInputs is greater than zero', () => {
            it('should not select inputs with size greater than maxInputs', () => {
                const limit = random(1, 4);
                const threshold = random(1, reduce(addressData, (balance, data) => balance + data.balance, 0));

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

        describe('when maxInputs is zero', () => {
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
                    const result = prepareInputs(addressData, threshold, 0);

                    expect(result.inputs).to.eql(inputs);
                    expect(result.balance).to.eql(reduce(inputs, (total, input) => total + input.balance, 0));
                });
            });
        });
    });

    describe('#getInputs', () => {
        let addressData;
        let normalisedTransactions;

        before(() => {
            addressData = {
                ['A'.repeat(81)]: { index: 0, balance: 3, spent: { local: true, remote: true } },
                ['B'.repeat(81)]: { index: 1, balance: 2, spent: { local: true, remote: false } },
                ['C'.repeat(81)]: { index: 2, balance: 1, spent: { local: false, remote: false } },
                ['D'.repeat(81)]: { index: 3, balance: 5, spent: { local: false, remote: false } },
                ['E'.repeat(81)]: { index: 4, balance: 7, spent: { local: false, remote: false } },
                ['F'.repeat(81)]: { index: 5, balance: 0, spent: { local: false, remote: false } },
            };

            normalisedTransactions = [
                {
                    // Pending outgoing transaction
                    inputs: [{ address: 'B'.repeat(81), value: -2 }],
                    outputs: [{ address: 'Z'.repeat(81), value: 1 }, { address: 'F'.repeat(81), value: 1 }],
                    persistence: false,
                    incoming: false,
                },
                {
                    // Pending incoming transaction
                    inputs: [{ address: 'Y'.repeat(81), value: -100 }],
                    outputs: [{ address: 'C'.repeat(81), value: 100 }],
                    persistence: false,
                    incoming: true,
                },
                {
                    inputs: [{ address: 'X'.repeat(81), value: -50 }],
                    outputs: [{ address: 'D'.repeat(81), value: 50 }],
                    persistence: true,
                    incoming: true,
                },
            ];
        });

        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-IOTA-API-Version': IRI_API_VERSION,
                },
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    if (body.command === 'getBalances') {
                        const resultMap = {
                            ['A'.repeat(81)]: '3',
                            ['B'.repeat(81)]: '2',
                            ['C'.repeat(81)]: '1',
                            ['D'.repeat(81)]: '5',
                            ['E'.repeat(81)]: '7',
                            ['F'.repeat(81)]: '0',
                            ['X'.repeat(81)]: '0',
                            ['Y'.repeat(81)]: '100',
                            ['Z'.repeat(81)]: '0',
                        };
                        const addresses = body.addresses;

                        return { balances: map(addresses, (address) => resultMap[address]) };
                    } else if (body.command === 'wereAddressesSpentFrom') {
                        const resultMap = {
                            ['A'.repeat(81)]: true,
                            ['B'.repeat(81)]: false,
                            ['C'.repeat(81)]: false,
                            ['D'.repeat(81)]: false,
                            ['E'.repeat(81)]: false,
                            ['F'.repeat(81)]: false,
                            ['X'.repeat(81)]: true,
                            ['Y'.repeat(81)]: true,
                            ['Z'.repeat(81)]: false,
                        };
                        const addresses = body.addresses;

                        return { states: map(addresses, (address) => resultMap[address]) };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        // Total balance on address data => 18
        // Addresses with pending incoming transactions => [CCC...CCC, FFF...FFF]
        // Addresses with pending outgoing transactions => [BBB...BBB]
        // Spent addresses => [AAA...AAA, BBB...BBB]

        // Available balance => Total balance - Balance(CCC...CCC, FFF...FFF) - Balance(BBB...BBB) - Balance(AAA...AAA) => 12
        // Whenever inputs are resolved, assert inputs balance <= 12
        describe('when has insufficient balance Sum(balances) < threshold', () => {
            it('should throw with an error with message "Insufficient balance."', () => {
                return getInputs()(
                    {
                        ['A'.repeat(81)]: { index: 0, balance: 1 },
                        ['B'.repeat(81)]: { index: 1, balance: 2 },
                        ['C'.repeat(81)]: { index: 2, balance: 5 },
                    },
                    [],
                    50,
                ).catch((error) => expect(error.message).to.equal('Insufficient balance.'));
            });
        });

        describe('when maxInputs is not null or number', () => {
            it('should throw with an error with message "Invalid max inputs provided."', () => {
                return getInputs()(
                    {
                        ['A'.repeat(81)]: { index: 0, balance: 1 },
                        ['B'.repeat(81)]: { index: 1, balance: 2 },
                        ['C'.repeat(81)]: { index: 2, balance: 5 },
                    },
                    [],
                    1,
                    undefined,
                ).catch((error) => expect(error.message).to.equal('Invalid max inputs provided.'));
            });
        });

        describe('when has pending incoming transactions on some addresses', () => {
            describe('when has enough balance after filtering addresses in address data with pending incoming transactions', () => {
                it('should not include addresses with incoming transactions in selected inputs', () => {
                    const threshold = 10;

                    return getInputs()(addressData, normalisedTransactions, threshold).then((result) => {
                        const { inputs } = result;
                        const inputAddresses = map(inputs, (input) => input.address);

                        expect(inputAddresses).to.not.includes('C'.repeat(81));
                        expect(inputAddresses).to.not.includes('F'.repeat(81));
                    });
                });
            });

            describe('when does not have enough balance after filtering addresses in address data with pending incoming transactions', () => {
                it('should throw with an error with message "Incoming transfers to all selected inputs"', () => {
                    const threshold = 18;
                    // Total balance on address data => 15
                    // Threshold = 15
                    // Addresses with pending incoming transactions => [CCC...CCC, FFF...FFF]

                    // Total Balance - Balance(CCC...CCC, FFF...FFF) => 14
                    return getInputs()(addressData, normalisedTransactions, threshold).catch((error) =>
                        expect(error.message).to.equal('Incoming transfers to all selected inputs'),
                    );
                });
            });
        });

        describe('when has pending outgoing transactions on some addresses', () => {
            describe('when has enough balance to spend after filtering addresses in address data with pending outgoing transactions', () => {
                it('should not include addresses with outgoing transactions in selected inputs', () => {
                    const threshold = 10;

                    return getInputs()(addressData, normalisedTransactions, threshold).then((result) => {
                        const { inputs } = result;
                        const inputAddresses = map(inputs, (input) => input.address);

                        expect(inputAddresses).to.not.includes('B'.repeat(81));
                    });
                });
            });

            describe('when does not have enough balance after filtering addresses in address data with pending outgoing transactions', () => {
                it('should throw with an error with message "Input addresses already used in a pending transfer."', () => {
                    const threshold = 16;

                    return getInputs()(addressData, normalisedTransactions, threshold).catch((error) =>
                        expect(error.message).to.equal('Input addresses already used in a pending transfer.'),
                    );
                });
            });
        });

        describe('when has spent addresses', () => {
            describe('when has enough balance to spend after filtering spent addresses in address data', () => {
                it('should not include spent addresses in selected inputs', () => {
                    const threshold = 10;

                    return getInputs()(addressData, normalisedTransactions, threshold).then((result) => {
                        const { inputs, balance } = result;
                        const inputAddresses = map(inputs, (input) => input.address);

                        expect(inputAddresses).to.not.includes('B'.repeat(81));
                        expect(inputAddresses).to.not.includes('A'.repeat(81));

                        expect(balance <= 12).to.equal(true);
                    });
                });
            });

            describe('when does not have enough balance to spend after filtering spent addresses in address data', () => {
                it('should throw with an error with message "WARNING FUNDS AT SPENT ADDRESSES."', () => {
                    const threshold = 13;

                    return getInputs()(addressData, normalisedTransactions, threshold).catch((error) =>
                        expect(error.message).to.equal('WARNING FUNDS AT SPENT ADDRESSES.'),
                    );
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
