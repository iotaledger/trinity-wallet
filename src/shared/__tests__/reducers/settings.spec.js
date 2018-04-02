import { expect } from 'chai';
import reducer from '../../reducers/settings';
import * as actions from '../../actions/settings';

describe('Reducer: settings', () => {
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
