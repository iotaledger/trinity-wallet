import * as Keychain from 'react-native-keychain';

export default {
    get: async () => {
        try {
            return await Keychain.getGenericPassword();
        } catch (err) {
            console.error(err); // eslint-disable-line no-console
            return undefined;
        }
    },
    clear: async () => {
        try {
            await Keychain.resetGenericPassword();
        } catch (err) {
            console.error(err); // eslint-disable-line no-console
        }
    },
    set: async (key, value) => {
        try {
            await Keychain.setGenericPassword(key, value);
        } catch (err) {
            console.error(err); // eslint-disable-line no-console
        }
    },
};
