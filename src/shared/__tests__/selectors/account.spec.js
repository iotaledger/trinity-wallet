import { expect } from 'chai';
import {
    getAccountFromState,
    getAccountInfoFromState,
    getUnconfirmedBundleTailsFromState,
    getTxHashesForUnspentAddressesFromState,
    getPendingTxHashesForSpentAddressesFromState,
    selectedAccountStateFactory,
} from '../../selectors/account';

describe('selectors: account', () => {
    describe('#getAccountFromState', () => {
        describe('when "account" prop is not defined in argument', () => {
            it('should return an empty object', () => {
                expect(getAccountFromState({ foo: {} })).to.eql({});
            });
        });

        describe('when "account" prop is defined in argument', () => {
            it('should return value for "account" prop', () => {
                expect(getAccountFromState({ foo: {}, account: { baz: {} } })).to.eql({ baz: {} });
            });
        });
    });

    describe('#getAccountInfoFromState', () => {
        describe('when "accountInfo" prop is not defined as a nested prop under "account" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getAccountInfoFromState({ account: { notAccountInfo: {} } })).to.eql({});
            });
        });

        describe('when "accountInfo" prop is defined as a nested prop under "account" prop in argument', () => {
            it('should return value for "account" prop', () => {
                expect(getAccountInfoFromState({ account: { accountInfo: { foo: {} } } })).to.eql({ foo: {} });
            });
        });
    });

    describe('#getUnconfirmedBundleTailsFromState', () => {
        describe('when "unconfirmedBundleTails" prop is not defined as a nested prop under "account" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getUnconfirmedBundleTailsFromState({ account: { foo: {} } })).to.eql({});
            });
        });

        describe('when "unconfirmedBundleTails" prop is defined as a nested prop under "account" prop in argument', () => {
            it('should return value for "unconfirmedBundleTails" prop', () => {
                expect(getUnconfirmedBundleTailsFromState({ account: { unconfirmedBundleTails: { foo: {} } } })).to.eql(
                    { foo: {} },
                );
            });
        });
    });

    describe('#getTxHashesForUnspentAddressesFromState', () => {
        describe('when "txHashesForUnspentAddresses" prop is not defined as a nested prop under "account" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getTxHashesForUnspentAddressesFromState({ account: { foo: {} } })).to.eql({});
            });
        });

        describe('when "txHashesForUnspentAddresses" prop is defined as a nested prop under "account" prop in argument', () => {
            it('should return value for "txHashesForUnspentAddresses" prop', () => {
                expect(
                    getTxHashesForUnspentAddressesFromState({ account: { txHashesForUnspentAddresses: { foo: {} } } }),
                ).to.eql({ foo: {} });
            });
        });
    });

    describe('#getPendingTxHashesForSpentAddressesFromState', () => {
        describe('when "pendingTxHashesForSpentAddresses" prop is not defined as a nested prop under "account" prop in argument', () => {
            it('should return an empty object', () => {
                expect(getPendingTxHashesForSpentAddressesFromState({ account: { foo: {} } })).to.eql({});
            });
        });

        describe('when "pendingTxHashesForSpentAddresses" prop is defined as a nested prop under "account" prop in argument', () => {
            it('should return value for "pendingTxHashesForSpentAddresses" prop', () => {
                expect(
                    getPendingTxHashesForSpentAddressesFromState({
                        account: { pendingTxHashesForSpentAddresses: { foo: {} } },
                    }),
                ).to.eql({ foo: {} });
            });
        });
    });

    describe('#selectedAccountStateFactory', () => {
        let state;

        beforeEach(() => {
            state = {
                account: {
                    unconfirmedBundleTails: { foo: {} },
                    pendingTxHashesForSpentAddresses: { valid: [], invalid: [] },
                    txHashesForUnspentAddresses: { valid: [], invalid: [] },
                    accountInfo: {
                        valid: { transfers: [], addresses: {}, balance: 0 },
                        invalid: { transfers: [], addresses: {}, balance: 0 },
                    },
                },
                garbage: {},
            };
        });

        it('should return an object with props "accountName", "unconfirmedBundleTails", "accountInfo", "txHashesForUnspentAddresses" and "pendingTxHashesForSpentAddresses"', () => {
            expect(selectedAccountStateFactory('valid')(state)).to.have.keys([
                'accountInfo',
                'txHashesForUnspentAddresses',
                'pendingTxHashesForSpentAddresses',
                'unconfirmedBundleTails',
                'accountName',
            ]);
        });
    });
});
