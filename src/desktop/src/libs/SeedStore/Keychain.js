/* global Electron */
import { ACC_MAIN, sha256, encrypt, decrypt } from 'libs/crypto';
import { ALIAS_REALM } from 'libs/realm';
import { tritsToChars, byteToTrit } from 'libs/iota/converter';
import { prepareTransfersAsync } from 'libs/iota/extendedApi';

import SeedStoreCore from './SeedStoreCore';

// Prefix for seed account titles stored in Keychain
const ACC_PREFIX = 'account';

class Keychain extends SeedStoreCore {
    /**
     * Init the vault
     * @param {array} key - Account decryption key
     * @param {string} accountId - Account identifier
     */
    constructor(key, accountId) {
        super();

        return (async () => {
            this.key = key.slice(0);
            if (accountId) {
                this.accountId = await sha256(`${ACC_PREFIX}-${accountId}`);
            }

            return this;
        })();
    }

    /**
     * If seed is available in plain form
     * @returns {boolean}
     */
    static get isSeedAvailable() {
        return true;
    }

    /**
     * If attaching a message to transactions is available
     * @returns {boolean}
     */
    static get isMessageAvailable() {
        return true;
    }

    /**
     * Return max supported input count
     * @returns {number} - 0 for no limit
     */
    getMaxInputs = () => {
        return 0;
    };

    /**
     * Create new account
     * @param {string} accountId - Account identifier
     * @param {array} seed - Byte array seed
     * @returns {promise} - Resolves to a success boolean
     */
    addAccount = async (accountId, seed) => {
        this.accountId = await sha256(`${ACC_PREFIX}-${accountId}`);

        const vault = await encrypt(seed, this.key);
        await Electron.setKeychain(this.accountId, vault);

        return true;
    };

    /**
     * Remove account
     */
    removeAccount = async () => {
        if (!this.accountId) {
            throw new Error('Account not selected');
        }

        const isRemoved = await Electron.removeKeychain(this.accountId);

        if (!isRemoved) {
            throw new Error('Incorrect seed name');
        }

        return true;
    };

    /**
     * Rename account
     * @param {string} accountName - New account name
     * @returns {boolean} Seed renamed success state
     */
    renameAccount = async (accountName) => {
        const newID = await sha256(`${ACC_PREFIX}-${accountName}`);

        const vault = await Electron.readKeychain(this.accountId);

        if (!vault) {
            throw new Error('Incorrect seed name');
        }

        await decrypt(vault, this.key);

        await Electron.removeKeychain(this.accountId);
        await Electron.setKeychain(newID, vault);

        this.accountId = newID;

        return true;
    };

    /**
     * Update vault password
     * @param {array} key - Current encryption key
     * @param {array} keyNew - New encryption key
     * @returns {boolean} Password updated success state
     */
    static updatePassword = async (key, keyNew) => {
        const vault = await Electron.listKeychain();

        if (!vault) {
            throw new Error('Local storage not available');
        }

        const accounts = Object.keys(vault);

        if (!accounts.length) {
            return true;
        }

        for (let i = 0; i < accounts.length; i++) {
            const account = vault[i];

            if (account.account === `${ACC_MAIN}-salt` || account.account === ALIAS_REALM) {
                continue;
            }

            const decryptedVault = await decrypt(account.password, key);
            const encryptedVault = await encrypt(decryptedVault, keyNew);

            await Electron.setKeychain(account.account, encryptedVault);
        }

        return true;
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
        const seed = await this.getSeed(true);
        const addresses = await Electron.genFn(seed, options.index, options.security, options.total);

        for (let i = 0; i < seed.length * 3; i++) {
            seed[i % seed.length] = 0;
        }

        Electron.garbageCollect();

        return !options.total || options.total === 1
            ? tritsToChars(addresses)
            : addresses.map((trits) => tritsToChars(trits));
    };

    /**
     * Placeholder for Trinity compatibillity
     * @returns {boolean}
     */
    validateAddress = () => {
        return true;
    };

    /**
     * Prepare transfers
     */
    prepareTransfers = async (transfers, options = null) => {
        const seed = await this.getSeed(true);
        const transfer = await prepareTransfersAsync()(seed, transfers, options);

        for (let i = 0; i < seed.length * 3; i++) {
            seed[i % seed.length] = 0;
        }

        Electron.garbageCollect();

        return transfer;
    };

    /**
     * Get seed from keychain
     * @param {boolean} rawTrits - Should return raw trits
     * @returns {array} Decrypted seed
     */
    getSeed = async (rawTrits) => {
        const vault = await Electron.readKeychain(this.accountId);

        if (!vault) {
            throw new Error('Incorrect seed name');
        }

        const decryptedVault = await decrypt(vault, this.key);
        if (rawTrits) {
            let trits = [];
            for (let i = 0; i < decryptedVault.length; i++) {
                trits = trits.concat(byteToTrit(decryptedVault[i]));
            }
            return trits;
        }
        return decryptedVault;
    };

    /**
     * Unique seed check
     * @param {array} Seed - Seed to check
     * @returns {boolean} If Seed is unique
     */
    isUniqueSeed = async (seed) => {
        const vault = await Electron.listKeychain();
        if (!vault) {
            throw new Error('Local storage not available');
        }
        try {
            const accounts = vault.filter(
                (acc) => acc.account !== ACC_MAIN && acc.account !== `${ACC_MAIN}-salt` && acc.account !== ALIAS_REALM,
            );

            for (let i = 0; i < accounts.length; i++) {
                const account = accounts[i];

                const vaultSeed = await decrypt(account.password, this.key);

                if (
                    vaultSeed &&
                    vaultSeed.length === seed.length &&
                    seed.every((v, x) => {
                        return v % 27 === vaultSeed[x] % 27;
                    })
                ) {
                    return false;
                }
            }

            return true;
        } catch (err) {
            throw err;
        }
    };

    /**
     * Destroy the vault
     */
    destroy = () => {
        for (let i = 0; i < this.key.length * 3; i++) {
            this.key[i % this.key.length] = 0;
        }
        delete this.key;
    };
}

export default Keychain;
