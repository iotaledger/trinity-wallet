import { expect } from 'chai';
import reducer from '../../reducers/app';

describe('Reducer: app', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                activationCode: null,
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe('IOTA/APP/SET_ACTIVATION_CODE', () => {
        it('should merge "payload" in "activationCode" state prop', () => {
            const initialState = {
                activationCode: null,
            };

            const action = {
                type: 'IOTA/APP/SET_ACTIVATION_CODE',
                payload: { foo: {} },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                activationCode: { foo: {} },
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
