import { expect } from 'chai';
import reducer from '../../reducers/account';
import * as actions from '../../actions/account';

describe('Reducer: account', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                seedCount: 0,
                accountNames: [],
                firstUse: true,
                onboardingComplete: false,
                accountInfo: {},
                unconfirmedBundleTails: {},
                txHashesForUnspentAddresses: {},
                pendingTxHashesForSpentAddresses: {},
                is2FAEnabled: false,
                isFingerprintEnabled: false,
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

        it('should update account name in "txHashesForUnspentAddresses" state prop', () => {
            const initialState = {
                txHashesForUnspentAddresses: {
                    foo: [{}],
                    baz: [{}, {}],
                },
            };

            const action = actions.changeAccountName({
                oldAccountName: 'foo',
                newAccountName: 'bar',
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                txHashesForUnspentAddresses: {
                    bar: [{}],
                    baz: [{}, {}],
                },
            };

            expect(newState.txHashesForUnspentAddresses).to.eql(expectedState.txHashesForUnspentAddresses);
        });

        it('should update account name in "pendingTxHashesForSpentAddresses" state prop', () => {
            const initialState = {
                pendingTxHashesForSpentAddresses: {
                    foo: [{}],
                    baz: [{}, {}],
                },
            };

            const action = actions.changeAccountName({
                oldAccountName: 'foo',
                newAccountName: 'bar',
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                pendingTxHashesForSpentAddresses: {
                    bar: [{}],
                    baz: [{}, {}],
                },
            };

            expect(newState.pendingTxHashesForSpentAddresses).to.eql(expectedState.pendingTxHashesForSpentAddresses);
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

        it('should omit "payload" prop in action from "txHashesForUnspentAddresses" in state', () => {
            const initialState = {
                txHashesForUnspentAddresses: { foo: {} },
            };

            const action = actions.removeAccount('foo');

            const newState = reducer(initialState, action);
            const expectedState = {
                txHashesForUnspentAddresses: {},
            };

            expect(newState.txHashesForUnspentAddresses).to.eql(expectedState.txHashesForUnspentAddresses);
        });

        it('should omit "payload" prop in action from "pendingTxHashesForSpentAddresses" in state', () => {
            const initialState = {
                pendingTxHashesForSpentAddresses: { foo: {} },
            };

            const action = actions.removeAccount('foo');

            const newState = reducer(initialState, action);
            const expectedState = {
                pendingTxHashesForSpentAddresses: {},
            };

            expect(newState.pendingTxHashesForSpentAddresses).to.eql(expectedState.pendingTxHashesForSpentAddresses);
        });

        it('should omit all keys from "unconfrimedBundleTails" that have any "account" prop equal to "payload" prop in action', () => {
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

    describe('ACCOUNT_INFO_FETCH_SUCCESS', () => {
        it('should merge addresses in payload to accountName in accountInfo', () => {
            const initialState = {
                accountInfo: {
                    firstAccount: {
                        addresses: { foo: {} },
                    },
                },
            };

            const accountName = 'firstAccount';
            const action = actions.accountInfoFetchSuccess({
                accountName,
                addresses: { baz: {} },
                unconfirmedBundleTails: {},
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    [accountName]: {
                        addresses: { foo: {}, baz: {} },
                    },
                },
            };

            expect(newState.accountInfo[accountName].addresses).to.eql(
                expectedState.accountInfo[accountName].addresses,
            );
        });

        it('should set transfers and balance in payload to accountName in accountInfo', () => {
            const initialState = {
                accountInfo: {
                    firstAccount: {
                        transfers: [[{}, {}], [{}, {}]],
                        balance: 0,
                    },
                },
            };

            const accountName = 'firstAccount';
            const action = actions.accountInfoFetchSuccess({
                accountName,
                transfers: [[{}, {}], [{}, {}], [{}, {}]],
                balance: 100,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    [accountName]: {
                        transfers: [[{}, {}], [{}, {}], [{}, {}]],
                        balance: 100,
                    },
                },
            };

            expect(newState.accountInfo[accountName].transfers).to.eql(
                expectedState.accountInfo[accountName].transfers,
            );
            expect(newState.accountInfo[accountName].balance).to.eql(expectedState.accountInfo[accountName].balance);
        });

        it('should set txHashesForUnspentAddresses in payload to txHashesForUnspentAddresses in state', () => {
            const initialState = {
                txHashesForUnspentAddresses: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
            };

            const action = actions.accountInfoFetchSuccess({
                accountName: 'firstAccount',
                txHashesForUnspentAddresses: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                txHashesForUnspentAddresses: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.txHashesForUnspentAddresses).to.eql(expectedState.txHashesForUnspentAddresses);
        });

        it('should set pendingTxHashesForSpentAddresses in payload to pendingTxHashesForSpentAddresses in state', () => {
            const initialState = {
                pendingTxHashesForSpentAddresses: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
            };

            const action = actions.accountInfoFetchSuccess({
                accountName: 'firstAccount',
                pendingTxHashesForSpentAddresses: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                pendingTxHashesForSpentAddresses: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.pendingTxHashesForSpentAddresses).to.eql(expectedState.pendingTxHashesForSpentAddresses);
        });

        it('should set unconfirmedBundleTails in payload to unconfirmedBundleTails in state', () => {
            const initialState = {
                unconfirmedBundleTails: {
                    foo: [],
                },
            };

            const action = actions.accountInfoFetchSuccess({
                accountName: 'firstAccount',
                unconfirmedBundleTails: {},
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                unconfirmedBundleTails: {},
            };

            expect(newState.unconfirmedBundleTails).to.eql(expectedState.unconfirmedBundleTails);
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

        it('should set txHashesForUnspentAddresses in payload to txHashesForUnspentAddresses in state', () => {
            const initialState = {
                txHashesForUnspentAddresses: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
            };

            const action = actions.manualSyncSuccess({
                accountName: 'firstAccount',
                txHashesForUnspentAddresses: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                txHashesForUnspentAddresses: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.txHashesForUnspentAddresses).to.eql(expectedState.txHashesForUnspentAddresses);
        });

        it('should set pendingTxHashesForSpentAddresses in payload to pendingTxHashesForSpentAddresses in state', () => {
            const initialState = {
                pendingTxHashesForSpentAddresses: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
            };

            const action = actions.manualSyncSuccess({
                accountName: 'firstAccount',
                pendingTxHashesForSpentAddresses: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                pendingTxHashesForSpentAddresses: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.pendingTxHashesForSpentAddresses).to.eql(expectedState.pendingTxHashesForSpentAddresses);
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
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {}, baz: {} },
                        transfers: [{}],
                        balance: 100,
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
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {}, baz: {} },
                        transfers: [[{}, {}], [{}, {}]],
                        balance: 100,
                    },
                },
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should set txHashesForUnspentAddresses in payload to txHashesForUnspentAddresses in state', () => {
            const initialState = {
                txHashesForUnspentAddresses: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
            };

            const action = actions.fullAccountInfoFirstSeedFetchSuccess({
                accountName: 'firstAccount',
                txHashesForUnspentAddresses: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                txHashesForUnspentAddresses: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.txHashesForUnspentAddresses).to.eql(expectedState.txHashesForUnspentAddresses);
        });

        it('should set pendingTxHashesForSpentAddresses in payload to pendingTxHashesForSpentAddresses in state', () => {
            const initialState = {
                pendingTxHashesForSpentAddresses: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
            };

            const action = actions.fullAccountInfoFirstSeedFetchSuccess({
                accountName: 'firstAccount',
                pendingTxHashesForSpentAddresses: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                pendingTxHashesForSpentAddresses: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.pendingTxHashesForSpentAddresses).to.eql(expectedState.pendingTxHashesForSpentAddresses);
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
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {}, baz: {} },
                        transfers: [{}],
                        balance: 100,
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
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {}, baz: {} },
                        transfers: [[{}, {}], [{}, {}]],
                        balance: 100,
                    },
                },
                accountNames: [],
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should set txHashesForUnspentAddresses in payload to txHashesForUnspentAddresses in state', () => {
            const initialState = {
                txHashesForUnspentAddresses: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
                accountNames: [],
                seedCount: 0,
            };

            const action = actions.fullAccountInfoAdditionalSeedFetchSuccess({
                accountName: 'firstAccount',
                txHashesForUnspentAddresses: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                txHashesForUnspentAddresses: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.txHashesForUnspentAddresses).to.eql(expectedState.txHashesForUnspentAddresses);
        });

        it('should set pendingTxHashesForSpentAddresses in payload to pendingTxHashesForSpentAddresses in state', () => {
            const initialState = {
                pendingTxHashesForSpentAddresses: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
                accountNames: [],
                seedCount: 0,
            };

            const action = actions.fullAccountInfoAdditionalSeedFetchSuccess({
                accountName: 'firstAccount',
                pendingTxHashesForSpentAddresses: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                pendingTxHashesForSpentAddresses: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.pendingTxHashesForSpentAddresses).to.eql(expectedState.pendingTxHashesForSpentAddresses);
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

    describe('UPDATE_ACCOUNT_INFO_AFTER_SPENDING', () => {
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

            const action = actions.updateAccountInfoAfterSpending({
                balance: 0,
                accountName: 'dummy',
                addresses: { baz: {} },
                transfers: [],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    dummy: {
                        balance: 0,
                        addresses: { foo: {}, baz: {} },
                        transfers: [],
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
            const action = actions.updateAccountInfoAfterSpending({
                accountName,
                transfers: [[{}, {}], [{}, {}]],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        balance: 0,
                        transfers: [[{}, {}], [{}, {}]],
                    },
                },
            };

            expect(newState.accountInfo[accountName].transfers).to.eql(
                expectedState.accountInfo[accountName].transfers,
            );
        });

        it('should set txHashesForUnspentAddresses in payload to txHashesForUnspentAddresses in state', () => {
            const initialState = {
                txHashesForUnspentAddresses: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
            };

            const action = actions.updateAccountInfoAfterSpending({
                accountName: 'firstAccount',
                txHashesForUnspentAddresses: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                txHashesForUnspentAddresses: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.txHashesForUnspentAddresses).to.eql(expectedState.txHashesForUnspentAddresses);
        });

        it('should set pendingTxHashesForSpentAddresses in payload to pendingTxHashesForSpentAddresses in state', () => {
            const initialState = {
                pendingTxHashesForSpentAddresses: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
            };

            const action = actions.updateAccountInfoAfterSpending({
                accountName: 'firstAccount',
                pendingTxHashesForSpentAddresses: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                pendingTxHashesForSpentAddresses: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.pendingTxHashesForSpentAddresses).to.eql(expectedState.pendingTxHashesForSpentAddresses);
        });

        it('should merge unconfirmedBundleTails in payload to unconfirmedBundleTails in state', () => {
            const initialState = {
                unconfirmedBundleTails: { foo: {} },
            };

            const action = actions.updateAccountInfoAfterSpending({ unconfirmedBundleTails: { baz: {} } });

            const newState = reducer(initialState, action);
            const expectedState = {
                unconfirmedBundleTails: { baz: {}, foo: {} },
            };

            expect(newState.unconfirmedBundleTails).to.eql(expectedState.unconfirmedBundleTails);
        });
    });

    describe('SET_2FA_STATUS', () => {
        it('should set is2FAEnabled to payload', () => {
            const initialState = {
                is2FAEnabled: false,
            };

            const action = actions.set2FAStatus(true);

            const newState = reducer(initialState, action);
            const expectedState = {
                is2FAEnabled: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
