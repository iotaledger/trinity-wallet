import assign from 'lodash/assign';
import size from 'lodash/size';
import { iota } from './iota';

/**
 *   Starts traversing from specified index backwards
 *   Keeps on calling findTransactions to see if there's any associated tx with address
 *   Stops at the point where it finds an address with hash
 *   Basically just removes the unused addresses
 *
 *   @method removeUnusedAddresses
 *   @param {function} resolve
 *   @param {function} reject
 *   @param {number} index
 *   @param {array} finalAddresses
 **/
const removeUnusedAddresses = (resolve, reject, index, finalAddresses) => {
    if (!finalAddresses[index]) {
        resolve(finalAddresses);
        return;
    }

    iota.api.findTransactions({ addresses: [finalAddresses[index]] }, (err, hashes) => {
        if (err) {
            reject(err);
        } else {
            // If address has affiliated txs
            if (size(hashes)) {
                resolve(finalAddresses);
            } else {
                removeUnusedAddresses(resolve, reject, index - 1, finalAddresses.slice(0, index));
            }
        }
    });
};

/**
 *   Returns associated addresses with a seed
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
                if (size(hashes)) {
                    allAddresses = [...allAddresses, ...addresses];
                    const newOpts = assign({}, opts, { index: opts.total + opts.index });
                    getRelevantAddresses(resolve, reject, seed, newOpts, allAddresses);
                } else {
                    // Traverse backwards to remove all unused addresses
                    new Promise((res, rej) => {
                        const lastAddressIndex = size(allAddresses) - 1;
                        removeUnusedAddresses(res, rej, lastAddressIndex, allAddresses.slice());
                    })
                        .then((finalAddresses) => {
                            resolve(finalAddresses);
                        })
                        .catch((err) => reject(err));
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
        security: 2,
    },
) => new Promise((res, rej) => getRelevantAddresses(res, rej, seed, addressesOpts, []));
