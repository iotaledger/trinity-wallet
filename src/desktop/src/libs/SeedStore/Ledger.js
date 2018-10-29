/* global Electron */
import Errors from 'libs/errors';

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
     * Trigger on screen address validation
     * @param {number} index -  Address index
     * @returns {promise}
     */
    validateAddress = async (index) => {
        const seed = await this.getSeed();
        const address = await seed.getAddress(index, { display: true });
        return !address
            ? false
            : {
                  notification: {
                      title: 'ledger:checkAddress',
                      content: 'ledger:checkAddressExplanation',
                  },
              };
    };

    /**
     * Prepare transfers
     */
    prepareTransfers = async (transfers, options = null) => {
        try {
            const seed = await Electron.ledger.selectSeed(this.index, this.page);

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

            const trytes = await seed.signTransaction(transfers, options.inputs, remainder);
            Electron.send('ledger', { awaitTransaction: false });

            Electron.ledger.removeListener(connectionListener);

            return trytes;
        } catch (err) {
            Electron.send('ledger', { awaitTransaction: false });

            const error = err.message;

            if (options === null) {
                throw new Error(Errors.LEDGER_ZERO_VALUE);
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

    getSeed = async () => {
        const seed = await Electron.ledger.selectSeed(this.index, this.page);
        return seed;
    };
}

export default Ledger;
