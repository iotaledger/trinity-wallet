import assign from 'lodash/assign';
import each from 'lodash/each';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import map from 'lodash/map';
import head from 'lodash/head';
import random from 'lodash/random';
import reduce from 'lodash/reduce';
import { expect } from 'chai';
import nock from 'nock';
import { prepareInputs, getInputs, isValidInput } from '../../../libs/iota/inputs';
import { addressData as mockAddressData, balance as totalBalanceOfMockAddressData } from '../../__samples__/addresses';
import mockTransactions, {
    LATEST_MILESTONE,
    LATEST_MILESTONE_INDEX,
    LATEST_SOLID_SUBTANGLE_MILESTONE,
    LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
} from '../../__samples__/transactions';
import { milestoneTrytes } from '../../__samples__/trytes';
import { SwitchingConfig } from '../../../libs/iota';
import { IRI_API_VERSION } from '../../../config';
import { EMPTY_TRANSACTION_TRYTES } from '../../../libs/iota/utils';

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
            addressData = [
                { index: 0, balance: 1, spent: { local: false, remote: false }, address: 'AAA' },
                { index: 1, balance: 2, spent: { local: false, remote: false }, address: 'BBB' },
                { index: 2, balance: 0, spent: { local: false, remote: false }, address: 'CCC' },
                { index: 3, balance: 99, spent: { local: false, remote: false }, address: 'DDD' },
                { index: 4, balance: 0, spent: { local: false, remote: false }, address: 'EEE' },
                { index: 5, balance: 50, spent: { local: false, remote: false }, address: 'FFF' },
                { index: 6, balance: 30, spent: { local: false, remote: false }, address: 'GGG' },
                { index: 7, balance: 6, spent: { local: false, remote: false }, address: 'HHH' },
                { index: 8, balance: 7, spent: { local: false, remote: false }, address: 'III' },
                { index: 9, balance: 1, spent: { local: false, remote: false }, address: 'JJJ' },
            ];
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
        describe('when has insufficient balance Sum(balances) < threshold', () => {
            it('should throw with an error with message "Insufficient balance."', () => {
                return getInputs()(mockAddressData, mockTransactions, totalBalanceOfMockAddressData + 10).catch(
                    (error) => expect(error.message).to.equal('Insufficient balance.'),
                );
            });
        });

        describe('when maxInputs not a number', () => {
            it('should throw with an error with message "Invalid max inputs provided."', () => {
                return getInputs()(mockAddressData, mockTransactions, totalBalanceOfMockAddressData, null).catch(
                    (error) => expect(error.message).to.equal('Invalid max inputs provided.'),
                );
            });
        });

        describe('when has pending incoming transactions on some addresses', () => {
            beforeEach(() => {
                nock('http://localhost:14265', {
                    reqheaders: {
                        'Content-Type': 'application/json',
                        'X-IOTA-API-Version': IRI_API_VERSION,
                    },
                    filteringScope: () => true,
                })
                    .filteringRequestBody(() => '*')
                    .persist()
                    .post('/', '*')
                    .reply(200, (_, body) => {
                        if (body.command === 'getBalances') {
                            const addresses = body.addresses;

                            const resultMap = reduce(
                                [
                                    ...mockAddressData,
                                    ...[
                                        {
                                            address:
                                                'QSHVEHOFGUYBDPMPUUPLNRDQGAHPMGQKRIEOIMLVMIKQSTHERN9DRLCN9J9RYFGPSPOIONQNYELEQUDUC',
                                            balance: 60,
                                        },
                                    ],
                                ],
                                (acc, addressObject) => {
                                    acc[addressObject.address] = addressObject.balance.toString();

                                    return acc;
                                },
                                {},
                            );

                            return {
                                balances: map(addresses, (address) => resultMap[address]),
                            };
                        } else if (body.command === 'wereAddressesSpentFrom') {
                            // Just return spend status as false for every address
                            // We're asserting if addresses with incoming transactions are filtered out
                            const addresses = body.addresses;

                            return { states: map(addresses, () => false) };
                        } else if (body.command === 'getNodeInfo') {
                            return {
                                appVersion: '1',
                                latestMilestone: LATEST_MILESTONE,
                                latestSolidSubtangleMilestone: LATEST_SOLID_SUBTANGLE_MILESTONE,
                                latestMilestoneIndex: LATEST_MILESTONE_INDEX,
                                latestSolidSubtangleMilestoneIndex: LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                            };
                        } else if (body.command === 'getTrytes') {
                            return {
                                trytes: includes(body.hashes, LATEST_MILESTONE)
                                    ? milestoneTrytes
                                    : map(body.hashes, () => EMPTY_TRANSACTION_TRYTES),
                            };
                        }

                        return {};
                    });
            });

            afterEach(() => {
                nock.cleanAll();
            });

            describe('when has enough balance after filtering addresses in address data with pending incoming transactions', () => {
                it('should not include addresses with incoming transactions in selected inputs', () => {
                    const threshold = 160;
                    const addressesWithPendingIncomingTransactions = [
                        // See shared/__tests__/__samples/transactions -> unconfirmedValueTransactions
                        'EGESUXEIFAHIRLP9PB9YQJUPNWNWVDBEZAIYWUFKYKHTAHDHRVKSBCYYRJOUJSRBZKUTJGJIIGUGLDPVX',
                    ];

                    return getInputs()(mockAddressData, mockTransactions, threshold).then((inputs) => {
                        const inputAddresses = map(inputs, (input) => input.address);

                        // FIXME (laumair): Also assert #prepareInputs is not called with any address with pending incoming transactions
                        each(inputAddresses, (address) =>
                            expect(includes(addressesWithPendingIncomingTransactions, address)).to.equal(false),
                        );
                    });
                });
            });

            describe('when does not have enough balance after filtering addresses in address data with pending incoming transactions', () => {
                it('should throw with an error with message "Incoming transfers to all selected inputs"', () => {
                    const threshold = 300;
                    const addressesWithPendingIncomingTransactions = [
                        // See shared/__tests__/__samples/transactions -> unconfirmedValueTransactions
                        'EGESUXEIFAHIRLP9PB9YQJUPNWNWVDBEZAIYWUFKYKHTAHDHRVKSBCYYRJOUJSRBZKUTJGJIIGUGLDPVX',
                    ];

                    return getInputs()(
                        map(mockAddressData, (addressObject) => {
                            if (includes(addressesWithPendingIncomingTransactions, addressObject.address)) {
                                return { ...addressObject, balance: addressObject.balance + 100 };
                            }

                            return addressObject;
                        }),
                        mockTransactions,
                        threshold,
                    )
                        .then(() => {
                            throw new Error();
                        })
                        .catch((error) => expect(error.message).to.equal('Incoming transfers to all selected inputs'));
                });
            });
        });

        describe('when has pending outgoing transactions on some addresses', () => {
            beforeEach(() => {
                nock('http://localhost:14265', {
                    reqheaders: {
                        'Content-Type': 'application/json',
                        'X-IOTA-API-Version': IRI_API_VERSION,
                    },
                    filteringScope: () => true,
                })
                    .filteringRequestBody(() => '*')
                    .persist()
                    .post('/', '*')
                    .reply(200, (_, body) => {
                        if (body.command === 'getBalances') {
                            const addresses = body.addresses;

                            const resultMap = reduce(
                                [
                                    ...mockAddressData,
                                    ...[
                                        {
                                            address:
                                                'QSHVEHOFGUYBDPMPUUPLNRDQGAHPMGQKRIEOIMLVMIKQSTHERN9DRLCN9J9RYFGPSPOIONQNYELEQUDUC',
                                            balance: 60,
                                        },
                                    ],
                                ],
                                (acc, addressObject) => {
                                    acc[addressObject.address] = addressObject.balance.toString();

                                    return acc;
                                },
                                {},
                            );

                            return {
                                balances: map(addresses, (address) => resultMap[address]),
                            };
                        } else if (body.command === 'wereAddressesSpentFrom') {
                            // Just return spend status as false for every address
                            // We're asserting if addresses with outgoing transactions are filtered out
                            const addresses = body.addresses;

                            return { states: map(addresses, () => false) };
                        } else if (body.command === 'getNodeInfo') {
                            return {
                                appVersion: '1',
                                latestMilestone: LATEST_MILESTONE,
                                latestSolidSubtangleMilestone: LATEST_SOLID_SUBTANGLE_MILESTONE,
                                latestMilestoneIndex: LATEST_MILESTONE_INDEX,
                                latestSolidSubtangleMilestoneIndex: LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                            };
                        } else if (body.command === 'getTrytes') {
                            return {
                                trytes: includes(body.hashes, LATEST_MILESTONE)
                                    ? milestoneTrytes
                                    : map(body.hashes, () => EMPTY_TRANSACTION_TRYTES),
                            };
                        }

                        return {};
                    });
            });

            afterEach(() => {
                nock.cleanAll();
            });

            describe('when has enough balance to spend after filtering addresses in address data with pending outgoing transactions', () => {
                it('should not include addresses with outgoing transactions in selected inputs', () => {
                    const threshold = 160;
                    const addressesWithPendingOutgoingTransactions = [
                        // See shared/__tests__/__samples/transactions -> unconfirmedValueTransactions
                        'EGESUXEIFAHIRLP9PB9YQJUPNWNWVDBEZAIYWUFKYKHTAHDHRVKSBCYYRJOUJSRBZKUTJGJIIGUGLDPVX',
                        // See shared/__tests__/__samples/transactions -> failedTransactionsWithCorrectTransactionHashes
                        'D9QCAHCWFN9BCFNNSPNGFVUEUSKBX9XQEKSIRRWXHHBQBJMEEI9ATVWNPJRLO9ETRPCBIRNQBLDMBUYVW',
                        // See shared/__tests__/__samples/transactions -> failedTransactionsWithIncorrectTransactionHashes
                        'OXCGKSXOVOFR9UMWGZMYHPWGVSSDZOTQAIKVMHVEHJBFPUNEZZKTISCKVVOVUGDHXLSVFIEWMMXGVYHOD',
                    ];

                    return getInputs()(mockAddressData, mockTransactions, threshold).then((inputs) => {
                        const inputAddresses = map(inputs, (input) => input.address);

                        each(inputAddresses, (address) =>
                            expect(includes(addressesWithPendingOutgoingTransactions, address)).to.equal(false),
                        );
                    });
                });
            });

            describe('when does not have enough balance after filtering addresses in address data with pending outgoing transactions', () => {
                it('should throw with an error with message "Input addresses already used in a pending transfer."', () => {
                    const threshold = 300;
                    const addressesWithPendingOutgoingTransactions = [
                        // See shared/__tests__/__samples/transactions -> unconfirmedValueTransactions
                        'EGESUXEIFAHIRLP9PB9YQJUPNWNWVDBEZAIYWUFKYKHTAHDHRVKSBCYYRJOUJSRBZKUTJGJIIGUGLDPVX',
                        // See shared/__tests__/__samples/transactions -> failedTransactionsWithCorrectTransactionHashes
                        'D9QCAHCWFN9BCFNNSPNGFVUEUSKBX9XQEKSIRRWXHHBQBJMEEI9ATVWNPJRLO9ETRPCBIRNQBLDMBUYVW',
                        // See shared/__tests__/__samples/transactions -> failedTransactionsWithIncorrectTransactionHashes
                        'OXCGKSXOVOFR9UMWGZMYHPWGVSSDZOTQAIKVMHVEHJBFPUNEZZKTISCKVVOVUGDHXLSVFIEWMMXGVYHOD',
                    ];

                    return getInputs()(
                        map(mockAddressData, (addressObject) => {
                            if (includes(addressesWithPendingOutgoingTransactions, addressObject.address)) {
                                return { ...addressObject, balance: addressObject.balance + 100 };
                            }

                            return addressObject;
                        }),
                        mockTransactions,
                        threshold,
                    )
                        .then(() => {
                            throw new Error();
                        })
                        .catch((error) =>
                            expect(error.message).to.equal('Input addresses already used in a pending transfer.'),
                        );
                });
            });
        });

        describe('when has spent addresses', () => {
            beforeEach(() => {
                nock('http://localhost:14265', {
                    reqheaders: {
                        'Content-Type': 'application/json',
                        'X-IOTA-API-Version': IRI_API_VERSION,
                    },
                    filteringScope: () => true,
                })
                    .filteringRequestBody(() => '*')
                    .persist()
                    .post('/', '*')
                    .reply(200, (_, body) => {
                        if (body.command === 'getBalances') {
                            const addresses = body.addresses;

                            const resultMap = reduce(
                                [
                                    ...mockAddressData,
                                    ...[
                                        {
                                            address:
                                                'QSHVEHOFGUYBDPMPUUPLNRDQGAHPMGQKRIEOIMLVMIKQSTHERN9DRLCN9J9RYFGPSPOIONQNYELEQUDUC',
                                            balance: 60,
                                        },
                                    ],
                                ],
                                (acc, addressObject) => {
                                    acc[addressObject.address] = addressObject.balance.toString();

                                    return acc;
                                },
                                {},
                            );

                            return {
                                balances: map(addresses, (address) => resultMap[address]),
                            };
                        } else if (body.command === 'wereAddressesSpentFrom') {
                            const addresses = body.addresses;

                            const resultMap = reduce(
                                mockAddressData,
                                (acc, addressObject) => {
                                    acc[addressObject.address] = addressObject.spent.remote;

                                    return acc;
                                },
                                {},
                            );

                            return { states: map(addresses, (address) => resultMap[address]) };
                        } else if (body.command === 'getNodeInfo') {
                            return {
                                appVersion: '1',
                                latestMilestone: LATEST_MILESTONE,
                                latestSolidSubtangleMilestone: LATEST_SOLID_SUBTANGLE_MILESTONE,
                                latestMilestoneIndex: LATEST_MILESTONE_INDEX,
                                latestSolidSubtangleMilestoneIndex: LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                            };
                        } else if (body.command === 'getTrytes') {
                            return {
                                trytes: includes(body.hashes, LATEST_MILESTONE)
                                    ? milestoneTrytes
                                    : map(body.hashes, () => EMPTY_TRANSACTION_TRYTES),
                            };
                        }

                        return {};
                    });
            });

            afterEach(() => {
                nock.cleanAll();
            });

            describe('when has enough balance to spend after filtering spent addresses in address data', () => {
                it('should not include spent addresses in selected inputs', () => {
                    const threshold = 160;

                    const spentAddresses = [
                        // (Index: 0) Local spend status -> true, Remote spend status -> true
                        'QVMPTRCCXYHUORXY9BLOZAFGVHRMRLPWFBX9DTWEXI9CNCKRWTNAZUPECVQUHGBTVIFNAWM9GMVDGJVEB',
                        // (Index: 1) Local spend status -> true, Remote spend status -> true
                        'EGESUXEIFAHIRLP9PB9YQJUPNWNWVDBEZAIYWUFKYKHTAHDHRVKSBCYYRJOUJSRBZKUTJGJIIGUGLDPVX',
                        // (Index: 2) Local spend status -> true, Remote spend status -> true
                        'D9QCAHCWFN9BCFNNSPNGFVUEUSKBX9XQEKSIRRWXHHBQBJMEEI9ATVWNPJRLO9ETRPCBIRNQBLDMBUYVW',
                        // (Index: 3) Local spend status -> true, Remote spend status -> false
                        'OXCGKSXOVOFR9UMWGZMYHPWGVSSDZOTQAIKVMHVEHJBFPUNEZZKTISCKVVOVUGDHXLSVFIEWMMXGVYHOD',
                        // (Index: 5) Local spend status -> false, Remote spend status -> true
                        'FXWIQUQWEATQQGUIWQTVOBHQBIEYCCYKZSNNAYBBILGA9ZRQKYQVPZKDBO9W9AUZBBGEDKNTTZQECBIBX',
                        // (Index: 6) Local spend status -> false, Remote spend status -> true
                        'ZBQWFOZVCOURPSVBNIBWOBQNRQXDBESSEJWWETTWWMGSJDUJLITMJYYBM9ZUFXTYTTPSGDTVBNIKLKXJA',
                    ];

                    return getInputs()(mockAddressData, mockTransactions, threshold).then((inputs) => {
                        const inputAddresses = map(inputs, (input) => input.address);

                        each(inputAddresses, (address) => expect(includes(spentAddresses, address)).to.equal(false));
                    });
                });
            });

            describe('when does not have enough balance to spend after filtering spent addresses in address data', () => {
                it('should throw with an error with message "WARNING FUNDS AT SPENT ADDRESSES."', () => {
                    const threshold = 170;

                    return getInputs()(mockAddressData, mockTransactions, threshold)
                        .then(() => {
                            throw new Error();
                        })
                        .catch((error) => expect(error.message).to.equal('WARNING FUNDS AT SPENT ADDRESSES.'));
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
