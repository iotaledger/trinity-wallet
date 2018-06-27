import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import * as actions from '../../actions/transfers';
import * as transferUtils from '../../libs/iota/transfers';
import * as accountsUtils from '../../libs/iota/accounts';
import * as extendedApis from '../../libs/iota/extendedApi';
import * as inputUtils from '../../libs/iota/inputs';
import { iota, SwitchingConfig } from '../../libs/iota/index';
import accounts from '../__samples__/accounts';
import trytes from '../__samples__/trytes';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('actions: transfers', () => {
    before(() => {
        SwitchingConfig.autoSwitch = false;
    });

    after(() => {
        SwitchingConfig.autoSwitch = true;
    });

    describe('#promoteTransaction', () => {
        describe('when bundle is invalid', () => {
            let sandbox;

            beforeEach(() => {
                sandbox = sinon.sandbox.create();

                sandbox.stub(iota.api, 'promoteTransaction').yields(null, '9'.repeat(81));
                sandbox.stub(iota.api, 'replayBundle').yields(null, []);
                sandbox.stub(transferUtils, 'isStillAValidTransaction').resolves(false);
                sandbox.stub(accountsUtils, 'syncAccount').resolves(accounts.accountInfo.TEST);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should create actions of type IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST, IOTA/ALERTS/SHOW, IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION, IOTA/ALERTS/SHOW and IOTA/TRANSFERS/PROMOTE_TRANSACTION_ERROR', () => {
                const store = mockStore({ accounts, settings: { remotePoW: false } });

                const expectedActions = [
                    'IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
                    'IOTA/ALERTS/SHOW',
                    'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION',
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
            let sandbox;

            beforeEach(() => {
                sandbox = sinon.sandbox.create();

                sandbox.stub(accountsUtils, 'syncAccount').resolves(accounts.accountInfo.TEST);
                sandbox.stub(iota.api, 'promoteTransaction').yields(null, '9'.repeat(81));
                sandbox.stub(transferUtils, 'isStillAValidTransaction').resolves(true);
                sandbox
                    .stub(transferUtils, 'getFirstConsistentTail')
                    .resolves('YVDXKCJNZIDNKBCLLRVJATPFYQC9XANKBWRDDXOOUMNKALDWGXHUBAJJCHGECUEHAUFGJZQZUMCV99999');
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should create actions of type IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST, IOTA/ALERTS/SHOW, IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION, IOTA/TRANSFERS/PROMOTE_TRANSACTION_SUCCESS and IOTA/ALERTS/SHOW', () => {
                const store = mockStore({ accounts, settings: { remotePoW: false } });

                const expectedActions = [
                    'IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
                    'IOTA/ALERTS/SHOW',
                    'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION',
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
                const store = mockStore({ accounts, settings: { remotePoW: false } });

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
            let sandbox;
            let syncAccountAfterReattachment;

            beforeEach(() => {
                sandbox = sinon.sandbox.create();

                sandbox.stub(iota.api, 'replayBundle').yields(null, []);
                sandbox.stub(transferUtils, 'isStillAValidTransaction').resolves(true);
                sandbox.stub(transferUtils, 'getFirstConsistentTail').resolves(false);
                sandbox.stub(accountsUtils, 'syncAccount').resolves(accounts.accountInfo.TEST);
                syncAccountAfterReattachment = sandbox.stub(accountsUtils, 'syncAccountAfterReattachment').returns({
                    newState: {},
                    reattachment: [],
                    normalisedReattachment: {},
                });
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should create an action of type IOTA/ALERTS/SHOW thrice', () => {
                const store = mockStore({ accounts, settings: { remotePoW: false } });

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
                        ).to.equal(3);
                    });
            });

            it('should call accounts util "syncAccountAfterReattachment"', () => {
                const store = mockStore({ accounts, settings: { remotePoW: false } });

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
                const store = mockStore({ accounts, settings: { remotePoW: false } });

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
            powFn = () => Promise.resolve('9'.repeat(27));
            genFn = () => Promise.resolve('A'.repeat(81));
        });

        describe('zero value transactions', () => {
            let sandbox;

            beforeEach(() => {
                sandbox = sinon.sandbox.create();

                sandbox.stub(iota.api, 'getNodeInfo').yields(null, {});
                sandbox.stub(iota.api, 'getTransactionsToApprove').yields(null, {
                    trunkTransaction:
                        'PMEL9E9ZACLGEUPHNX9TSLEBDKTIGXDERNQSURABASAIGPWTFB9WUIXQVPKIFTHUQBRXEYQJANBDZ9999',
                    branchTransaction:
                        'BPZXKIPUOMPXZFLASWNSOXOACWOKYYIQCPYEVEPQSNAHJIRMLQZUZEHQAPTBGOILOTUWJUXLIBZP99999',
                });
                sandbox.stub(iota.api, 'attachToTangle').yields(null, trytes.zeroValue);
                sandbox.stub(iota.api, 'storeAndBroadcast').yields(null);
                sandbox.stub(iota.api, 'findTransactions').yields(null, []);
                sandbox.stub(iota.api, 'getBalances').yields(null, []);
                sandbox.stub(iota.api, 'getInclusionStates').yields(null, []);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should create five actions of type IOTA/PROGRESS/SET_NEXT_STEP_AS_ACTIVE', () => {
                const store = mockStore({ accounts });
                const prepareTransfers = sinon.stub(iota.api, 'prepareTransfers').yields(null, trytes.zeroValue);
                const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, []);
                const syncAccountAfterSpending = sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns({});

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
                const syncAccountAfterSpending = sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns({});

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
            let sandbox;

            beforeEach(() => {
                sandbox = sinon.sandbox.create();

                sandbox.stub(iota.api, 'getNodeInfo').yields(null, {});
                sandbox.stub(extendedApis, 'isNodeSynced').resolves(true);
                sandbox.stub(iota.api, 'getTransactionsToApprove').yields(null, {
                    trunkTransaction:
                        'PMEL9E9ZACLGEUPHNX9TSLEBDKTIGXDERNQSURABASAIGPWTFB9WUIXQVPKIFTHUQBRXEYQJANBDZ9999',
                    branchTransaction:
                        'BPZXKIPUOMPXZFLASWNSOXOACWOKYYIQCPYEVEPQSNAHJIRMLQZUZEHQAPTBGOILOTUWJUXLIBZP99999',
                });
                sandbox.stub(iota.api, 'attachToTangle').yields(null, trytes.zeroValue);
                sandbox.stub(iota.api, 'storeAndBroadcast').yields(null);
                sandbox.stub(iota.api, 'findTransactions').yields(null, []);
                sandbox.stub(iota.api, 'getBalances').yields(null, []);
                sandbox.stub(iota.api, 'getInclusionStates').yields(null, []);
            });

            afterEach(() => {
                sandbox.restore();
            });

            describe('when transaction is successful', () => {
                it('should create nine actions of type IOTA/PROGRESS/SET_NEXT_STEP_AS_ACTIVE', () => {
                    const prepareTransfers = sinon.stub(iota.api, 'prepareTransfers').yields(null, trytes.value);
                    const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false]);

                    const getUnspentInputs = sinon.stub(inputUtils, 'getUnspentInputs').resolves({
                        totalBalance: 110,
                        availableBalance: 10,
                        inputs: [
                            {
                                address:
                                    'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                            },
                        ],
                    });

                    const syncAccountAfterSpending = sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns({});

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
                            ).to.equal(9);

                            syncAccountAfterSpending.restore();
                            getUnspentInputs.restore();
                            prepareTransfers.restore();
                            wereAddressesSpentFrom.restore();
                        });
                });
            });

            describe('when transaction fails', () => {
                describe('when recipient address is used', () => {
                    it('should create action of type IOTA/ALERTS/SHOW with a message "You cannot send to an address that has already been spent from."', () => {
                        const wereAddressesSpentFrom = sinon
                            .stub(iota.api, 'wereAddressesSpentFrom')
                            .yields(null, [true]);
                        sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns({});

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
                            totalBalance: 110,
                            availableBalance: 10,
                            inputs: [
                                {
                                    address:
                                        'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                                },
                            ],
                        });
                        sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns({});

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

                describe('when has funds at spent addresses', () => {
                    it('should create action of type IOTA/ALERTS/SHOW with a message "Sending from the same address more than once is dangerous. Please head to the #help channel on Discord to find out what you can do."', () => {
                        const store = mockStore({ accounts });

                        const wereAddressesSpentFrom = sinon
                            .stub(iota.api, 'wereAddressesSpentFrom')
                            .yields(null, [false]);

                        sinon.stub(inputUtils, 'getUnspentInputs').resolves({
                            totalBalance: 110,
                            availableBalance: 0,
                            inputs: [],
                            spentAddresses: [
                                {
                                    address:
                                        'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                                },
                            ],
                        });
                        sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns({});

                        return store
                            .dispatch(
                                actions.makeTransaction(
                                    'SEED',
                                    'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUNXELTUENX',
                                    100,
                                    'TEST MESSAGE',
                                    'TEST',
                                    powFn,
                                    genFn,
                                ),
                            )
                            .then(() => {
                                expect(
                                    store.getActions().find((action) => action.type === 'IOTA/ALERTS/SHOW').message,
                                ).to.equal(
                                    'Sending from the same address more than once is dangerous. Please head to the #help channel on Discord to find out what you can do.',
                                );

                                wereAddressesSpentFrom.restore();
                                inputUtils.getUnspentInputs.restore();
                                accountsUtils.syncAccountAfterSpending.restore();
                            });
                    });
                });

                describe('when receive address is one of the input addresses', () => {
                    it('should create action of type IOTA/ALERTS/SHOW with a message "You cannot make a value transfer to one of your own addresses."', () => {
                        const store = mockStore({ accounts });

                        const wereAddressesSpentFrom = sinon
                            .stub(iota.api, 'wereAddressesSpentFrom')
                            .yields(null, [false]);

                        sinon.stub(inputUtils, 'getUnspentInputs').resolves({
                            totalBalance: 110,
                            availableBalance: 10,
                            inputs: [
                                {
                                    address:
                                        'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                                },
                                {
                                    address:
                                        'NNLAKCEDT9FMFLBIFWKHRIQJJETOSBSFPUCBWYYXXYKSLNCCSWOQRAVOYUSX9FMLGHMKUITLFEQIPHQLW',
                                },
                            ],
                        });
                        sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns({});

                        return store
                            .dispatch(
                                actions.makeTransaction(
                                    'SEED',
                                    'NNLAKCEDT9FMFLBIFWKHRIQJJETOSBSFPUCBWYYXXYKSLNCCSWOQRAVOYUSX9FMLGHMKUITLFEQIPHQLWWSWWTDSVX',
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
                                ).to.equal('You cannot make a value transfer to one of your own addresses.');

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
