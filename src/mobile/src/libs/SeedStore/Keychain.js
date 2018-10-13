import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';
import omit from 'lodash/omit';
import cloneDeep from 'lodash/cloneDeep';
import { createAndStoreBoxInKeychain, getSecretBoxFromKeychainAndOpenIt, keychain, ALIAS_SEEDS } from 'libs/keychain';
import { prepareTransfersAsync } from 'shared-modules/libs/iota/extendedApi';
import { getAddressGenFn, getMultiAddressGenFn } from 'libs/nativeModules';

class Keychain {
    /**
     * Init the vault
     * @param {array} key - Account decryption key
     * @param {string} accountId - Account identifier
     */
    constructor(key, accountId) {
        this.key = cloneDeep(key);
        this.accountId = accountId;
    }

    /**
     * Create new account
     * @param {string} accountId - Account identifier
     * @param {string} seed - Account seed
     * @returns {promise} - Resolves to a success boolean
     */
    addAccount = async (accountId, seed) => {
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
    removeAccount = async () => {
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
        return prepareTransfersAsync()(seed, transfers, options);
    };

    /**
     * Get seed from keychain
     * @returns {string} Decrypted seed
     */
    getSeed = async () => {
        const seeds = await this.getSeeds();
        return seeds[this.accountId];
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
    isUniqueSeed = async (seed) => {
        const seeds = await this.getSeeds();
        return values(seeds).indexOf(seed) === -1;
    };
}

export default Keychain;
