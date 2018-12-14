import { expect } from 'chai';
import tk from 'timekeeper';
import reducer from '../../reducers/progress';
import * as actions from '../../actions/progress';

describe('Reducer: progress', () => {
    before(() => {
        const time = new Date(1520808420002);
        tk.freeze(time);
    });

    after(() => {
        tk.reset();
    });

    describe('SET_ACTIVE_STEP_INDEX ', () => {
        it('should assign "payload" prop in action to "activeStepIndex" in state', () => {
            const initialState = {
                activeStepIndex: -1,
            };

            const action = actions.setActiveStepIndex(1);

            const newState = reducer(initialState, action);
            const expectedState = {
                activeStepIndex: 1,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_NEXT_STEP_AS_ACTIVE ', () => {
        it('should increment "activeStepIndex" prop in state by one', () => {
            const initialState = {
                activeStepIndex: -1,
                timeTakenByEachStep: [],
            };

            const action = actions.setNextStepAsActive();

            const newState = reducer(initialState, action);
            const expectedState = {
                activeStepIndex: 0,
            };

            expect(newState.activeStepIndex).to.eql(expectedState.activeStepIndex);
        });

        it('should set current time to "lastStepInitializationTime" prop in state', () => {
            const initialState = {
                lastStepInitializationTime: 1520808410000,
                timeTakenByEachStep: [],
            };

            const action = actions.setNextStepAsActive();

            const newState = reducer(initialState, action);
            const expectedState = {
                lastStepInitializationTime: Date.now(),
            };

            expect(newState.lastStepInitializationTime).to.eql(expectedState.lastStepInitializationTime);
        });

        it('should always convert time to seconds before adding it to "timeTakenByEachStep" prop in state', () => {
            const initialState = {
                lastStepInitializationTime: 1520808410000,
                timeTakenByEachStep: ['1s'],
            };

            const action = actions.setNextStepAsActive();

            const newState = reducer(initialState, action);
            const expectedState = {
                timeTakenByEachStep: ['1s', '10.0'],
            };

            expect(newState.timeTakenByEachStep).to.eql(expectedState.timeTakenByEachStep);
        });
    });

    describe('START_TRACKING_PROGRESS ', () => {
        it('should set "activeStepIndex" prop in state to -1', () => {
            const initialState = {
                activeStepIndex: 2,
            };

            const action = actions.startTrackingProgress([{}]);

            const newState = reducer(initialState, action);
            const expectedState = {
                activeStepIndex: -1,
            };

            expect(newState.activeStepIndex).to.eql(expectedState.activeStepIndex);
        });

        it('should set "timeTakenByEachStep" prop in state to an empty array', () => {
            const initialState = {
                timeTakenByEachStep: ['1s', '2s'],
            };

            const action = actions.startTrackingProgress([{}]);

            const newState = reducer(initialState, action);
            const expectedState = {
                timeTakenByEachStep: [],
            };

            expect(newState.timeTakenByEachStep).to.eql(expectedState.timeTakenByEachStep);
        });

        it('should set "lastStepInitializationTime" prop in state to current time', () => {
            const initialState = {
                lastStepInitializationTime: 1520808410000,
            };

            const action = actions.startTrackingProgress([{}]);

            const newState = reducer(initialState, action);
            const expectedState = {
                lastStepInitializationTime: Date.now(),
            };

            expect(newState.lastStepInitializationTime).to.eql(expectedState.lastStepInitializationTime);
        });

        it('should set "activeSteps" prop in state to "payload" prop in action', () => {
            const initialState = {
                activeSteps: [{}],
            };

            const action = actions.startTrackingProgress([{}, {}]);

            const newState = reducer(initialState, action);
            const expectedState = {
                activeSteps: [{}, {}],
            };

            expect(newState.activeSteps).to.eql(expectedState.activeSteps);
        });
    });
});
