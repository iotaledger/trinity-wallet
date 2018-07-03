import isFunction from 'lodash/isFunction';
import { iota } from './index';

const iotaNativeBindings = new Object();

iotaNativeBindings.asyncTransactionObject = (...args) => Promise.resolve(iota.utils.transactionObject(...args));

/**
 * Override nativeBindings instance asyncTransactionObject method
 *
 *   @method overrideAsyncTransactionObject
 *   @param {object} instance - iota instance
 *   @param {function} getDigestPromise
 *
 **/
export const overrideAsyncTransactionObject = (instance, getDigestPromise) => {
    const assignTxObjectConverter = () => {
        return (trytes, hash) => {
            if (hash) {
                return Promise.resolve(iota.utils.transactionObject(trytes, hash));
            }

            return isFunction(getDigestPromise)
                ? getDigestPromise(trytes).then((hash) => {
                      return iota.utils.transactionObject(trytes, hash);
                  })
                : Promise.resolve(iota.utils.transactionObject(trytes));
        };
    };

    instance.utils.asyncTransactionObject = assignTxObjectConverter();
};

export default iotaNativeBindings;
