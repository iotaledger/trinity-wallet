import ReactNativeKeychain from 'react-native-keychain';
import { keychain, hasEntryInKeychain } from 'libs/keychain';

jest.mock('react-native-keychain', () => ({
    setInternetCredentials: jest.fn(() => Promise.resolve()),
    getInternetCredentials: jest.fn((alias) => {
        const result = {
            alias_one: {
                username: 'foo_one',
                password: 'baz_one',
            },
            alias_two: {
                username: 'foo_one',
                password: 'baz_one',
            },
        };

        return Promise.resolve(result[alias]);
    }),
    resetInternetCredentials: jest.fn(() => Promise.resolve()),
}));

describe('Testing keychain', () => {
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
