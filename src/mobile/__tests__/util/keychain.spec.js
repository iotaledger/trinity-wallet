import assign from 'lodash/assign';
import noop from 'lodash/noop';
import each from 'lodash/each';
import React from 'react';
import keychain from 'react-native-keychain';
import keychainWrapper, { storeSeedInKeychain } from '../../util/keychain';
import { shallow } from 'enzyme';
import { Poll } from '../../containers/poll';

jest.mock('react-native-keychain', () => ({
    setGenericPassword: jest.fn((username, password) => Promise.resolve({})),
    getGenericPassword: jest.fn(() => Promise.resolve({ username: '', password: '', service: 'bundleId' })),
    resetGenericPassword: jest.fn(() => Promise.resolve({})),
}));

describe('Testing keychain util', () => {
    describe('#get', () => {
        afterEach(() => {
            keychain.getGenericPassword.mockClear();
        });

        it('should return an object with keys password, data and service', () => {
            return keychainWrapper.get().then(data => {
                expect(Object.keys(data)).toEqual(['password', 'data', 'service']);
            });
        });

        it('should call getGenericPassword method on keychain', () => {
            return keychainWrapper.get().then(() => {
                expect(keychain.getGenericPassword).toHaveBeenCalled();
            });
        });
    });

    describe('#set', () => {
        afterEach(() => {
            keychain.setGenericPassword.mockClear();
        });

        it('should call setGenericPassword method on keychain', () => {
            return keychainWrapper.set('foo', 'baz').then(() => {
                expect(keychain.setGenericPassword).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('#clear', () => {
        afterEach(() => {
            keychain.resetGenericPassword.mockClear();
        });

        it('should call resetGenericPassword method on keychain', () => {
            return keychainWrapper.clear().then(() => {
                expect(keychain.resetGenericPassword).toHaveBeenCalled();
            });
        });
    });

    describe('#storeSeedInKeychain', () => {
        describe('when data prop is empty', () => {
            it('should call setGenericPassword with first argument and info consisting of seed and name', () => {
                return storeSeedInKeychain('foo', 'SEED', 'account').then(() => {
                    expect(keychain.setGenericPassword).toHaveBeenCalledWith(
                        'foo',
                        JSON.stringify({
                            accounts: [{ seed: 'SEED', name: 'account' }],
                            shared: { twoFactorAuthKey: null },
                        }),
                    );
                });
            });
        });
    });
});
