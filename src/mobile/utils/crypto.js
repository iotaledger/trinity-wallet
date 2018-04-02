import { serialize, parse } from 'iota-wallet-shared-modules/libs/utils';
import { generateSecureRandom } from 'react-native-securerandom';
import { TextDecoder } from 'text-encoding';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

const crypto = require('crypto');

export const getNonce = async () => {
    return await generateSecureRandom(24);
};

export const getPasswordHash = (password) => {
    return crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
};

export const createSecretBox = async (message, nonce, key) => {
    const messageUint8Array = await naclUtil.decodeUTF8(serialize(message));
    const keyUint8Array = hexStringToByte(key);
    return await nacl.secretbox(messageUint8Array, nonce, keyUint8Array);
};

export const openSecretBox = async (box, nonce, key) => {
    return await parse(uInt8ToString(nacl.secretbox.open(box, nonce, key)));
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

export const uInt8ToString = (uIntArray) => {
    return new TextDecoder('utf-8').decode(uIntArray);
};

export const decodeBase64 = async (input) => {
    return await naclUtil.decodeBase64(input);
};

export const encodeBase64 = async (input) => {
    return await naclUtil.encodeBase64(input);
};
