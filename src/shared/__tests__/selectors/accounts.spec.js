import keys from 'lodash/keys';
import { expect } from 'chai';
import {
    getAccountsFromState,
    getAccountInfoFromState,
    selectedAccountStateFactory,
    getAccountNamesFromState,
    selectAccountInfo,
    getTransactionsForSelectedAccount,
    getAddressesForSelectedAccount,
    getBalanceForSelectedAccount,
    getSelectedAccountName,
    getSetupInfoFromAccounts,
    getTasksFromAccounts,
    getSetupInfoForSelectedAccount,
    getTasksForSelectedAccount,
    shouldTransitionForSnapshot,
    hasDisplayedSnapshotTransitionGuide,
    selectLatestAddressFromAccountFactory,
    getSelectedAccountType,
    getPromotableBundlesFromState,
    getAccountInfoDuringSetup,
    isSettingUpNewAccount,
} from '../../selectors/accounts';
import accounts from '../__samples__/accounts';
import addresses, { latestAddressWithoutChecksum, latestAddressWithChecksum, balance } from '../__samples__/addresses';
import { normalisedTransactions, promotableBundleHashes } from '../__samples__/transactions';

describe('selectors: accounts', () => {
    describe('#getAccountsFromState', () => {
        describe('when "accounts" prop is not defined in argument', () => {
            it('should return an empty object', () => {
                expect(getAccountsFromState({})).to.eql({});
            });
        });

        describe('when "accounts" prop is defined in argument', () => {
            it('should return value for "accounts" prop', () => {
                expect(getAccountsFromState({ accounts })).to.eql(accounts);
            });
        });
    });

    describe('#getAccountInfoFromState', () => {
        describe('when "accountInfo" prop is not defined as a nested prop under "accounts" prop', () => {
            it('should return an empty object', () => {
                expect(getAccountInfoFromState({ accounts: { notAccountInfo: {} } })).to.eql({});
            });
        });

        describe('when "accountInfo" prop is defined as a nested prop under "accounts" prop', () => {
            it('should return value for "accounts" prop', () => {
                expect(getAccountInfoFromState({ accounts })).to.eql(accounts.accountInfo);
            });
        });
    });

    describe('#getAccountNamesFromState', () => {
        describe('when "accountInfo" prop is not defined as a nested prop under "accounts" prop', () => {
            it('should return an empty array', () => {
                expect(getAccountNamesFromState({ accounts: { notAccountInfo: [] } })).to.eql([]);
            });
        });

        describe('when "accountInfo" prop is defined as a nested prop under "accounts" prop', () => {
            it('should return value for "accountNames" prop', () => {
                expect(getAccountNamesFromState({ accounts })).to.eql(['TEST']);
            });
        });
    });

    describe('#getSelectedAccountName', () => {
        let state;

        beforeEach(() => {
            state = {
                accounts,
                wallet: {
                    seedIndex: 0,
                },
            };
        });

        it('should return account name for seed index', () => {
            expect(getSelectedAccountName(state)).to.equal('TEST');
        });
    });

    describe('#selectAccountInfo', () => {
        let state;

        beforeEach(() => {
            state = {
                accounts,
                wallet: {
                    seedIndex: 0,
                },
            };
        });

        it('should slice accountInfo with currently selected account name', () => {
            expect(selectAccountInfo(state)).to.eql(accounts.accountInfo.TEST);
        });
    });

    describe('#getAccountNamesFromState', () => {
        describe('when "accountInfo" prop is not defined as a nested prop under "accounts" prop in argument', () => {
            it('should return an empty array', () => {
                expect(getAccountNamesFromState({ accounts: { notAccountInfo: [] } })).to.eql([]);
            });
        });

        describe('when "accountInfo" prop is defined as a nested prop under "accounts" prop in argument', () => {
            it('should return sorted account names by indes', () => {
                expect(
                    getAccountNamesFromState({ accounts: { accountInfo: { a: { index: 1 }, b: { index: 0 } } } }),
                ).to.eql(['b', 'a']);
            });
        });
    });

    describe('#selectLatestAddressFromAccountFactory', () => {
        let state;

        beforeEach(() => {
            state = {
                accounts,
                wallet: {
                    seedIndex: 0,
                },
            };
        });

        describe('when withChecksum is true', () => {
            it('should return latest address (highest index) with checksum for provided account', () => {
                expect(selectLatestAddressFromAccountFactory()(state)).to.equal(latestAddressWithChecksum);
            });
        });

        describe('when withChecksum is false', () => {
            it('should return latest address (highest index) without checksum for provided account', () => {
                const latestAddress = selectLatestAddressFromAccountFactory(false)(state);

                expect(latestAddress).to.not.equal(latestAddressWithChecksum);
                expect(latestAddress).to.equal(latestAddressWithoutChecksum);
            });
        });
    });

    describe('#getSelectedAccountType', () => {
        describe('when "type" prop is undefined', () => {
            it('should return "keychain"', () => {
                const type = getSelectedAccountType({
                    accounts: { accountInfo: { foo: {} } },
                    wallet: { seedIndex: 0 },
                });

                expect(type).to.eql('keychain');
            });
        });

        describe('when "type" prop is defined', () => {
            it('should return type', () => {
                const type = getSelectedAccountType({
                    accounts,
                    wallet: { seedIndex: 0 },
                });

                expect(type).to.eql('ledger');
            });
        });
    });

    describe('#selectedAccountStateFactory', () => {
        let state;

        beforeEach(() => {
            state = {
                accounts,
                garbage: {},
            };
        });

        it('should return an object with props "transactions", "addressData", "type" and "accountName"', () => {
            expect(selectedAccountStateFactory('TEST')(state)).to.have.keys([
                'transactions',
                'addressData',
                'type',
                'accountName',
            ]);
        });
    });

    describe('#getTransactionsForSelectedAccount', () => {
        it('should return normalised transaction', () => {
            expect(
                getTransactionsForSelectedAccount({
                    accounts,
                    wallet: {
                        seedIndex: 0,
                    },
                }),
            ).to.eql(normalisedTransactions);
        });
    });

    describe('#getAddressesForSelectedAccount', () => {
        it('should return list of addresses', () => {
            expect(
                getAddressesForSelectedAccount({
                    accounts,
                    wallet: {
                        seedIndex: 0,
                    },
                }),
            ).to.eql(addresses);
        });
    });

    describe('#getBalanceForSelectedAccount', () => {
        it('should return total balance on addresses', () => {
            expect(
                getBalanceForSelectedAccount({
                    accounts,
                    wallet: {
                        seedIndex: 0,
                    },
                }),
            ).to.equal(balance);
        });
    });

    describe('#getSetupInfoFromAccounts', () => {
        describe('when "setupInfo" prop is not defined as a nested prop under "accounts" reducer', () => {
            it('should return an empty object', () => {
                expect(getSetupInfoFromAccounts({ accounts: {} })).to.eql({});
            });
        });

        describe('when "setupInfo" prop is defined as a nested prop under "accounts" reducer', () => {
            it('should return value for "setupInfo" prop', () => {
                expect(getSetupInfoFromAccounts({ accounts })).to.eql(accounts.setupInfo);
            });
        });
    });

    describe('#getAccountInfoDuringSetup', () => {
        it('should return value for "accountInfoDuringSetup" prop', () => {
            expect(getAccountInfoDuringSetup({ accounts: { accountInfoDuringSetup: { foo: {} } } })).to.eql({
                foo: {},
            });
        });
    });

    describe('#getTasksFromAccounts', () => {
        describe('when "tasks" prop is not defined as a nested prop under "accounts" reducer', () => {
            it('should return an empty object', () => {
                expect(getTasksFromAccounts({ accounts: {} })).to.eql({});
            });
        });

        describe('when "tasks" prop is defined as a nested prop under "accounts" reducer', () => {
            it('should return value for "tasks" prop', () => {
                expect(getTasksFromAccounts({ accounts })).to.eql(accounts.tasks);
            });
        });
    });

    describe('#getSetupInfoForSelectedAccount', () => {
        it('should return account setup info for selected account', () => {
            expect(
                getSetupInfoForSelectedAccount({
                    accounts,
                    wallet: {
                        seedIndex: 0,
                    },
                }),
            ).to.eql(accounts.setupInfo.TEST);
        });
    });

    describe('#getTasksForSelectedAccount', () => {
        it('should return tasks for selected account', () => {
            expect(
                getTasksForSelectedAccount({
                    accounts,
                    wallet: {
                        seedIndex: 0,
                    },
                }),
            ).to.eql(accounts.tasks.TEST);
        });
    });

    describe('#shouldTransitionForSnapshot', () => {
        describe('when "usedExistingSeed" prop under "setupInfo" is false and balance is 0', () => {
            it('should return false', () => {
                expect(
                    shouldTransitionForSnapshot({
                        accounts: {
                            accountInfo: {
                                foo: {
                                    // Set address data as empty so that balance is zero
                                    addressData: [],
                                },
                            },
                            setupInfo: { foo: { usedExistingSeed: false } },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal(false);
            });
        });

        describe('when "usedExistingSeed" prop under "setupInfo" is true and balance is not 0', () => {
            it('should return false', () => {
                expect(
                    shouldTransitionForSnapshot({
                        accounts,
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal(false);
            });
        });

        describe('when "usedExistingSeed" prop under "setupInfo" is true and balance is 0', () => {
            it('should return true', () => {
                expect(
                    shouldTransitionForSnapshot({
                        accounts: {
                            accountInfo: {
                                foo: {
                                    addressData: [],
                                },
                            },
                            setupInfo: { foo: { usedExistingSeed: true } },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal(true);
            });
        });
    });

    describe('#hasDisplayedSnapshotTransitionGuide', () => {
        describe('when "displayedSnapshotTransitionGuide" prop under "tasks" is not defined', () => {
            it('should return true', () => {
                expect(
                    hasDisplayedSnapshotTransitionGuide({
                        accounts: {
                            accountInfo: {
                                foo: {},
                            },
                            tasks: {
                                foo: { unknownProp: false },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal(true);
            });
        });

        describe('when "displayedSnapshotTransitionGuide" prop under "tasks" is defined', () => {
            it('should return value of "displayedSnapshotTransitionGuide"', () => {
                expect(
                    hasDisplayedSnapshotTransitionGuide({
                        accounts: {
                            accountInfo: {
                                foo: {},
                            },
                            tasks: {
                                // Set hasDisplayedTransitionGuide to string instead of boolean
                                // to check for false positives
                                foo: { displayedSnapshotTransitionGuide: 'raw' },
                            },
                        },
                        wallet: {
                            seedIndex: 0,
                        },
                    }),
                ).to.equal('raw');
            });
        });
    });

    describe('#getPromotableBundlesFromState', () => {
        it('should unconfirmed bundle hashes', () => {
            const promotableBundles = getPromotableBundlesFromState({
                accounts,
                wallet: {
                    seedIndex: 0,
                },
            });

            expect(keys(promotableBundles)).to.eql(promotableBundleHashes);
        });
    });

    describe('#isSettingUpNewAccount', () => {
        describe('when accountInfoDuringSetup.name is empty', () => {
            describe('when accountInfoDuringSetup.meta is not empty', () => {
                describe('when accountInfoDuringSetup.completed is false', () => {
                    it('should return false', () => {
                        expect(
                            isSettingUpNewAccount({
                                accounts: {
                                    accountInfoDuringSetup: {
                                        name: '',
                                        meta: { foo: {} },
                                        completed: false,
                                    },
                                },
                            }),
                        ).to.equal(false);
                    });
                });
            });
        });

        describe('when accountInfoDuringSetup.name is not empty', () => {
            describe('when accountInfoDuringSetup.meta is empty', () => {
                describe('when accountInfoDuringSetup.completed is true', () => {
                    it('should return false', () => {
                        expect(
                            isSettingUpNewAccount({
                                accounts: {
                                    accountInfoDuringSetup: {
                                        name: 'foo',
                                        meta: {},
                                        completed: true,
                                    },
                                },
                            }),
                        ).to.equal(false);
                    });
                });
            });
        });

        describe('when accountInfoDuringSetup.name is not empty', () => {
            describe('when accountInfoDuringSetup.meta is not empty', () => {
                describe('when accountInfoDuringSetup.completed is false', () => {
                    it('should return false', () => {
                        expect(
                            isSettingUpNewAccount({
                                accounts: {
                                    accountInfoDuringSetup: {
                                        name: 'foo',
                                        meta: { foo: {} },
                                        completed: false,
                                    },
                                },
                            }),
                        ).to.equal(false);
                    });
                });
            });
        });

        describe('when accountInfoDuringSetup.name is not empty', () => {
            describe('when accountInfoDuringSetup.meta is not empty', () => {
                describe('when accountInfoDuringSetup.completed is true', () => {
                    it('should return true', () => {
                        expect(
                            isSettingUpNewAccount({
                                accounts: {
                                    accountInfoDuringSetup: {
                                        name: 'foo',
                                        meta: { baz: {} },
                                        completed: true,
                                    },
                                },
                            }),
                        ).to.equal(true);
                    });
                });
            });
        });
    });
});
