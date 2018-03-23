import { expect } from 'chai';
import {
    getAccountFromState,
    getAccountInfoFromState,
    getUnconfirmedBundleTailsFromState,
    getTxHashesForUnspentAddressesFromState,
    getPendingTxHashesForSpentAddressesFromState,
    selectedAccountStateFactory,
    selectFirstAddressFromAccountFactory,
    getAccountNamesFromState,
    getSeedIndexFromState,
    selectAccountInfo,
    getDeduplicatedTransfersForSelectedAccount,
    getAddressesForSelectedAccount,
    getBalanceForSelectedAccount,
    getSelectedAccountName,
} from '../../selectors/accounts';

describe('selectors: accounts', () => {
    describe('#getAccountFromState', () => {
        describe('when "account" prop is not defined in argument', () => {
            it('should return an empty object', () => {
                expect(getAccountFromState({ foo: {} })).to.eql({});
            });
        });

        describe('when "account" prop is defined in argument', () => {
            it('should return value for "account" prop', () => {
                expect(getAccountFromState({ foo: {}, account: { baz: {} } })).to.eql({ baz: {} });
            });
        });
    });

    describe('#getAccountInfoFromState', () => {
        describe('when "accountInfo" prop is not defined as a nested prop under "account" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getAccountInfoFromState({ account: { notAccountInfo: {} } })).to.eql({});
            });
        });

        describe('when "accountInfo" prop is defined as a nested prop under "account" prop in argument', () => {
            it('should return value for "account" prop', () => {
                expect(getAccountInfoFromState({ account: { accountInfo: { foo: {} } } })).to.eql({ foo: {} });
            });
        });
    });

    describe('#getUnconfirmedBundleTailsFromState', () => {
        describe('when "unconfirmedBundleTails" prop is not defined as a nested prop under "account" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getUnconfirmedBundleTailsFromState({ account: { foo: {} } })).to.eql({});
            });
        });

        describe('when "unconfirmedBundleTails" prop is defined as a nested prop under "account" prop in argument', () => {
            it('should return value for "unconfirmedBundleTails" prop', () => {
                expect(getUnconfirmedBundleTailsFromState({ account: { unconfirmedBundleTails: { foo: {} } } })).to.eql(
                    { foo: {} },
                );
            });
        });
    });

    describe('#getTxHashesForUnspentAddressesFromState', () => {
        describe('when "txHashesForUnspentAddresses" prop is not defined as a nested prop under "account" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getTxHashesForUnspentAddressesFromState({ account: { foo: {} } })).to.eql({});
            });
        });

        describe('when "txHashesForUnspentAddresses" prop is defined as a nested prop under "account" prop in argument', () => {
            it('should return value for "txHashesForUnspentAddresses" prop', () => {
                expect(
                    getTxHashesForUnspentAddressesFromState({ account: { txHashesForUnspentAddresses: { foo: {} } } }),
                ).to.eql({ foo: {} });
            });
        });
    });

    describe('#getPendingTxHashesForSpentAddressesFromState', () => {
        describe('when "pendingTxHashesForSpentAddresses" prop is not defined as a nested prop under "account" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getPendingTxHashesForSpentAddressesFromState({ account: { foo: {} } })).to.eql({});
            });
        });

        describe('when "pendingTxHashesForSpentAddresses" prop is defined as a nested prop under "account" prop in argument', () => {
            it('should return value for "pendingTxHashesForSpentAddresses" prop', () => {
                expect(
                    getPendingTxHashesForSpentAddressesFromState({
                        account: { pendingTxHashesForSpentAddresses: { foo: {} } },
                    }),
                ).to.eql({ foo: {} });
            });
        });
    });

    describe('#selectedAccountStateFactory', () => {
        let state;

        beforeEach(() => {
            state = {
                account: {
                    unconfirmedBundleTails: { foo: {} },
                    pendingTxHashesForSpentAddresses: { valid: [], invalid: [] },
                    txHashesForUnspentAddresses: { valid: [], invalid: [] },
                    accountInfo: {
                        valid: { transfers: [], addresses: {}, balance: 0 },
                        invalid: { transfers: [], addresses: {}, balance: 0 },
                    },
                },
                garbage: {},
            };
        });

        it('should return an object with props "transfers", "addresses", "balance", "unconfirmedBundleTails", "accountInfo", "txHashesForUnspentAddresses" and "pendingTxHashesForSpentAddresses"', () => {
            expect(selectedAccountStateFactory('valid')(state)).to.have.keys([
                'transfers',
                'addresses',
                'balance',
                'txHashesForUnspentAddresses',
                'pendingTxHashesForSpentAddresses',
                'unconfirmedBundleTails',
                'accountName',
            ]);
        });
    });

    describe('#selectFirstAddressFromAccountFactory', () => {
        let state;

        beforeEach(() => {
            state = {
                account: {
                    unconfirmedBundleTails: {},
                    pendingTxHashesForSpentAddresses: {},
                    txHashesForUnspentAddresses: {},
                    accountInfo: {
                        foo: {
                            transfers: [],
                            addresses: {
                                ['U'.repeat(81)]: { index: 0, balance: 0, spent: false },
                                ['A'.repeat(81)]: { index: 1, balance: 10, spent: false },
                            },
                            balance: 10,
                        },
                        baz: {
                            transfers: [],
                            addresses: {
                                addresses: {
                                    ['B'.repeat(81)]: { index: 0, balance: 20, spent: false },
                                },
                            },
                            balance: 20,
                        },
                    },
                },
                alerts: {},
            };
        });

        it('should return the address from selected account with index zero', () => {
            expect(selectFirstAddressFromAccountFactory('foo')(state)).to.equal('U'.repeat(81));
        });
    });

    describe('#getAccountNamesFromState', () => {
        describe('when "accountNames" prop is not defined as a nested prop under "account" prop in argument', () => {
            it('should return an empty array', () => {
                expect(getAccountNamesFromState({ account: { notAccountNames: [] } })).to.eql([]);
            });
        });

        describe('when "accountNames" prop is defined as a nested prop under "account" prop in argument', () => {
            it('should return value for "accountNames" prop', () => {
                expect(getAccountNamesFromState({ account: { accountNames: [{}, {}] } })).to.eql([{}, {}]);
            });
        });
    });

    describe('#getSeedIndexFromState', () => {
        describe('when "seedIndex" prop is not defined as a nested prop under "tempAccount" prop in argument', () => {
            it('should return 0', () => {
                expect(getSeedIndexFromState({ tempAccount: { notSeedIndex: 4 } })).to.equal(0);
            });
        });

        describe('when "seedIndex" prop is defined as a nested prop under "tempAccount" prop in argument', () => {
            it('should return value for "seedIndex" prop', () => {
                expect(getSeedIndexFromState({ tempAccount: { seedIndex: 3 } })).to.equal(3);
            });
        });
    });

    describe('#selectAccountInfo', () => {
        let state;

        beforeEach(() => {
            state = {
                account: {
                    accountInfo: {
                        foo: {
                            transfers: [],
                            addresses: {},
                            balance: 0,
                        },
                        baz: {
                            transfers: [],
                            addresses: {
                                addresses: {
                                    ['B'.repeat(81)]: { index: 0, balance: 20, spent: false },
                                },
                            },
                            balance: 20,
                        },
                    },
                    accountNames: ['foo', 'baz'],
                },
                tempAccount: {
                    seedIndex: 0,
                },
            };
        });

        it('should slice accountInfo with currently selected account name', () => {
            expect(selectAccountInfo(state)).to.eql({
                transfers: [],
                addresses: {},
                balance: 0,
            });
        });
    });

    describe('#getDeduplicatedTransfersForSelectedAccount', () => {
        describe('when "transfers" prop is not defined as a nested prop under selected account info object', () => {
            it('should return an empty array', () => {
                expect(
                    getDeduplicatedTransfersForSelectedAccount({
                        account: {
                            accountInfo: {
                                foo: {
                                    addresses: {},
                                    balance: 0,
                                },
                                baz: {
                                    addresses: {},
                                    balance: 0,
                                },
                            },
                            accountNames: ['foo', 'baz'],
                        },
                        tempAccount: {
                            seedIndex: 0,
                        },
                    }),
                ).to.eql([]);
            });
        });

        describe('when "transfers" prop is defined as a nested prop under selected account info object', () => {
            // Test deduplication for transfers separately
            it('should return transfers', () => {
                expect(
                    getDeduplicatedTransfersForSelectedAccount({
                        account: {
                            accountInfo: {
                                foo: {
                                    transfers: [
                                        [{ bundle: 'bundleOne', currentIndex: 0 }],
                                        [{ bundle: 'bundleTwo', currentIndex: 0 }],
                                    ],
                                    addresses: {},
                                    balance: 0,
                                },
                                baz: {
                                    transfers: [],
                                    addresses: {},
                                    balance: 0,
                                },
                            },
                            accountNames: ['foo', 'baz'],
                        },
                        tempAccount: {
                            seedIndex: 0,
                        },
                    }),
                ).to.eql([[{ bundle: 'bundleOne', currentIndex: 0 }], [{ bundle: 'bundleTwo', currentIndex: 0 }]]);
            });
        });
    });

    describe('#getAddressesForSelectedAccount', () => {
        describe('when "addresses" prop is not defined as a nested prop under selected account info object', () => {
            it('should return an empty array', () => {
                expect(
                    getAddressesForSelectedAccount({
                        account: {
                            accountInfo: {
                                foo: {
                                    transfers: [],
                                    balance: 0,
                                },
                                baz: {
                                    transfers: [],
                                    balance: 0,
                                },
                            },
                            accountNames: ['foo', 'baz'],
                        },
                        tempAccount: {
                            seedIndex: 0,
                        },
                    }),
                ).to.eql([]);
            });
        });

        describe('when "addresses" prop is defined as a nested prop under selected account info object', () => {
            it('should return list of addresses', () => {
                expect(
                    getAddressesForSelectedAccount({
                        account: {
                            accountInfo: {
                                foo: {
                                    transfers: [],
                                    addresses: {
                                        ['U'.repeat(81)]: {},
                                        ['A'.repeat(81)]: {},
                                    },
                                    balance: 0,
                                },
                                baz: {
                                    transfers: [],
                                    addresses: {},
                                    balance: 0,
                                },
                            },
                            accountNames: ['foo', 'baz'],
                        },
                        tempAccount: {
                            seedIndex: 0,
                        },
                    }),
                ).to.eql(['U'.repeat(81), 'A'.repeat(81)]);
            });
        });
    });

    describe('#getBalanceForSelectedAccount', () => {
        describe('when "balance" prop is not defined as a nested prop under selected account info object', () => {
            it('should return 0', () => {
                expect(
                    getBalanceForSelectedAccount({
                        account: {
                            accountInfo: {
                                foo: {
                                    transfers: [],
                                    addresses: {},
                                },
                                baz: {
                                    transfers: [],
                                    addresses: {},
                                },
                            },
                            accountNames: ['foo', 'baz'],
                        },
                        tempAccount: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal(0);
            });
        });

        describe('when "balance" prop is defined as a nested prop under selected account info object', () => {
            it('should return balance', () => {
                expect(
                    getBalanceForSelectedAccount({
                        account: {
                            accountInfo: {
                                foo: {
                                    transfers: [],
                                    addresses: {},
                                    balance: 10000,
                                },
                                baz: {
                                    transfers: [],
                                    addresses: {},
                                    balance: 10,
                                },
                            },
                            accountNames: ['foo', 'baz'],
                        },
                        tempAccount: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal(10000);
            });
        });
    });

    describe('#getSelectedAccountName', () => {
        let state;

        beforeEach(() => {
            state = {
                account: {
                    accountNames: ['foo', 'baz'],
                },
                tempAccount: {
                    seedIndex: 0,
                },
            };
        });

        it('should return account name for seed index', () => {
            expect(getSelectedAccountName(state)).to.equal('foo');
        });
    });
});
