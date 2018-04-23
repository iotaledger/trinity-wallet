import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import * as actions from '../../actions/transfers';
import * as transferUtils from '../../libs/iota/transfers';
import * as accountsUtils from '../../libs/iota/accounts';
import * as inputUtils from '../../libs/iota/inputs';
import { iota, SwitchingConfig } from '../../libs/iota/index';
import accounts from '../__samples__/accounts';
import trytes from '../__samples__/trytes';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('actions: transfers', () => {
    let sandbox;

    before(() => {
        SwitchingConfig.autoSwitch = false;
        sandbox = sinon.sandbox.create();
        sandbox.stub(iota.api, 'getNodeInfo').yields(null, {});
    });

    after(() => {
        SwitchingConfig.autoSwitch = true;
        sandbox.restore();
    });

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
            let isStillAValidTransaction;

            beforeEach(() => {
                isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(false);
            });

            afterEach(() => {
                if (isStillAValidTransaction.restore) {
                    isStillAValidTransaction.restore();
                }
            });

            it('should create actions of type IOTA/TRANSFERS/BROADCAST_BUNDLE_REQUEST, IOTA/ALERTS/SHOW and IOTA/TRANSFERS/BROADCAST_BUNDLE_ERROR', () => {
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
                    });
            });
        });

        describe('when bundle is valid', () => {
            let isStillAValidTransaction;

            beforeEach(() => {
                isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(true);
            });

            afterEach(() => {
                if (isStillAValidTransaction.restore) {
                    isStillAValidTransaction.restore();
                }
            });

            it('should create actions of type IOTA/TRANSFERS/BROADCAST_BUNDLE_REQUEST, IOTA/TRANSFERS/BROADCAST_BUNDLE_SUCCESS and IOTA/ALERTS/SHOW', () => {
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
            let isStillAValidTransaction;

            beforeEach(() => {
                isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(false);
            });

            afterEach(() => {
                if (isStillAValidTransaction.restore) {
                    isStillAValidTransaction.restore();
                }
            });

            it('should create actions of type IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST, IOTA/ALERTS/SHOW and IOTA/TRANSFERS/PROMOTE_TRANSACTION_ERROR', () => {
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
                    });
            });
        });

        describe('when bundle is valid and has a consistent tail', () => {
            let isStillAValidTransaction;
            let getFirstConsistentTail;

            beforeEach(() => {
                isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(true);
                getFirstConsistentTail = sinon
                    .stub(transferUtils, 'getFirstConsistentTail')
                    .resolves('YVDXKCJNZIDNKBCLLRVJATPFYQC9XANKBWRDDXOOUMNKALDWGXHUBAJJCHGECUEHAUFGJZQZUMCV99999');
            });

            afterEach(() => {
                if (isStillAValidTransaction.restore) {
                    isStillAValidTransaction.restore();
                }

                if (getFirstConsistentTail.restore) {
                    getFirstConsistentTail.restore();
                }
            });

            it('should create actions of type IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST, IOTA/TRANSFERS/PROMOTE_TRANSACTION_SUCCESS and IOTA/ALERTS/SHOW', () => {
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
                    });
            });

            it('should not create an action of type IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_REATTACHMENT', () => {
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
                    });
            });
        });

        describe('when bundle is valid and does not have any consistent tail', () => {
            let isStillAValidTransaction;
            let getFirstConsistentTail;

            beforeEach(() => {
                isStillAValidTransaction = sinon.stub(transferUtils, 'isStillAValidTransaction').resolves(true);
                getFirstConsistentTail = sinon.stub(transferUtils, 'getFirstConsistentTail').resolves(false);
            });

            afterEach(() => {
                if (isStillAValidTransaction.restore) {
                    isStillAValidTransaction.restore();
                }

                if (getFirstConsistentTail.restore) {
                    getFirstConsistentTail.restore();
                }
            });

            it('should create an action of type IOTA/ALERTS/SHOW twice', () => {
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
                    });
            });

            it('should call accounts util "syncAccountAfterReattachment"', () => {
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
                        syncAccountAfterReattachment.restore();
                    });
            });

            it('should create an action of type IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_REATTACHMENT', () => {
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
                        syncAccountAfterReattachment.restore();
                    });
            });
        });
    });

    describe('#makeTransaction', () => {
        let powFn;
        let genFn;

        before(() => {
            sandbox.stub(iota.api, 'getTransactionsToApprove').yields(null, {
                trunkTransaction: 'PMEL9E9ZACLGEUPHNX9TSLEBDKTIGXDERNQSURABASAIGPWTFB9WUIXQVPKIFTHUQBRXEYQJANBDZ9999',
                branchTransaction: 'BPZXKIPUOMPXZFLASWNSOXOACWOKYYIQCPYEVEPQSNAHJIRMLQZUZEHQAPTBGOILOTUWJUXLIBZP99999',
            });
            sandbox.stub(iota.api, 'attachToTangle').yields(null, trytes.zeroValue);
            sandbox.stub(iota.api, 'storeAndBroadcast').yields(null);
            sandbox.stub(iota.api, 'findTransactions').yields(null, []);
            sandbox.stub(iota.api, 'getBalances').yields(null, []);
            sandbox.stub(iota.api, 'getInclusionStates').yields(null, []);

            powFn = () => Promise.resolve('9'.repeat(27));
            genFn = () => Promise.resolve('A'.repeat(81));
        });

        describe('zero value transactions', () => {
            it('should create five actions of type IOTA/PROGRESS/SET_NEXT_STEP_AS_ACTIVE', () => {
                const store = mockStore({ accounts });
                const prepareTransfers = sinon.stub(iota.api, 'prepareTransfers').yields(null, trytes.zeroValue);
                const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, []);
                const syncAccountAfterSpending = sinon.stub(accountsUtils, 'syncAccountAfterSpending').resolves({});

                return store
                    .dispatch(
                        actions.makeTransaction(
                            'SEED',
                            'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUNXELTUENX',
                            0,
                            'TEST MESSAGE',
                            'TEST',
                            powFn,
                            genFn,
                        ),
                    )
                    .then(() => {
                        expect(
                            store
                                .getActions()
                                .map((action) => action.type)
                                .filter((type) => type === 'IOTA/PROGRESS/SET_NEXT_STEP_AS_ACTIVE').length,
                        ).to.equal(5);

                        prepareTransfers.restore();
                        wereAddressesSpentFrom.restore();
                        syncAccountAfterSpending.restore();
                    });
            });

            it('should create an action of type IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING', () => {
                const store = mockStore({ accounts });

                const prepareTransfers = sinon.stub(iota.api, 'prepareTransfers').yields(null, trytes.zeroValue);
                const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, []);
                const syncAccountAfterSpending = sinon.stub(accountsUtils, 'syncAccountAfterSpending').resolves({});

                return store
                    .dispatch(
                        actions.makeTransaction(
                            'SEED',
                            'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUNXELTUENX',
                            0,
                            'TEST MESSAGE',
                            'TEST',
                            powFn,
                            genFn,
                        ),
                    )
                    .then(() => {
                        expect(store.getActions().map((action) => action.type)).to.include(
                            'IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
                        );

                        prepareTransfers.restore();
                        wereAddressesSpentFrom.restore();
                        syncAccountAfterSpending.restore();
                    });
            });
        });

        describe('value transactions', () => {
            describe('when transaction successfully completes', () => {
                it('should create eight actions of type IOTA/PROGRESS/SET_NEXT_STEP_AS_ACTIVE', () => {
                    const prepareTransfers = sinon.stub(iota.api, 'prepareTransfers').yields(null, trytes.value);
                    const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false]);

                    const getUnspentInputs = sinon.stub(inputUtils, 'getUnspentInputs').resolves({
                        allBalance: 110,
                        totalBalance: 10,
                        inputs: [
                            {
                                address:
                                    'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                            },
                        ],
                    });

                    const syncAccountAfterSpending = sinon.stub(accountsUtils, 'syncAccountAfterSpending').resolves({});

                    const store = mockStore({ accounts });

                    return store
                        .dispatch(
                            actions.makeTransaction(
                                'SEED',
                                'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUNXELTUENX',
                                2,
                                'TEST MESSAGE',
                                'TEST',
                                powFn,
                                genFn,
                            ),
                        )
                        .then(() => {
                            expect(
                                store
                                    .getActions()
                                    .map((action) => action.type)
                                    .filter((type) => type === 'IOTA/PROGRESS/SET_NEXT_STEP_AS_ACTIVE').length,
                            ).to.equal(8);

                            syncAccountAfterSpending.restore();
                            getUnspentInputs.restore();
                            prepareTransfers.restore();
                            wereAddressesSpentFrom.restore();
                        });
                });
            });

            describe('when transaction does not complete', () => {
                describe('when recipient address is used', () => {
                    it('should create action of type IOTA/ALERTS/SHOW with a message "You cannot send to an address that has already been spent from."', () => {
                        const wereAddressesSpentFrom = sinon
                            .stub(iota.api, 'wereAddressesSpentFrom')
                            .yields(null, [true]);
                        sinon.stub(accountsUtils, 'syncAccountAfterSpending').resolves({});

                        const store = mockStore({ accounts });

                        return store
                            .dispatch(
                                actions.makeTransaction(
                                    'SEED',
                                    'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUNXELTUENX',
                                    2,
                                    'TEST MESSAGE',
                                    'TEST',
                                    powFn,
                                    genFn,
                                ),
                            )
                            .then(() => {
                                expect(
                                    store.getActions().find((action) => action.type === 'IOTA/ALERTS/SHOW').message,
                                ).to.equal('You cannot send to an address that has already been spent from.');

                                wereAddressesSpentFrom.restore();
                                accountsUtils.syncAccountAfterSpending.restore();
                            });
                    });
                });

                describe('when does not have enough balance', () => {
                    it('should create action of type IOTA/ALERTS/SHOW with a message "You do not have enough IOTA to complete this transfer."', () => {
                        const store = mockStore({ accounts });

                        const wereAddressesSpentFrom = sinon
                            .stub(iota.api, 'wereAddressesSpentFrom')
                            .yields(null, [false]);
                        sinon.stub(inputUtils, 'getUnspentInputs').resolves({
                            allBalance: 110,
                            totalBalance: 10,
                            inputs: [
                                {
                                    address:
                                        'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                                },
                            ],
                        });
                        sinon.stub(accountsUtils, 'syncAccountAfterSpending').resolves({});

                        return store
                            .dispatch(
                                actions.makeTransaction(
                                    'SEED',
                                    'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUNXELTUENX',
                                    200,
                                    'TEST MESSAGE',
                                    'TEST',
                                    powFn,
                                    genFn,
                                ),
                            )
                            .then(() => {
                                expect(
                                    store.getActions().find((action) => action.type === 'IOTA/ALERTS/SHOW').message,
                                ).to.equal('You do not have enough IOTA to complete this transfer.');

                                wereAddressesSpentFrom.restore();
                                inputUtils.getUnspentInputs.restore();
                                accountsUtils.syncAccountAfterSpending.restore();
                            });
                    });
                });
            });
        });
    });
});
