import assign from 'lodash/assign';
import get from 'lodash/get';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';
import keys from 'lodash/keys';
import isString from 'lodash/isString';
import * as Keychain from 'react-native-keychain';
import {
    getRandomBytes,
    createSecretBox,
    openSecretBox,
    encodeBase64,
    decodeBase64,
    generatePasswordHash,
} from './crypto';

const keychain = {
    get: (alias) => {
        return new Promise((resolve, reject) => {
            Keychain.getInternetCredentials(alias)
                .then((credentials) => {
                    if (isEmpty(credentials)) {
                        resolve(null);
                    } else {
                        const payload = {
                            nonce: get(credentials, 'username'),
                            item: get(credentials, 'password'),
                        };

                        resolve(payload);
                    }
                })
                .catch((err) => reject(err));
        });
    },
    clear: (alias) => {
        return new Promise((resolve, reject) => {
            Keychain.resetInternetCredentials(alias)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    },
    set: (alias, nonce, item) => {
        return new Promise((resolve, reject) => {
            Keychain.setInternetCredentials(alias, nonce, item)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    },
};

export const getSecretBoxFromKeychainAndOpenIt = async (alias, keyUInt8) => {
    const secretBox = await keychain.get(alias);
    const boxUInt8 = await decodeBase64(secretBox.item);
    const nonceUInt8 = await decodeBase64(secretBox.nonce);
    return await openSecretBox(boxUInt8, nonceUInt8, keyUInt8);
};

export const getPasswordHash = async (password) => {
    const salt = await getSaltFromKeychain();
    return await generatePasswordHash(password, salt);
};

export const getSaltFromKeychain = async () => {
    const salt = await keychain.get('salt');
    return await decodeBase64(salt.item);
};

export const storeSaltInKeychain = async (salt) => {
    const nonce = await getRandomBytes(24);
    const nonce64 = await encodeBase64(nonce);
    const salt64 = await encodeBase64(salt);
    await keychain.set('salt', nonce64, salt64);
};

export const createAndStoreBoxInKeychain = async (key, message, alias) => {
    const nonce = await getRandomBytes(24);
    const box = await createSecretBox(message, nonce, key);
    const nonce64 = await encodeBase64(nonce);
    const box64 = await encodeBase64(box);
    return await keychain.set(alias, nonce64, box64);
};

export const storeSeedInKeychain = async (pwdHash, seed, name, alias = 'seeds') => {
    const existingInfo = await keychain.get(alias);
    const info = { [name]: seed };
    // If this is the first seed, store the seed with account name
    if (isEmpty(existingInfo)) {
        return await createAndStoreBoxInKeychain(pwdHash, info, alias);
    }
    // If this is an additional seed, get existing seed info and update with new seed info before storing
    const existingSeedInfo = await getSecretBoxFromKeychainAndOpenIt(alias, pwdHash);
    const updatedSeedInfo = assign({}, existingSeedInfo, info);
    return await createAndStoreBoxInKeychain(pwdHash, updatedSeedInfo, alias);
};

export const getAllSeedsFromKeychain = async (pwdHash) => {
    try {
        return await getSecretBoxFromKeychainAndOpenIt('seeds', pwdHash);
    } catch (error) {
        // In case no seeds in keychain or password hash is incorrect
        return null;
    }
};

export const getSeedFromKeychain = async (pwdHash, accountName) => {
    try {
        return (await getSecretBoxFromKeychainAndOpenIt('seeds', pwdHash))[accountName];
    } catch (error) {
        // In case no seeds in keychain or password hash is incorrect
        return null;
    }
};

export const logSeeds = async (pwdHash) => {
    try {
        const seeds = await getSecretBoxFromKeychainAndOpenIt('seeds', pwdHash);
        console.log(seeds); // eslint-disable-line no-console
    } catch (error) {
        // In case no seeds in keychain or password hash is incorrect
        return console.log(error); // eslint-disable-line no-console
    }
};

export const logTwoFa = async (pwdHash) => {
    const twofa = await getSecretBoxFromKeychainAndOpenIt('authKey', pwdHash);
    console.log(twofa); // eslint-disable-line no-console
};

export const getTwoFactorAuthKeyFromKeychain = async (pwdHash) => {
    try {
        return await getSecretBoxFromKeychainAndOpenIt('authKey', pwdHash);
    } catch (error) {
        // In case no 2FA key in keychain or password hash is incorrect
        return null;
    }
};

export const storeTwoFactorAuthKeyInKeychain = async (pwdHash, authKey, alias = 'authKey') => {
    // Should only allow storing two factor authkey if the user has an account
    const info = await keychain.get('seeds');
    const shouldNotAllow = !info;

    if (!isString(authKey)) {
        throw new Error('Invalid two factor authentication key.');
    } else if (shouldNotAllow) {
        throw new Error('Cannot store two factor authentication key.');
    }
    return await createAndStoreBoxInKeychain(pwdHash, authKey, alias);
};

export const hasDuplicateAccountName = (seedInfo, accountName) => {
    return keys(seedInfo).indexOf(accountName) > -1;
};

export const hasDuplicateSeed = (seedInfo, seed) => {
    return values(seedInfo).indexOf(seed) > -1;
};

export const updateAccountNameInKeychain = async (pwdHash, oldAccountName, newAccountName, alias = 'seeds') => {
    const seedInfo = await getAllSeedsFromKeychain(pwdHash);
    let newSeedInfo = {};
    if (oldAccountName !== newAccountName) {
        newSeedInfo = assign({}, seedInfo, { [newAccountName]: seedInfo[oldAccountName] });
        delete newSeedInfo[oldAccountName];
    }
    return await createAndStoreBoxInKeychain(pwdHash, newSeedInfo, alias);
};

export const deleteSeedFromKeychain = async (pwdHash, accountNameToDelete, alias = 'seeds') => {
    const seedInfo = await getAllSeedsFromKeychain(pwdHash);
    if (seedInfo) {
        const newSeedInfo = omit(seedInfo, accountNameToDelete);
        return await createAndStoreBoxInKeychain(pwdHash, newSeedInfo, alias);
    }
    throw new Error('Something went wrong while deleting from keychain.');
};

export const deleteTwoFactorAuthKeyFromKeychain = async (alias = 'authKey') => {
    return await keychain.clear(alias);
};

export const clearKeychain = async (aliasOne = 'authKey', aliasTwo = 'seeds', aliasThree = 'salt') => {
    await keychain.clear(aliasOne);
    await keychain.clear(aliasTwo);
    return await keychain.clear(aliasThree);
};

export const changePassword = async (
    oldPwdHash,
    newPwdHash,
    salt,
    aliasOne = 'seeds',
    aliasTwo = 'authKey',
    aliasThree = 'salt',
) => {
    const seedInfo = await getSecretBoxFromKeychainAndOpenIt(aliasOne, oldPwdHash);
    // Clear keychain for alias "seeds"
    await keychain.clear(aliasOne);
    const authKey = await getTwoFactorAuthKeyFromKeychain(oldPwdHash);
    if (authKey) {
        await keychain.clear(aliasTwo);
    }
    // Clear salt and store new salt in keychain
    await keychain.clear(aliasThree);
    await storeSaltInKeychain(salt);
    // Create a secret box with new password hash
    await createAndStoreBoxInKeychain(newPwdHash, seedInfo, aliasOne);
    // Only update keychain with authKey alias if wallet has a twoFa key
    if (authKey) {
        return await storeTwoFactorAuthKeyInKeychain(newPwdHash, authKey);
    }
    return Promise.resolve();
};

export default keychain;
