import { expect } from 'chai';
import {
    getAccountsFromState,
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
    describe('#getAccountsFromState', () => {
        describe('when "accounts" prop is not defined in argument', () => {
            it('should return an empty object', () => {
                expect(getAccountsFromState({ foo: {} })).to.eql({});
            });
        });

        describe('when "accounts" prop is defined in argument', () => {
            it('should return value for "accounts" prop', () => {
                expect(getAccountsFromState({ foo: {}, accounts: { baz: {} } })).to.eql({ baz: {} });
            });
        });
    });

    describe('#getAccountInfoFromState', () => {
        describe('when "accountInfo" prop is not defined as a nested prop under "accounts" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getAccountInfoFromState({ accounts: { notAccountInfo: {} } })).to.eql({});
            });
        });

        describe('when "accountInfo" prop is defined as a nested prop under "accounts" prop in argument', () => {
            it('should return value for "accounts" prop', () => {
                expect(getAccountInfoFromState({ accounts: { accountInfo: { foo: {} } } })).to.eql({ foo: {} });
            });
        });
    });

    describe('#getUnconfirmedBundleTailsFromState', () => {
        describe('when "unconfirmedBundleTails" prop is not defined as a nested prop under "accounts" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getUnconfirmedBundleTailsFromState({ accounts: { foo: {} } })).to.eql({});
            });
        });

        describe('when "unconfirmedBundleTails" prop is defined as a nested prop under "accounts" prop in argument', () => {
            it('should return value for "unconfirmedBundleTails" prop', () => {
                expect(
                    getUnconfirmedBundleTailsFromState({ accounts: { unconfirmedBundleTails: { foo: {} } } }),
                ).to.eql({ foo: {} });
            });
        });
    });

    describe('#getTxHashesForUnspentAddressesFromState', () => {
        describe('when "txHashesForUnspentAddresses" prop is not defined as a nested prop under "accounts" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getTxHashesForUnspentAddressesFromState({ accounts: { foo: {} } })).to.eql({});
            });
        });

        describe('when "txHashesForUnspentAddresses" prop is defined as a nested prop under "accounts" prop in argument', () => {
            it('should return value for "txHashesForUnspentAddresses" prop', () => {
                expect(
                    getTxHashesForUnspentAddressesFromState({ accounts: { txHashesForUnspentAddresses: { foo: {} } } }),
                ).to.eql({ foo: {} });
            });
        });
    });

    describe('#getPendingTxHashesForSpentAddressesFromState', () => {
        describe('when "pendingTxHashesForSpentAddresses" prop is not defined as a nested prop under "accounts" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getPendingTxHashesForSpentAddressesFromState({ accounts: { foo: {} } })).to.eql({});
            });
        });

        describe('when "pendingTxHashesForSpentAddresses" prop is defined as a nested prop under "accounts" prop in argument', () => {
            it('should return value for "pendingTxHashesForSpentAddresses" prop', () => {
                expect(
                    getPendingTxHashesForSpentAddressesFromState({
                        accounts: { pendingTxHashesForSpentAddresses: { foo: {} } },
                    }),
                ).to.eql({ foo: {} });
            });
        });
    });

    describe('#selectedAccountStateFactory', () => {
        let state;

        beforeEach(() => {
            state = {
                accounts: {
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
                accounts: {
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
        describe('when "accountNames" prop is not defined as a nested prop under "accounts" prop in argument', () => {
            it('should return an empty array', () => {
                expect(getAccountNamesFromState({ accounts: { notAccountNames: [] } })).to.eql([]);
            });
        });

        describe('when "accountNames" prop is defined as a nested prop under "accounts" prop in argument', () => {
            it('should return value for "accountNames" prop', () => {
                expect(getAccountNamesFromState({ accounts: { accountNames: [{}, {}] } })).to.eql([{}, {}]);
            });
        });
    });

    describe('#getSeedIndexFromState', () => {
        describe('when "seedIndex" prop is not defined as a nested prop under "wallet" prop in argument', () => {
            it('should return 0', () => {
                expect(getSeedIndexFromState({ wallet: { notSeedIndex: 4 } })).to.equal(0);
            });
        });

        describe('when "seedIndex" prop is defined as a nested prop under "wallet" prop in argument', () => {
            it('should return value for "seedIndex" prop', () => {
                expect(getSeedIndexFromState({ wallet: { seedIndex: 3 } })).to.equal(3);
            });
        });
    });

    describe('#selectAccountInfo', () => {
        let state;

        beforeEach(() => {
            state = {
                accounts: {
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
                wallet: {
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
                        accounts: {
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
                        wallet: {
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
                        accounts: {
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
                        wallet: {
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
                        accounts: {
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
                        wallet: {
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
                        accounts: {
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
                        wallet: {
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
                        accounts: {
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
                        wallet: {
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
                        accounts: {
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
                        wallet: {
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
                accounts: {
                    accountNames: ['foo', 'baz'],
                },
                wallet: {
                    seedIndex: 0,
                },
            };
        });

        it('should return account name for seed index', () => {
            expect(getSelectedAccountName(state)).to.equal('foo');
        });
    });
});
