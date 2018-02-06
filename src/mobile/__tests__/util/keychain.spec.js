import React from 'react';
import keychain from 'react-native-keychain';
import keychainWrapper, {
    storeSeedInKeychain,
    storeTwoFactorAuthKeyInKeychain,
    getTwoFactorAuthKeyFromKeychain,
} from '../../util/keychain';

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
        afterEach(() => {
            keychain.setGenericPassword.mockClear();
            keychain.getGenericPassword.mockClear();
        });

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

        describe('when data prop is not empty', () => {
            it('should call setGenericPassword with first argument and accounts array updated with info consisting of seed and name', () => {
                keychain.getGenericPassword.mockImplementation(() =>
                    Promise.resolve({
                        username: '',
                        password: {
                            accounts: [{ seed: 'FOO', name: 'ACCOUNT_ONE' }],
                            shared: { twoFactorAuthKey: null },
                        },
                        service: 'bundleId',
                    }),
                );

                return storeSeedInKeychain('foo', 'SEED', 'new account').then(() => {
                    expect(keychain.setGenericPassword).toHaveBeenCalledWith(
                        'foo',
                        JSON.stringify({
                            accounts: [{ seed: 'FOO', name: 'ACCOUNT_ONE' }, { seed: 'SEED', name: 'new account' }],
                            shared: { twoFactorAuthKey: null },
                        }),
                    );
                });
            });
        });
    });

    describe('#storeTwoFactorAuthKeyInKeychain', () => {
        afterEach(() => {
            keychain.setGenericPassword.mockClear();
            keychain.getGenericPassword.mockClear();
        });

        describe('when key passed as an argument is not a string', () => {
            it('should throw with error "Invalid two factor authentication key."', () => {
                return storeTwoFactorAuthKeyInKeychain(null).catch(err => {
                    expect(err.message).toEqual('Invalid two factor authentication key.');
                });
            });
        });

        describe('when password prop from getGenericPassword is empty', () => {
            it('should throw with error "Cannot store two factor authentication key. No account information found in keychain."', () => {
                return storeTwoFactorAuthKeyInKeychain('foo').catch(err => {
                    expect(err.message).toEqual(
                        'Cannot store two factor authentication key. No account information found in keychain.',
                    );
                });
            });
        });

        describe('when data prop from getGenericPassword is empty', () => {
            keychain.getGenericPassword.mockImplementation(() =>
                Promise.resolve({
                    username: 'foo', // password -> username
                    password: '', // data -> password
                    service: 'bundleId',
                }),
            );

            it('should throw with error "Cannot store two factor authentication key. No account information found in keychain."', () => {
                return storeTwoFactorAuthKeyInKeychain('foo').catch(err => {
                    expect(err.message).toEqual(
                        'Cannot store two factor authentication key. No account information found in keychain.',
                    );
                });
            });
        });

        describe('when data and password props are not empty and key is a string', () => {
            it('should assign twoFactorAuthKey to argument', () => {
                keychain.getGenericPassword.mockImplementation(() =>
                    Promise.resolve({
                        username: 'baz',
                        password: {
                            accounts: [{ seed: 'FOO', name: 'ACCOUNT_ONE' }],
                            shared: { twoFactorAuthKey: null },
                        },
                        service: 'bundleId',
                    }),
                );

                return storeTwoFactorAuthKeyInKeychain('foo').then(() => {
                    expect(keychain.setGenericPassword).toHaveBeenCalledWith(
                        'baz',
                        JSON.stringify({
                            accounts: [{ seed: 'FOO', name: 'ACCOUNT_ONE' }],
                            shared: { twoFactorAuthKey: 'foo' },
                        }),
                    );
                });
            });
        });
    });

    describe('#getTwoFactorAuthKeyFromKeychain', () => {
        afterEach(() => {
            keychain.getGenericPassword.mockClear();
        });

        it('should return twoFactorAuthKey prop', () => {
            keychain.getGenericPassword.mockImplementation(() =>
                Promise.resolve({
                    username: 'baz',
                    password: {
                        accounts: [{ seed: 'FOO', name: 'ACCOUNT_ONE' }],
                        shared: { twoFactorAuthKey: 'my super secret key' },
                    },
                    service: 'bundleId',
                }),
            );

            return getTwoFactorAuthKeyFromKeychain().then(key => expect(key).toEqual('my super secret key'));
        });
    });
});
