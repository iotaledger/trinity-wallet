import { expect } from 'chai';
import { getAddressesWithChangedBalance, mergeLatestTransfersInOld } from '../../libs/accountUtils';

describe('libs: accountUtils', () => {
    describe('#getAddressesWithChangedBalance', () => {
        describe('when second argument array indices do not match indices of items in first argument array', () => {
            it('should return an empty array', () => {
                expect(getAddressesWithChangedBalance(['foo', 'baz'], [3, 4])).to.eql([]);
                expect(getAddressesWithChangedBalance(['foo', 'baz'], [])).to.eql([]);
            });
        });

        describe('when second argument array indices match indices of items in first argument array', () => {
            it('should return an array with items from first argument array', () => {
                expect(getAddressesWithChangedBalance(['foo', 'baz'], [0])).to.eql(['foo']);
                expect(getAddressesWithChangedBalance(['foo', 'baz'], [0, 1])).to.eql(['foo', 'baz']);
                expect(getAddressesWithChangedBalance(['foo', 'baz'], [1])).to.eql(['baz']);
            });
        });
    });

    describe('#mergeLatestTransfersInOld', () => {
        let oldTransfers;

        beforeEach(() => {
            oldTransfers = [
                [
                    { hash: 'fooHash', bundle: 'fooBundle', currentIndex: 0 },
                    { hash: 'bazHash', bundle: 'fooBundle', currentIndex: 1 },
                ],
                [
                    { hash: 'waldoHash', bundle: 'fooBundle', currentIndex: 0 },
                    { hash: 'defHash', bundle: 'fooBundle', currentIndex: 1 },
                ],
                [
                    { hash: 'corgeHash', bundle: 'corgeBundle', currentIndex: 0 },
                    { hash: 'graultHash', bundle: 'corgeBundle', currentIndex: 1 },
                ],
            ];
        });

        describe('when bundle exists in oldTransfers', () => {
            it('should replace the latestTransfers passed as second argument with objects in oldTransfers', () => {
                const latestTransfers = [
                    [
                        { hash: 'fooHash', bundle: 'fooBundle', currentIndex: 0 },
                        { hash: 'bazHash', bundle: 'fooBundle', currentIndex: 1 },
                        { hash: 'thudHash', bundle: 'fooBundle', currentIndex: 2 },
                    ],
                    [
                        { hash: 'waldoHash', bundle: 'fooBundle', currentIndex: 0 },
                        { hash: 'defHash', bundle: 'fooBundle', currentIndex: 1 },
                    ],
                ];

                const updatedTransfers = [
                    [
                        { hash: 'fooHash', bundle: 'fooBundle', currentIndex: 0 },
                        { hash: 'bazHash', bundle: 'fooBundle', currentIndex: 1 },
                        { hash: 'thudHash', bundle: 'fooBundle', currentIndex: 2 },
                    ],
                    [
                        { hash: 'waldoHash', bundle: 'fooBundle', currentIndex: 0 },
                        { hash: 'defHash', bundle: 'fooBundle', currentIndex: 1 },
                    ],
                    [
                        { hash: 'corgeHash', bundle: 'corgeBundle', currentIndex: 0 },
                        { hash: 'graultHash', bundle: 'corgeBundle', currentIndex: 1 },
                    ],
                ];

                expect(mergeLatestTransfersInOld(oldTransfers, latestTransfers)).to.eql(updatedTransfers);
            });
        });

        describe('when bundle does not exist in oldTransfers', () => {
            it('should add the latestTransfer bundle passed as second argument with objects in oldTransfers', () => {
                const latestTransfers = [
                    [
                        { hash: 'fooHash', bundle: 'henkBundle', currentIndex: 0 },
                        { hash: 'bazHash', bundle: 'henkBundle', currentIndex: 1 },
                        { hash: 'thudHash', bundle: 'henkBundle', currentIndex: 2 },
                    ],
                ];

                const updatedTransfers = [
                    [
                        { hash: 'fooHash', bundle: 'fooBundle', currentIndex: 0 },
                        { hash: 'bazHash', bundle: 'fooBundle', currentIndex: 1 },
                    ],
                    [
                        { hash: 'waldoHash', bundle: 'fooBundle', currentIndex: 0 },
                        { hash: 'defHash', bundle: 'fooBundle', currentIndex: 1 },
                    ],
                    [
                        { hash: 'corgeHash', bundle: 'corgeBundle', currentIndex: 0 },
                        { hash: 'graultHash', bundle: 'corgeBundle', currentIndex: 1 },
                    ],
                    [
                        { hash: 'fooHash', bundle: 'henkBundle', currentIndex: 0 },
                        { hash: 'bazHash', bundle: 'henkBundle', currentIndex: 1 },
                        { hash: 'thudHash', bundle: 'henkBundle', currentIndex: 2 },
                    ],
                ];

                expect(mergeLatestTransfersInOld(oldTransfers, latestTransfers)).to.eql(updatedTransfers);
            });
        });
    });
});
