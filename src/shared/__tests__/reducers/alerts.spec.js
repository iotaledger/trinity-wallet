import { expect } from 'chai';
import reducer from '../../reducers/alerts';

describe('Reducer: alerts', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                category: '',
                title: '',
                message: '',
                closeInterval: 5500,
                notificationLog: [],
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe('IOTA/ALERTS/SHOW', () => {
        it('should assign "category" prop in action to category in state', () => {
            const initialState = {
                category: 'foo',
            };

            const action = {
                type: 'IOTA/ALERTS/SHOW',
                category: 'baz',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                category: 'baz',
            };

            expect(newState.category).to.eql(expectedState.category);
        });

        it('should assign "title" prop in action to "title" in state', () => {
            const initialState = {
                title: 'foo',
            };

            const action = {
                type: 'IOTA/ALERTS/SHOW',
                title: 'baz',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                title: 'baz',
            };

            expect(newState.title).to.eql(expectedState.title);
        });

        it('should assign "message" prop in action to "message" in state', () => {
            const initialState = {
                message: 'foo',
            };

            const action = {
                type: 'IOTA/ALERTS/SHOW',
                message: 'baz',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                message: 'baz',
            };

            expect(newState.message).to.eql(expectedState.message);
        });

        it('should assign "closeInterval" prop in action to "closeInterval" in state', () => {
            const initialState = {
                closeInterval: 500,
            };

            const action = {
                type: 'IOTA/ALERTS/SHOW',
                closeInterval: 1000,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                closeInterval: 1000,
            };

            expect(newState.closeInterval).to.eql(expectedState.closeInterval);
        });
    });

    describe('IOTA/ALERTS/HIDE', () => {
        it('should set "category" in state as empty', () => {
            const initialState = {
                category: 'foo',
            };

            const action = {
                type: 'IOTA/ALERTS/HIDE',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                category: '',
            };

            expect(newState.category).to.eql(expectedState.category);
        });

        it('should set "title" in state as empty', () => {
            const initialState = {
                title: 'foo',
            };

            const action = {
                type: 'IOTA/ALERTS/HIDE',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                title: '',
            };

            expect(newState.title).to.eql(expectedState.title);
        });

        it('should set "message" in state as empty', () => {
            const initialState = {
                message: 'foo',
            };

            const action = {
                type: 'IOTA/ALERTS/HIDE',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                message: '',
            };

            expect(newState.message).to.eql(expectedState.message);
        });

        it('should set "closeInterval" in state as 5500', () => {
            const initialState = {
                closeInterval: 2000,
            };

            const action = {
                type: 'IOTA/ALERTS/HIDE',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                closeInterval: 5500,
            };

            expect(newState.closeInterval).to.eql(expectedState.closeInterval);
        });
    });

    describe('IOTA/ALERTS/UPDATE_LOG', () => {
        it('should concat "logItem" in action to "notificationLog" list in state', () => {
            const initialState = {
                notificationLog: ['foo'],
            };

            const action = {
                type: 'IOTA/ALERTS/UPDATE_LOG',
                logItem: 'baz',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                notificationLog: ['foo', 'baz'],
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/ALERTS/CLEAR_LOG', () => {
        it('should set notificationLog to an empty list', () => {
            const initialState = {
                notificationLog: ['foo'],
            };

            const action = {
                type: 'IOTA/ALERTS/CLEAR_LOG',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                notificationLog: [],
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
