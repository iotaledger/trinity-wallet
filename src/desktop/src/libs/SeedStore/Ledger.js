/* global Electron */

class Ledger {
    /**
     * Init the vault
     * @param {array} key - Account decryption key (unused)
     * @param {string} accountId - Account identifier (unused)
     * @param {object} accountMeta -  Account meta data
     */
    constructor(key, accountId, accountMeta) {
        return (async () => {
            if (accountMeta) {
                this.index = accountMeta.index;
            }
            return this;
        })();
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
    addAccount = async () => {
        return true;
    };

    /**
     * Placeholder for Trinity compatibillity
     * @returns {promise} - Resolves to a success boolean
     */
    removeAccount = async () => {
        return true;
    };

    /**
     * Placeholder for Trinity compatibillity
     * @returns {promise} - Resolves to a success boolean
     */
    renameAccount = async () => {
        return true;
    };

    /**
     * Placeholder for Trinity compatibillity
     * @returns {promise} - Resolves to a success boolean
     */
    static updatePassword = async () => {
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
        const seed = await Electron.ledger.selectSeed(this.index);

        Electron.send('ledger', { awaitTransaction: true });
        const trytes = await seed.signTransaction(transfers, options.inputs);
        Electron.send('ledger', { awaitTransaction: false });

        return trytes;
    };

    getSeed = async () => {
        const seed = await Electron.ledger.selectSeed(this.index);
        return seed;
    };

    awaitConnection = async () => {
        return new Promise((resolve) => {
            const callback = (connected) => {
                if (connected) {
                    resolve();
                    Electron.ledger.removeListener(callback);
                }
            };

            Electron.ledger.addListener(callback);
        });
    };
}

export default Ledger;
