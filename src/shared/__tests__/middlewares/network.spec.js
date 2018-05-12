import head from 'lodash/head';
import last from 'lodash/last';
import configureStore from 'redux-mock-store';
import { expect } from 'chai';
import thunk from 'redux-thunk';
import networkMiddleware from '../../middlewares/network';

describe('Middlewares: networkMiddleware', () => {
    describe('when action type is "IOTA/WALLET/CONNECTION_CHANGED"', () => {
        describe('when has lost connection', () => {
            it('should dispatch an alert action', () => {
                const middleware = [thunk, networkMiddleware];
                const mockStore = configureStore(middleware);
                const store = mockStore({});

                store.dispatch({
                    type: 'IOTA/WALLET/CONNECTION_CHANGED',
                    payload: { isConnected: false }
                });

                const actions = store.getActions();

                const firstExpectedAction = {
                    type: 'IOTA/ALERTS/SHOW',
                    category: 'error',
                    title: 'No network connection',
                    message: 'Your internet connection appears to be offline.',
                    closeInterval: 100000
                };

                expect(head(actions)).to.eql(firstExpectedAction);
            });

            it('should dispatch a connection change action', () => {
                const middleware = [thunk, networkMiddleware];
                const mockStore = configureStore(middleware);
                const store = mockStore({});

                store.dispatch({
                    type: 'IOTA/WALLET/CONNECTION_CHANGED',
                    payload: { isConnected: false }
                });

                const actions = store.getActions();

                const lastExpectedAction = {
                    type: 'IOTA/WALLET/CONNECTION_CHANGED',
                    payload: { isConnected: false }
                };

                expect(last(actions)).to.eql(lastExpectedAction);
            });
        });

        describe('when has restored connection', () => {
            it('should dispatch a connection change action', () => {
                const middleware = [thunk, networkMiddleware];
                const mockStore = configureStore(middleware);
                const store = mockStore({});

                store.dispatch({
                    type: 'IOTA/WALLET/CONNECTION_CHANGED',
                    payload: { isConnected: true }
                });

                const actions = store.getActions();

                const firstExpectedAction = {
                    type: 'IOTA/WALLET/CONNECTION_CHANGED',
                    payload: { isConnected: true }
                };

                expect(head(actions)).to.eql(firstExpectedAction);
            });

            it('should dispatch an alerts actions', () => {
                const middleware = [thunk, networkMiddleware];
                const mockStore = configureStore(middleware);
                const store = mockStore({});

                store.dispatch({
                    type: 'IOTA/WALLET/CONNECTION_CHANGED',
                    payload: { isConnected: true }
                });

                const actions = store.getActions();

                const lastExpectedAction = {
                    type: 'IOTA/ALERTS/HIDE',
                };

                expect(last(actions)).to.eql(lastExpectedAction);
            });
        });
    });
});
