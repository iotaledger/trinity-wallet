import { serialize, parse } from 'iota-wallet-shared-modules/libs/utils';
import { generateSecureRandom } from 'react-native-securerandom';
import { TextDecoder } from 'text-encoding';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import crypto from 'react-native-fast-crypto';

const cryptoImport = require('crypto'); // eslint-disable-line no-unused-vars

export const getRandomBytes = async (quantity) => {
    return await generateSecureRandom(quantity);
};

export const generatePasswordHash = (password, salt) => {
    const passwordUInt8 = stringToUInt8(password);
    return crypto.scrypt(passwordUInt8, salt, 32768, 16, 1, 32).then(
        (result) => {
            return result;
        },
        (error) => console.log(error),
    ); // eslint-disable-line no-console
};

export const createSecretBox = async (message, nonce, keyUint8) => {
    const messageUint8 = await naclUtil.decodeUTF8(serialize(message));
    return await nacl.secretbox(messageUint8, nonce, keyUint8);
};

export const openSecretBox = async (box, nonce, key) => {
    return await parse(UInt8ToString(nacl.secretbox.open(box, nonce, key)));
};

export const hexStringToByte = (str) => {
    if (!str) {
        return new Uint8Array();
    }
    const a = [];
    for (let i = 0, len = str.length; i < len; i += 2) {
        a.push(parseInt(str.substr(i, 2), 16));
    }
    return new Uint8Array(a);
};

export const UInt8ToString = (uInt8) => {
    return new TextDecoder('utf-8').decode(uInt8);
};

export const stringToUInt8 = (string) => {
    return new TextEncoder('utf-8').encode(string);
};

export const decodeBase64 = async (input) => {
    return await naclUtil.decodeBase64(input);
};

export const encodeBase64 = async (input) => {
    return await naclUtil.encodeBase64(input);
};
