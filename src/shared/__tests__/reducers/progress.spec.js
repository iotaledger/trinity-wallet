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
