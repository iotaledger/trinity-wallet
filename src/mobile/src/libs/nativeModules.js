import { NativeModules } from 'react-native';
import { isAndroid, isIOS } from 'libs/device';

/**
 * Gets single address generation function
 * @return {function | null} Address generation function
 */
export const getAddressGenFn = () => {
    let genFn = null;
    if (isAndroid) {
        genFn = NativeModules.EntangledAndroid.generateAddress;
    } else if (isIOS) {
        genFn = NativeModules.EntangledIOS.generateAddress;
    }
    return genFn;
};

/**
 * Gets multi address generation function
 * @return {function | null} Address generation function
 */
export const getMultiAddressGenFn = () => {
    let genFn = null;
    if (isAndroid) {
        genFn = NativeModules.EntangledAndroid.generateAddresses;
    } else if (isIOS) {
        genFn = NativeModules.EntangledIOS.generateAddresses;
    }
    return genFn;
};

/**
 * Gets Proof of Work function
 * @return {function | null} PoW function
 */
export const getPowFn = () => {
    let powFn = null;
    if (isAndroid) {
        powFn = NativeModules.EntangledAndroid.doPoW;
    } else if (isIOS) {
        powFn = NativeModules.EntangledIOS.doPoW;
    }
    return powFn;
};

/**
 * Gets digest function
 * @return {function} Digest function
 */
export const getDigestFn = () => {
    return isAndroid ? NativeModules.EntangledAndroid.getDigest : NativeModules.EntangledIOS.getDigest;
};

/**
 * Gets Argon2 hash function
 * @return {function} Hash function
 */
export const getHashFn = () => {
    if (isAndroid) {
        return NativeModules.Argon2Android.hash;
    } else if (isIOS) {
        return NativeModules.Argon2IOS.hash;
    }
};

/**
 * Forces garbage collection
 * @return {function} Garbage collector function
 */
export const forceGC = () => {
    return isAndroid ? NativeModules.GarbageCollectorAndroid.forceGC : NativeModules.GarbageCollectorIOS.forceGC;
};
