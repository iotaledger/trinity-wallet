import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import * as actions from '../../actions/transfers';
import * as transferUtils from '../../libs/iota/transfers';
import * as accountsUtils from '../../libs/iota/accounts';
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
            it('should create actions of type IOTA/TRANSFERS/BROADCAST_BUNDLE_REQUEST, IOTA/ALERTS/SHOW and IOTA/TRANSFERS/BROADCAST_BUNDLE_ERROR', () => {
                const isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(false);
                const store = mockStore({ accounts });

                const expectedActions = [
                    'IOTA/TRANSFERS/BROADCAST_BUNDLE_REQUEST',
                    'IOTA/ALERTS/SHOW',
                    'IOTA/TRANSFERS/BROADCAST_BUNDLE_ERROR',
                ];

                return store
                    .dispatch(
                        actions.broadcastBundle(
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
            it('should create actions of type IOTA/TRANSFERS/BROADCAST_BUNDLE_REQUEST, IOTA/TRANSFERS/BROADCAST_BUNDLE_SUCCESS and IOTA/ALERTS/SHOW', () => {
                const isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(true);
                const store = mockStore({ accounts });

                const expectedActions = [
                    'IOTA/TRANSFERS/BROADCAST_BUNDLE_REQUEST',
                    'IOTA/ALERTS/SHOW',
                    'IOTA/TRANSFERS/BROADCAST_BUNDLE_SUCCESS',
                ];

                return store
                    .dispatch(
                        actions.broadcastBundle(
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

    describe('#promoteTransaction', () => {
        before(() => {
            sinon.stub(iota.api, 'promoteTransaction').yields(null, '9'.repeat(81));
            sinon.stub(iota.api, 'replayBundle').yields(null, []);
        });

        after(() => {
            if (iota.api.promoteTransaction.restore) {
                iota.api.promoteTransaction.restore();
            }

            if (iota.api.replayBundle.restore) {
                iota.api.replayBundle.restore();
            }
        });

        describe('when bundle is invalid', () => {
            it('should create actions of type IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST, IOTA/ALERTS/SHOW and IOTA/TRANSFERS/PROMOTE_TRANSACTION_ERROR', () => {
                const isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(false);
                const store = mockStore({ accounts });

                const expectedActions = [
                    'IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
                    'IOTA/ALERTS/SHOW',
                    'IOTA/TRANSFERS/PROMOTE_TRANSACTION_ERROR',
                ];

                return store
                    .dispatch(
                        actions.promoteTransaction(
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

        describe('when bundle is valid and has a consistent tail', () => {
            it('should create actions of type IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST, IOTA/TRANSFERS/PROMOTE_TRANSACTION_SUCCESS and IOTA/ALERTS/SHOW', () => {
                const isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(true);
                const getFirstConsistentTail = sinon
                    .stub(transferUtils, 'getFirstConsistentTail')
                    .resolves('YVDXKCJNZIDNKBCLLRVJATPFYQC9XANKBWRDDXOOUMNKALDWGXHUBAJJCHGECUEHAUFGJZQZUMCV99999');

                const store = mockStore({ accounts });

                const expectedActions = [
                    'IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
                    'IOTA/ALERTS/SHOW',
                    'IOTA/TRANSFERS/PROMOTE_TRANSACTION_SUCCESS',
                ];

                return store
                    .dispatch(
                        actions.promoteTransaction(
                            'ABHSKIARZVHZ9GKX9DJDSB9YPFKPPHBOOHSKTENCWQHLRGXTFWEDKLREGF9WIFBYNUEXUTJUL9GYLAXRD',
                            'TEST',
                        ),
                    )
                    .then(() => {
                        expect(store.getActions().map((action) => action.type)).to.eql(expectedActions);
                        isStillAValidTransaction.restore();
                        getFirstConsistentTail.restore();
                    });
            });

            it('should not create an action of type IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_REATTACHMENT', () => {
                const isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(true);
                const getFirstConsistentTail = sinon
                    .stub(transferUtils, 'getFirstConsistentTail')
                    .resolves('YVDXKCJNZIDNKBCLLRVJATPFYQC9XANKBWRDDXOOUMNKALDWGXHUBAJJCHGECUEHAUFGJZQZUMCV99999');

                const store = mockStore({ accounts });

                return store
                    .dispatch(
                        actions.promoteTransaction(
                            'ABHSKIARZVHZ9GKX9DJDSB9YPFKPPHBOOHSKTENCWQHLRGXTFWEDKLREGF9WIFBYNUEXUTJUL9GYLAXRD',
                            'TEST',
                        ),
                    )
                    .then(() => {
                        expect(store.getActions().map((action) => action.type)).to.not.include(
                            'IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_REATTACHMENT',
                        );
                        isStillAValidTransaction.restore();
                        getFirstConsistentTail.restore();
                    });
            });
        });

        describe('when bundle is valid and does not have any consistent tail', () => {
            it('should create an action of type IOTA/ALERTS/SHOW twice', () => {
                const isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(true);
                const getFirstConsistentTail = sinon.stub(transferUtils, 'getFirstConsistentTail').resolves(false);

                const store = mockStore({ accounts });

                return store
                    .dispatch(
                        actions.promoteTransaction(
                            'ABHSKIARZVHZ9GKX9DJDSB9YPFKPPHBOOHSKTENCWQHLRGXTFWEDKLREGF9WIFBYNUEXUTJUL9GYLAXRD',
                            'TEST',
                        ),
                    )
                    .then(() => {
                        expect(
                            store
                                .getActions()
                                .map((action) => action.type)
                                .filter((type) => type === 'IOTA/ALERTS/SHOW').length,
                        ).to.equal(2);
                        isStillAValidTransaction.restore();
                        getFirstConsistentTail.restore();
                    });
            });

            it('should call accounts util "syncAccountAfterReattachment"', () => {
                const isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(true);
                const getFirstConsistentTail = sinon.stub(transferUtils, 'getFirstConsistentTail').resolves(false);
                const syncAccountAfterReattachment = sinon
                    .stub(accountsUtils, 'syncAccountAfterReattachment')
                    .resolves({});

                const store = mockStore({ accounts });

                return store
                    .dispatch(
                        actions.promoteTransaction(
                            'ABHSKIARZVHZ9GKX9DJDSB9YPFKPPHBOOHSKTENCWQHLRGXTFWEDKLREGF9WIFBYNUEXUTJUL9GYLAXRD',
                            'TEST',
                        ),
                    )
                    .then(() => {
                        expect(syncAccountAfterReattachment.calledOnce).to.equal(true);
                        isStillAValidTransaction.restore();
                        getFirstConsistentTail.restore();
                        syncAccountAfterReattachment.restore();
                    });
            });

            it('should create an action of type IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_REATTACHMENT', () => {
                const isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(true);
                const getFirstConsistentTail = sinon.stub(transferUtils, 'getFirstConsistentTail').resolves(false);
                const syncAccountAfterReattachment = sinon
                    .stub(accountsUtils, 'syncAccountAfterReattachment')
                    .resolves({});

                const store = mockStore({ accounts });

                return store
                    .dispatch(
                        actions.promoteTransaction(
                            'ABHSKIARZVHZ9GKX9DJDSB9YPFKPPHBOOHSKTENCWQHLRGXTFWEDKLREGF9WIFBYNUEXUTJUL9GYLAXRD',
                            'TEST',
                        ),
                    )
                    .then(() => {
                        expect(store.getActions().map((action) => action.type)).to.include(
                            'IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_REATTACHMENT',
                        );
                        isStillAValidTransaction.restore();
                        getFirstConsistentTail.restore();
                        syncAccountAfterReattachment.restore();
                    });
            });
        });
    });
});
