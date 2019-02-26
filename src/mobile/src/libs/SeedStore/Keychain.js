import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import values from 'lodash/values';
import omit from 'lodash/omit';
import cloneDeep from 'lodash/cloneDeep';
import { createAndStoreBoxInKeychain, getSecretBoxFromKeychainAndOpenIt, keychain, ALIAS_SEEDS } from 'libs/keychain';
import { sha256 } from 'libs/crypto';
import { prepareTransfersAsync } from 'shared-modules/libs/iota/extendedApi';
import { tritsToChars } from 'shared-modules/libs/iota/converter';
import { getAddressGenFn, getMultiAddressGenFn, getSignatureFn } from 'libs/nativeModules';
import SeedStoreCore from './SeedStoreCore';

class Keychain extends SeedStoreCore {
    /**
     * Init the vault
     * @param {array} key - Account decryption key
     * @param {string} accountId - Account identifier
     */
    constructor(key, accountId) {
        super();
        return (async () => {
            this.key = cloneDeep(key);
            if (accountId) {
                this.accountId = await sha256(accountId);
            }
            return this;
        })();
    }

    /**
     * Return max supported input count
     * @returns {number} - 0 for no limit
     */
    get maxInputs() {
        return 0;
    }

    /**
     * Create new account
     * @param {string} accountId - Account identifier
     * @param {string} seed - Account seed
     * @returns {promise} - Resolves to a success boolean
     */
    addAccount = async (accountId, seed) => {
        this.accountId = await sha256(accountId);
        const existingInfo = await keychain.get(ALIAS_SEEDS);
        // Sha256 of account name against basic trit array
        const info = { [this.accountId]: values(seed) };

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
     * Return max supported input count
     * @returns {number} - 0 for no limit
     */
    getMaxInputs = () => {
        return 0;
    };

    /**
     * Rename account
     * @param {string} accountId - New account name
     * @returns {boolean} Seed renamed success state
     */
    accountRename = async (accountId) => {
        const seedInfo = await this.getSeeds();
        const newAccountId = await sha256(accountId);
        let newSeedInfo = {};

        if (this.accountId !== newAccountId) {
            newSeedInfo = Object.assign({}, seedInfo, { [newAccountId]: seedInfo[this.accountId] });
            delete newSeedInfo[this.accountId];
        }

        this.accountId = newAccountId;

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
        const seed = values(await this.getSeed());
        if (options.total && options.total > 1) {
            const genFn = getMultiAddressGenFn();
            const addressesTrits = await genFn(seed, options.index, options.security, options.total);
            return map(addressesTrits, (addressTrits) => tritsToChars(addressTrits));
        }
        const genFn = getAddressGenFn();
        const addressTrits = await genFn(seed, options.index, options.security);
        return tritsToChars(addressTrits);
    };

    /**
     * Prepare transfers
     */
    prepareTransfers = async (transfers, options = null) => {
        const seed = await this.getSeed();
        return prepareTransfersAsync()(seed, transfers, options, getSignatureFn());
    };

    /**
     * Get seed from keychain
     * @returns {string} Decrypted seed
     */
    getSeed = async () => {
        const seeds = await this.getSeeds();
        return new Int8Array(seeds[this.accountId]);
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
        for (let i = 0; i < values(seeds).length; i++) {
            if (isEqual(values(seeds)[i], values(seed))) {
                return false;
            }
        }
        return true;
    };
}

export default Keychain;
