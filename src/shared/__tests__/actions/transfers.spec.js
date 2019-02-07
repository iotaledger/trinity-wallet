import map from 'lodash/map';
import nock from 'nock';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import * as actions from '../../actions/transfers';
import * as addressesUtils from '../../libs/iota/addresses';
import * as transferUtils from '../../libs/iota/transfers';
import * as accountsUtils from '../../libs/iota/accounts';
import * as inputUtils from '../../libs/iota/inputs';
import { iota, quorum, SwitchingConfig } from '../../libs/iota';
import { realm, config as realmConfig, Account, Wallet, getRealm, initialise } from '../../storage';
import accounts from '../__samples__/accounts';
import { addressData, latestAddressObject } from '../__samples__/addresses';
import { newZeroValueTransactionTrytes, newValueTransactionTrytes } from '../__samples__/trytes';
import transactions, { newZeroValueTransaction, newValueTransaction } from '../__samples__/transactions';
import { IRI_API_VERSION } from '../../config';

const Realm = getRealm();

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
        let seedStore;

        before(() => {
            Realm.deleteFile(realmConfig);
            initialise(() => Promise.resolve(new Int8Array(64)));
            seedStore = {
                performPow: () =>
                    Promise.resolve({
                        trytes: newZeroValueTransactionTrytes.slice().reverse(),
                        transactionObjects: newZeroValueTransaction.slice().reverse(),
                    }),
                getDigest: () => Promise.resolve('9'.repeat(81)),
            };
        });

        beforeEach(() => {
            Account.create({ name: 'TEST', index: 0 });
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
                    .dispatch(actions.promoteTransaction('9'.repeat(81), 'TEST', seedStore))
                    .then(() =>
                        expect(store.getActions().map((action) => action.type)).to.include(
                            'IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
                        ),
                    );
            });

            it('should sync account', () => {
                const store = mockStore({ accounts, settings: { remotePoW: false } });

                return store
                    .dispatch(actions.promoteTransaction('9'.repeat(81), 'TEST', seedStore))
                    .then(() => expect(accountsUtils.syncAccount.calledOnce).to.equal(true));
            });

            describe('when remotePoW in settings is false', () => {
                it('should create an action of type IOTA/ALERTS/SHOW with message "Your device may become unresponsive for a while."', () => {
                    const store = mockStore({ accounts, settings: { remotePoW: false } });

                    return store.dispatch(actions.promoteTransaction('9'.repeat(81), 'TEST', seedStore)).then(() => {
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

                    return store.dispatch(actions.promoteTransaction('9'.repeat(81), 'TEST', seedStore)).then(() => {
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

                return store.dispatch(actions.promoteTransaction('9'.repeat(81), 'TEST', seedStore)).then(() => {
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

                return store.dispatch(actions.promoteTransaction('9'.repeat(81), 'TEST', seedStore)).then(() => {
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

                return store.dispatch(actions.promoteTransaction(bundleHash, 'TEST', seedStore)).then(() => {
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

                return store.dispatch(actions.promoteTransaction(bundleHash, 'TEST', seedStore)).then(() => {
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

    describe('#makeTransaction', () => {
        let seedStore;

        before(() => {
            Realm.deleteFile(realmConfig);
            initialise(() => Promise.resolve(new Int8Array(64)));
            seedStore = {
                generateAddress: () => Promise.resolve('A'.repeat(81)),
                prepareTransfers: () => Promise.resolve(newZeroValueTransactionTrytes),
                performPow: (trytes) =>
                    Promise.resolve({
                        trytes,
                        transactionObjects: map(trytes, iota.utils.transactionObject),
                    }),
                getDigest: () => Promise.resolve('9'.repeat(81)),
            };
        });

        beforeEach(() => {
            Account.create({ name: 'TEST', index: 0 });
            Wallet.createIfNotExists();

            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-IOTA-API-Version': IRI_API_VERSION,
                },
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    if (body.command === 'getTransactionsToApprove') {
                        return {
                            branchTransaction:
                                'MFZXHOXKGVVBDGSVXIGEFBFDXICQDK9UQFVSQCAJMZICRXDGBRZMHHJUGTDPWTEHWSREZFDCRRYD99999',
                            trunkTransaction:
                                'OAAMETLECXOVQNTTAKCNWPZSQALUYEGTO9QGEQL9ST9RFJ9JPNBHTOABJQTCIHKMNUMHEKZJSFYT99999',
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            realm.write(() => {
                realm.delete(Account.data);
                realm.delete(Wallet.data);
            });

            nock.cleanAll();
        });

        after(() => {
            Realm.deleteFile(realmConfig);
        });

        describe('zero value transactions', () => {
            it('should call prepareTransfers method on seedStore', () => {
                const store = mockStore({ accounts });
                sinon.spy(seedStore, 'prepareTransfers');
                sinon
                    .stub(accountsUtils, 'syncAccountAfterSpending')
                    .returns(() => Promise.resolve([...transactions, ...newZeroValueTransaction]));

                return store
                    .dispatch(actions.makeTransaction(seedStore, 'U'.repeat(81), 0, 'foo', 'TEST', seedStore))
                    .then(() => {
                        expect(seedStore.prepareTransfers.calledOnce).to.equal(true);
                        seedStore.prepareTransfers.restore();
                        accountsUtils.syncAccountAfterSpending.restore();
                    });
            });

            it('should create an action of type IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING with updated account state', () => {
                const store = mockStore({ accounts });
                const updatedTransactions = [
                    ...transactions,
                    ...map(newZeroValueTransaction, (transaction) => ({
                        ...transaction,
                        persistence: false,
                        broadcasted: true,
                    })),
                ];

                sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns(() =>
                    Promise.resolve({
                        transactions: updatedTransactions,
                        addressData,
                    }),
                );

                const wereAddressesSpentFrom = sinon.stub(quorum, 'wereAddressesSpentFrom').resolves([]);

                return store
                    .dispatch(actions.makeTransaction(seedStore, 'U'.repeat(81), 0, 'foo', 'TEST', seedStore))
                    .then(() => {
                        const expectedAction = {
                            type: 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
                            payload: {
                                accountName: 'TEST',
                                transactions: updatedTransactions,
                                addressData,
                            },
                        };

                        const actualAction = store
                            .getActions()
                            .find((action) => action.type === 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING');

                        expect(expectedAction).to.eql(actualAction);
                        accountsUtils.syncAccountAfterSpending.restore();
                        wereAddressesSpentFrom.restore();
                    });
            });
        });

        describe('value transactions', () => {
            describe('when receive address is used', () => {
                it('should create an action of type IOTA/ALERTS/SHOW with message "You cannot send to an address that has already been spent from."', () => {
                    const store = mockStore({ accounts });
                    const wereAddressesSpentFrom = sinon.stub(quorum, 'wereAddressesSpentFrom').resolves([true]);

                    return store
                        .dispatch(actions.makeTransaction(seedStore, 'A'.repeat(81), 10, 'foo', 'TEST'))
                        .then(() => {
                            const expectedAction = {
                                category: 'error',
                                closeInterval: 5500,
                                message: 'You cannot send to an address that has already been spent from.',
                                title: 'Sending to spent address',
                                type: 'IOTA/ALERTS/SHOW',
                            };

                            const actualAction = store
                                .getActions()
                                .find(
                                    (action) =>
                                        action.type === 'IOTA/ALERTS/SHOW' &&
                                        action.message ===
                                            'You cannot send to an address that has already been spent from.',
                                );

                            expect(expectedAction).to.eql(actualAction);
                            wereAddressesSpentFrom.restore();
                        });
                });
            });

            describe('when receive address is one of the input addresses', () => {
                it('should create an action of type IOTA/ALERTS/SHOW with message "You cannot send to an address that is being used as an input in the transaction."', () => {
                    const store = mockStore({ accounts });

                    // Stub syncAccount implementation and return mocked transactions and address data
                    const syncAccount = sinon.stub(accountsUtils, 'syncAccount').returns(() =>
                        Promise.resolve({
                            transactions,
                            addressData,
                        }),
                    );

                    const wereAddressesSpentFrom = sinon.stub(quorum, 'wereAddressesSpentFrom').resolves([false]);

                    // Stub getInputs implementation and return receive address (UUU...UUU)
                    // as one of the input addresses
                    const getInputs = sinon.stub(inputUtils, 'getInputs').returns(() =>
                        Promise.resolve({
                            inputs: [
                                {
                                    // Receive address
                                    address: 'A'.repeat(81),
                                    balance: 5,
                                    keyIndex: 11,
                                    security: 2,
                                },
                                {
                                    address: 'Z'.repeat(81),
                                    balance: 6,
                                    keyIndex: 12,
                                    security: 2,
                                },
                            ],
                        }),
                    );

                    return store
                        .dispatch(actions.makeTransaction(seedStore, 'A'.repeat(81), 10, 'foo', 'TEST', seedStore))
                        .then(() => {
                            const expectedAction = {
                                category: 'error',
                                closeInterval: 20000,
                                message:
                                    'You cannot send to an address that is being used as an input in the transaction.',
                                title: 'Sending to an input address',
                                type: 'IOTA/ALERTS/SHOW',
                            };

                            const actualAction = store
                                .getActions()
                                .find(
                                    (action) =>
                                        action.type === 'IOTA/ALERTS/SHOW' &&
                                        action.message ===
                                            'You cannot send to an address that is being used as an input in the transaction.',
                                );

                            expect(expectedAction).to.eql(actualAction);

                            // Restore stubs
                            syncAccount.restore();
                            wereAddressesSpentFrom.restore();
                            getInputs.restore();
                        });
                });
            });

            describe('when constructs invalid bundle', () => {
                it('should create an action of type IOTA/ALERTS/SHOW with message "Something went wrong while sending your transfer. Please try again."', () => {
                    const store = mockStore({ accounts });
                    const wereAddressesSpentFrom = sinon.stub(quorum, 'wereAddressesSpentFrom').resolves([false]);

                    // Stub prepareTransfers implementation and return invalid trytes.
                    // Invalid trytes should lead to invalid bundle construction
                    const prepareTransfers = sinon.stub(seedStore, 'prepareTransfers').resolves(
                        map(
                            newValueTransactionTrytes,
                            (tryteString) =>
                                // Replace signature message fragments with all nines
                                `${'9'.repeat(2187)}${tryteString.slice(2187)}`,
                        ),
                    );

                    // Stub syncAccount implementation and return mocked transactions and address data
                    const syncAccount = sinon.stub(accountsUtils, 'syncAccount').returns(() =>
                        Promise.resolve({
                            transactions,
                            addressData,
                        }),
                    );

                    const getAddressDataUptoRemainder = sinon
                        .stub(addressesUtils, 'getAddressDataUptoRemainder')
                        .returns(() =>
                            Promise.resolve({
                                addressDataUptoRemainder: addressData,
                                remainderAddress: latestAddressObject.address,
                                keyIndex: latestAddressObject.index,
                            }),
                        );

                    // Stub getInputs implementation and return receive address (UUU...UUU)
                    // as one of the input addresses
                    const getInputs = sinon.stub(inputUtils, 'getInputs').returns(() =>
                        Promise.resolve({
                            inputs: [
                                {
                                    address:
                                        'JEFTSJGSNYGDSYHTCIZF9WXPWGHOPKRJSGXGNNZIUJUZGOFEGXRHPJVGPUZNIZMQ9QSNAITO9QUYQZZEC',
                                    balance: 10,
                                    keyIndex: 8,
                                    security: 2,
                                },
                            ],
                        }),
                    );

                    return store
                        .dispatch(actions.makeTransaction(seedStore, 'A'.repeat(81), 10, 'foo', 'TEST', seedStore))
                        .then(() => {
                            const expectedAction = {
                                category: 'error',
                                closeInterval: 20000,
                                message: 'Something went wrong while sending your transfer. Please try again.',
                                title: 'Transfer error',
                                type: 'IOTA/ALERTS/SHOW',
                            };

                            const actualAction = store
                                .getActions()
                                .find(
                                    (action) =>
                                        action.type === 'IOTA/ALERTS/SHOW' &&
                                        action.message ===
                                            'Something went wrong while sending your transfer. Please try again.',
                                );

                            expect(expectedAction).to.eql(actualAction);

                            // Restore stubs
                            prepareTransfers.restore();
                            syncAccount.restore();
                            getAddressDataUptoRemainder.restore();
                            getInputs.restore();
                            wereAddressesSpentFrom.restore();
                        });
                });
            });

            describe('when successfully broadcasts', () => {
                it('should create an action of type IOTA/ALERTS/SHOW with message "Something went wrong while sending your transfer. Please try again."', () => {
                    const store = mockStore({ accounts });

                    const updatedTransactions = [
                        ...transactions,
                        ...map(newValueTransaction, (transaction) => ({
                            ...transaction,
                            persistence: false,
                            broadcasted: true,
                        })),
                    ];

                    const syncAccountAfterSpending = sinon.stub(accountsUtils, 'syncAccountAfterSpending').returns(() =>
                        Promise.resolve({
                            transactions: updatedTransactions,
                            addressData,
                        }),
                    );

                    // Stub syncAccount implementation and return mocked transactions and address data
                    const syncAccount = sinon.stub(accountsUtils, 'syncAccount').returns(() =>
                        Promise.resolve({
                            transactions,
                            addressData,
                        }),
                    );

                    const wereAddressesSpentFrom = sinon.stub(quorum, 'wereAddressesSpentFrom').resolves([false]);

                    const getAddressDataUptoRemainder = sinon
                        .stub(addressesUtils, 'getAddressDataUptoRemainder')
                        .returns(() =>
                            Promise.resolve({
                                addressDataUptoRemainder: addressData,
                                remainderAddress: latestAddressObject.address,
                                keyIndex: latestAddressObject.index,
                            }),
                        );

                    // Stub getInputs implementation and return receive address (UUU...UUU)
                    // as one of the input addresses
                    const getInputs = sinon.stub(inputUtils, 'getInputs').returns(() =>
                        Promise.resolve({
                            inputs: [
                                {
                                    address:
                                        'JEFTSJGSNYGDSYHTCIZF9WXPWGHOPKRJSGXGNNZIUJUZGOFEGXRHPJVGPUZNIZMQ9QSNAITO9QUYQZZEC',
                                    balance: 10,
                                    keyIndex: 8,
                                    security: 2,
                                },
                            ],
                        }),
                    );

                    return store
                        .dispatch(actions.makeTransaction(seedStore, 'A'.repeat(81), 10, 'foo', 'TEST'))
                        .then(() => {
                            const expectedAction = {
                                type: 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
                                payload: {
                                    accountName: 'TEST',
                                    transactions: updatedTransactions,
                                    addressData,
                                },
                            };

                            const actualAction = store
                                .getActions()
                                .find((action) => action.type === 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING');

                            expect(expectedAction).to.eql(actualAction);

                            // Restore stubs
                            syncAccountAfterSpending.restore();
                            syncAccount.restore();
                            getAddressDataUptoRemainder.restore();
                            getInputs.restore();
                            wereAddressesSpentFrom.restore();
                        });
                });
            });
        });
    });
});
