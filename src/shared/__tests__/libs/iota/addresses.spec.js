import merge from 'lodash/merge';
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
            sandbox.stub(iota.api, 'wereAddressesSpentFrom').yields(null, []);
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('when current latest address is not blacklisted', () => {
            it('should return current latest address', () => {
                const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, []);

                return addressesUtils
                    .getAddressesUptoRemainder(addressData, seed, () => Promise.resolve([]), [
                        'Z'.repeat(81),
                        'I'.repeat(81),
                    ])
                    .then(({ remainderAddress }) => {
                        expect(remainderAddress).to.equal(
                            'NNLAKCEDT9FMFLBIFWKHRIQJJETOSBSFPUCBWYYXXYKSLNCCSWOQRAVOYUSX9FMLGHMKUITLFEQIPHQLW',
                        );

                        findTransactions.restore();
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
                        });
                });

                it('should generate new addresses and merge it in address data', () => {
                    const addressGenFn = sinon.stub();

                    addressGenFn.onCall(0).resolves('U'.repeat(81));

                    const findTransactions = sinon.stub(iota.api, 'findTransactions').yields(null, []);

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
                        });
                });
            });

            describe('when newly generated address is blacklisted', () => {
                it('should recursively generate new addresses till latest unused is not part of the blacklisted addresses list', () => {
                    const addressGenFn = sinon.stub();

                    const findTransactions = sinon.stub(iota.api, 'findTransactions');

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
                                    balance: 0,
                                    spent: false,
                                },
                                ['Y'.repeat(81)]: {
                                    index: 7,
                                    checksum: 'MHXTFTEBX',
                                    balance: 0,
                                    spent: false,
                                },
                                ['Z'.repeat(81)]: {
                                    index: 8,
                                    checksum: '9JTQPKDGC',
                                    balance: 0,
                                    spent: false,
                                },
                            });

                            expect(addressDataUptoRemainder).to.eql(expectedAddressData);

                            findTransactions.restore();
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
});
