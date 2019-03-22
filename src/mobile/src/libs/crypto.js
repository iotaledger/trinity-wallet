import values from 'lodash/values';
import { parse } from 'shared-modules/libs/utils';
import { generateSecureRandom } from 'react-native-securerandom';
import { TextDecoder } from 'text-encoding';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { getHashFn } from 'libs/nativeModules';

const DEFAULT_ARGON2_PARAMS = { t_cost: 1, m_cost: 4096, parallelism: 4, hashLength: 32 };
const SALT_LENGTH = 32;
const NONCE_LENGTH = 24;

const cryptoImport = require('crypto'); // eslint-disable-line no-unused-vars

const sha256 = (input) => {
    return cryptoImport
        .createHash('sha256')
        .update(input)
        .digest('hex');
};

/**
 * Gets random bytes for provided quanity (length)
 *
 * @method getRandomBytes
 *
 * @param {number} quantity
 *
 * @returns {Promise<Uint8Array>}
 */
const getRandomBytes = async (quantity) => {
    return await generateSecureRandom(quantity);
};

const generatePasswordHash = async (password, salt) => {
    const salt64 = await encodeBase64(salt);
    return getHashFn()(values(password), salt64, DEFAULT_ARGON2_PARAMS).then(
        (result) => new Uint8Array(result),
        (error) => console.log(error), // eslint-disable-line no-console
    );
};

/**
 * Generates random salt
 *
 * @method getSalt
 *
 * @returns {Promise<Uint8Array>}
 */
const getSalt = async () => {
    return await CryptoModule.getRandomBytes(SALT_LENGTH);
};

/**
 * Generates random nonce
 *
 * @method getNonce
 *
 * @returns {Promise<Uint8Array>}
 */
const getNonce = async () => {
    return await CryptoModule.getRandomBytes(NONCE_LENGTH);
};

/**
 * Wraps nacl.secretbox (https://github.com/dchest/tweetnacl-js#secret-key-authenticated-encryption-secretbox)
 *
 * @method createSecretBox
 *
 * @param {Uint8Array} msg
 * @param {Uint8Array} nonce
 * @param {Uint8Array} key
 *
 * @return {Promise<Uint8Array>}
 */
const createSecretBox = async (msg, nonce, key) => {
    return await nacl.secretbox(msg, nonce, key);
};

/**
 * Wraps nacl.secretbox.open (https://github.com/dchest/tweetnacl-js#naclsecretboxopenbox-nonce-key)
 *
 * @method openSecretBox
 *
 * @param {Uint8Array} msg
 * @param {Uint8Array} nonce
 * @param {Uint8Array} key
 *
 * @returns {Promise<Uint8Array}
 */
const openSecretBox = async (box, nonce, key) => {
    const openedBox = await nacl.secretbox.open(box, nonce, key);
    if (openedBox) {
        return parse(CryptoModule.UInt8ToString(openedBox));
    }

    throw new Error('Incorrect password');
};

// FIXME: This method returns an empty string.
// Tried with new Uint8Array([ 84,114, 105, 110, 105, 116, 121 ])
const UInt8ToString = (uInt8) => {
    return new TextDecoder().decode(uInt8);
};

const stringToUInt8 = (string) => {
    // FIXME: How does this work with TextEncoder undefined?
    return new TextEncoder().encode(string);
};

/**
 * Wraps tweetnacl-util.decodeBase64 (https://github.com/dchest/tweetnacl-util-js#naclutildecodebase64string)
 *
 * @method decodeBase64
 *
 * @param {string} input
 *
 * @returns {Promise<Uint8Array>}
 */
const decodeBase64 = async (input) => {
    return await naclUtil.decodeBase64(input);
};

/**
 * Wraps tweetnacl-util.encodeBase64 (https://github.com/dchest/tweetnacl-util-js#naclutilencodebase64array)
 *
 * @method encodeBase64
 *
 * @param {Uint8Array} input
 *
 * @returns {Promise<string>}
 */
const encodeBase64 = async (input) => {
    return await naclUtil.encodeBase64(input);
};

/**
 * Converts hexadecimal string to Uint8Array
 *
 * @method hexToUint8
 *
 * @param {string} str
 *
 * @returns {Uint8Array}
 */
const hexToUint8 = (str) => {
    if (!str) {
        return new Uint8Array();
    }
    const a = [];
    for (let i = 0, len = str.length; i < len; i += 2) {
        a.push(parseInt(str.substr(i, 2), 16));
    }
    return new Uint8Array(a);
};

const CryptoModule = {
    sha256,
    getRandomBytes,
    generatePasswordHash,
    getSalt,
    getNonce,
    createSecretBox,
    openSecretBox,
    UInt8ToString,
    stringToUInt8,
    decodeBase64,
    encodeBase64,
    hexToUint8,
};

export default CryptoModule;
