/* global Electron */
import { ACC_MAIN, sha256, encrypt, decrypt } from 'libs/crypto';
import { byteToTrit } from 'libs/helpers';
import IOTA from '../../../../shared/node_modules/iota.lib.js';

// Prefix for seed account titles stored in Keychain
const ACC_PREFIX = 'account';

class Keychain {
    /**
     * Init the vault
     * @param {array} key - Account decryption key
     * @param {string} accountId - Account identifier
     */
    constructor(key, accountId) {
        return (async () => {
            this.key = key.slice(0);
            if (accountId) {
                this.accountId = await sha256(`${ACC_PREFIX}-${accountId}`);
            }
            return this;
        })();
    }

    /**
     * Create new account
     * @param {string} accountId - Account identifier
     * @param {array} seed - Byte array seed
     * @returns {promise} - Resolves to a success boolean
     */
    accountAdd = async (accountId, seed) => {
        try {
            this.accountId = await sha256(`${ACC_PREFIX}-${accountId}`);

            const vault = await encrypt(seed, this.key);
            await Electron.setKeychain(this.accountId, vault);

            return true;
        } catch (err) {
            throw err;
        }
    };

    /**
     * Remove account
     */
    accountRemove = async () => {
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
    accountRename = async (accountName) => {
        const newID = await sha256(`${ACC_PREFIX}-${accountName}`);

        const vault = await Electron.readKeychain(this.accountId);

        if (!vault) {
            throw new Error('Incorrect seed name');
        }

        try {
            await decrypt(vault, this.key);

            await Electron.removeKeychain(this.accountId);
            await Electron.setKeychain(newID, vault);

            this.accountId = newID;

            return true;
        } catch (err) {
            throw err;
        }
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

        try {
            const accounts = Object.keys(vault);

            if (!accounts.length) {
                return true;
            }

            for (let i = 0; i < accounts.length; i++) {
                const account = vault[i];

                if (account.account === `${ACC_MAIN}-salt`) {
                    continue;
                }

                const decryptedVault = await decrypt(account.password, key);
                const encryptedVault = await encrypt(decryptedVault, keyNew);

                await Electron.setKeychain(account.account, encryptedVault);
            }

            return true;
        } catch (err) {
            throw err;
        }
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
        const addresses = await Electron.genFn(seed, options.index, options.security, options.total);

        for (let i = 0; i < seed.length * 3; i++) {
            seed[i % seed.length] = 0;
        }

        return addresses;
    };

    /**
     * Prepare transfers
     */
    prepareTransfers = async (transfers, options = null) => {
        const seed = await this.getSeed(true);

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
    getSeed = async (rawTrits) => {
        const vault = await Electron.readKeychain(this.accountId);

        if (!vault) {
            throw new Error('Incorrect seed name');
        }

        try {
            const decryptedVault = await decrypt(vault, this.key);
            if (rawTrits) {
                let trits = [];
                for (let i = 0; i < decryptedVault.length; i++) {
                    trits = trits.concat(byteToTrit(decryptedVault[i]));
                }
                return trits;
            }
            return decryptedVault;
        } catch (err) {
            throw err;
        }
    };

    /**
     * Clear the vault
     * @returns {boolean} True if vault cleared
     */
    static clearVault = async () => {
        const vault = await Electron.listKeychain();
        const accounts = Object.keys(vault);

        for (let i = 0; i < accounts.length; i++) {
            await Electron.removeKeychain(vault[i].account);
        }

        return true;
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
