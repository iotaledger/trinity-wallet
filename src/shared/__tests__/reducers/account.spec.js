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
});
