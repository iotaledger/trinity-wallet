import values from 'lodash/values';
import { parse } from 'shared-modules/libs/utils';
import { generateSecureRandom } from 'react-native-securerandom';
import { TextDecoder } from 'text-encoding';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { getHashFn } from 'libs/nativeModules';
import { isAndroid } from 'libs/device';

const DEFAULT_ARGON2_PARAMS = { t_cost: 1, m_cost: 4096, parallelism: 4, hashLength: 32 };
const SALT_LENGTH = 32;
const NONCE_LENGTH = 24;

const cryptoImport = require('crypto'); // eslint-disable-line no-unused-vars

export const sha256 = (input) => {
    return cryptoImport
        .createHash('sha256')
        .update(input)
        .digest('hex');
};

export const getRandomBytes = async (quantity) => {
    return await generateSecureRandom(quantity);
};

export const generatePasswordHash = async (password, salt) => {
    const salt64 = await encodeBase64(salt);
    if (isAndroid) {
        return getHashFn()(values(password), salt64, DEFAULT_ARGON2_PARAMS).then(
            (result) => new Uint8Array(result),
            (error) => console.log(error), // eslint-disable-line no-console
        );
    }
    // FIXME: iOS should hash Uint8Array, not string
    return getHashFn()(UInt8ToString(password), salt64, DEFAULT_ARGON2_PARAMS).then(
        (result) => new Uint8Array(result.split(',').map((num) => parseInt(num))),
        (error) => console.log(error), // eslint-disable-line no-console
    );
};

export const getSalt = async () => {
    return await getRandomBytes(SALT_LENGTH);
};

export const getNonce = async () => {
    return await getRandomBytes(NONCE_LENGTH);
};

export const createSecretBox = async (msg, nonce, key) => {
    return await nacl.secretbox(msg, nonce, key);
};

export const openSecretBox = async (box, nonce, key) => {
    const openedBox = await nacl.secretbox.open(box, nonce, key);
    if (openedBox) {
        return parse(UInt8ToString(openedBox));
    }
    throw new Error('Incorrect password');
};

export const UInt8ToString = (uInt8) => {
    return new TextDecoder().decode(uInt8);
};

export const stringToUInt8 = (string) => {
    return new TextEncoder().encode(string);
};

export const decodeBase64 = async (input) => {
    return await naclUtil.decodeBase64(input);
};

export const encodeBase64 = async (input) => {
    return await naclUtil.encodeBase64(input);
};

export const hexToUint8 = (str) => {
    if (!str) {
        return new Uint8Array();
    }
    const a = [];
    for (let i = 0, len = str.length; i < len; i += 2) {
        a.push(parseInt(str.substr(i, 2), 16));
    }
    return new Uint8Array(a);
};
