import random from 'lodash/random';
import { generateSecureRandom } from 'react-native-securerandom';
import tweetnacl from 'tweetnacl';
import CryptoModule from 'libs/crypto';

jest.mock('react-native-securerandom', () => ({
    generateSecureRandom: jest.fn((quantity) => Promise.resolve(new Uint8Array(quantity))),
}));

jest.mock('tweetnacl', () => {
    const nacl = {
        secretbox: jest.fn(() => Promise.resolve(new Uint8Array())),
    };

    nacl.secretbox.open = jest.fn(() => Promise.resolve(new Uint8Array()));

    return nacl;
});

describe('Testing libs/crypto', () => {
    describe('#getRandomBytes', () => {
        it('should call react-native-securerandom.generateSecureRandom with provided param', () => {
            const param = random(1, 64);
            return CryptoModule.getRandomBytes(param).then(() => {
                expect(generateSecureRandom).toHaveBeenCalledWith(param);
            });
        });
    });

    describe('#getSalt', () => {
        it('should call getRandomBytes with SALT_LENGTH (32)', () => {
            const spy = jest.spyOn(CryptoModule, 'getRandomBytes');

            return CryptoModule.getSalt()
                .then(() => {
                    expect(spy).toHaveBeenCalledWith(32);
                    spy.mockRestore();
                })
                .catch((error) => {
                    spy.mockRestore();

                    throw error;
                });
        });
    });

    describe('#getNonce', () => {
        it('should call getRandomBytes with NONCE_LENGTH (24)', () => {
            const spy = jest.spyOn(CryptoModule, 'getRandomBytes');

            return CryptoModule.getNonce()
                .then(() => {
                    expect(spy).toHaveBeenCalledWith(24);
                    spy.mockRestore();
                })
                .catch((error) => {
                    spy.mockRestore();

                    throw error;
                });
        });
    });

    describe('#createSecretBox', () => {
        it('should call tweetnacl.secretbox with provided param', () => {
            return CryptoModule.createSecretBox('foo', 'baz', 'bar').then(() => {
                expect(tweetnacl.secretbox).toHaveBeenCalledWith('foo', 'baz', 'bar');
            });
        });
    });

    describe('#openSecretBox', () => {
        describe('when nacl.secretbox.open() returns undefined', () => {
            it('should throw an error with message "Incorrect password"', () => {
                tweetnacl.secretbox.open.mockImplementationOnce(() => Promise.resolve(undefined));

                return CryptoModule.openSecretBox('foo', 'baz', 'bar').catch((error) => {
                    expect(error.message).toEqual('Incorrect password');
                });
            });
        });

        describe('when nacl.secretbox.open() returns UInt8Array', () => {
            it('should call UInt8ToString with return value of nacl.secretbox.open()', () => {
                const openedBox = new Uint8Array([84, 114, 105, 110, 105, 116, 121]);

                const spy = jest.spyOn(CryptoModule, 'UInt8ToString');

                tweetnacl.secretbox.open.mockImplementationOnce(() => Promise.resolve(openedBox));

                return CryptoModule.openSecretBox('foo', 'baz', 'bar')
                    .then(() => {
                        expect(spy).toHaveBeenCalledWith(openedBox);
                        spy.mockRestore();
                    })
                    .catch((error) => {
                        spy.mockRestore();

                        throw error;
                    });
            });
        });
    });

    describe('#hexToUint8', () => {
        it('should convert hexadecimal string to Uint8Array', () => {
            const keyMap = {
                '0001022a646566ff': new Uint8Array([0, 1, 2, 42, 100, 101, 102, 255]),
                '0001022a6465226fa': new Uint8Array([0, 1, 2, 42, 100, 101, 34, 111, 10]),
                fff1021a123465226fa: new Uint8Array([255, 241, 2, 26, 18, 52, 101, 34, 111, 10]),
            };

            Object.keys(keyMap).forEach((hexString) => {
                expect(CryptoModule.hexToUint8(hexString)).toEqual(keyMap[hexString]);
            });
        });
    });
});
