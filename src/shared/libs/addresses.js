import assign from 'lodash/assign';
import size from 'lodash/size';
import { iota } from './iota';

/**
 *   Keeps on calling findTransactions to check if each address has any associated transaction hashes
 *   In case it has no associated transaction hashes, as a safety measure check for the next addresses if it has associated transactions
 *   NOTE: Has side effects
 *
 *   @method getRelevantAddresses
 *   @param {function} res
 *   @param {function} rej
 *   @param {array} addresses
 *   @param {number} start
 *   @param {array} allRemaining
 *   @returns {array} All addresses
 **/

const getRemainingAddresses = (res, rej, addresses, start, allRemaining) => {
    if (!addresses[start]) {
        res(allRemaining);
        return;
    }

    iota.api.findTransactions({ addresses: [addresses[start]] }, (err, hashes) => {
        if (err) {
            rej(err);
        } else {
            if (size(hashes)) {
                allRemaining.push(addresses[start]);
                start = start + 1;

                getRemainingAddresses(res, rej, addresses, start, allRemaining);
            } else {
                // Got an address with no transactions associated
                // Keep it as a deposit address
                allRemaining.push(addresses[start]);

                // As a safety check, check for the next address
                if (!addresses[start + 1]) {
                    res(allRemaining);
                } else {
                    iota.api.findTransactionObjects({ addresses: [addresses[start + 1]] }, (err, result) => {
                        if (err) {
                            rej(err);
                        } else {
                            if (size(result)) {
                                allRemaining.push(addresses[start + 1]);
                                start = start + 2;

                                getRemainingAddresses(res, rej, addresses, start, allRemaining);
                            } else {
                                res(allRemaining);
                            }
                        }
                    });
                }
            }
        }
    });
};

/**
 *   Returns all associated addresses with a seed plus a deposit address as last entry in the array
 *
 *   @method getRelevantAddresses
 *   @param {function} resolve
 *   @param {function} reject
 *   @param {string} seed
 *   @param {object} [opts={index: 0, total: 1, returnAll: true, security: 2}]
 *   @param {array} allAddresses
 *   @param {boolean} [withNewSeedCheck=false] If on, check the first address to see if its used
 *   @returns {array} All addresses
 **/

const getRelevantAddresses = (resolve, reject, seed, opts, allAddresses, withNewSeedCheck = false) => {
    iota.api.getNewAddress(seed, opts, (err, addresses) => {
        if (err) {
            reject(err);
        } else {
            const latest = addresses[addresses.length - 1];
            iota.api.findTransactions({ addresses: [latest] }, (err, hashes) => {
                if (withNewSeedCheck) {
                    // Probably not a new seed as the first address is not used
                    if (size(hashes)) {
                        allAddresses = [...allAddresses, ...addresses];
                        const newOpts = assign({}, opts, { index: opts.index + 1, total: 10 });
                        getRelevantAddresses(resolve, reject, seed, newOpts, allAddresses);
                    } else {
                        allAddresses = [...allAddresses, ...addresses];
                        resolve(allAddresses);
                    }
                } else {
                    if (size(hashes)) {
                        allAddresses = [...allAddresses, ...addresses];
                        const newOpts = assign({}, opts, { index: opts.total + opts.index });
                        getRelevantAddresses(resolve, reject, seed, newOpts, allAddresses);
                    } else {
                        iota.api.findTransactions({ addresses: addresses.slice(5, 10) }, (err, hashes) => {
                            if (size(hashes)) {
                                // include first five
                                allAddresses = [...allAddresses, ...addresses.slice(0, 5)];
                                new Promise((res, rej) => {
                                    getRemainingAddresses(res, rej, addresses.slice(5, 10), 0, []);
                                }).then((allRemaining) => {
                                    allAddresses = [...allAddresses, ...allRemaining];
                                    resolve(allAddresses);
                                });
                            } else {
                                new Promise((res, rej) => {
                                    getRemainingAddresses(res, rej, addresses.slice(0, 5), 0, []);
                                }).then((allRemaining) => {
                                    allAddresses = [...allAddresses, ...allRemaining];
                                    resolve(allAddresses);
                                });
                            }
                        });
                    }
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
 *   @param {object} [addressesOpts={index: 0, total: 1, returnAll: true, security: 2}] - Default options for address generation
 *   @returns {promise}
 **/
export const getAllAddresses = (
    seed,
    addressesOpts = {
        index: 0,
        total: 1,
        returnAll: true,
        security: 2,
    },
) => new Promise((res, rej) => getRelevantAddresses(res, rej, seed, addressesOpts, [], true));
