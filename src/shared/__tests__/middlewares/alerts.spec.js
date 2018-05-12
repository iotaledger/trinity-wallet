import head from 'lodash/head';
import configureStore from 'redux-mock-store';
import { expect } from 'chai';
import thunk from 'redux-thunk';
import alertsMiddlware from '../../middlewares/alerts';

describe('Middlewares: alertsMiddleware', () => {
  describe('when action has a type including "ALERTS/SHOW"', () => {
    describe('when wallet has connection', () => {
      it('should dispatch action', () => {
        const middleware = [thunk, alertsMiddlware];
        const mockStore = configureStore(middleware);
        const store = mockStore({ wallet: { hasConnection: true } });

        store.dispatch({
          type: 'IOTA/ALERTS/SHOW',
          payload: {}
        });

        const expectedAction = { type: 'IOTA/ALERTS/SHOW', payload: {} };
        expect(head(store.getActions())).to.eql(expectedAction);
      });
    });

    describe('when wallet has no connection', () => {
      it('should ignore action', () => {
        const middleware = [thunk, alertsMiddlware];
        const mockStore = configureStore(middleware);
        const store = mockStore({ wallet: { hasConnection: false } });

        store.dispatch({
          type: 'IOTA/ALERTS/SHOW',
          payload: {}
        });

        expect(store.getActions()).to.eql([]);
      });
    });
  });

  describe('when action has a type including "ALERTS/HIDE"', () => {
    describe('when wallet has connection', () => {
      it('should dispatch action', () => {
        const middleware = [thunk, alertsMiddlware];
        const mockStore = configureStore(middleware);
        const store = mockStore({ wallet: { hasConnection: true } });

        store.dispatch({
          type: 'IOTA/ALERTS/HIDE',
          payload: {}
        });

        const expectedAction = { type: 'IOTA/ALERTS/HIDE', payload: {} };
        expect(head(store.getActions())).to.eql(expectedAction);
      });
    });

    describe('when wallet has no connection', () => {
      it('should ignore action', () => {
        const middleware = [thunk, alertsMiddlware];
        const mockStore = configureStore(middleware);
        const store = mockStore({ wallet: { hasConnection: false } });

        store.dispatch({
          type: 'IOTA/ALERTS/HIDE',
          payload: {}
        });

        expect(store.getActions()).to.eql([]);
      });
    });
  });

  describe('when action has a type not including "ALERTS/HIDE" or "ALERTS/SHOW"', () => {
    it('should dispatch action', () => {
      const middleware = [thunk, alertsMiddlware];
      const mockStore = configureStore(middleware);
      const store = mockStore({});

      store.dispatch({
        type: 'SOME_DUMMY_ACTION',
      });

      const expectedAction = { type: 'SOME_DUMMY_ACTION' };
      expect(head(store.getActions())).to.eql(expectedAction);
    });
  });
});
