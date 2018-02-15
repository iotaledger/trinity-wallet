import { expect } from 'chai';
import reducer from '../../reducers/account';
import * as actions from '../../actions/account';

describe('Reducer: account', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                seedCount: 0,
                seedNames: [],
                firstUse: true,
                onboardingComplete: false,
                accountInfo: {},
                unconfirmedBundleTails: {},
                unspentAddressesHashes: {},
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
        it('should set seedNames to accountNames and accountInfo to accountInfo props in action', () => {
            const initialState = {
                seedNames: [{}],
                accountInfo: {},
            };

            const action = actions.changeAccountName(null, [{}, {}]);

            const newState = reducer(initialState, action);
            const expectedState = {
                seedNames: [{}, {}],
                accountInfo: null,
            };

            expect(newState).to.eql(expectedState);
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

        it('should remove payload from seedNames array', () => {
            const initialState = {
                seedNames: ['foo', 'baz'],
            };

            const action = actions.removeAccount('foo');

            const newState = reducer(initialState, action);
            const expectedState = {
                seedNames: ['baz'],
            };

            expect(newState.seedNames).to.eql(expectedState.seedNames);
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
        it('should concat seedName to list of seedNames in state', () => {
            const initialState = {
                seedNames: ['foo'],
            };

            const action = actions.addAccountName('baz');

            const newState = reducer(initialState, action);
            const expectedState = {
                seedNames: ['foo', 'baz'],
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

        it('should set unspentAddressesHashes in payload to unspentAddressesHashes in state', () => {
            const initialState = {
                unspentAddressesHashes: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
            };

            const action = actions.accountInfoFetchSuccess({
                accountName: 'firstAccount',
                unspentAddressesHashes: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                unspentAddressesHashes: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.unspentAddressesHashes).to.eql(expectedState.unspentAddressesHashes);
        });
    });

    describe('MANUAL_SYNC_SUCCESS', () => {
        it('should merge unconfirmedBundleTails in payload to unconfirmedBundleTails in state', () => {
            const initialState = {
                unconfirmedBundleTails: { foo: {} },
            };

            const action = actions.manualSyncSuccess({ unconfirmedBundleTails: { baz: {} } });

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
                    },
                },
            };

            const action = actions.manualSyncSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
                transfers: [{}],
                balance: 100,
                isFingerprintEnabled: false,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {}, baz: {} },
                        transfers: [{}],
                        isFingerprintEnabled: false,
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
                        transfers: [[{}, {}], [{}, {}]],
                        balance: 0,
                    },
                },
            };

            const action = actions.manualSyncSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
                transfers: [[{}, {}], [{}, {}], [{}, {}]],
                balance: 100,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {}, baz: {} },
                        transfers: [[{}, {}], [{}, {}], [{}, {}]],
                        balance: 100,
                        isFingerprintEnabled: false,
                    },
                },
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should set unspentAddressesHashes in payload to unspentAddressesHashes in state', () => {
            const initialState = {
                unspentAddressesHashes: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
            };

            const action = actions.manualSyncSuccess({
                accountName: 'firstAccount',
                unspentAddressesHashes: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                unspentAddressesHashes: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.unspentAddressesHashes).to.eql(expectedState.unspentAddressesHashes);
        });
    });

    describe('FULL_ACCOUNT_INFO_FETCH_SUCCESS', () => {
        it('should merge unconfirmedBundleTails in payload to unconfirmedBundleTails in state', () => {
            const initialState = {
                unconfirmedBundleTails: { foo: {} },
            };

            const action = actions.fullAccountInfoFetchSuccess({ unconfirmedBundleTails: { baz: {} } });

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

            const action = actions.fullAccountInfoFetchSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
                transfers: [{}],
                balance: 100,
                isFingerprintEnabled: false,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {}, baz: {} },
                        transfers: [{}],
                        balance: 100,
                        isFingerprintEnabled: false,
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

            const action = actions.fullAccountInfoFetchSuccess({
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
                        isFingerprintEnabled: false,
                    },
                },
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should set unspentAddressesHashes in payload to unspentAddressesHashes in state', () => {
            const initialState = {
                unspentAddressesHashes: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
            };

            const action = actions.fullAccountInfoFetchSuccess({
                accountName: 'firstAccount',
                unspentAddressesHashes: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                unspentAddressesHashes: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.unspentAddressesHashes).to.eql(expectedState.unspentAddressesHashes);
        });

        it('should set firstUse in state to false', () => {
            const initialState = {
                firstUse: true,
            };

            const action = actions.fullAccountInfoFetchSuccess({ accountName: 'foo' }); // Would break if accountName is missing

            const newState = reducer(initialState, action);
            const expectedState = {
                firstUse: false,
            };

            expect(newState.firstUse).to.eql(expectedState.firstUse);
        });
    });

    describe('FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_SUCCESS', () => {
        it('should merge addresses in payload to accountName in accountInfo', () => {
            const initialState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {} },
                        transfers: [],
                        balance: 0,
                    },
                },
                seedNames: [],
                seedCount: 0,
            };

            const action = actions.fullAccountInfoForFirstUseFetchSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
                transfers: [{}],
                balance: 100,
                isFingerprintEnabled: false,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {
                    foo: {
                        addresses: { foo: {}, baz: {} },
                        transfers: [{}],
                        balance: 100,
                        isFingerprintEnabled: false,
                    },
                },
                seedNames: [],
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
                seedNames: [],
                seedCount: 0,
            };

            const action = actions.fullAccountInfoForFirstUseFetchSuccess({
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
                        isFingerprintEnabled: false,
                    },
                },
                seedNames: [],
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should set hashes in payload to unspentAddressesHashes in state', () => {
            const initialState = {
                unspentAddressesHashes: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
                seedNames: [],
                seedCount: 0,
            };

            const action = actions.fullAccountInfoForFirstUseFetchSuccess({
                accountName: 'firstAccount',
                unspentAddressesHashes: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                unspentAddressesHashes: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.unspentAddressesHashes).to.eql(expectedState.unspentAddressesHashes);
        });

        it('should increment seedCount by one', () => {
            const initialState = {
                seedCount: 1,
                seedNames: [],
            };

            const action = actions.fullAccountInfoForFirstUseFetchSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
                transfers: [{}],
                balance: 100,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                seedCount: 2,
                seedNames: [],
            };

            expect(newState.seedCount).to.eql(expectedState.seedCount);
        });

        it('should concat accountName to seedNames', () => {
            const initialState = {
                seedCount: 1,
                seedNames: ['foo'],
            };

            const action = actions.fullAccountInfoForFirstUseFetchSuccess({
                accountName: 'foo',
                addresses: { baz: {} },
                transfers: [{}],
                balance: 100,
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                seedCount: 1,
                seedNames: ['foo', 'baz'],
            };

            expect(newState.seedNames).to.not.eql(['baz', 'foo']);
            expect(newState.seedNames).to.not.eql(expectedState.seedNames);
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
                        isFingerprintEnabled: false,
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

        it('should set unspentAddressesHashes in payload to unspentAddressesHashes in state', () => {
            const initialState = {
                unspentAddressesHashes: {
                    firstAccount: ['baz', 'bar'],
                    secondAccount: ['hash'],
                },
            };

            const action = actions.updateAccountInfoAfterSpending({
                accountName: 'firstAccount',
                unspentAddressesHashes: ['baz'],
            });

            const newState = reducer(initialState, action);
            const expectedState = {
                unspentAddressesHashes: {
                    firstAccount: ['baz'],
                    secondAccount: ['hash'],
                },
            };

            expect(newState.unspentAddressesHashes).to.eql(expectedState.unspentAddressesHashes);
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
