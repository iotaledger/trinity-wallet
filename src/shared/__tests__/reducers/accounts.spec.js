import { expect } from 'chai';
import reducer from '../../reducers/accounts';
import * as actions from '../../actions/accounts';

describe('Reducer: accounts', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                seedCount: 0,
                accountNames: [],
                firstUse: true,
                onboardingComplete: false,
                accountInfo: {},
                setupInfo: {},
                tasks: {},
                unconfirmedBundleTails: {},
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe('UPDATE_UNCONFIRMED_BUNDLE_TAILS', () => {
        it('should assign payload to unconfirmedBundleTails prop in state', () => {
            const initialState = {
                unconfirmedBundleTails: { foo: 'baz' },
            };

            const action = actions.updateUnconfirmedBundleTails({
                foo: 'bar',
                baz: null,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                unconfirmedBundleTails: { foo: 'bar', baz: null },
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS', () => {
        it('should remove payload from "unconfirmedBundleTails"', () => {
            const initialState = {
                unconfirmedBundleTails: { foo: 'baz' },
            };

            const action = actions.removeBundleFromUnconfirmedBundleTails('foo');

            const newState = reducer(initialState, action);
            const expectedState = {
                unconfirmedBundleTails: {},
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_NEW_UNCONFIRMED_BUNDLE_TAILS', () => {
        it('should set payload to "unconfirmedBundleTails"', () => {
            const initialState = {
                unconfirmedBundleTails: { foo: 'baz' },
            };

            const action = actions.setNewUnconfirmedBundleTails({ foo: null, baz: null });

            const newState = reducer(initialState, action);
            const expectedState = {
                unconfirmedBundleTails: { foo: null, baz: null },
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('CHANGE_ACCOUNT_NAME', () => {
        it('should update account name in "accountInfo" state prop', () => {
            const initialState = {
                accountInfo: {
                    foo: {},
                    baz: {},
                },
            };

            const action = actions.changeAccountName({
                oldAccountName: 'foo',
                newAccountName: 'bar',
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    bar: {},
                    baz: {},
                },
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should update account name in "tasks" state prop', () => {
            const initialState = {
                tasks: {
                    foo: {},
                    baz: {},
                },
            };

            const action = actions.changeAccountName({
                oldAccountName: 'foo',
                newAccountName: 'bar',
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                tasks: {
                    bar: {},
                    baz: {},
                },
            };

            expect(newState.tasks).to.eql(expectedState.tasks);
        });

        it('should update account name in "setupInfo" state prop', () => {
            const initialState = {
                setupInfo: {
                    foo: {},
                    baz: {},
                },
            };

            const action = actions.changeAccountName({
                oldAccountName: 'foo',
                newAccountName: 'bar',
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                setupInfo: {
                    bar: {},
                    baz: {},
                },
            };

            expect(newState.setupInfo).to.eql(expectedState.setupInfo);
        });

        it('should update account name in "accountNames" state prop', () => {
            const initialState = {
                accountNames: ['foo', 'baz'],
            };

            const action = actions.changeAccountName({
                oldAccountName: 'foo',
                newAccountName: 'bar',
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountNames: ['bar', 'baz'],
            };

            expect(newState.accountNames).to.eql(expectedState.accountNames);
        });

        it('should update account prop for each tail transaction with new account name in "unconfirmedBundleTails" state prop', () => {
            const initialState = {
                unconfirmedBundleTails: {
                    bundleOne: [{ account: 'foo', hash: '9'.repeat(81) }, { account: 'foo', hash: '9'.repeat(81) }],
                    bundleTwo: [{ account: 'foo', hash: '9'.repeat(81) }, { account: 'foo', hash: '9'.repeat(81) }],
                    bundleThree: [{ account: 'baz', hash: '9'.repeat(81) }, { account: 'baz', hash: '9'.repeat(81) }],
                },
            };

            const action = actions.changeAccountName({
                oldAccountName: 'foo',
                newAccountName: 'bar',
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                unconfirmedBundleTails: {
                    bundleOne: [{ account: 'bar', hash: '9'.repeat(81) }, { account: 'bar', hash: '9'.repeat(81) }],
                    bundleTwo: [{ account: 'bar', hash: '9'.repeat(81) }, { account: 'bar', hash: '9'.repeat(81) }],
                    bundleThree: [{ account: 'baz', hash: '9'.repeat(81) }, { account: 'baz', hash: '9'.repeat(81) }],
                },
            };

            expect(newState.unconfirmedBundleTails).to.eql(expectedState.unconfirmedBundleTails);
        });
    });

    describe('REMOVE_ACCOUNT', () => {
        it('should omit payload prop from "accountInfo"', () => {
            const initialState = {
                accountInfo: { foo: {} },
            };

            const action = actions.removeAccount('foo');

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {},
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should omit payload prop from "tasks"', () => {
            const initialState = {
                tasks: { foo: {} },
            };

            const action = actions.removeAccount('foo');

            const newState = reducer(initialState, action);
            const expectedState = {
                tasks: {},
            };

            expect(newState.tasks).to.eql(expectedState.tasks);
        });

        it('should omit payload prop from "setupInfo"', () => {
            const initialState = {
                setupInfo: { foo: {} },
            };

            const action = actions.removeAccount('foo');

            const newState = reducer(initialState, action);
            const expectedState = {
                setupInfo: {},
            };

            expect(newState.setupInfo).to.eql(expectedState.setupInfo);
        });

        it('should remove payload from accountNames array', () => {
            const initialState = {
                accountNames: ['foo', 'baz'],
            };

            const action = actions.removeAccount('foo');

            const newState = reducer(initialState, action);
            const expectedState = {
                accountNames: ['baz'],
            };

            expect(newState.accountNames).to.eql(expectedState.accountNames);
        });

        it('should subtract one from seedCount', () => {
            const initialState = {
                seedCount: 1,
            };

            const action = actions.removeAccount('foo');

            const newState = reducer(initialState, action);
            const expectedState = {
                seedCount: 0,
            };

            expect(newState.seedCount).to.eql(expectedState.seedCount);
        });

        it('should omit all keys from "unconfirmedBundleTails" that have any "account" prop equal to "payload" prop in action', () => {
            const initialState = {
                unconfirmedBundleTails: {
                    foo: [{ account: 'account-one' }, { account: 'account-one' }],
                    baz: [{ account: 'account-one' }, { account: 'account-one' }],
                    bar: [{ account: 'account-two' }, { account: 'account-two' }],
                },
            };

            const action = actions.removeAccount('account-one');

            const newState = reducer(initialState, action);
            const expectedState = {
                unconfirmedBundleTails: {
                    bar: [{ account: 'account-two' }, { account: 'account-two' }],
                },
            };

            expect(newState.unconfirmedBundleTails).to.eql(expectedState.unconfirmedBundleTails);
        });
    });

    describe('SET_FIRST_USE', () => {
        it('should set firstUse to payload', () => {
            const initialState = {
                firstUse: false,
            };

            const action = actions.setFirstUse(true);

            const newState = reducer(initialState, action);
            const expectedState = {
                firstUse: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_ONBOARDING_COMPLETE', () => {
        it('should set onboardingComplete to payload', () => {
            const initialState = {
                onboardingComplete: false,
            };

            const action = actions.setOnboardingComplete(true);

            const newState = reducer(initialState, action);
            const expectedState = {
                onboardingComplete: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('INCREASE_SEED_COUNT', () => {
        it('should increment seedCount by one', () => {
            const initialState = {
                seedCount: 4,
            };

            const action = actions.increaseSeedCount();

            const newState = reducer(initialState, action);
            const expectedState = {
                seedCount: 5,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('ADD_SEED_NAME', () => {
        it('should concat accountName to list of accountNames in state', () => {
            const initialState = {
                accountNames: ['foo'],
            };

            const action = actions.addAccountName('baz');

            const newState = reducer(initialState, action);
            const expectedState = {
                accountNames: ['foo', 'baz'],
            };

            expect(newState).to.not.eql(['baz', 'foo']);
            expect(newState).to.eql(expectedState);
        });
    });

    describe('MANUAL_SYNC_SUCCESS', () => {
        it('should remove all bundle hashes that have any element in array with "account" prop equals "accountName" in payload', () => {
            const initialState = {
                unconfirmedBundleTails: {
                    foo: [{ account: 'to-be-deleted' }],
                    baz: [{ account: 'not-to-be-deleted' }],
                },
            };

            const action = actions.manualSyncSuccess({ unconfirmedBundleTails: {}, accountName: 'to-be-deleted' });

            const newState = reducer(initialState, action);
            const expectedState = {
                unconfirmedBundleTails: { baz: [{ account: 'not-to-be-deleted' }] },
            };

            expect(newState.unconfirmedBundleTails).to.eql(expectedState.unconfirmedBundleTails);
        });

        it('should merge "unconfirmedBundleTails" prop in payload to "unconfirmedBundleTails" prop in state after deleting existing tail transactions associated with account', () => {
            const initialState = {
                unconfirmedBundleTails: {
                    foo: [{ account: 'main', toBeDeletedMeta: {} }],
                    baz: [{ account: 'secondary' }],
                },
            };

            const action = actions.manualSyncSuccess({
                unconfirmedBundleTails: { foo: [{ account: 'main' }, { account: 'main' }] },
                accountName: 'main',
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                unconfirmedBundleTails: {
                    foo: [{ account: 'main' }, { account: 'main' }],
                    baz: [{ account: 'secondary' }],
                },
            };

            expect(newState.unconfirmedBundleTails).to.eql(expectedState.unconfirmedBundleTails);
        });

        it('should set addresses in payload to "addresses" prop under accountName in accountInfo', () => {
            const initialState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {} },
                    },
                },
            };

            const action = actions.manualSyncSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        addresses: { baz: {} },
                    },
                },
            };

            expect(newState.accountInfo.addresses).to.eql(expectedState.accountInfo.addresses);
        });

        it('should set hashes in payload to "hashes" prop under accountName in accountInfo', () => {
            const initialState = {
                accountInfo: {
                    foo: {
                        hashes: ['baz'],
                    },
                },
            };

            const action = actions.manualSyncSuccess({
                accountName: 'foo',
                hashes: ['baz', 'bar'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        hashes: ['baz', 'bar'],
                    },
                },
            };

            expect(newState.accountInfo.hashes).to.eql(expectedState.accountInfo.hashes);
        });

        it('should set "transfers" and "balance" props in payload to "transfers" and "balance" props under accountName in accountInfo', () => {
            const initialState = {
                accountInfo: {
                    foo: {
                        transfers: [[{}, {}], [{}, {}]],
                        balance: 0,
                    },
                },
            };

            const action = actions.manualSyncSuccess({
                accountName: 'foo',
                transfers: [[{}, {}], [{}, {}], [{}, {}]],
                balance: 100,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        transfers: [[{}, {}], [{}, {}], [{}, {}]],
                        balance: 100,
                    },
                },
            };

            expect(newState.accountInfo.transfers).to.eql(expectedState.accountInfo.transfers);
            expect(newState.accountInfo.balance).to.eql(expectedState.accountInfo.balance);
        });
    });

    describe('FULL_ACCOUNT_INFO_FIRST_SEED_FETCH_SUCCESS', () => {
        it('should merge unconfirmedBundleTails in payload to unconfirmedBundleTails in state', () => {
            const initialState = {
                unconfirmedBundleTails: { foo: {} },
            };

            const action = actions.fullAccountInfoFirstSeedFetchSuccess({ unconfirmedBundleTails: { baz: {} } });

            const newState = reducer(initialState, action);
            const expectedState = {
                unconfirmedBundleTails: { baz: {}, foo: {} },
            };

            expect(newState.unconfirmedBundleTails).to.eql(expectedState.unconfirmedBundleTails);
        });

        it('should merge addresses in payload to accountName in accountInfo', () => {
            const initialState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {} },
                        transfers: [],
                        balance: 0,
                    },
                },
            };

            const action = actions.fullAccountInfoFirstSeedFetchSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
                transfers: [{}],
                balance: 100,
                hashes: [],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {}, baz: {} },
                        transfers: [{}],
                        balance: 100,
                        hashes: [],
                    },
                },
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should set transfers and balance in payload to accountName in accountInfo', () => {
            const initialState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {} },
                        transfers: [[{}, {}], [{}, {}], [{}, {}]],
                        balance: 0,
                    },
                },
            };

            const action = actions.fullAccountInfoFirstSeedFetchSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
                transfers: [[{}, {}], [{}, {}]],
                balance: 100,
                hashes: [],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {}, baz: {} },
                        transfers: [[{}, {}], [{}, {}]],
                        balance: 100,
                        hashes: [],
                    },
                },
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should set hashes in payload to accountName in accountInfo', () => {
            const initialState = {
                accountInfo: {
                    foo: {
                        balance: 0,
                        transfers: {},
                        addresses: {},
                        hashes: ['baz'],
                    },
                },
            };

            const action = actions.fullAccountInfoFirstSeedFetchSuccess({
                accountName: 'foo',
                hashes: ['baz', 'bar'],
                transfers: {},
                balance: 0,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        balance: 0,
                        transfers: {},
                        addresses: {},
                        hashes: ['baz', 'bar'],
                    },
                },
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should set firstUse in state to false', () => {
            const initialState = {
                firstUse: true,
            };

            const action = actions.fullAccountInfoFirstSeedFetchSuccess({ accountName: 'foo' }); // Would break if accountName is missing

            const newState = reducer(initialState, action);
            const expectedState = {
                firstUse: false,
            };

            expect(newState.firstUse).to.eql(expectedState.firstUse);
        });
    });

    describe('FULL_ACCOUNT_INFO_ADDITIONAL_SEED_FETCH_SUCCESS', () => {
        it('should merge addresses in payload to accountName in accountInfo', () => {
            const initialState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {} },
                        transfers: [],
                        balance: 0,
                    },
                },
                accountNames: [],
                seedCount: 0,
            };

            const action = actions.fullAccountInfoAdditionalSeedFetchSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
                transfers: [{}],
                balance: 100,
                hashes: [],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {}, baz: {} },
                        transfers: [{}],
                        balance: 100,
                        hashes: [],
                    },
                },
                accountNames: [],
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should set transfers and balance in payload to accountName in accountInfo', () => {
            const initialState = {
                accountInfo: {
                    foo: {
                        hashes: [],
                        addresses: { foo: {} },
                        transfers: [[{}, {}], [{}, {}], [{}, {}]],
                        balance: 0,
                    },
                },
                accountNames: [],
                seedCount: 0,
            };

            const action = actions.fullAccountInfoAdditionalSeedFetchSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
                transfers: [[{}, {}], [{}, {}]],
                balance: 100,
                hashes: [],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        hashes: [],
                        addresses: { foo: {}, baz: {} },
                        transfers: [[{}, {}], [{}, {}]],
                        balance: 100,
                    },
                },
                accountNames: [],
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should set hashes in payload to accountName in accountInfo', () => {
            const initialState = {
                accountInfo: {
                    foo: {
                        balance: 0,
                        transfers: {},
                        addresses: {},
                        hashes: ['baz'],
                    },
                },
            };

            const action = actions.fullAccountInfoAdditionalSeedFetchSuccess({
                accountName: 'foo',
                hashes: ['baz', 'bar'],
                transfers: {},
                balance: 0,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        balance: 0,
                        transfers: {},
                        addresses: {},
                        hashes: ['baz', 'bar'],
                    },
                },
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should increment seedCount by one', () => {
            const initialState = {
                seedCount: 1,
                accountNames: [],
            };

            const action = actions.fullAccountInfoAdditionalSeedFetchSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
                transfers: [{}],
                balance: 100,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                seedCount: 2,
                accountNames: [],
            };

            expect(newState.seedCount).to.eql(expectedState.seedCount);
        });

        it('should concat accountName to accountNames', () => {
            const initialState = {
                seedCount: 1,
                accountNames: ['foo'],
            };

            const action = actions.fullAccountInfoAdditionalSeedFetchSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
                transfers: [{}],
                balance: 100,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                seedCount: 1,
                accountNames: ['foo', 'baz'],
            };

            expect(newState.accountNames).to.not.eql(['baz', 'foo']);
            expect(newState.accountNames).to.not.eql(expectedState.accountNames);
        });
    });

    describe('IOTA/ACCOUNTS/SET_BASIC_ACCOUNT_INFO', () => {
        it('should assign "accountName" to "setupInfo" prop in state', () => {
            const initialState = {
                setupInfo: {},
            };

            const action = {
                type: 'IOTA/ACCOUNTS/SET_BASIC_ACCOUNT_INFO',
                payload: { accountName: 'foo', usedExistingSeed: false },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                setupInfo: { foo: { usedExistingSeed: false } },
            };

            expect(newState.setupInfo).to.eql(expectedState.setupInfo);
        });

        it('should assign "accountName" to "tasks" prop in state', () => {
            const initialState = {
                tasks: {},
            };

            const action = {
                type: 'IOTA/ACCOUNTS/SET_BASIC_ACCOUNT_INFO',
                payload: { accountName: 'foo' },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                tasks: { foo: { hasDisplayedTransitionGuide: false } },
            };

            expect(newState.tasks).to.eql(expectedState.tasks);
        });
    });

    describe('IOTA/ACCOUNTS/MARK_TASK_AS_DONE', () => {
        it('should mark "task" in payload for "accountName" as true', () => {
            const initialState = {
                tasks: {
                    foo: { taskOne: false, taskTwo: false },
                    baz: { taskOne: false, taskTwo: true },
                },
            };

            const action = {
                type: 'IOTA/ACCOUNTS/MARK_TASK_AS_DONE',
                payload: {
                    accountName: 'foo',
                    task: 'taskOne',
                },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                tasks: {
                    foo: { taskOne: true, taskTwo: false },
                    baz: { taskOne: false, taskTwo: true },
                },
            };

            expect(newState).to.eql(expectedState);
        });
    });

    [
        'IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
        'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION',
        'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_REBROADCAST',
        'IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_REATTACHMENT',
        'IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_SUCCESS',
        'IOTA/POLLING/ACCOUNT_INFO_FETCH_SUCCESS',
        'IOTA/POLLING/SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION',
    ].forEach((actionType) => {
        describe(actionType, () => {
            it('should merge addresses in payload to accountName in accountInfo', () => {
                const initialState = {
                    accountInfo: {
                        dummy: {
                            balance: 0,
                            addresses: { foo: {} },
                            transfers: [],
                        },
                    },
                };

                const action = {
                    type: actionType,
                    payload: {
                        balance: 0,
                        accountName: 'dummy',
                        addresses: { baz: {} },
                        transfers: [],
                        hashes: [],
                    },
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    accountInfo: {
                        dummy: {
                            balance: 0,
                            addresses: { foo: {}, baz: {} },
                            transfers: [],
                            hashes: [],
                        },
                    },
                };

                expect(newState.accountInfo).to.eql(expectedState.accountInfo);
            });

            it('should set transfers in payload to accountName in accountInfo', () => {
                const initialState = {
                    accountInfo: {
                        foo: {
                            balance: 0,
                            transfers: [[{}, {}], [{}, {}], [{}, {}]],
                        },
                    },
                };

                const accountName = 'foo';
                const action = {
                    type: actionType,
                    payload: {
                        accountName,
                        transfers: [[{}, {}], [{}, {}]],
                        hashes: [],
                    },
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    accountInfo: {
                        foo: {
                            balance: 0,
                            transfers: [[{}, {}], [{}, {}]],
                            hashes: [],
                        },
                    },
                };

                expect(newState.accountInfo[accountName].transfers).to.eql(
                    expectedState.accountInfo[accountName].transfers,
                );
            });

            it('should set hashes in payload in accountInfo', () => {
                const initialState = {
                    accountInfo: {
                        foo: {
                            balance: 0,
                            transfers: [],
                            hashes: ['baz'],
                        },
                    },
                };

                const accountName = 'foo';
                const action = {
                    type: actionType,
                    payload: {
                        accountName,
                        transfers: [],
                        hashes: ['bar'],
                    },
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    accountInfo: {
                        foo: {
                            balance: 0,
                            transfers: [],
                            hashes: ['bar'],
                        },
                    },
                };

                expect(newState.accountInfo[accountName].hashes).to.eql(expectedState.accountInfo[accountName].hashes);
            });

            it('should set unconfirmedBundleTails in payload to unconfirmedBundleTails in state', () => {
                const initialState = {
                    unconfirmedBundleTails: {
                        foo: [],
                    },
                };

                const action = {
                    type: actionType,
                    payload: {
                        unconfirmedBundleTails: { baz: [], foo: [] },
                    },
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    unconfirmedBundleTails: { foo: [], baz: [] },
                };

                expect(newState.unconfirmedBundleTails).to.eql(expectedState.unconfirmedBundleTails);
            });
        });
    });
});
