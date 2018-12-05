import { NativeModules } from 'react-native';
import { isAndroid, isIOS } from 'libs/device';

export const forceGC = () => {
    return NativeModules.GarbageCollectorIOS.forceGC();
};
