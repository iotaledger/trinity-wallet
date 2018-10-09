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
        const seed = await this.getSeed(true);

        if (!options.total || options.total === 1) {
            const address =  await seed.getAddress(options.index);
            console.log(address);
            return address;
        }

        const addresses = [];

        for (let i = 0; i < options.total; i++) {
            const address = await seed.getAddress(options.index + i);
            addresses.push(address);
        }

        console.log(addresses);

        return addresses;
    };

    getSeed = async () => {
        const transport = Electron.ledger.selectSeed(this.index);
        return transport;
    };
}

export default Ledger;
