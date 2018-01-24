import assign from 'lodash/assign';
import size from 'lodash/size';
import { iota } from './iota';

/**
 *   Returns associated addresses with a seed plus a deposit address as last entry in the array
 *   Generates addresses in batches and upon each execution increase the index to fetch the next batch
 *   Stops at the point where there are no transaction hashes associated with last (total defaults to --> 10) addresses
 *
 *   @method getRelevantAddresses
 *   @param {function} resolve
 *   @param {function} reject
 *   @param {string} seed
 *   @param {object} [opts={index: 0, total: 10, returnAll: true, security: 2}]
 *   @param {array} allAddresses
 *   @returns {array} All addresses
 **/

const getRelevantAddresses = (resolve, reject, seed, opts, allAddresses) => {
    iota.api.getNewAddress(seed, opts, (err, addresses) => {
        if (err) {
            reject(err);
        } else {
            iota.api.findTransactions({ addresses }, (err, hashes) => {
                allAddresses = [...allAddresses, ...addresses];
                if (size(hashes)) {
                    const newOpts = assign({}, opts, { index: opts.total + opts.index });
                    getRelevantAddresses(resolve, reject, seed, newOpts, allAddresses);
                } else {
                    resolve(allAddresses);
                }
            });
        }
    });
};
/**
 *   Returns a promise meant for returning all associated addresses with a seed
 *
 *   @method getAllAddresses
 *   @param {string} seed
 *   @param {object} [addressesOpts={index: 0, total: 10, returnAll: true, security: 2}] - Default options for address generation
 *   @returns {promise}
 **/

export const getAllAddresses = (
    seed,
    addressesOpts = {
        index: 0,
        total: 10,
        returnAll: true,
        security: 2
    }
) => new Promise((res, rej) => getRelevantAddresses(res, rej, seed, addressesOpts, []));
