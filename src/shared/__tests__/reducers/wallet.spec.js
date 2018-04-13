import { expect } from 'chai';
import reducer from '../../reducers/wallet';
import * as actions from '../../actions/wallet';

describe('Reducer: wallet', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                ready: false,
                receiveAddress: ' ',
                password: '',
                seed: Array(82).join(' '),
                accountName: 'MAIN WALLET',
                seedIndex: 0,
                usedSeedToLogin: false,
                currentSetting: 'mainSettings',
                copiedToClipboard: false,
                additionalAccountName: '',
                transitionBalance: 0,
                transitionAddresses: [],
                addingAdditionalAccount: false,
                balanceCheckToggle: false,
                deepLinkActive: false,
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe('SET_SEED_INDEX', () => {
        it('should assign payload to seedIndex prop in state', () => {
            const initialState = {
                seedIndex: 1,
            };

            const action = actions.setSeedIndex(5);

            const newState = reducer(initialState, action);
            const expectedState = {
                seedIndex: 5,
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
