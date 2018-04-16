import { expect } from 'chai';
import reducer from '../../reducers/home';

describe('Reducer: home', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                childRoute: 'balance',
                isTopBarActive: false,
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe('IOTA/HOME/ROUTE/CHANGE', () => {
        it('should assign "payload" to "childRoute" state prop', () => {
            const initialState = {
                childRoute: 'balance',
            };

            const action = {
                type: 'IOTA/HOME/ROUTE/CHANGE',
                payload: 'settings',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                childRoute: 'settings',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/HOME/TOP_BAR/TOGGLE', () => {
        it('should invert "isTopBarActive" state prop', () => {
            const initialState = {
                isTopBarActive: false,
            };

            const action = {
                type: 'IOTA/HOME/TOP_BAR/TOGGLE',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isTopBarActive: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
