import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import * as actions from '../../actions/accounts';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('actions: accounts', () => {
    describe('#assignAccountIndexIfNecessary', () => {
        describe('provided param is empty', () => {
            it('should not create an action of type IOTA/ACCOUNTS/ASSIGN_ACCOUNT_INDEX', () => {
                const store = mockStore({});

                // Dispatch action
                store.dispatch(actions.assignAccountIndexIfNecessary({}));

                expect(store.getActions()).to.eql([]);
            });
        });

        describe('provided param is not empty', () => {
            describe('when some accounts in accountInfo object have an index property with a non-numeric value', () => {
                it('should not create an action of type IOTA/ACCOUNTS/ASSIGN_ACCOUNT_INDEX', () => {
                    const store = mockStore({});

                    let accountInfo = { foo: {}, baz: { index: 2 } };

                    const expectedActions = [
                        {
                            type: 'IOTA/ACCOUNTS/ASSIGN_ACCOUNT_INDEX',
                        },
                    ];

                    // Dispatch action
                    store.dispatch(actions.assignAccountIndexIfNecessary(accountInfo));
                    expect(store.getActions()).to.eql(expectedActions);

                    // Clear actions
                    store.clearActions();

                    // Reassign account info and check for undefined values
                    accountInfo = { foo: { index: undefined }, baz: { index: 1 } };

                    // Dispatch action
                    store.dispatch(actions.assignAccountIndexIfNecessary(accountInfo));
                    expect(store.getActions()).to.eql(expectedActions);
                });
            });

            describe('when every account in accountInfo object has an index property with a numeric value', () => {
                it('should not create an action of type IOTA/ACCOUNTS/ASSIGN_ACCOUNT_INDEX', () => {
                    const store = mockStore({});

                    const accountInfo = { foo: { index: 0 }, baz: { index: 1 } };

                    // Dispatch action
                    store.dispatch(actions.assignAccountIndexIfNecessary(accountInfo));
                    expect(store.getActions()).to.eql([]);
                });
            });
        });
    });
});
