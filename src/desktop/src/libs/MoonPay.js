/* global Electron */
import isNull from 'lodash/isNull';
import { parse, serialise } from 'libs/utils';
import { ALIAS_MOONPAY_CREDENTIALS } from './constants';

/**
 * MoonPay keychain adapter
 */
export default {
    /**
     * Gets MoonPay credentials (jwt & csrf) from keychain
     *
     * @returns {Promise}
     */
    get() {
        return Electron.readKeychain(ALIAS_MOONPAY_CREDENTIALS).then((credentials) => {
            if (!isNull(credentials)) {
                return parse(credentials);
            }

            return null;
        });
    },
    /**
     * Sets MoonPay credentials (jwt & csrf) in keychain
     *
     * @param {object} credentials
     *
     * @returns {Promise}
     */
    set(credentials) {
        return Electron.setKeychain(ALIAS_MOONPAY_CREDENTIALS, serialise(credentials));
    },
    /**
     * Clears MoonPay credentials (jwt & csrf) in keychain
     *
     * @returns {Promise}
     */
    clear() {
        return Electron.removeKeychain(ALIAS_MOONPAY_CREDENTIALS);
    },
};
