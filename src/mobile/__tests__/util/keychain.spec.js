import keychain from 'react-native-keychain';
import keychainWrapper, {
    storeSeedInKeychain,
    storeTwoFactorAuthKeyInKeychain,
    getTwoFactorAuthKeyFromKeychain,
    getPasswordFromKeychain,
    hasDuplicateAccountName,
    hasDuplicateSeed,
    getSeed,
    updateAccountNameInKeychain,
    deleteFromKeychain,
} from '../../util/keychain';

jest.mock('react-native-keychain', () => ({
    setGenericPassword: jest.fn(() => Promise.resolve({})),
    getGenericPassword: jest.fn(() => Promise.resolve({ username: '', password: '', service: 'bundleId' })),
    resetGenericPassword: jest.fn(() => Promise.resolve({})),
}));

describe('Testing keychain util', () => {
    describe('#get', () => {
        afterEach(() => {
            keychain.getGenericPassword.mockClear();
        });

        it('should return an object with keys password, data and service', () => {
            return keychainWrapper.get().then((data) => {
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
                return storeTwoFactorAuthKeyInKeychain(null).catch((err) => {
                    expect(err.message).toEqual('Invalid two factor authentication key.');
                });
            });
        });

        describe('when password prop from getGenericPassword is empty', () => {
            it('should throw with error "Cannot store two factor authentication key. No account information found in keychain."', () => {
                return storeTwoFactorAuthKeyInKeychain('foo').catch((err) => {
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
                return storeTwoFactorAuthKeyInKeychain('foo').catch((err) => {
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

            return getTwoFactorAuthKeyFromKeychain().then((key) => expect(key).toEqual('my super secret key'));
        });
    });

    describe('#getPasswordFromKeychain', () => {
        afterEach(() => {
            keychain.getGenericPassword.mockClear();
        });

        it('should call getPasswordFromKeychain once', () => {
            return getPasswordFromKeychain().then(() => expect(keychain.getGenericPassword).toHaveBeenCalledTimes(1));
        });

        it('should return password prop from keychain object', () => {
            keychain.getGenericPassword.mockImplementation(() =>
                Promise.resolve({
                    username: 'barcelona', // username is transformed to password -> keychain.get()
                    password: '',
                    service: '',
                }),
            );

            return getPasswordFromKeychain().then((password) => expect(password).toEqual('barcelona'));
        });
    });

    describe('#hasDuplicateAccountName', () => {
        it('should return false if name passed in second argument is not present in any account array object', () => {
            const data = JSON.stringify({ accounts: [{ seed: 'SEED', name: 'bar' }], shared: {} });

            expect(hasDuplicateAccountName(data, 'foo')).toEqual(false);
            expect(hasDuplicateAccountName(data, 'baz')).toEqual(false);
        });

        it('should return true if name passed in second argument is present in any account array object', () => {
            const data = JSON.stringify({
                accounts: [{ seed: 'SEED', name: 'bar' }, { seed: 'SEEDTWO', name: 'foo' }],
                shared: {},
            });

            expect(hasDuplicateAccountName(data, 'bar')).toEqual(true);
            expect(hasDuplicateAccountName(data, 'foo')).toEqual(true);
        });
    });

    describe('#hasDuplicateSeed', () => {
        it('should return false if seed passed in second argument is not present in any account array object', () => {
            const data = JSON.stringify({ accounts: [{ seed: 'SEED', name: 'bar' }], shared: {} });

            expect(hasDuplicateSeed(data, 'SEEDTWO')).toEqual(false);
            expect(hasDuplicateSeed(data, 'SEEDTHREE')).toEqual(false);
        });

        it('should return true if seed passed in second argument is present in any account array object', () => {
            const data = JSON.stringify({
                accounts: [{ seed: 'SEED', name: 'bar' }, { seed: 'SEEDTWO', name: 'foo' }],
                shared: {},
            });

            expect(hasDuplicateSeed(data, 'SEED')).toEqual(true);
            expect(hasDuplicateSeed(data, 'SEEDTWO')).toEqual(true);
        });
    });

    describe('#getSeed', () => {
        it('should return an empty string if index does not exist in accounts array prop passed as first argument', () => {
            const data = JSON.stringify({ accounts: [{ seed: 'SEED', name: 'bar' }], shared: {} });

            [1, -1, 0.5, null, undefined].forEach((item) => expect(getSeed(data, item)).toEqual(''));
        });

        it('should return seed prop for item at specified index if index exists is accounts array', () => {
            const data = JSON.stringify({
                accounts: [{ seed: 'DANGLE', name: 'bar' }, { seed: '9999', name: 'foo' }],
                shared: {},
            });

            expect(getSeed(data, 0)).toEqual('DANGLE');
            expect(getSeed(data, 1)).toEqual('9999');
        });
    });

    describe('#updateAccountNameInKeychain', () => {
        afterEach(() => {
            keychain.setGenericPassword.mockClear();
            keychain.getGenericPassword.mockClear();
        });

        describe('when data prop fetched for keychain is empty', () => {
            it('should throw with error "Something went wrong while updating account name."', () => {
                return updateAccountNameInKeychain().catch((err) => {
                    expect(err.message).toEqual('Something went wrong while updating account name.');
                });
            });
        });

        describe('when data prop fetched for keychain is not empty', () => {
            it('should call setGenericPassword method on keychain with updated account name', () => {
                keychain.getGenericPassword.mockImplementation(() =>
                    Promise.resolve({
                        username: 'baz',
                        password: {
                            accounts: [
                                { seed: 'FOO', name: 'ACCOUNT_ONE' },
                                { seed: 'BAR', name: 'ACCOUNT_TWO' },
                                { seed: '9999', name: 'ACCOUNT_THREE' },
                            ],
                            shared: { twoFactorAuthKey: null },
                        },
                        service: 'bundleId',
                    }),
                );

                return updateAccountNameInKeychain(0, 'NEW ACCOUNT NAME', 'baz').then(() => {
                    expect(keychain.setGenericPassword).toHaveBeenCalledWith(
                        'baz',
                        JSON.stringify({
                            accounts: [
                                { seed: 'FOO', name: 'NEW ACCOUNT NAME' },
                                { seed: 'BAR', name: 'ACCOUNT_TWO' },
                                { seed: '9999', name: 'ACCOUNT_THREE' },
                            ],
                            shared: { twoFactorAuthKey: null },
                        }),
                    );
                });
            });
        });
    });

    describe('#deleteFromKeychain', () => {
        afterEach(() => {
            keychain.setGenericPassword.mockClear();
            keychain.getGenericPassword.mockClear();
        });

        describe('when data prop fetched for keychain is empty', () => {
            it('should throw with error "Something went wrong while deleting from keychain."', () => {
                return deleteFromKeychain().catch((err) => {
                    expect(err.message).toEqual('Something went wrong while deleting from keychain.');
                });
            });
        });

        describe('when data prop fetched for keychain is not empty', () => {
            it('should call setGenericPassword method on keychain with filtered accounts', () => {
                keychain.getGenericPassword.mockImplementation(() =>
                    Promise.resolve({
                        username: 'baz',
                        password: {
                            accounts: [
                                { seed: 'FOO', name: 'ACCOUNT_ONE' },
                                { seed: 'BAR', name: 'ACCOUNT_TWO' },
                                { seed: '9999', name: 'ACCOUNT_THREE' },
                            ],
                            shared: { twoFactorAuthKey: null },
                        },
                        service: 'bundleId',
                    }),
                );

                return deleteFromKeychain(0, 'baz').then(() => {
                    expect(keychain.setGenericPassword).toHaveBeenCalledWith(
                        'baz',
                        JSON.stringify({
                            accounts: [{ seed: 'BAR', name: 'ACCOUNT_TWO' }, { seed: '9999', name: 'ACCOUNT_THREE' }],
                            shared: { twoFactorAuthKey: null },
                        }),
                    );
                });
            });
        });
    });
});
