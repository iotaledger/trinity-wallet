/* global Electron */
import Errors from 'libs/errors';
import { prepareTransfersAsync } from 'libs/iota/extendedApi';

import SeedStoreCore from './SeedStoreCore';

class Ledger extends SeedStoreCore {
    /**
     * Init the vault
     * @param {array} key - Account decryption key (unused)
     * @param {string} accountId - Account identifier (unused)
     * @param {object} accountMeta -  Account meta data
     */
    constructor(key, accountId, accountMeta) {
        super();

        if (accountMeta && typeof accountMeta.index === 'number') {
            this.index = accountMeta.index;
            this.page = typeof accountMeta.page === 'number' ? accountMeta.page : 0;
            this.indexAddress = typeof accountMeta.indexAddress === 'string' ? accountMeta.indexAddress : null;
        }
    }

    /**
     * If seed is available in plain form
     * @returns {boolean}
     */
    static get isSeedAvailable() {
        return false;
    }

    /**
     * If attaching a message to transactions is available
     * @returns {boolean}
     */
    static get isMessageAvailable() {
        return false;
    }

    /**
     * Return max supported input count
     * @returns {number}
     */
    getMaxInputs = async () => {
        await this.getSeed();
        const maxinputs = await Electron.ledger.getAppMaxBundleSize();
        return maxinputs;
    };

    /**
     * Placeholder for Trinity compatibillity
     * @returns {promise} - Resolves to a success boolean
     */
    addAccount = () => {
        return true;
    };

    /**
     * Placeholder for Trinity compatibillity
     * @returns {promise} - Resolves to a success boolean
     */
    removeAccount = () => {
        return true;
    };

    /**
     * Placeholder for Trinity compatibillity
     * @returns {promise} - Resolves to a success boolean
     */
    renameAccount = () => {
        return true;
    };

    /**
     * Placeholder for Trinity compatibillity
     * @returns {promise} - Resolves to a success boolean
     */
    static updatePassword = () => {
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
        const seed = await this.getSeed(options.security);

        if (!options.total || options.total === 1) {
            const address = await seed.getAddress(options.index);
            return address;
        }

        const addresses = [];

        for (let i = 0; i < options.total; i++) {
            const address = await seed.getAddress(options.index + i);
            addresses.push(address);
        }

        return addresses;
    };

    /**
     * Trigger on screen address validation
     * @param {number} index -  Address index
     */
    validateAddress = async (index) => {
        const seed = await this.getSeed();
        await seed.getAddress(index, { display: true });
    };

    /**
     * Prepare transfers
     */
    prepareTransfers = async (transfers, options = null) => {
        try {
            // If sending a 0 value transaction, use iota.lib.js
            if (options === null) {
                return prepareTransfersAsync()(transfers[0].address, transfers);
            }

            const seed = await this.getSeed();

            const remainder = { address: options.address, keyIndex: options.keyIndex };

            const connectionListener = (connected) => {
                if (!connected) {
                    Electron.send('ledger', { awaitTransaction: false });
                    Electron.ledger.removeListener(connectionListener);
                }
            };
            Electron.ledger.addListener(connectionListener);

            Electron.send('ledger', {
                awaitTransaction: { address: options.address, value: transfers.reduce((a, b) => a + b.value, 0) },
            });

            const trytes = await seed.prepareTransfers(transfers, options.inputs, remainder);
            Electron.send('ledger', { awaitTransaction: false });

            Electron.ledger.removeListener(connectionListener);

            return trytes;
        } catch (err) {
            Electron.send('ledger', { awaitTransaction: false });

            const error = err.message;

            if (options === null) {
                throw new Error(Errors.LEDGER_ZERO_VALUE);
            }
            if (error === Errors.LEDGER_INVALID_INDEX) {
                throw new Error(Errors.LEDGER_INVALID_INDEX);
            }
            if (error.includes('could not read from HID')) {
                throw new Error(Errors.LEDGER_DISCONNECTED);
            } else if (error.includes('Denied by user')) {
                throw new Error(Errors.LEDGER_DENIED);
            } else if (error === 'Ledger app error' || error === 'Ledger connection error') {
                throw new Error(Errors.LEDGER_CANCELLED);
            }
        }
    };

    /**
     * Select active seed on Ledger device
     * @param {number} security - Address generation security level - 1,2 or 3
     * @returns {object} Ledger IOTA transport
     */
    getSeed = async (security) => {
        if (this.indexAddress) {
            const testSeed = await Electron.ledger.selectSeed(this.index, this.page, 1);
            const testAddress = await testSeed.getAddress(0);

            if (testAddress !== this.indexAddress) {
                throw new Error(Errors.LEDGER_INVALID_INDEX);
            }
        }

        const seed = await Electron.ledger.selectSeed(this.index, this.page, security);

        return seed;
    };
}

export default Ledger;
