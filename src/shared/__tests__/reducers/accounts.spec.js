import { expect } from 'chai';
import reducer from '../../reducers/accounts';
import { ActionTypes } from '../../actions/accounts';

describe('Reducer: accounts', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                onboardingComplete: false,
                accountInfo: {},
                setupInfo: {},
                tasks: {},
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe(ActionTypes.CHANGE_ACCOUNT_NAME, () => {
        it('should update account name in "accountInfo" state prop', () => {
            const initialState = {
                accountInfo: {
                    foo: {},
                    baz: {},
                },
            };

            const action = {
                type: ActionTypes.CHANGE_ACCOUNT_NAME,
                payload: {
                    oldAccountName: 'foo',
                    newAccountName: 'bar',
                },
            };

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

            const action = {
                type: ActionTypes.CHANGE_ACCOUNT_NAME,
                payload: {
                    oldAccountName: 'foo',
                    newAccountName: 'bar',
                },
            };

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

            const action = {
                type: ActionTypes.CHANGE_ACCOUNT_NAME,
                payload: {
                    oldAccountName: 'foo',
                    newAccountName: 'bar',
                },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                setupInfo: {
                    bar: {},
                    baz: {},
                },
            };

            expect(newState.setupInfo).to.eql(expectedState.setupInfo);
        });
    });

    describe(ActionTypes.REMOVE_ACCOUNT, () => {
        it('should remove account data from "accountInfo"', () => {
            const initialState = {
                accountInfo: { foo: {} },
            };

            const action = {
                type: ActionTypes.REMOVE_ACCOUNT,
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                accountInfo: {},
            };

            expect(newState.accountInfo).to.eql(expectedState.accountInfo);
        });

        it('should remove account data from "tasks"', () => {
            const initialState = {
                tasks: { foo: {} },
            };

            const action = {
                type: ActionTypes.REMOVE_ACCOUNT,
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                tasks: {},
            };

            expect(newState.tasks).to.eql(expectedState.tasks);
        });

        it('should remove account data from "setupInfo"', () => {
            const initialState = {
                setupInfo: { foo: {} },
            };

            const action = {
                type: ActionTypes.REMOVE_ACCOUNT,
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                setupInfo: {},
            };

            expect(newState.setupInfo).to.eql(expectedState.setupInfo);
        });
    });

    describe(ActionTypes.SET_ONBOARDING_COMPLETE, () => {
        it('should set onboardingComplete to payload', () => {
            const initialState = {
                onboardingComplete: false,
            };

            const action = {
                type: ActionTypes.SET_ONBOARDING_COMPLETE,
                payload: true,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                onboardingComplete: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.SET_BASIC_ACCOUNT_INFO, () => {
        it('should assign "accountName" to "setupInfo" prop in state', () => {
            const initialState = {
                setupInfo: {},
            };

            const action = {
                type: ActionTypes.SET_BASIC_ACCOUNT_INFO,
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
                type: ActionTypes.SET_BASIC_ACCOUNT_INFO,
                payload: { accountName: 'foo' },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                tasks: { foo: { displayedSnapshotTransitionGuide: false } },
            };

            expect(newState.tasks).to.eql(expectedState.tasks);
        });
    });

    describe(ActionTypes.MARK_TASK_AS_DONE, () => {
        it('should mark "task" in payload for "accountName" as true', () => {
            const initialState = {
                tasks: {
                    foo: { taskOne: false, taskTwo: false },
                    baz: { taskOne: false, taskTwo: true },
                },
            };

            const action = {
                type: ActionTypes.MARK_TASK_AS_DONE,
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
});
