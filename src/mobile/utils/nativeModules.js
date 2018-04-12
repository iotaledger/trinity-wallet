import { NativeModules } from 'react-native';
import { isAndroid, isIOS } from './device';

export const getAddressGenFn = () => {
    let genFn = null;
    if (isAndroid) {
        genFn = NativeModules.EntangledAndroid.generateAddress;
    } else if (isIOS) {
        genFn = NativeModules.Iota.address;
    }
    return genFn;
};

export const getMultiAddressGenFn = () => {
    let genFn = null;
    if (isAndroid) {
        genFn = NativeModules.EntangledAndroid.generateAddresses;
    } else if (isIOS) {
        genFn = NativeModules.Iota.multiAddress;
    }
    return genFn;
};

export const getPowFn = () => {
    let powFn = null;
    if (isAndroid) {
        powFn = NativeModules.EntangledAndroid.doPoW;
    } else if (isIOS) {
        powFn = NativeModules.Iota.doPoW;
    }
    return powFn;
};
