import nock from 'nock';
import Realm from 'realm';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import * as actions from '../../actions/transfers';
import * as transferUtils from '../../libs/iota/transfers';
import * as accountsUtils from '../../libs/iota/accounts';
import * as extendedApis from '../../libs/iota/extendedApi';
import * as inputUtils from '../../libs/iota/inputs';
import { iota, SwitchingConfig } from '../../libs/iota';
import { realm, config as realmConfig, Account, Wallet } from '../../storage';
import accounts from '../__samples__/accounts';
import { addressData } from '../__samples__/addresses';
import trytes from '../__samples__/trytes';
import transactions from '../__samples__/transactions';
import { IRI_API_VERSION } from '../../config';
import Errors from '../../libs/errors';

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
        let powFn;

        before(() => {
            Realm.deleteFile(realmConfig);
            powFn = () => Promise.resolve('9'.repeat(27));
        });

        beforeEach(() => {
            Account.create({ name: 'test' });
            Wallet.createIfNotExists();
        });

        afterEach(() => {
            realm.write(() => {
                realm.delete(Account.data);
                realm.delete(Wallet.data);
            });
        });

        after(() => {
            Realm.deleteFile(realmConfig);
        });

        describe('when called', () => {
            let sandbox;

            beforeEach(() => {
                sandbox = sinon.sandbox.create();

                sandbox.stub(accountsUtils, 'syncAccount').returns(() => Promise.reject(new Error()));
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should create an action of type IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST', () => {
                const store = mockStore({ accounts, settings: { remotePoW: false } });

                return store
                    .dispatch(actions.promoteTransaction('9'.repeat(81), 'TEST', powFn))
                    .then(() =>
                        expect(store.getActions().map((action) => action.type)).to.include(
                            'IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
                        ),
                    );
            });

            it('should sync account', () => {
                const store = mockStore({ accounts, settings: { remotePoW: false } });

                return store
                    .dispatch(actions.promoteTransaction('9'.repeat(81), 'TEST', powFn))
                    .then(() => expect(accountsUtils.syncAccount.calledOnce).to.equal(true));
            });

            describe('when remotePoW in settings is false', () => {
                it('should create an action of type IOTA/ALERTS/SHOW with message "Your device may become unresponsive for a while."', () => {
                    const store = mockStore({ accounts, settings: { remotePoW: false } });

                    return store.dispatch(actions.promoteTransaction('9'.repeat(81), 'TEST', powFn)).then(() => {
                        const expectedAction = {
                            category: 'info',
                            closeInterval: 5500,
                            message: 'Your device may become unresponsive for a while.',
                            title: 'Promoting transaction',
                            type: 'IOTA/ALERTS/SHOW',
                        };

                        const actualAction = store
                            .getActions()
                            .find(
                                (action) =>
                                    action.type === 'IOTA/ALERTS/SHOW' &&
                                    action.message === 'Your device may become unresponsive for a while.',
                            );

                        expect(actualAction).to.eql(expectedAction);
                    });
                });
            });

            describe('when remotePoW in settings is true', () => {
                it('should not create an action of type IOTA/ALERTS/SHOW with message "Your device may become unresponsive for a while."', () => {
                    const store = mockStore({ accounts, settings: { remotePoW: true } });

                    return store.dispatch(actions.promoteTransaction('9'.repeat(81), 'TEST', powFn)).then(() => {
                        const expectedAction = {
                            category: 'info',
                            closeInterval: 5500,
                            message: 'Your device may become unresponsive for a while.',
                            title: 'Promoting transaction',
                            type: 'IOTA/ALERTS/SHOW',
                        };

                        const actualAction = store
                            .getActions()
                            .find(
                                (action) =>
                                    action.type === 'IOTA/ALERTS/SHOW' &&
                                    action.message === 'Your device may become unresponsive for a while.',
                            );

                        expect(actualAction).to.not.eql(expectedAction);
                        expect(actualAction).to.equal(undefined);
                    });
                });
            });
        });

        describe('when successfully syncs account', () => {
            it('should dispatch an action of type "IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION" with updated account state', () => {
                const store = mockStore({ accounts, settings: { remotePoW: false } });
                const syncAccount = sinon.stub(accountsUtils, 'syncAccount').returns(
                    // Updated account state
                    () => Promise.resolve({ addressData, transactions }),
                );

                return store.dispatch(actions.promoteTransaction('9'.repeat(81), 'TEST', powFn)).then(() => {
                    const expectedAction = {
                        type: 'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION',
                        payload: {
                            transactions,
                            addressData,
                        },
                    };

                    const actualAction = store
                        .getActions()
                        .find((action) => action.type === 'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION');
                    expect(actualAction).to.eql(expectedAction);

                    // Restore stub
                    syncAccount.restore();
                });
            });
        });

        describe('when account syncing fails', () => {
            it('should dispatch an action of type "IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION" with updated account state', () => {
                const store = mockStore({ accounts, settings: { remotePoW: false } });
                const syncAccount = sinon.stub(accountsUtils, 'syncAccount').returns(
                    // Reject account syncing
                    () => Promise.reject(new Error()),
                );

                return store.dispatch(actions.promoteTransaction('9'.repeat(81), 'TEST', powFn)).then(() => {
                    const expectedAction = {
                        type: 'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION',
                        payload: {
                            transactions,
                            addressData,
                        },
                    };

                    const actualAction = store
                        .getActions()
                        .find((action) => action.type === 'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION');

                    expect(actualAction).to.not.eql(expectedAction);
                    expect(actualAction).to.equal(undefined);

                    // Restore stub
                    syncAccount.restore();
                });
            });
        });

        describe('when transaction is already confirmed', () => {
            it('should create an action of type "IOTA/ALERTS/SHOW" with message "The transaction you are trying to promote is already confirmed."', () => {
                const store = mockStore({ accounts, settings: { remotePoW: false } });
                const syncAccount = sinon.stub(accountsUtils, 'syncAccount').returns(
                    // Updated account state
                    () => Promise.resolve({ addressData, transactions }),
                );

                // Bundle hash of a confirmed value transaction. See __samples__/transactions
                const bundleHash = 'AGLVISDEBEYCZVIQFVHSSZISEZDCPKQJNQIHLQASIGHJWEJPWLHQUTPDQZUEZQIBHEDY9SRIBGJJEQQLZ';

                return store.dispatch(actions.promoteTransaction(bundleHash, 'TEST', powFn)).then(() => {
                    const expectedAction = {
                        category: 'success',
                        type: 'IOTA/ALERTS/SHOW',
                        title: 'Transaction already confirmed',
                        message: 'The transaction you are trying to promote is already confirmed.',
                        closeInterval: 5500,
                    };

                    const actualAction = store
                        .getActions()
                        .find(
                            (action) =>
                                action.type === 'IOTA/ALERTS/SHOW' &&
                                action.message === 'The transaction you are trying to promote is already confirmed.',
                        );
                    expect(actualAction).to.eql(expectedAction);

                    // Restore stub
                    syncAccount.restore();
                });
            });
        });

        describe('when bundle is not funded', () => {
            let sandbox;

            beforeEach(() => {
                sandbox = sinon.sandbox.create();

                sandbox.stub(transferUtils, 'isFundedBundle').returns(() => Promise.resolve(false));
                sandbox
                    .stub(accountsUtils, 'syncAccount')
                    .returns(() => Promise.resolve({ addressData, transactions }));
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should create an action of type IOTA/ALERTS/SHOW with message "The bundle you are trying to promote is no longer valid"', () => {
                const store = mockStore({ accounts, settings: { remotePoW: false } });

                // Bundle hash for unconfirmed value transactions. See __samples__/transactions.
                const bundleHash = 'VGPSTOJHLLXGCOIQJPFIGGPYLISUNBBHDLQUINNKNRKEDQZLBTKCT9KJELDEXSQNPSQDSPHWQICTJFLCB';

                return store.dispatch(actions.promoteTransaction(bundleHash, 'TEST', powFn)).then(() => {
                    const expectedAction = {
                        category: 'error',
                        title: 'Could not promote transaction',
                        message: 'The bundle you are trying to promote is no longer valid',
                        closeInterval: 5500,
                        type: 'IOTA/ALERTS/SHOW',
                    };

                    const actualAction = store
                        .getActions()
                        .find(
                            (action) =>
                                action.type === 'IOTA/ALERTS/SHOW' &&
                                action.message === 'The bundle you are trying to promote is no longer valid',
                        );

                    expect(expectedAction).to.eql(actualAction);
                });
            });
        });

        // TODO: Add coverage when successfully promotes.
    });

    describe.skip('#makeTransaction', () => {
        let powFn;
        let seedStore;

        before(() => {
            powFn = () => Promise.resolve('9'.repeat(27));
            seedStore = {
                generateAddress: () => Promise.resolve('A'.repeat(81)),
                prepareTransfers: () => Promise.resolve(trytes.zeroValue),
            };
        });

        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-IOTA-API-Version': IRI_API_VERSION,
                },
            })
                .persist()
                .filteringRequestBody(() => '*')
                .post('/', '*')
                .reply(200, {});
        });

        afterEach(() => {
            nock.cleanAll();
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
                sandbox.stub(iota.api, 'findTransactions').yields(null, []);
                sandbox.stub(iota.api, 'getBalances').yields(null, []);
                sandbox.stub(iota.api, 'getInclusionStates').yields(null, []);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should create five actions of type IOTA/PROGRESS/SET_NEXT_STEP_AS_ACTIVE', () => {
                const store = mockStore({ accounts });
                const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, []);
                const syncAccountAfterSpending = sinon
                    .stub(accountsUtils, 'syncAccountAfterSpending')
                    .returns(() => Promise.resolve({}));

                return store
                    .dispatch(
                        actions.makeTransaction(
                            seedStore,
                            'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUNXELTUENX',
                            0,
                            'TEST MESSAGE',
                            'TEST',
                            powFn,
                        ),
                    )
                    .then(() => {
                        expect(
                            store
                                .getActions()
                                .map((action) => action.type)
                                .filter((type) => type === 'IOTA/PROGRESS/SET_NEXT_STEP_AS_ACTIVE').length,
                        ).to.equal(5);

                        wereAddressesSpentFrom.restore();
                        syncAccountAfterSpending.restore();
                    });
            });

            it('should create an action of type IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING', () => {
                const store = mockStore({ accounts });

                const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, []);
                const syncAccountAfterSpending = sinon
                    .stub(accountsUtils, 'syncAccountAfterSpending')
                    .returns(() => Promise.resolve({}));

                return store
                    .dispatch(
                        actions.makeTransaction(
                            seedStore,
                            'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUNXELTUENX',
                            0,
                            'TEST MESSAGE',
                            'TEST',
                            powFn,
                        ),
                    )
                    .then(() => {
                        expect(store.getActions().map((action) => action.type)).to.include(
                            'IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
                        );

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
                    const wereAddressesSpentFrom = sinon.stub(iota.api, 'wereAddressesSpentFrom').yields(null, [false]);
                    const store = mockStore({ accounts });

                    const getInputs = sinon.stub(inputUtils, 'getInputs').returns(() =>
                        Promise.resolve({
                            balance: 10,
                            inputs: [
                                {
                                    address:
                                        'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                                    balance: 10,
                                    keyIndex: 0,
                                    security: 2,
                                },
                            ],
                        }),
                    );

                    const syncAccountAfterSpending = sinon
                        .stub(accountsUtils, 'syncAccountAfterSpending')
                        .returns(() => Promise.resolve({}));

                    const syncAccount = sinon
                        .stub(accountsUtils, 'syncAccount')
                        .returns(() => Promise.resolve(accounts.accountInfo.TEST));

                    return store
                        .dispatch(
                            actions.makeTransaction(
                                seedStore,
                                'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUNXELTUENX',
                                2,
                                'TEST MESSAGE',
                                'TEST',
                                powFn,
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
                            syncAccount.restore();
                            getInputs.restore();

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
                        sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns(() => Promise.resolve({}));
                        sinon
                            .stub(accountsUtils, 'syncAccount')
                            .returns(() => Promise.resolve(accounts.accountInfo.TEST));

                        const store = mockStore({ accounts });

                        return store
                            .dispatch(
                                actions.makeTransaction(
                                    seedStore,
                                    'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUNXELTUENX',
                                    2,
                                    'TEST MESSAGE',
                                    'TEST',
                                    powFn,
                                ),
                            )
                            .then(() => {
                                expect(
                                    store.getActions().find((action) => action.type === 'IOTA/ALERTS/SHOW').message,
                                ).to.equal('You cannot send to an address that has already been spent from.');

                                wereAddressesSpentFrom.restore();
                                accountsUtils.syncAccountAfterSpending.restore();
                                accountsUtils.syncAccount.restore();
                            });
                    });
                });

                describe('when does not have enough balance', () => {
                    it('should create action of type IOTA/ALERTS/SHOW with a message "You do not have enough IOTA to complete this transfer."', () => {
                        const store = mockStore({ accounts });

                        const wereAddressesSpentFrom = sinon
                            .stub(iota.api, 'wereAddressesSpentFrom')
                            .yields(null, [false]);
                        sinon
                            .stub(inputUtils, 'getInputs')
                            .returns(() => Promise.reject(new Error(Errors.INSUFFICIENT_BALANCE)));
                        sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns(() => Promise.resolve({}));
                        sinon.stub(accountsUtils, 'syncAccount').returns(() => Promise.resolve({}));

                        return store
                            .dispatch(
                                actions.makeTransaction(
                                    seedStore,
                                    'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUNXELTUENX',
                                    200,
                                    'TEST MESSAGE',
                                    'TEST',
                                    powFn,
                                ),
                            )
                            .then(() => {
                                expect(
                                    store.getActions().find((action) => action.type === 'IOTA/ALERTS/SHOW').message,
                                ).to.equal('You do not have enough IOTA to complete this transfer.');

                                wereAddressesSpentFrom.restore();
                                inputUtils.getInputs.restore();
                                accountsUtils.syncAccountAfterSpending.restore();
                                accountsUtils.syncAccount.restore();
                            });
                    });
                });

                describe('when has funds at spent addresses', () => {
                    it('should create action of type IOTA/ALERTS/SHOW with a message "Sending from the same address more than once is dangerous. Please head to the #help channel on Discord to find out what you can do."', () => {
                        const store = mockStore({ accounts });

                        const wereAddressesSpentFrom = sinon
                            .stub(iota.api, 'wereAddressesSpentFrom')
                            .yields(null, [false]);

                        sinon
                            .stub(inputUtils, 'getInputs')
                            .returns(() => Promise.reject(new Error(Errors.FUNDS_AT_SPENT_ADDRESSES)));
                        sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns(() => Promise.resolve({}));
                        sinon.stub(accountsUtils, 'syncAccount').returns(() => Promise.resolve({}));

                        return store
                            .dispatch(
                                actions.makeTransaction(
                                    seedStore,
                                    'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUNXELTUENX',
                                    100,
                                    'TEST MESSAGE',
                                    'TEST',
                                    powFn,
                                ),
                            )
                            .then(() => {
                                expect(
                                    store.getActions().find((action) => action.type === 'IOTA/ALERTS/SHOW').message,
                                ).to.equal(
                                    'Sending from the same address more than once is dangerous. Please head to the #help channel on Discord to find out what you can do.',
                                );

                                wereAddressesSpentFrom.restore();
                                inputUtils.getInputs.restore();
                                accountsUtils.syncAccountAfterSpending.restore();
                                accountsUtils.syncAccount.restore();
                            });
                    });
                });

                describe('when receive address is one of the input addresses', () => {
                    it('should create action of type IOTA/ALERTS/SHOW with a message "You cannot send to an address that is being used as an input in the transaction."', () => {
                        const store = mockStore({ accounts });

                        const wereAddressesSpentFrom = sinon
                            .stub(iota.api, 'wereAddressesSpentFrom')
                            .yields(null, [false]);

                        sinon.stub(inputUtils, 'getInputs').returns(() =>
                            Promise.resolve({
                                balance: 10,
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
                            }),
                        );
                        sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns(() => Promise.resolve({}));
                        sinon.stub(accountsUtils, 'syncAccount').returns(() => Promise.resolve({}));

                        return store
                            .dispatch(
                                actions.makeTransaction(
                                    seedStore,
                                    'NNLAKCEDT9FMFLBIFWKHRIQJJETOSBSFPUCBWYYXXYKSLNCCSWOQRAVOYUSX9FMLGHMKUITLFEQIPHQLWWSWWTDSVX',
                                    2,
                                    'TEST MESSAGE',
                                    'TEST',
                                    powFn,
                                ),
                            )
                            .then(() => {
                                expect(
                                    store.getActions().find((action) => action.type === 'IOTA/ALERTS/SHOW').message,
                                ).to.equal(
                                    'You cannot send to an address that is being used as an input in the transaction.',
                                );

                                wereAddressesSpentFrom.restore();
                                inputUtils.getInputs.restore();
                                accountsUtils.syncAccountAfterSpending.restore();
                                accountsUtils.syncAccount.restore();
                            });
                    });
                });
            });
        });
    });
});
