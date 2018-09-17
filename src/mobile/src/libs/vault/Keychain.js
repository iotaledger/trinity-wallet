import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';
import omit from 'lodash/omit';
import { createAndStoreBoxInKeychain, getSecretBoxFromKeychainAndOpenIt, keychain, ALIAS_SEEDS } from 'libs/keychain';
import { getAddressGenFn, getMultiAddressGenFn } from 'libs/nativeModules';
import { openSecretBox, decodeBase64 } from 'libs/crypto';
import IOTA from '../../../../shared/node_modules/iota.lib.js';

class Keychain {
    /**
     * Init the vault
     * @param {array} key - Account decryption key
     * @param {string} accountId - Account identifier
     */
    constructor(key, accountId) {
        this.key = key.slice(0);
        this.accountId = accountId;
    }

    /**
     * Create new account
     * @param {string} accountId - Account identifier
     * @param {string} seed - Account seed
     * @returns {promise} - Resolves to a success boolean
     */
    accountAdd = async (accountId, seed) => {
        this.accountId = accountId;

        const existingInfo = await keychain.get(ALIAS_SEEDS);
        const info = { [this.accountId]: seed };

        // If this is the first seed, store the seed with account name
        if (isEmpty(existingInfo)) {
            return await createAndStoreBoxInKeychain(this.key, info, ALIAS_SEEDS);
        }
        // If this is an additional seed, get existing seed info and update with new seed info before storing
        const existingSeedInfo = await this.getSeeds();
        const updatedSeedInfo = Object.assign({}, existingSeedInfo, info);
        return await createAndStoreBoxInKeychain(this.key, updatedSeedInfo, ALIAS_SEEDS);
    };

    /**
     * Rename account
     * @param {string} accountId - New account name
     * @returns {boolean} Seed renamed success state
     */
    accountRename = async (accountId) => {
        const seedInfo = await this.getSeeds();

        let newSeedInfo = {};

        if (this.accountId !== accountId) {
            newSeedInfo = Object.assign({}, seedInfo, { [accountId]: seedInfo[this.accountId] });
            delete newSeedInfo[this.accountId];
        }

        this.accountId = accountId;

        return await createAndStoreBoxInKeychain(this.key, newSeedInfo, ALIAS_SEEDS);
    };

    /**
     * Remove account
     */
    accountRemove = async () => {
        const seedInfo = await this.getSeeds();
        if (seedInfo) {
            const newSeedInfo = omit(seedInfo, this.accountId);
            return await createAndStoreBoxInKeychain(this.key, newSeedInfo, ALIAS_SEEDS);
        }
        throw new Error('Something went wrong while deleting from keychain.');
    };

    /**
     * Generate address
     * @param {object} options - Address generation options
     *   @property {number} index - Address index
     *   @property {number} security - Address generation security level - 1,2 or 3
     *   @property {number} total - Address count to return
     * @returns {promise}
     */
    generateAddress = async (options) => {
        const seed = await this.getSeed();

        if (options.total && options.total > 1) {
            const genFn = getMultiAddressGenFn();
            return await genFn(seed, options.index, options.security, options.total);
        }

        const genFn = getAddressGenFn();
        return await genFn(seed, options.index, options.security);
    };

    /**
     * Prepare transfers
     */
    prepareTransfers = async (transfers, options = null) => {
        const seed = await this.getSeed();

        let args = [seed, transfers];

        if (options) {
            args = [...args, options];
        }

        return new Promise((resolve, reject) => {
            const instance = new IOTA({ provider: 'http://localhost:14265' });

            instance.api.prepareTransfers(...args, (err, trytes) => {
                for (let i = 0; i < seed.length * 3; i++) {
                    seed[i % seed.length] = 0;
                }

                if (err) {
                    reject(err);
                } else {
                    resolve(trytes);
                }
            });
        });
    };

    /**
     * Get seed from keychain
     * @param {boolean} rawTrits - Should return raw trits
     * @returns {array} Derypted seed
     */
    getSeed = async () => {
        const secretBox = await keychain.get(ALIAS_SEEDS);
        const box = await decodeBase64(secretBox.item);
        const nonce = await decodeBase64(secretBox.nonce);
        return await openSecretBox(box, nonce, this.key)[this.accountId];
    };

    /**
     * Get all seeds from keychain
     * @returns {object} Seed items object
     */
    getSeeds = async () => {
        try {
            return await getSecretBoxFromKeychainAndOpenIt(ALIAS_SEEDS, this.key);
        } catch (error) {
            return null;
        }
    };

    /**
     * Check if a seed is unique
     * @param {string} - Target seed
     * @returns {boolean} If seed is unique
     */
    uniqueSeed = async (seed) => {
        const seeds = this.getSeeds();
        return values(seeds).indexOf(seed) > -1;
    };
}

export default Keychain;
