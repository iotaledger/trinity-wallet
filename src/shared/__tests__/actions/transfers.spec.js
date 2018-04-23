import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import { broadcastBundle } from '../../actions/transfers';
import * as transferUtils from '../../libs/iota/transfers';
import { iota } from '../../libs/iota/index';
import accounts from '../__samples__/accounts';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('actions: transfers', () => {
    describe('#broadcastBundle', () => {
        before(() => {
            sinon.stub(iota.api, 'broadcastBundle').yields(null);
        });

        after(() => {
            if (iota.api.broadcastBundle.restore) {
                iota.api.broadcastBundle.restore();
            }
        });

        describe('when bundle is invalid', () => {
            it('should create actions of type IOTA/TRANSFERS/BROADCAST_BUNDLE_ERROR and IOTA/ALERTS/SHOW', () => {
                const isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(false);
                const store = mockStore({ accounts });

                const expectedActions = [
                    'IOTA/TRANSFERS/BROADCAST_BUNDLE_REQUEST',
                    'IOTA/ALERTS/SHOW',
                    'IOTA/TRANSFERS/BROADCAST_BUNDLE_ERROR',
                ];

                return store
                    .dispatch(
                        broadcastBundle(
                            'ABHSKIARZVHZ9GKX9DJDSB9YPFKPPHBOOHSKTENCWQHLRGXTFWEDKLREGF9WIFBYNUEXUTJUL9GYLAXRD',
                            'TEST',
                        ),
                    )
                    .then(() => {
                        expect(store.getActions().map((action) => action.type)).to.eql(expectedActions);
                        isStillAValidTransaction.restore();
                    });
            });
        });

        describe('when bundle is valid', () => {
            it('should create actions of type IOTA/TRANSFERS/BROADCAST_BUNDLE_SUCCESS and IOTA/ALERTS/SHOW', () => {
                const isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(true);
                const store = mockStore({ accounts });

                const expectedActions = [
                    'IOTA/TRANSFERS/BROADCAST_BUNDLE_REQUEST',
                    'IOTA/ALERTS/SHOW',
                    'IOTA/TRANSFERS/BROADCAST_BUNDLE_SUCCESS',
                ];

                return store
                    .dispatch(
                        broadcastBundle(
                            'ABHSKIARZVHZ9GKX9DJDSB9YPFKPPHBOOHSKTENCWQHLRGXTFWEDKLREGF9WIFBYNUEXUTJUL9GYLAXRD',
                            'TEST',
                        ),
                    )
                    .then(() => {
                        expect(store.getActions().map((action) => action.type)).to.eql(expectedActions);
                        isStillAValidTransaction.restore();
                    });
            });
        });
    });
});
