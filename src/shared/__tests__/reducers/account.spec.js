import { expect } from 'chai';
import reducer from '../../reducers/account';
import * as actions from '../../actions/account';

describe('Reducer: account', () => {
    it('should have an initial state', () => {
        const initialState = {
            seedCount: 0,
            seedNames: [],
            firstUse: true,
            onboardingComplete: false,
            accountInfo: {},
            unconfirmedBundleTails: {},
            unspentAddressesHashes: {},
            pendingTxTailsHashes: {},
        };

        expect(reducer(undefined, {})).to.eql(initialState);
    });

    it('UPDATE_UNCONFIRMED_BUNDLE_TAILS should assign payload to unconfirmedBundleTails prop in state', () => {
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

    it('REMOVE_BUNDLE_FROM_UNCONFIRMED_BUNDLE_TAILS should remove payload from "unconfirmedBundleTails"', () => {
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

    it('SET_NEW_UNCONFIRMED_BUNDLE_TAILS should set payload to "unconfirmedBundleTails"', () => {
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

    it('CHANGE_ACCOUNT_NAME should set seedNames to accountNames and accountInfo to accountInfo props in action', () => {
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

    it('REMOVE_ACCOUNT should omit payload prop from "accountInfo"', () => {
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

    it('REMOVE_ACCOUNT should remove payload from seedNames array', () => {
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

    it('REMOVE_ACCOUNT should subtract one from seedCount', () => {
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

    it('SET_FIRST_USE should set firstUse to payload', () => {
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

    it('SET_ONBOARDING_COMPLETE should set onboardingComplete to payload', () => {
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

    it('INCREASE_SEED_COUNT should increment seedCount by one', () => {
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

    it('ADD_SEED_NAME should concat seedName to list of seedNames in state', () => {
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

    it('MANUAL_SYNC_SUCCESS should merge unconfirmedBundleTails in payload to unconfirmedBundleTails in state', () => {
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

    it('MANUAL_SYNC_SUCCESS should merge addresses, transfers and balance in payload to accountName in accountInfo', () => {
        const initialState = {
            accountInfo: {
                foo: {
                    addresses: { foo: {} },
                    transfers: [],
                    balance: 0,
                },
            },
        };

        const action = actions.manualSyncSuccess({
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

    it('FULL_ACCOUNT_INFO_FETCH_SUCCESS should merge unconfirmedBundleTails in payload to unconfirmedBundleTails in state', () => {
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

    it('FULL_ACCOUNT_INFO_FETCH_SUCCESS should merge addresses, transfers and balance in payload to accountName in accountInfo', () => {
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

    it('FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_SUCCESS should merge addresses, transfers and balance in payload to accountName in accountInfo', () => {
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
            seedNames: [],
        };

        expect(newState.accountInfo).to.eql(expectedState.accountInfo);
    });

    it('FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_SUCCESS should increment seedCount by one', () => {
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

    it('FULL_ACCOUNT_INFO_FOR_FIRST_USE_FETCH_SUCCESS should concat accountName to seedNames', () => {
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
