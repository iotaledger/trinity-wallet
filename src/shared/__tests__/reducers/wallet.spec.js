import { expect } from 'chai';
import reducer from '../../reducers/wallet';

describe('Reducer: wallet', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                ready: false,
                password: {},
                seedIndex: 0,
                currentSetting: 'mainSettings',
                transitionBalance: 0,
                transitionAddresses: [],
                balanceCheckFlag: false,
                deepLinkActive: false,
                hasConnection: true,
                isValidatingAddress: false,
                navStack: [],
                forceUpdate: false,
                shouldUpdate: false,
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe('IOTA/WALLET/SET_PASSWORD', () => {
        it('should assign payload to "password" in state', () => {
            const initialState = {
                password: {},
            };

            const action = {
                type: 'IOTA/WALLET/SET_PASSWORD',
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                password: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/SET_READY', () => {
        it('should assign payload to "ready" in state', () => {
            const initialState = {
                ready: false,
            };

            const action = {
                type: 'IOTA/WALLET/SET_READY',
                payload: true,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                ready: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_SEED_INDEX', () => {
        it('should assign payload to "seedIndex" prop in state', () => {
            const initialState = {
                seedIndex: 1,
            };

            const action = {
                type: 'IOTA/WALLET/SET_SEED_INDEX',
                payload: 5,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                seedIndex: 5,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/CLEAR_WALLET_DATA', () => {
        it('should set "ready" state prop to false', () => {
            const initialState = {
                ready: true,
            };

            const action = {
                type: 'IOTA/WALLET/CLEAR_WALLET_DATA',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                ready: false,
            };

            expect(newState.ready).to.eql(expectedState.ready);
        });

        it('should set "seedIndex" state prop to 0', () => {
            const initialState = {
                seedIndex: 3,
            };

            const action = {
                type: 'IOTA/WALLET/CLEAR_WALLET_DATA',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                seedIndex: 0,
            };

            expect(newState.seedIndex).to.eql(expectedState.seedIndex);
        });

        it('should set "isGeneratingReceiveAddress" state prop to false', () => {
            const initialState = {
                isGeneratingReceiveAddress: true,
            };

            const action = {
                type: 'IOTA/WALLET/CLEAR_WALLET_DATA',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isGeneratingReceiveAddress: false,
            };

            expect(newState.isGeneratingReceiveAddress).to.eql(expectedState.isGeneratingReceiveAddress);
        });

        it('should set "currentSetting" state prop to "mainSettings"', () => {
            const initialState = {
                currentSetting: 'advancedSettings',
            };

            const action = {
                type: 'IOTA/WALLET/CLEAR_WALLET_DATA',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                currentSetting: 'mainSettings',
            };

            expect(newState.currentSetting).to.eql(expectedState.currentSetting);
        });

        it('should set "deepLinkActive" state prop to false', () => {
            const initialState = {
                deepLinkActive: true,
            };

            const action = {
                type: 'IOTA/WALLET/CLEAR_WALLET_DATA',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                deepLinkActive: false,
            };

            expect(newState.deepLinkActive).to.eql(expectedState.deepLinkActive);
        });
    });

    describe('IOTA/WALLET/SET_SETTING', () => {
        it('should assign payload to "currentSetting" in state', () => {
            const initialState = {
                currentSetting: 'advancedSettings',
            };

            const action = {
                type: 'IOTA/WALLET/SET_SETTING',
                payload: 'mainSettings',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                currentSetting: 'mainSettings',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_REQUEST', () => {
        it('should set "ready" in state to false', () => {
            const initialState = {
                ready: true,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                ready: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_SUCCESS', () => {
        it('should set "ready" in state to true', () => {
            const initialState = {
                ready: false,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                ready: true,
            };

            expect(newState.ready).to.eql(expectedState.ready);
        });
    });

    describe('IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_REQUEST', () => {
        it('should set "ready" in state to false', () => {
            const initialState = {
                ready: true,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                ready: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_SUCCESS', () => {
        it('should set "ready" in state to true', () => {
            const initialState = {
                ready: false,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                ready: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/ACCOUNTS/REMOVE_ACCOUNT', () => {
        it('should set "seedIndex" in state to 0', () => {
            const initialState = {
                seedIndex: 10,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/REMOVE_ACCOUNT',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                seedIndex: 0,
            };

            expect(newState.seedIndex).to.eql(expectedState.seedIndex);
        });

        it('should set "currentSetting" in state to "accountManagement"', () => {
            const initialState = {
                currentSetting: 'mainSettings',
            };

            const action = {
                type: 'IOTA/ACCOUNTS/REMOVE_ACCOUNT',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                currentSetting: 'accountManagement',
            };

            expect(newState.currentSetting).to.eql(expectedState.currentSetting);
        });
    });

    describe('IOTA/WALLET/SNAPSHOT_TRANSITION_SUCCESS', () => {
        it('should set "transitionBalance" in state to 0', () => {
            const initialState = {
                transitionBalance: 100,
            };

            const action = {
                type: 'IOTA/WALLET/SNAPSHOT_TRANSITION_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                transitionBalance: 0,
            };

            expect(newState.transitionBalance).to.eql(expectedState.transitionBalance);
        });

        it('should set "transitionAddresses" in state to an empty array', () => {
            const initialState = {
                transitionAddresses: ['U'.repeat(81)],
            };

            const action = {
                type: 'IOTA/WALLET/SNAPSHOT_TRANSITION_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                transitionAddresses: [],
            };

            expect(newState.transitionAddresses).to.eql(expectedState.transitionAddresses);
        });
    });

    describe('IOTA/WALLET/SNAPSHOT_TRANSITION_ERROR', () => {
        it('should set "transitionBalance" in state to 0', () => {
            const initialState = {
                transitionBalance: 100,
            };

            const action = {
                type: 'IOTA/WALLET/SNAPSHOT_TRANSITION_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                transitionBalance: 0,
            };

            expect(newState.transitionBalance).to.eql(expectedState.transitionBalance);
        });

        it('should set "transitionAddresses" in state to an empty array', () => {
            const initialState = {
                transitionAddresses: ['U'.repeat(81)],
            };

            const action = {
                type: 'IOTA/WALLET/SNAPSHOT_TRANSITION_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                transitionAddresses: [],
            };

            expect(newState.transitionAddresses).to.eql(expectedState.transitionAddresses);
        });
    });

    describe('IOTA/WALLET/SET_BALANCE_CHECK_FLAG', () => {
        it('should set "transitionBalance" in state to 0', () => {
            const initialState = {
                balanceCheckFlag: true,
            };

            const action = {
                type: 'IOTA/WALLET/SET_BALANCE_CHECK_FLAG',
                payload: false,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                balanceCheckFlag: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/UPDATE_TRANSITION_BALANCE', () => {
        it('should assign "transitionBalance" in state the sum of "transitionBalance" in the state with "payload"', () => {
            const initialState = {
                transitionBalance: 15,
            };

            const action = {
                type: 'IOTA/WALLET/UPDATE_TRANSITION_BALANCE',
                payload: 10,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                transitionBalance: 25,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/UPDATE_TRANSITION_ADDRESSES', () => {
        it('should set a deduplicated list "transitionAddresses" in state and payload to "transitionAddresses"', () => {
            const initialState = {
                transitionAddresses: ['foo'],
            };

            const action = {
                type: 'IOTA/WALLET/UPDATE_TRANSITION_ADDRESSES',
                payload: ['foo', 'bar'],
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                transitionAddresses: ['foo', 'bar'],
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/APP/WALLET/SET_DEEP_LINK', () => {
        it('should set "deepLinkActive" in state to true', () => {
            const initialState = {
                deepLinkActive: false,
            };

            const action = {
                type: 'IOTA/APP/WALLET/SET_DEEP_LINK',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                deepLinkActive: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/APP/WALLET/SET_DEEP_LINK_INACTIVE', () => {
        it('should set "deepLinkActive" in state to false', () => {
            const initialState = {
                deepLinkActive: true,
            };

            const action = {
                type: 'IOTA/APP/WALLET/SET_DEEP_LINK_INACTIVE',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                deepLinkActive: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/CONNECTION_CHANGED', () => {
        it('should set "hasConnection" in state to "isConnected" prop in payload', () => {
            const initialState = {
                hasConnection: false,
            };

            const action = {
                type: 'IOTA/WALLET/CONNECTION_CHANGED',
                payload: { isConnected: true },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                hasConnection: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
