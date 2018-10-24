import each from 'lodash/each';
import find from 'lodash/find';
import merge from 'lodash/merge';
import maxBy from 'lodash/maxBy';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import { expect } from 'chai';
import sinon from 'sinon';
import nock from 'nock';
import * as addressesUtils from '../../../libs/iota/addresses';
import * as extendedApis from '../../../libs/iota/extendedApi';
import accounts from '../../__samples__/accounts';
import { addressData as mockAddressData } from '../../__samples__/addresses';
import transactions, {
    confirmedZeroValueTransactions,
    unconfirmedValueTransactions,
} from '../../__samples__/transactions';
import { iota, SwitchingConfig } from '../../../libs/iota/index';
import { IRI_API_VERSION } from '../../../config';

describe('libs: iota/addresses', () => {
    before(() => {
        SwitchingConfig.autoSwitch = false;
    });

    after(() => {
        SwitchingConfig.autoSwitch = true;
    });

    describe('#isAddressUsedSync', () => {
        describe('when provided argument is not a valid address object', () => {
            it('should throw an error with message "Invalid address data."', () => {
                expect(addressesUtils.isAddressUsedSync.bind(null, {}, [])).to.throw('Invalid address data.');
                expect(addressesUtils.isAddressUsedSync.bind(null, undefined, [])).to.throw('Invalid address data.');
            });
        });

        describe('when provided argument is a valid address object', () => {
            describe('when address has no associated transactions', () => {
                describe('when address is marked spent locally', () => {
                    it('should return true', () => {
                        const addressObject = {
                            address: 'U'.repeat(81),
                            balance: 0,
                            index: 0,
                            checksum: 'NXELTUENX',
                            spent: { local: true, remote: true },
                        };

                        const isUsed = addressesUtils.isAddressUsedSync(addressObject, []);

                        expect(isUsed).to.equal(true);
                    });
                });

                describe('when address is marked unspent locally', () => {
                    it('should return false', () => {
                        const addressObject = {
                            address: 'U'.repeat(81),
                            balance: 0,
                            index: 0,
                            checksum: 'NXELTUENX',
                            spent: { local: false, remote: true },
                        };

                        const isUsed = addressesUtils.isAddressUsedSync(addressObject, []);

                        expect(isUsed).to.equal(false);
                    });
                });
            });

            describe('when address has associated transactions', () => {
                describe('when address is marked spent locally', () => {
                    it('should return true', () => {
                        const addressObject = {
                            address:
                                'EGESUXEIFAHIRLP9PB9YQJUPNWNWVDBEZAIYWUFKYKHTAHDHRVKSBCYYRJOUJSRBZKUTJGJIIGUGLDPVX',
                            balance: 0,
                            index: 1,
                            checksum: 'BZIF9ZEBC',
                            spent: { local: true, remote: true },
                        };

                        const isUsed = addressesUtils.isAddressUsedSync(addressObject, unconfirmedValueTransactions);

                        expect(isUsed).to.equal(true);
                    });
                });

                describe('when address is marked unspent locally', () => {
                    it('should return true', () => {
                        const addressObject = {
                            address:
                                'RRHMYUP9RNBBNAORNMNHYTLJZWXCWKOYV9TVQPGPKDNTTSTVLCXCDKDKPILANYIOPOHBTNAXZ9IUBPQCC',
                            balance: 0,
                            index: 4,
                            checksum: 'YBBRFADGD',
                            spent: { local: false, remote: false },
                        };

                        const isUsed = addressesUtils.isAddressUsedSync(addressObject, confirmedZeroValueTransactions);

                        expect(isUsed).to.equal(true);
                    });
                });
            });
        });
    });

    describe('#accumulateBalance', () => {
        describe('when argument is not an array', () => {
            it('should return 0', () => {
                const args = [null, undefined, '', {}, 0, 0.5];

                args.forEach((arg) => expect(addressesUtils.accumulateBalance(arg)).to.equal(0));
            });
        });

        describe('when argument is an array', () => {
            it('should return 0 if array is empty', () => {
                expect(addressesUtils.accumulateBalance([])).to.equal(0);
            });

            it('should only calculates on numbers inside array', () => {
                expect(addressesUtils.accumulateBalance(['foo', 'baz'])).to.equal(0);
            });

            it('should return total after summing up', () => {
                expect(addressesUtils.accumulateBalance([0, 4, 10])).to.equal(14);
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

                expect(addressesUtils.getBalancesSync(addresses, addressData)).to.eql([]);
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

                expect(addressesUtils.getBalancesSync(addresses, addressData)).to.eql([10]);
            });
        });
    });

    describe('#formatAddressData', () => {
        let addresses;

        before(() => {
            addresses = ['A'.repeat(81), 'B'.repeat(81), 'C'.repeat(81)];
        });

        describe('when balances size does not equal addresses size', () => {
            describe('when size of spent statuses equal addresses size', () => {
                describe('when key indexes are not provided', () => {
                    it('should throw with an error with message "Address metadata length mismatch."', () => {
                        expect(
                            addressesUtils.formatAddressData.bind(
                                null,
                                addresses,
                                [],
                                Array(3)
                                    .fill()
                                    .map(() => ({ local: false, remote: false })),
                            ),
                        ).to.throw('Address metadata length mismatch.');
                    });
                });

                describe('when key indexes are provided', () => {
                    describe('when key indexes size does not equal addresses size', () => {
                        it('should throw with an error with message "Address metadata length mismatch."', () => {
                            expect(
                                addressesUtils.formatAddressData.bind(
                                    null,
                                    addresses,
                                    [],
                                    Array(addresses.length)
                                        .fill()
                                        .map(() => ({ local: false, remote: false })),
                                ),
                                [0],
                            ).to.throw('Address metadata length mismatch.');
                        });
                    });

                    describe('when key indexes size equals addresses size', () => {
                        it('should throw with an error with message "Address metadata length mismatch."', () => {
                            expect(
                                addressesUtils.formatAddressData.bind(
                                    null,
                                    addresses,
                                    [],
                                    Array(3)
                                        .fill()
                                        .map(() => ({ local: false, remote: false })),
                                    Array(3)
                                        .fill()
                                        .map((_, i) => i),
                                ),
                            ).to.throw('Address metadata length mismatch.');
                        });
                    });
                });
            });
        });

        describe('when address spend statuses size does not equal addresses size', () => {
            describe('when size of balances equal addresses size', () => {
                describe('when key indexes are not provided', () => {
                    it('should throw with an error with message "Address metadata length mismatch."', () => {
                        expect(
                            addressesUtils.formatAddressData.bind(
                                null,
                                addresses,
                                Array(3)
                                    .fill()
                                    .map((_, i) => i),
                                [],
                            ),
                        ).to.throw('Address metadata length mismatch.');
                    });
                });

                describe('when key indexes are provided', () => {
                    describe('when key indexes size does not equal addresses size', () => {
                        it('should throw with an error with message "Address metadata length mismatch."', () => {
                            expect(
                                addressesUtils.formatAddressData.bind(
                                    null,
                                    addresses,
                                    Array(3)
                                        .fill()
                                        .map((_, i) => i),
                                    [],
                                    [],
                                ),
                            ).to.throw('Address metadata length mismatch.');
                        });
                    });

                    describe('when key indexes size equals addresses size', () => {
                        it('should throw with an error with message "Address metadata length mismatch."', () => {
                            expect(
                                addressesUtils.formatAddressData.bind(
                                    null,
                                    addresses,
                                    Array(3)
                                        .fill()
                                        .map((_, i) => i),
                                    [],
                                    Array(3)
                                        .fill()
                                        .map((_, i) => i),
                                ),
                            ).to.throw('Address metadata length mismatch.');
                        });
                    });
                });
            });
        });

        describe('when address spend statuses size & balances size equal addresses size ', () => {
            describe('when key indexes are not provided', () => {
                it('should return address data with key indexes as address index in addresses list (passed as first argument)', () => {
                    const expectedAddressData = [
                        {
                            address:
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                            index: 0,
                            spent: { local: true, remote: false },
                            balance: 0,
                            checksum: 'YLFHUOJUY',
                        },
                        {
                            address:
                                'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                            index: 1,
                            spent: { local: false, remote: false },
                            balance: 1,
                            checksum: 'IO9LGIBVB',
                        },
                        {
                            address:
                                'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
                            index: 2,
                            spent: { local: true, remote: false },
                            balance: 2,
                            checksum: 'X9KV9ELOW',
                        },
                    ];

                    const actualAddressData = addressesUtils.formatAddressData(
                        addresses,
                        Array(3)
                            .fill()
                            .map((_, i) => i),
                        Array(3)
                            .fill()
                            .map((_, i) => ({ local: i % 2 === 0, remote: false })),
                    );

                    expect(actualAddressData).to.eql(expectedAddressData);

                    // Test valid checksum
                    expectedAddressData.forEach(({ address, checksum }) => {
                        expect(iota.utils.isValidChecksum(`${address}${checksum}`)).to.equal(true);
                    });
                });
            });

            describe('when key indexes are provided', () => {
                it('should return address data with key indexes from key indexes list (passed as fourth argument)', () => {
                    const expectedAddressData = [
                        {
                            address:
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                            index: 4,
                            spent: { local: true, remote: false },
                            balance: 0,
                            checksum: 'YLFHUOJUY',
                        },
                        {
                            address:
                                'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                            index: 6,
                            spent: { local: false, remote: false },
                            balance: 1,
                            checksum: 'IO9LGIBVB',
                        },
                        {
                            address:
                                'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
                            index: 9,
                            spent: { local: true, remote: false },
                            balance: 2,
                            checksum: 'X9KV9ELOW',
                        },
                    ];

                    const keyIndexes = [4, 6, 9];
                    const actualAddressData = addressesUtils.formatAddressData(
                        addresses,
                        Array(3)
                            .fill()
                            .map((_, i) => i),
                        Array(3)
                            .fill()
                            .map((_, i) => ({ local: i % 2 === 0, remote: false })),
                        keyIndexes,
                    );

                    expect(actualAddressData).to.eql(expectedAddressData);

                    // Test valid checksum
                    expectedAddressData.forEach(({ address, checksum }) => {
                        expect(iota.utils.isValidChecksum(`${address}${checksum}`)).to.equal(true);
                    });
                });
            });
        });
    });

    describe('#filterAddressDataWithPendingIncomingTransactions', () => {
        describe('when addressData passed as first argument is an empty array', () => {
            it('should return addressData passed as first argument', () => {
                expect(addressesUtils.filterAddressDataWithPendingIncomingTransactions([], [{}, {}])).to.eql([]);
            });
        });

        describe('when pendingValueTransactions passed as second argument is an empty array', () => {
            it('should return addressData passed as first argument', () => {
                expect(addressesUtils.filterAddressDataWithPendingIncomingTransactions([{}], [])).to.eql([{}]);
            });
        });

        describe('when addressData passed as first argument is not an empty array and transactions passed as second argument is not an empty array', () => {
            it('should filter addressData with pending incoming value transactions', () => {
                expect(
                    addressesUtils.filterAddressDataWithPendingIncomingTransactions(mockAddressData, transactions),
                ).to.eql([
                    {
                        address: 'EGESUXEIFAHIRLP9PB9YQJUPNWNWVDBEZAIYWUFKYKHTAHDHRVKSBCYYRJOUJSRBZKUTJGJIIGUGLDPVX',
                        balance: 0,
                        index: 1,
                        checksum: 'BZIF9ZEBC',
                        spent: { local: true, remote: true },
                    },
                    {
                        address: 'D9QCAHCWFN9BCFNNSPNGFVUEUSKBX9XQEKSIRRWXHHBQBJMEEI9ATVWNPJRLO9ETRPCBIRNQBLDMBUYVW',
                        balance: 0,
                        index: 2,
                        checksum: 'NXL99BCPW',
                        spent: { local: true, remote: false },
                    },
                    {
                        address: 'OXCGKSXOVOFR9UMWGZMYHPWGVSSDZOTQAIKVMHVEHJBFPUNEZZKTISCKVVOVUGDHXLSVFIEWMMXGVYHOD',
                        balance: 0,
                        index: 3,
                        checksum: 'FDPMAF9UD',
                        spent: { local: true, remote: false },
                    },
                ]);
            });
        });
    });

    describe('#getAddressesUptoRemainder', () => {
        let addressData;
        let seedStore;

        let sandbox;

        before(() => {
            addressData = accounts.accountInfo.TEST.addresses;
            seedStore = {
                generateAddress: () => Promise.resolve('A'.repeat(81)),
            };
        });

        beforeEach(() => {
            sandbox = sinon.sandbox.create();

            sandbox.stub(iota.api, 'getNodeInfo').yields(null, {});
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('when current latest address is not blacklisted', () => {
            it('should return current latest address', () => {
                return addressesUtils
                    .getAddressesUptoRemainder()(addressData, [], seedStore, () => Promise.resolve([]), [
                        'Z'.repeat(81),
                        'I'.repeat(81),
                    ])
                    .then(({ remainderAddress }) => {
                        expect(remainderAddress).to.equal(
                            'NNLAKCEDT9FMFLBIFWKHRIQJJETOSBSFPUCBWYYXXYKSLNCCSWOQRAVOYUSX9FMLGHMKUITLFEQIPHQLW',
                        );
                    });
            });
        });

        describe('when current latest address is blacklisted', () => {
            describe('when newly generated address is not blacklisted', () => {
                it('should generate new addresses and return latest unused address as the remainder address', () => {
                    const addressGenFn = sinon.stub(seedStore, 'generateAddress');

                    // Return an empty response from findTransactions
                    // So that the very first address that is generated
                    // is added as the remainder address
                    const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, []);
                    const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false]);
                    const getBalances = sinon.stub(iota.api, 'getBalances').yields(null, { balances: ['0'] });

                    addressGenFn.onCall(0).resolves('U'.repeat(81));

                    return addressesUtils
                        .getAddressesUptoRemainder()(addressData, [], seedStore, [
                            'NNLAKCEDT9FMFLBIFWKHRIQJJETOSBSFPUCBWYYXXYKSLNCCSWOQRAVOYUSX9FMLGHMKUITLFEQIPHQLW',
                        ])
                        .then(({ remainderAddress }) => {
                            expect(remainderAddress).to.not.equal(
                                'NNLAKCEDT9FMFLBIFWKHRIQJJETOSBSFPUCBWYYXXYKSLNCCSWOQRAVOYUSX9FMLGHMKUITLFEQIPHQLW',
                            );
                            expect(remainderAddress).to.equal('U'.repeat(81));

                            findTransactions.restore();
                            wereAddressesSpentFrom.restore();
                            getBalances.restore();
                            addressGenFn.restore();
                        });
                });

                it('should generate new addresses and merge it in address data', () => {
                    const addressGenFn = sinon.stub(seedStore, 'generateAddress');

                    addressGenFn.onCall(0).resolves('U'.repeat(81));

                    const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, []);
                    const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false]);
                    const getBalances = sinon.stub(iota.api, 'getBalances').yields(null, { balances: ['0'] });

                    return addressesUtils
                        .getAddressesUptoRemainder()(addressData, [], seedStore, [
                            'NNLAKCEDT9FMFLBIFWKHRIQJJETOSBSFPUCBWYYXXYKSLNCCSWOQRAVOYUSX9FMLGHMKUITLFEQIPHQLW',
                        ])
                        .then(({ addressDataUptoRemainder }) => {
                            const expectedAddressData = merge({}, addressData, {
                                ['U'.repeat(81)]: {
                                    index: 5,
                                    checksum: 'NXELTUENX',
                                    balance: 0,
                                    spent: {
                                        local: false,
                                        remote: false,
                                    },
                                },
                            });

                            expect(addressDataUptoRemainder).to.eql(expectedAddressData);

                            findTransactions.restore();
                            wereAddressesSpentFrom.restore();
                            getBalances.restore();
                            addressGenFn.restore();
                        });
                });
            });

            describe('when newly generated address is blacklisted', () => {
                it('should recursively generate new addresses till latest unused is not part of the blacklisted addresses list', () => {
                    const addressGenFn = sinon.stub(seedStore, 'generateAddress');

                    const findTransactions = sinon.stub(iota.api, 'findTransactions');
                    const getBalances = sinon.stub(iota.api, 'getBalances');
                    const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom');

                    addressGenFn.onCall(0).resolves('U'.repeat(81));
                    addressGenFn.onCall(1).resolves('R'.repeat(81));
                    addressGenFn.onCall(2).resolves('Y'.repeat(81));
                    addressGenFn.onCall(3).resolves('Z'.repeat(81));

                    // Return hashes for first three addresses
                    // So that getLatestAddresses returns all three addresses
                    // with address ZZZ..ZZZ as the latest unused
                    findTransactions.onCall(0).yields(null, ['9'.repeat(81)]);
                    findTransactions.onCall(1).yields(null, ['9'.repeat(81)]);
                    findTransactions.onCall(2).yields(null, ['9'.repeat(81)]);
                    findTransactions.onCall(3).yields(null, []);

                    getBalances.onCall(0).yields(null, { balances: ['0'] });
                    getBalances.onCall(1).yields(null, { balances: ['3'] });
                    getBalances.onCall(2).yields(null, { balances: ['5'] });
                    getBalances.onCall(3).yields(null, { balances: ['10'] });

                    wereAddressesSpentFrom.onCall(0).yields(null, [false]);
                    wereAddressesSpentFrom.onCall(1).yields(null, [false]);
                    wereAddressesSpentFrom.onCall(2).yields(null, [false]);
                    wereAddressesSpentFrom.onCall(3).yields(null, [false]);

                    return addressesUtils
                        .getAddressesUptoRemainder()(addressData, [], seedStore, [
                            'NNLAKCEDT9FMFLBIFWKHRIQJJETOSBSFPUCBWYYXXYKSLNCCSWOQRAVOYUSX9FMLGHMKUITLFEQIPHQLW',
                            'U'.repeat(81),
                            'R'.repeat(81),
                        ])
                        .then(({ remainderAddress, addressDataUptoRemainder }) => {
                            expect(remainderAddress).to.equal('Z'.repeat(81));

                            const expectedAddressData = merge({}, addressData, {
                                ['U'.repeat(81)]: {
                                    index: 5,
                                    checksum: 'NXELTUENX',
                                    balance: 0,
                                    spent: {
                                        local: false,
                                        remote: false,
                                    },
                                },
                                ['R'.repeat(81)]: {
                                    index: 6,
                                    checksum: 'JUHTDRHCA',
                                    balance: 3,
                                    spent: {
                                        local: false,
                                        remote: false,
                                    },
                                },
                                ['Y'.repeat(81)]: {
                                    index: 7,
                                    checksum: 'MHXTFTEBX',
                                    balance: 5,
                                    spent: {
                                        local: false,
                                        remote: false,
                                    },
                                },
                                ['Z'.repeat(81)]: {
                                    index: 8,
                                    checksum: '9JTQPKDGC',
                                    balance: 10,
                                    spent: {
                                        local: false,
                                        remote: false,
                                    },
                                },
                            });

                            expect(addressDataUptoRemainder).to.eql(expectedAddressData);

                            findTransactions.restore();
                            wereAddressesSpentFrom.restore();
                            getBalances.restore();
                            addressGenFn.restore();
                        });
                });
            });
        });
    });

    describe('#filterSpentAddressData', () => {
        describe('when all addresses in addressData are marked spent locally', () => {
            it('should return an empty array', () => {
                return addressesUtils
                    .filterSpentAddressData()(
                        map(mockAddressData, (addressObject) => ({
                            ...addressObject,
                            ...{ spent: { ...addressObject.spent, local: true } },
                        })),
                        [],
                    )
                    .then((unspentAddressData) => {
                        expect(unspentAddressData).to.eql([]);
                    });
            });
        });

        describe('when some addresses in addressData are marked spent locally', () => {
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
                        if (body.command === 'wereAddressesSpentFrom') {
                            const addresses = body.addresses;

                            const resultMap = reduce(
                                mockAddressData,
                                (acc, addressObject) => {
                                    acc = { ...acc, [addressObject.address]: addressObject.spent.remote };

                                    return acc;
                                },
                                {},
                            );

                            return { states: map(addresses, (address) => resultMap[address]) };
                        }

                        return {};
                    });
            });

            afterEach(() => {
                nock.cleanAll();
            });

            it('should filter addressData with spent addresses', () => {
                return addressesUtils
                    .filterSpentAddressData()(mockAddressData, transactions)
                    .then((actualUnspentAddressData) => {
                        const expectedAddressData = [
                            {
                                address:
                                    'RRHMYUP9RNBBNAORNMNHYTLJZWXCWKOYV9TVQPGPKDNTTSTVLCXCDKDKPILANYIOPOHBTNAXZ9IUBPQCC',
                                balance: 0,
                                index: 4,
                                checksum: 'YBBRFADGD',
                                spent: { local: false, remote: false },
                            },
                            {
                                address:
                                    'VOVTUPNCVSEYOGYXPER9RRHPICCMTBD9DNTJMBZPCUNXHHYTZQOAVJBBIGRCMBXRVRLHVROE9OMNDKTVW',
                                balance: 150,
                                index: 7,
                                checksum: 'MLUGSLZRA',
                                spent: { local: false, remote: false },
                            },
                            {
                                address:
                                    'JEFTSJGSNYGDSYHTCIZF9WXPWGHOPKRJSGXGNNZIUJUZGOFEGXRHPJVGPUZNIZMQ9QSNAITO9QUYQZZEC',
                                balance: 10,
                                index: 8,
                                checksum: 'RHAFCPMZY',
                                spent: { local: false, remote: false },
                            },
                            {
                                address:
                                    'DMBXMBUXTNBMQBWKENUROZ9OFVFABPETLAQPZSWTPDAJABOLQGKIQQHP9VQSRQ9LTOTGCYUVGNIJIPYOX',
                                balance: 0,
                                index: 9,
                                checksum: 'RHAFCPMZY',
                                spent: { local: false, remote: false },
                            },
                        ];

                        expect(actualUnspentAddressData).to.eql(expectedAddressData);
                    });
            });
        });
    });

    describe('#attachAndFormatAddress', () => {
        let address;
        let addressIndex;
        let addressData;
        let seedStore;

        let sandbox;

        before(() => {
            address = 'U'.repeat(81);
            seedStore = {
                generateAddress: () => Promise.resolve('A'.repeat(81)),
            };
            addressIndex = 11;
            addressData = { ['A'.repeat(81)]: { index: 0, balance: 0, spent: { local: false, remote: false } } };
        });

        beforeEach(() => {
            sandbox = sinon.sandbox.create();

            sandbox.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false]);
            sandbox.stub(extendedApis, 'sendTransferAsync').returns(() => Promise.resolve([{}, {}]));
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('when finds transaction hashes for specified address', () => {
            it('should throw with an error "Address already attached."', () => {
                const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, ['9'.repeat(81)]);

                return addressesUtils
                    .attachAndFormatAddress()(address, addressIndex, 10, seedStore, [], addressData, null)
                    .catch((error) => {
                        expect(error.message).to.equal('Address already attached.');

                        findTransactions.restore();
                    });
            });
        });

        describe('when does not find transaction hashes for specified address', () => {
            it('should return an object with formatted address data', () => {
                const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, []);

                return addressesUtils
                    .attachAndFormatAddress()(address, addressIndex, 10, seedStore, [], addressData, null)
                    .then((result) => {
                        expect(result.addressData).to.eql({
                            ['U'.repeat(81)]: {
                                balance: 10,
                                checksum: 'NXELTUENX',
                                spent: {
                                    local: false,
                                    remote: false,
                                },
                                index: 11,
                            },
                        });
                        findTransactions.restore();
                    });
            });

            it('should return an object with newly attached transaction object', () => {
                const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, []);

                return addressesUtils
                    .attachAndFormatAddress()(address, addressIndex, 10, seedStore, [], addressData, null)
                    .then((result) => {
                        expect(result.transfer).to.eql([{}, {}]);
                        findTransactions.restore();
                    });
            });
        });
    });

    describe('#syncAddresses', () => {
        let addressData;
        let seedStore;

        let sandbox;

        before(() => {
            addressData = accounts.accountInfo.TEST.addresses;
            seedStore = {
                generateAddress: (index) => Promise.resolve(accounts.accountInfo.TEST.addresses[index]),
            };
        });

        beforeEach(() => {
            sandbox = sinon.sandbox.create();

            sandbox.stub(iota.api, 'getNodeInfo').yields(null, {});
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('when there are no transaction hashes associated with the latest address', () => {
            describe('when the latest address in not spent', () => {
                it('should return existing address data', () => {
                    const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, []);
                    const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false]);

                    return addressesUtils
                        .syncAddresses()(seedStore, addressData, [], () => Promise.resolve('A'.repeat(81)))
                        .then((newAddressData) => {
                            expect(newAddressData).to.eql(addressData);

                            findTransactions.restore();
                            wereAddressesSpentFrom.restore();
                        });
                });
            });

            describe('when the latest address is spent', () => {
                it('should merge new address data in existing address data', () => {
                    const findTransactions = sinon.stub(iota.api, 'findTransactions');
                    const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom');
                    const getBalances = sinon.stub(iota.api, 'getBalances');

                    // Stub for first call that will be made to check if the latest
                    // address is spent. This yields true so new addresses will be generated
                    wereAddressesSpentFrom.onCall(0).yields(null, [true]);

                    const addressGenFn = sinon.stub(seedStore, 'generateAddress');

                    const addresses = ['A'.repeat(81), 'B'.repeat(81), 'C'.repeat(81), 'D'.repeat(81)];

                    addresses.forEach((address, index) => addressGenFn.onCall(index).resolves(address));

                    const spentStatuses = [true, false, true, false];

                    // Stubs for corresponding address generation calls
                    // Generate first address (AAA...AAA) -> wereAddressesSpentFrom (true)
                    // Generate second address (BBB...BBB) -> wereAddressesSpentFrom (false)
                    // Generate third address (CCC...CCC) -> wereAddressesSpentFrom (true)
                    // Generate fourth address (DDD...DDD) -> wereAddressesSpentFrom (false)

                    // Do index + 1 because the first call to wereAddressesSpentFrom would be for the
                    // latest known address
                    spentStatuses.forEach((status, index) =>
                        wereAddressesSpentFrom.onCall(index + 1).yields(null, [status]),
                    );

                    const hashes = [null, '9'.repeat(81), '9'.repeat(81), null];

                    // Generate first address (AAA...AAA) -> findTransactions (No transaction found)
                    // Generate second address (BBB...BBB) -> findTransactions (Transaction found)
                    // Generate third address (CCC...CCC) -> findTransactions (Transaction found)
                    // Generate fourth address (DDD...DDD) -> findTransactions (Transaction not found)
                    hashes.forEach((hash, index) => findTransactions.onCall(index).yields(null, hash ? [hash] : []));

                    // Use unique balances to assert if newly generated addresses have correct balance assignment
                    const balances = ['0', '10', '20', '30'];

                    balances.forEach((balance, index) =>
                        getBalances.onCall(index).yields(null, { balances: [balance] }),
                    );

                    return addressesUtils
                        .syncAddresses()(seedStore, addressData, [])
                        .then((newAddressData) => {
                            expect(newAddressData).to.not.eql(addressData);

                            // Validate that all existing data is preserved
                            Object.keys(addressData).forEach((address) => {
                                expect(newAddressData[address]).to.eql(addressData[address]);
                            });

                            // Start index of new addresses will be
                            // the (highest index of address in existing address data + 1)
                            const startIndexForNewAddresses =
                                maxBy(map(addressData, (data) => data), 'index').index + 1;

                            // Then check if all new addresses are merged and have correct properties
                            addresses.forEach((address, index) => {
                                const thisAddressData = newAddressData[address];

                                expect(thisAddressData.balance).to.equal(parseInt(balances[index]));
                                expect(thisAddressData.spent.remote).to.equal(spentStatuses[index]);
                                expect(thisAddressData.index).to.equal(startIndexForNewAddresses + index);
                                expect(iota.utils.isValidChecksum(`${address}${thisAddressData.checksum}`)).to.equal(
                                    true,
                                );
                            });

                            findTransactions.restore();
                            wereAddressesSpentFrom.restore();
                            getBalances.restore();
                        });
                });
            });
        });
    });

    describe('#removeUnusedAddresses', () => {
        let addresses;
        let sandbox;

        before(() => {
            addresses = [
                'A'.repeat(81),
                'B'.repeat(81),
                'C'.repeat(81),
                'D'.repeat(81),
                'E'.repeat(81),
                'F'.repeat(81),
                'G'.repeat(81),
            ];
        });

        beforeEach(() => {
            sandbox = sinon.sandbox.create();

            sandbox.stub(iota.api, 'getNodeInfo').yields(null, {});
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('when the last address has associated meta data', () => {
            it('should return addresses with latest unused address', () => {
                // Return transaction hashes on this stub so that there is only iteration
                const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, ['9'.repeat(81)]);
                const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false]);
                const getBalances = sinon.stub(iota.api, 'getBalances').yields(null, { balances: ['0'] });

                const latestUnusedAddress = 'H'.repeat(81);
                const lastAddressIndex = 6;

                return addressesUtils
                    .removeUnusedAddresses()(lastAddressIndex, latestUnusedAddress, addresses)
                    .then((finalAddresses) => {
                        expect(finalAddresses).to.eql([...addresses, latestUnusedAddress]);

                        findTransactions.restore();
                        wereAddressesSpentFrom.restore();
                        getBalances.restore();
                    });
            });
        });

        describe('when no address has any associated meta data', () => {
            it('should return address at zeroth index as the latest unused address', () => {
                const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, []);
                const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false]);
                const getBalances = sinon.stub(iota.api, 'getBalances').yields(null, { balances: ['0'] });

                const latestUnusedAddress = 'H'.repeat(81);
                const lastAddressIndex = 6;

                return addressesUtils
                    .removeUnusedAddresses()(lastAddressIndex, latestUnusedAddress, addresses)
                    .then((finalAddresses) => {
                        expect(finalAddresses).to.eql([addresses[0]]);

                        findTransactions.restore();
                        wereAddressesSpentFrom.restore();
                        getBalances.restore();
                    });
            });
        });

        describe('when some addresses have associated meta data', () => {
            it('should return addresses till one unused', () => {
                const findTransactions = sinon.stub(iota.api, 'findTransactions');
                const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom');
                const getBalances = sinon.stub(iota.api, 'getBalances');

                // Address GGG...GGG - index 6
                findTransactions.onCall(0).yields(null, []);
                wereAddressesSpentFrom.onCall(0).yields(null, [false]);
                getBalances.onCall(0).yields(null, { balances: ['0'] });

                // Address FFF...FFF - index 5
                findTransactions.onCall(1).yields(null, []);
                wereAddressesSpentFrom.onCall(1).yields(null, [false]);
                getBalances.onCall(1).yields(null, { balances: ['0'] });

                // Address EEE...EEE - index 4
                findTransactions.onCall(2).yields(null, []);
                wereAddressesSpentFrom.onCall(2).yields(null, [false]);
                getBalances.onCall(2).yields(null, { balances: ['0'] });

                // Address DDD...DDD - index 3
                // Return transaction hashes for this address
                findTransactions.onCall(3).yields(null, ['9'.repeat(81)]);
                wereAddressesSpentFrom.onCall(3).yields(null, [false]);
                getBalances.onCall(3).yields(null, { balances: ['0'] });

                const latestUnusedAddress = 'H'.repeat(81);
                const lastAddressIndex = 6;

                return addressesUtils
                    .removeUnusedAddresses()(lastAddressIndex, latestUnusedAddress, addresses)
                    .then((finalAddresses) => {
                        // Till address EEE...EEE with DDD...DDD as the used address
                        // And EEE...EEE as the latest unused address
                        expect(finalAddresses).to.eql(addresses.slice(0, 5));

                        findTransactions.restore();
                        wereAddressesSpentFrom.restore();
                        getBalances.restore();
                    });
            });
        });
    });

    describe('#getFullAddressHistory', () => {
        let firstBatchOfAddresses;
        let firstBatchOfBalances;
        let firstBatchOfSpentStatuses;
        let findTransactions;
        let getBalances;
        let wereAddressesSpentFrom;

        let addressGenFn;
        let seedStore;

        let sandbox;

        before(() => {
            seedStore = {
                generateAddress: () => Promise.resolve('A'.repeat(81)),
            };
            firstBatchOfAddresses = [
                'A'.repeat(81),
                'B'.repeat(81),
                'C'.repeat(81),
                'D'.repeat(81),
                'E'.repeat(81),
                'F'.repeat(81),
                'G'.repeat(81),
                'H'.repeat(81),
                'I'.repeat(81),
                'J'.repeat(81),
            ];
            firstBatchOfBalances = Array(10)
                .fill()
                .map((v, i) => i.toString());
            firstBatchOfSpentStatuses = Array(10)
                .fill()
                .map((v, i) => i % 2 === 0);
        });

        beforeEach(() => {
            sandbox = sinon.sandbox.create();

            sandbox.stub(iota.api, 'getNodeInfo').yields(null, {});
            addressGenFn = sandbox.stub(seedStore, 'generateAddress');

            // First batch
            addressGenFn.onCall(0).resolves(firstBatchOfAddresses);

            // Second batch
            addressGenFn
                .onCall(1)
                .resolves(firstBatchOfAddresses.map((address) => address.substring(0, address.length - 1).concat('9')));

            findTransactions = sandbox.stub(iota.api, 'findTransactions');

            // Return hashes on the very first call i.e. call made for findTransactions with first batch of addresses
            findTransactions.onCall(0).yields(null, ['9'.repeat(81)]);

            // Return no hashes for the second call i.e. call made for findTransactions with second batch of addresses
            findTransactions.onCall(1).yields(null, []);

            // Return hashes for the third call i.e. call made for findTransactions with last address of first batch
            findTransactions.onCall(2).yields(null, ['U'.repeat(81)]);

            getBalances = sandbox.stub(iota.api, 'getBalances');

            // Return balances for the very first call i.e. getBalances with first batch of addresses
            getBalances.onCall(0).yields(null, { balances: firstBatchOfBalances });

            // Return 0 balances for the second call i.e. getBalances with second batch of addresses
            getBalances.onCall(1).yields(null, {
                balances: Array(10)
                    .fill()
                    .map(() => '0'),
            });

            // Return balances for the third call i.e. call made for getBalances with last address of first batch
            getBalances.onCall(2).yields(null, { balances: ['0'] });

            wereAddressesSpentFrom = sandbox.stub(iota.api, 'wereAddressesSpentFrom');

            // Return spent statuses for the very first call i.e. wereAddressesSpentFrom with first batch of addresses
            wereAddressesSpentFrom.onCall(0).yields(null, firstBatchOfSpentStatuses);

            // Return spent statuses for the second call i.e. wereAddressesSpentFrom with second batch of addresses
            wereAddressesSpentFrom.onCall(1).yields(
                null,
                Array(10)
                    .fill()
                    .map(() => false),
            );

            // Return spent statuses for the third call
            // i.e. call made for wereAddressesSpentFrom with last address of first batch
            wereAddressesSpentFrom.onCall(2).yields(null, [false]);
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should return addresses till one unused', () => {
            return addressesUtils
                .getFullAddressHistory()(seedStore)
                .then((history) => {
                    expect(history.addresses).to.eql([...firstBatchOfAddresses, `${'A'.repeat(80)}9`]);
                });
        });

        it('should return transaction hashes associated with addresses', () => {
            return addressesUtils
                .getFullAddressHistory()(seedStore)
                .then((history) => {
                    expect(history.hashes).to.eql(['9'.repeat(81)]);
                });
        });

        it('should return balances associated with addresses', () => {
            return addressesUtils
                .getFullAddressHistory()(seedStore)
                .then((history) => {
                    expect(history.balances).to.eql([...firstBatchOfBalances.map((balance) => parseInt(balance)), 0]);
                });
        });

        it('should return (local & remote) spent statuses for addresses', () => {
            return addressesUtils
                .getFullAddressHistory()(seedStore)
                .then((history) => {
                    expect(history.wereSpent).to.eql([
                        ...map(firstBatchOfSpentStatuses, (status, idx) => ({
                            local: false,
                            remote: firstBatchOfSpentStatuses[idx],
                        })),
                        { local: false, remote: false },
                    ]);
                });
        });
    });

    describe('#categoriseAddressesBySpentStatus', () => {
        let addresses;
        let sandbox;

        before(() => {
            addresses = ['A'.repeat(81), 'B'.repeat(81), 'C'.repeat(81), 'D'.repeat(81)];
        });

        beforeEach(() => {
            sandbox = sinon.sandbox.create();

            sandbox.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false, true, false, true]);
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should categorise spent addresses', () => {
            return addressesUtils
                .categoriseAddressesBySpentStatus()(addresses)
                .then((result) => {
                    expect(result.spent).to.eql(['B'.repeat(81), 'D'.repeat(81)]);
                });
        });

        it('should categorise unspent addresses', () => {
            return addressesUtils
                .categoriseAddressesBySpentStatus()(addresses)
                .then((result) => {
                    expect(result.unspent).to.eql(['A'.repeat(81), 'C'.repeat(81)]);
                });
        });
    });

    describe('#filterSpentAddressesSync', () => {
        it('should filter addresses marked spent locally', () => {
            const addresses = ['A'.repeat(81), 'B'.repeat(81)];

            const addressData = {
                ['A'.repeat(81)]: { spent: { local: true, remote: true } },
                ['B'.repeat(81)]: { spent: { local: false, remote: false } },
                ['C'.repeat(81)]: { spent: { local: true, remote: false } },
            };

            const result = addressesUtils.filterSpentAddressesSync(addresses, addressData);
            expect(result).to.eql(['B'.repeat(81)]);
        });
    });

    describe('#getLatestAddress', () => {
        it('should return address with highest index', () => {
            const addressData = {
                ['A'.repeat(81)]: { index: 20 },
                ['B'.repeat(81)]: { index: 5 },
                ['C'.repeat(81)]: { index: -30 },
                ['D'.repeat(81)]: { index: 99 },
                ['E'.repeat(81)]: { index: 1 },
            };

            const result = addressesUtils.getLatestAddress(addressData);
            expect(result).to.equal('D'.repeat(81));
        });
    });

    describe('#getLatestAddressData', () => {
        it('should return address data with highest index', () => {
            const addressData = {
                ['A'.repeat(81)]: { index: 20 },
                ['B'.repeat(81)]: { index: 5 },
                ['C'.repeat(81)]: { index: -30 },
                ['D'.repeat(81)]: { index: 99 },
                ['E'.repeat(81)]: { index: 1 },
            };

            const result = addressesUtils.getLatestAddressData(addressData);
            expect(result).to.eql({ index: 99 });
        });
    });

    describe('#findSpendStatusesFromTransactionObjects', () => {
        it('should return spend status true for addresses used as inputs', () => {
            const addresses = ['A'.repeat(81), 'B'.repeat(81), 'C'.repeat(81)];
            const transactionObjects = [
                {
                    address: 'A'.repeat(81),
                    value: -1,
                },
                {
                    address: 'B'.repeat(81),
                    value: 0,
                },
                {
                    address: 'B'.repeat(81),
                    value: -1,
                },
                {
                    address: 'C'.repeat(81),
                    value: 0,
                },
            ];

            const result = addressesUtils.findSpendStatusesFromTransactionObjects(addresses, transactionObjects);
            expect(result).to.eql([true, true, false]);
        });
    });

    describe('#findSpendStatusesFromNormalisedTransactions', () => {
        it('should return spend status true for addresses used as inputs', () => {
            const addresses = ['A'.repeat(81), 'B'.repeat(81), 'C'.repeat(81)];

            const normalisedTransactions = [
                {
                    inputs: [{ address: 'A'.repeat(81), value: -1 }],
                    outputs: [{ address: 'Z'.repeat(81), value: 1 }],
                },
                {
                    inputs: [],
                    outputs: [{ address: 'Z'.repeat(81), value: 0 }],
                },
            ];

            const result = addressesUtils.findSpendStatusesFromNormalisedTransactions(
                addresses,
                normalisedTransactions,
            );
            expect(result).to.eql([true, false, false]);
        });
    });

    describe('#transformAddressDataToInputs', () => {
        let addressData;

        before(() => {
            addressData = {
                ['A'.repeat(81)]: { index: 0, balance: 100, spent: { local: false, remote: false } },
                ['B'.repeat(81)]: { index: 1, balance: 0, spent: { local: true, remote: false } },
                ['C'.repeat(81)]: { index: 2, balance: 50, spent: { local: false, remote: false } },
            };
        });

        it('should assign "security" passed as second argument to each transformed input', () => {
            const inputs = addressesUtils.transformAddressDataToInputs(addressData, 3);

            each(inputs, (input) => expect(input.security).to.equal(3));
        });

        it('should assign correct keyIndex, address and balance to each input', () => {
            const inputs = addressesUtils.transformAddressDataToInputs(addressData);

            each(addressData, (data, address) => {
                const input = find(inputs, { address });

                expect(input.address).to.equal(address);
                expect(input.balance).to.equal(data.balance);
                expect(input.keyIndex).to.equal(data.index);
            });
        });
    });

    describe('#filterAddressDataWithPendingOutgoingTransactions', () => {
        it('should filter address data with pending outgoing transactions', () => {
            const addressData = {
                ['A'.repeat(81)]: {
                    index: 0,
                    balance: 10,
                },
                ['B'.repeat(81)]: {
                    index: 1,
                    balance: 15,
                },
                ['C'.repeat(81)]: {
                    index: 2,
                    balance: 20,
                },
                ['D'.repeat(81)]: {
                    index: 3,
                    balance: 0,
                },
            };

            const normalisedTransactionsList = [
                {
                    inputs: [{ address: 'A'.repeat(81), value: -1 }],
                    outputs: [{ address: 'Z'.repeat(81), value: 1 }],
                    persistence: false,
                },
                {
                    inputs: [],
                    outputs: [{ address: 'D'.repeat(81), value: 0 }],
                    persistence: true,
                },
                {
                    inputs: [{ address: 'C'.repeat(81), value: -5 }],
                    outputs: [{ address: 'Y'.repeat(81), value: 5 }],
                    persistence: true,
                },
            ];

            const result = addressesUtils.filterAddressDataWithPendingOutgoingTransactions(
                addressData,
                normalisedTransactionsList,
            );

            const expectedResult = {
                ['B'.repeat(81)]: {
                    index: 1,
                    balance: 15,
                },
                ['C'.repeat(81)]: {
                    index: 2,
                    balance: 20,
                },
                ['D'.repeat(81)]: {
                    index: 3,
                    balance: 0,
                },
            };

            expect(result).to.eql(expectedResult);
        });
    });
});
