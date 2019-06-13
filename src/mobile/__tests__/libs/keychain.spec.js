import ReactNativeKeychain from 'react-native-keychain';
import { keychain, getSecretBoxFromKeychainAndOpenIt, hasEntryInKeychain, hash } from 'libs/keychain';
import { decodeBase64 } from 'libs/crypto';

jest.mock('react-native-keychain', () => ({
    setInternetCredentials: jest.fn(() => Promise.resolve()),
    getInternetCredentials: jest.fn((alias) => {
        const result = {
            alias_one: {
                username: 'foo_one',
                password: 'baz_one',
            },
            alias_two: {
                username: 'foo_two',
                password: 'baz_two',
            },
            salt: {
                username: 'salt_nonce',
                password: 'salt_item',
            },
        };

        return Promise.resolve(result[alias]);
    }),
    resetInternetCredentials: jest.fn(() => Promise.resolve()),
}));

jest.mock('libs/crypto', () => ({
    decodeBase64: jest.fn(() => Promise.resolve()),
    openSecretBox: jest.fn(() => Promise.resolve()),
    generatePasswordHash: jest.fn(() => Promise.resolve('password_hash')),
}));

describe('Testing keychain', () => {
    describe('keychain', () => {
        describe('#get', () => {
            describe('when getInternetCredentials returns undefined', () => {
                it('should return an object with keys password, data', () => {
                    // Pass in an unknown alias to get an undefined result
                    // See mock implementation of getInternetCredentials
                    return keychain.get('undefined_alias').then((data) => {
                        expect(data).toEqual(null);
                    });
                });
            });

            describe('when getInternetCredentials returns an object with properties "username" and "password"', () => {
                it('should return an object with "nonce: username" and "item: password"', () => {
                    return keychain.get('alias_one').then((data) => {
                        expect(data).toEqual({ nonce: 'foo_one', item: 'baz_one' });
                    });
                });
            });

            it('should call getInternetCredentials method on keychain', () => {
                return keychain.get('alias_two').then(() => {
                    expect(ReactNativeKeychain.getInternetCredentials).toHaveBeenCalledWith('alias_two');
                });
            });
        });

        describe('#set', () => {
            it('should call setGenericPassword method on keychain with provided params', () => {
                return keychain.set('foo', 'baz', 'bar').then(() => {
                    expect(ReactNativeKeychain.setInternetCredentials).toHaveBeenCalledWith('foo', 'baz', 'bar');
                });
            });
        });

        describe('#clear', () => {
            it('should call resetInternetCredentials method on keychain with provided params', () => {
                return keychain.clear('alias_one').then(() => {
                    expect(ReactNativeKeychain.resetInternetCredentials).toHaveBeenCalledWith('alias_one');
                });
            });
        });
    });

    describe('getSecretBoxFromKeychainAndOpenIt', () => {
        describe('when keychain has an entry for provided alias', () => {
            it('should call decodeBase64 with keychain item', () => {
                return getSecretBoxFromKeychainAndOpenIt('alias_one', new Uint8Array()).then(() => {
                    expect(decodeBase64).toHaveBeenCalledWith('baz_one');
                });
            });

            it('should call decodeBase64 with keychain nonce', () => {
                return getSecretBoxFromKeychainAndOpenIt('alias_one', new Uint8Array()).then(() => {
                    expect(decodeBase64).toHaveBeenCalledWith('foo_one');
                });
            });
        });

        describe('when keychain has no entry for provided alias', () => {
            it('should resolve null', () => {
                return getSecretBoxFromKeychainAndOpenIt('undefined_alias', new Uint8Array()).then((data) => {
                    expect(data).toEqual(null);
                });
            });
        });
    });

    describe('hash', () => {
        it('should call keychain.get with "salt"', () => {
            const spy = jest.spyOn(keychain, 'get');

            return hash('alias_one', new Uint8Array())
                .then(() => {
                    expect(spy).toHaveBeenCalledWith('salt');

                    spy.mockClear();
                })
                .catch((error) => {
                    spy.mockClear();

                    throw error;
                });
        });

        it('should call decodeBase64 with keychain item if a non-null value is returned from keychain', () => {
            return hash('alias_one', new Uint8Array()).then(() => {
                expect(decodeBase64).toHaveBeenCalledWith('salt_item');
            });
        });

        it('should throw if a null value is returned from keychain', () => {
            // Resolve a null value to mimic the scenario of missing salt from keychain
            ReactNativeKeychain.getInternetCredentials.mockReturnValueOnce(Promise.resolve(null));

            return hash('alias_one', new Uint8Array())
                .then(() => {
                    throw new Error();
                })
                .catch((error) => {
                    expect(error.message).toEqual('Missing salt from keychain.');
                });
        });
    });

    describe('#hasEntryInKeychain', () => {
        describe('when provided prop has an entry in keychain', () => {
            it('should return true', () => {
                return hasEntryInKeychain('alias_one').then((result) => {
                    expect(result).toEqual(true);
                });
            });
        });

        describe('when provided prop has no entry in keychain', () => {
            it('should return false', () => {
                return hasEntryInKeychain('unknown_alias').then((result) => {
                    expect(result).toEqual(false);
                });
            });
        });
    });
});
