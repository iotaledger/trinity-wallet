/* global Electron */

/**
 * Redux store persistance storage wrapper
 */
const storage = {
    getItem: (key, callback) => {
        try {
            const item = Electron.getStorage(key);
            callback(null, item);
        } catch (err) {
            callback(err);
        }
    },
    setItem: (key, item, callback) => {
        try {
            Electron.setStorage(key, item);
        } catch (err) {
            callback(err);
        }
    },
    removeItem: (key, callback) => {
        try {
            Electron.removeStorage(key);
        } catch (err) {
            callback(err);
        }
    },
    getAllKeys: (callback) => {
        try {
            const keys = Electron.getAllStorageKeys();
            callback(null, keys);
        } catch (err) {
            callback(err, []);
        }
    },
};

export default storage;
