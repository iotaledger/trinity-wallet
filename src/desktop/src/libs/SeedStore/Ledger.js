/* global Electron */

class Ledger {
    /**
     * Init the vault
     * @param {array} key - Account decryption key (unused)
     * @param {string} accountId - Account identifier (unused)
     * @param {object} accountMeta -  Account meta data
     */
    constructor(key, accountId, accountMeta) {
        if (accountMeta && typeof accountMeta.index === 'number') {
            this.index = accountMeta.index;
            this.page = typeof accountMeta.page === 'number' ? accountMeta.page : 0;
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
    get maxInputs() {
        return 2;
    }

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
        const seed = await this.getSeed();

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
     * Prepare transfers
     */
    prepareTransfers = async (transfers, options = null) => {
        const seed = await Electron.ledger.selectSeed(this.index, this.page);

        const remainder = { address: options.address, keyIndex: options.keyIndex };

        Electron.send('ledger', {
            awaitTransaction: { address: options.address, value: transfers.reduce((a, b) => a + b.value, 0) },
        });
        const trytes = await seed.signTransaction(transfers, options.inputs, remainder);
        Electron.send('ledger', { awaitTransaction: false });

        return trytes;
    };

    getSeed = async () => {
        const seed = await Electron.ledger.selectSeed(this.index, this.page);
        return seed;
    };
}

export default Ledger;
