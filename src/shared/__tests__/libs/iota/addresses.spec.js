import merge from 'lodash/merge';
import maxBy from 'lodash/maxBy';
import map from 'lodash/map';
import { expect } from 'chai';
import sinon from 'sinon';
import * as addressesUtils from '../../../libs/iota/addresses';
import * as extendedApis from '../../../libs/iota/extendedApi';
import accounts from '../../__samples__/accounts';
import { iota, SwitchingConfig } from '../../../libs/iota/index';

describe('libs: iota/addresses', () => {
    before(() => {
        SwitchingConfig.autoSwitch = false;
    });

    after(() => {
        SwitchingConfig.autoSwitch = true;
    });

    describe('#getUnspentAddressesSync', () => {
        describe('when argument is not an object', () => {
            it('should always return an array', () => {
                const args = [null, undefined, '', {}, 0, -1];

                args.forEach((arg) => expect(addressesUtils.getUnspentAddressesSync(arg)).to.eql([]));
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

                expect(addressesUtils.getUnspentAddressesSync(addressData)).to.eql([firstAddress, thirdAddress]);
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

                expect(addressesUtils.getSpentAddressesWithPendingTransfersSync(transfers, addressData)).to.eql([]);
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

                expect(addressesUtils.getSpentAddressesWithPendingTransfersSync(transfers, addressData)).to.eql([
                    firstAddress,
                ]);
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

    describe('#filterAddressesWithIncomingTransfers', () => {
        describe('when inputs passed as first argument is an empty array', () => {
            it('should return inputs passed as first argument', () => {
                expect(addressesUtils.filterAddressesWithIncomingTransfers([], [{}, {}])).to.eql([]);
            });
        });

        describe('when pendingValueTransfers passed as second argument is an empty array', () => {
            it('should return inputs passed as first argument', () => {
                expect(addressesUtils.filterAddressesWithIncomingTransfers([{}], [])).to.eql([{}]);
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

                expect(addressesUtils.filterAddressesWithIncomingTransfers(inputs, pendingTransfers)).to.eql([
                    { address: 'F'.repeat(81) },
                ]);
            });

            it('should filter inputs that have pending outgoing value transfers on change addresses', () => {
                const inputs = [{ address: 'C'.repeat(81) }, { address: 'F'.repeat(81) }];

                expect(addressesUtils.filterAddressesWithIncomingTransfers(inputs, pendingTransfers)).to.eql([
                    { address: 'F'.repeat(81) },
                ]);
            });
        });
    });

    describe('#getAddressesUptoRemainder', () => {
        let addressData;
        let seed;

        let sandbox;

        before(() => {
            addressData = accounts.accountInfo.TEST.addresses;
            seed = 'SEED';
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
                    .getAddressesUptoRemainder(addressData, seed, () => Promise.resolve([]), [
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
                    const addressGenFn = sinon.stub();

                    // Return an empty response from findTransactions
                    // So that the very first address that is generated
                    // is added as the remainder address
                    const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, []);
                    const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false]);
                    const getBalances = sinon.stub(iota.api, 'getBalances').yields(null, { balances: ['0'] });

                    addressGenFn.onCall(0).resolves('U'.repeat(81));

                    return addressesUtils
                        .getAddressesUptoRemainder(addressData, seed, addressGenFn, [
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
                        });
                });

                it('should generate new addresses and merge it in address data', () => {
                    const addressGenFn = sinon.stub();

                    addressGenFn.onCall(0).resolves('U'.repeat(81));

                    const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, []);
                    const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false]);
                    const getBalances = sinon.stub(iota.api, 'getBalances').yields(null, { balances: ['0'] });

                    return addressesUtils
                        .getAddressesUptoRemainder(addressData, seed, addressGenFn, [
                            'NNLAKCEDT9FMFLBIFWKHRIQJJETOSBSFPUCBWYYXXYKSLNCCSWOQRAVOYUSX9FMLGHMKUITLFEQIPHQLW',
                        ])
                        .then(({ addressDataUptoRemainder }) => {
                            const expectedAddressData = merge({}, addressData, {
                                ['U'.repeat(81)]: {
                                    index: 5,
                                    checksum: 'NXELTUENX',
                                    balance: 0,
                                    spent: false,
                                },
                            });

                            expect(addressDataUptoRemainder).to.eql(expectedAddressData);

                            findTransactions.restore();
                            wereAddressesSpentFrom.restore();
                            getBalances.restore();
                        });
                });
            });

            describe('when newly generated address is blacklisted', () => {
                it('should recursively generate new addresses till latest unused is not part of the blacklisted addresses list', () => {
                    const addressGenFn = sinon.stub();

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
                        .getAddressesUptoRemainder(addressData, seed, addressGenFn, [
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
                                    spent: false,
                                },
                                ['R'.repeat(81)]: {
                                    index: 6,
                                    checksum: 'JUHTDRHCA',
                                    balance: 3,
                                    spent: false,
                                },
                                ['Y'.repeat(81)]: {
                                    index: 7,
                                    checksum: 'MHXTFTEBX',
                                    balance: 5,
                                    spent: false,
                                },
                                ['Z'.repeat(81)]: {
                                    index: 8,
                                    checksum: '9JTQPKDGC',
                                    balance: 10,
                                    spent: false,
                                },
                            });

                            expect(addressDataUptoRemainder).to.eql(expectedAddressData);

                            findTransactions.restore();
                            wereAddressesSpentFrom.restore();
                            getBalances.restore();
                        });
                });
            });
        });
    });

    describe('#filterSpentAddresses', () => {
        let inputs;
        let sandbox;

        before(() => {
            inputs = [
                {
                    address: 'U'.repeat(81),
                },
                {
                    address: 'V'.repeat(81),
                },
                {
                    address: 'Y'.repeat(81),
                },
            ];
        });

        beforeEach(() => {
            sandbox = sinon.sandbox.create();

            sandbox.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false, false, true]);
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('when spent addresses is an empty array', () => {
            it('should filter spent addresses relying on wereAddressesSpentFrom network call', () => {
                return addressesUtils.filterSpentAddresses(inputs, []).then((unspentInputs) => {
                    expect(unspentInputs).to.eql([
                        {
                            address: 'U'.repeat(81),
                        },
                        {
                            address: 'V'.repeat(81),
                        },
                    ]);
                });
            });
        });

        describe('when spent addresses is not an empty array', () => {
            it('should filter inputs containing spent addresses', () => {
                return addressesUtils.filterSpentAddresses(inputs, ['U'.repeat(81)]).then((unspentInputs) => {
                    expect(unspentInputs).to.eql([{ address: 'V'.repeat(81) }]);
                });
            });
        });
    });

    describe('#isAnyAddressSpent', () => {
        let transactionObjects;

        before(() => {
            transactionObjects = [
                {
                    address: 'U'.repeat(81),
                },
                {
                    address: 'V'.repeat(81),
                },
                {
                    address: 'Y'.repeat(81),
                },
            ];
        });

        describe('when none of the addresses is spent', () => {
            it('should return false', () => {
                const wereAddressesSpentFrom = sinon
                    .stub(iota.api, 'wereAddressesSpentFrom')
                    .yields(null, [false, false, false]);

                return addressesUtils.isAnyAddressSpent(transactionObjects).then((isSpent) => {
                    expect(isSpent).to.eql(false);
                    wereAddressesSpentFrom.restore();
                });
            });
        });

        describe('when one or more addresses are spent', () => {
            it('should return true', () => {
                const wereAddressesSpentFrom = sinon
                    .stub(iota.api, 'wereAddressesSpentFrom')
                    .yields(null, [false, true, false]);

                return addressesUtils.isAnyAddressSpent(transactionObjects).then((isSpent) => {
                    expect(isSpent).to.equal(true);
                    wereAddressesSpentFrom.restore();
                });
            });
        });
    });

    describe('#attachAndFormatAddress', () => {
        let address;
        let addressIndex;
        let seed;

        let sandbox;

        before(() => {
            address = 'U'.repeat(81);
            seed = 'SEED';
            addressIndex = 11;
        });

        beforeEach(() => {
            sandbox = sinon.sandbox.create();

            sandbox.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false]);
            sandbox.stub(extendedApis, 'sendTransferAsync').resolves([{}, {}]);
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('when finds transaction hashes for specified address', () => {
            it('should throw with an error "Address already attached."', () => {
                const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, ['9'.repeat(81)]);

                return addressesUtils.attachAndFormatAddress(address, addressIndex, 10, seed, null).catch((error) => {
                    expect(error.message).to.equal('Address already attached.');

                    findTransactions.restore();
                });
            });
        });

        describe('when does not find transaction hashes for specified address', () => {
            it('should return an object with formatted address data', () => {
                const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, []);

                return addressesUtils.attachAndFormatAddress(address, addressIndex, 10, seed, null).then((result) => {
                    expect(result.addressData).to.eql({
                        ['U'.repeat(81)]: {
                            balance: 10,
                            checksum: 'NXELTUENX',
                            spent: false,
                            index: 11,
                        },
                    });
                    findTransactions.restore();
                });
            });

            it('should return an object with newly attached transaction object', () => {
                const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, []);

                return addressesUtils.attachAndFormatAddress(address, addressIndex, 10, seed, null).then((result) => {
                    expect(result.transfer).to.eql([{}, {}]);
                    findTransactions.restore();
                });
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
                        try {
                            addressesUtils.formatAddressData(
                                addresses,
                                [],
                                Array(3)
                                    .fill()
                                    .map(() => false),
                            );
                        } catch (e) {
                            expect(e.message).to.equal('Address metadata length mismatch.');
                        }
                    });
                });

                describe('when key indexes are provided', () => {
                    describe('when key indexes size does not equal addresses size', () => {
                        it('should throw with an error with message "Address metadata length mismatch."', () => {
                            try {
                                addressesUtils.formatAddressData(
                                    addresses,
                                    [],
                                    Array(3)
                                        .fill()
                                        .map(() => false),
                                    [],
                                );
                            } catch (e) {
                                expect(e.message).to.equal('Address metadata length mismatch.');
                            }
                        });
                    });

                    describe('when key indexes size equals addresses size', () => {
                        it('should throw with an error with message "Address metadata length mismatch."', () => {
                            try {
                                addressesUtils.formatAddressData(
                                    addresses,
                                    [],
                                    Array(3)
                                        .fill()
                                        .map(() => false),
                                    Array(3)
                                        .fill()
                                        .map((v, i) => i),
                                );
                            } catch (e) {
                                expect(e.message).to.equal('Address metadata length mismatch.');
                            }
                        });
                    });
                });
            });
        });

        describe('when address spent list size does not equal addresses size', () => {
            describe('when size of balances equal addresses size', () => {
                describe('when key indexes are not provided', () => {
                    it('should throw with an error with message "Address metadata length mismatch."', () => {
                        try {
                            addressesUtils.formatAddressData(
                                addresses,
                                Array(3)
                                    .fill()
                                    .map((v, i) => i),
                                [],
                            );
                        } catch (e) {
                            expect(e.message).to.equal('Address metadata length mismatch.');
                        }
                    });
                });

                describe('when key indexes are provided', () => {
                    describe('when key indexes size does not equal addresses size', () => {
                        it('should throw with an error with message "Address metadata length mismatch."', () => {
                            try {
                                addressesUtils.formatAddressData(
                                    addresses,
                                    Array(3)
                                        .fill()
                                        .map((v, i) => i),
                                    [],
                                    [],
                                );
                            } catch (e) {
                                expect(e.message).to.equal('Address metadata length mismatch.');
                            }
                        });
                    });

                    describe('when key indexes size equals addresses size', () => {
                        it('should throw with an error with message "Address metadata length mismatch."', () => {
                            try {
                                addressesUtils.formatAddressData(
                                    addresses,
                                    Array(3)
                                        .fill()
                                        .map((v, i) => i),
                                    [],
                                    Array(3)
                                        .fill()
                                        .map((v, i) => i),
                                );
                            } catch (e) {
                                expect(e.message).to.equal('Address metadata length mismatch.');
                            }
                        });
                    });
                });
            });
        });

        describe('when address spent list size & balances size equal addresses size ', () => {
            describe('when key indexes are not provided', () => {
                it('should return address data object with index as address list index', () => {
                    const result = addressesUtils.formatAddressData(
                        addresses,
                        Array(3)
                            .fill()
                            .map((v, i) => i),
                        Array(3)
                            .fill()
                            .map(() => false),
                    );

                    addresses.forEach((address, index) => {
                        expect(result[address].index).to.equal(index);
                    });
                });

                it('should return address data object with spent as corresponding index in addressSpentStatus list', () => {
                    const addressesSpentStatus = [true, false, true];
                    const result = addressesUtils.formatAddressData(
                        addresses,
                        Array(3)
                            .fill()
                            .map((v, i) => i),
                        addressesSpentStatus,
                    );

                    addresses.forEach((address, index) => {
                        expect(result[address].spent).to.equal(addressesSpentStatus[index]);
                    });
                });

                it('should return address data object with balance as corresponding balance in balances list', () => {
                    const balances = [2, 3, 4];
                    const result = addressesUtils.formatAddressData(
                        addresses,
                        balances,
                        Array(3)
                            .fill()
                            .map((v, i) => i),
                    );

                    addresses.forEach((address, index) => {
                        expect(result[address].balance).to.equal(balances[index]);
                    });
                });

                it('should return address data object with checksum as valid address checksum', () => {
                    const balances = [2, 3, 4];
                    const result = addressesUtils.formatAddressData(
                        addresses,
                        balances,
                        Array(3)
                            .fill()
                            .map((v, i) => i),
                    );

                    addresses.forEach((address) => {
                        const checksum = result[address].checksum;
                        expect(iota.utils.isValidChecksum(`${address}${checksum}`)).to.equal(true);
                    });
                });
            });

            describe('when key indexes are provided', () => {
                it('should return address data object with index as corresponding index in keyIndexes list', () => {
                    const keyIndexes = [4, 6, 9];
                    const result = addressesUtils.formatAddressData(
                        addresses,
                        Array(3)
                            .fill()
                            .map((v, i) => i),
                        Array(3)
                            .fill()
                            .map(() => false),
                        keyIndexes,
                    );

                    addresses.forEach((address, index) => {
                        expect(result[address].index).to.not.equal(index);
                        expect(result[address].index).to.equal(keyIndexes[index]);
                    });
                });
            });
        });
    });

    describe('#syncAddresses', () => {
        let addressData;
        let seed;

        let sandbox;

        before(() => {
            addressData = accounts.accountInfo.TEST.addresses;
            seed = 'SEED';
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
                        .syncAddresses(seed, addressData, () => Promise.resolve('A'.repeat(81)))
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

                    const addressGenFn = sinon.stub();

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

                    return addressesUtils.syncAddresses(seed, addressData, addressGenFn).then((newAddressData) => {
                        expect(newAddressData).to.not.eql(addressData);

                        // Validate that all existing data is preserved
                        Object.keys(addressData).forEach((address) => {
                            expect(newAddressData[address]).to.eql(addressData[address]);
                        });

                        // Start index of new addresses will be
                        // the (highest index of address in existing address data + 1)
                        const startIndexForNewAddresses = maxBy(map(addressData, (data) => data), 'index').index + 1;

                        // Then check if all new addresses are merged and have correct properties
                        addresses.forEach((address, index) => {
                            const thisAddressData = newAddressData[address];

                            expect(thisAddressData.balance).to.equal(parseInt(balances[index]));
                            expect(thisAddressData.spent).to.equal(spentStatuses[index]);
                            expect(thisAddressData.index).to.equal(startIndexForNewAddresses + index);
                            expect(iota.utils.isValidChecksum(`${address}${thisAddressData.checksum}`)).to.equal(true);
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
                    .removeUnusedAddresses(lastAddressIndex, latestUnusedAddress, addresses)
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
                    .removeUnusedAddresses(lastAddressIndex, latestUnusedAddress, addresses)
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
                    .removeUnusedAddresses(lastAddressIndex, latestUnusedAddress, addresses)
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
        let seed;

        let sandbox;

        before(() => {
            seed = 'SEED';
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
            addressGenFn = sandbox.stub();

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
            return addressesUtils.getFullAddressHistory(seed, addressGenFn).then((history) => {
                expect(history.addresses).to.eql([...firstBatchOfAddresses, `${'A'.repeat(80)}9`]);
            });
        });

        it('should return transaction hashes associated with addresses', () => {
            return addressesUtils.getFullAddressHistory(seed, addressGenFn).then((history) => {
                expect(history.hashes).to.eql(['9'.repeat(81)]);
            });
        });

        it('should return balances associated with addresses', () => {
            return addressesUtils.getFullAddressHistory(seed, addressGenFn).then((history) => {
                expect(history.balances).to.eql([...firstBatchOfBalances.map((balance) => parseInt(balance)), 0]);
            });
        });

        it('should return spent statuses for addresses', () => {
            return addressesUtils.getFullAddressHistory(seed, addressGenFn).then((history) => {
                expect(history.wereSpent).to.eql([...firstBatchOfSpentStatuses, false]);
            });
        });
    });
});
