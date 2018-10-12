const Transport = require('@ledgerhq/hw-transport-node-hid').default;
const Iota = require('hw-app-iota').default;
const Wallet = require('electron').remote.getCurrentWindow().webContents;

class Ledger {
    constructor() {
        this.connected = false;
        this.listeners = [];

        this.subscription = Transport.listen({
            next: (e) => {
                this.onMessage(e.type);
            }
        });
    }

    /**
    * Create Ledger Transport and select seed by index
    * @param {number} index 
    * @returns {object} Ledger IOTA transport
    */
    async selectSeed(index) {
        if (!this.connected) {
            Wallet.send('ledger', { awaitConnection: true });
            await this.awaitConnection();
            Wallet.send('ledger', { awaitConnection: false });
        }

        if (this.iota) {
            this.transport.close();
            this.iota = null;
        }

        await this.awaitApplication(index);

        return this.iota;
    }

    /**
     * Wait for succesfull Ledger connection callback
     * @returns {promise}
     */
    async awaitConnection() {
        return new Promise((resolve) => {
            const callback = (connected) => {
                if (connected) {
                    resolve();
                    this.removeListener(callback);
                }
            };
            this.addListener(callback);
        });
    }

    /**
     * Wait for IOTA application and selected seed by index
     * @param {number} index - Target seed index
     * @returns {promise} Resolves with IOTA Transport object
     */
    async awaitApplication(index) {
        return new Promise((resolve, reject) => {
            const callback = async () => {
                try {
                    this.transport = await Transport.create();
                    this.iota = new Iota(this.transport);

                    const timeout = setTimeout(() => {
                        Wallet.send('ledger', { awaitApplication: true });
                    }, 1000);

                    await this.iota.setActiveSeed(`44'/4218'/${index}'`);

                    Wallet.send('ledger', { awaitApplication: false });
                    clearTimeout(timeout);

                    resolve(true);
                } catch (error) {
                    this.transport.close();
                    this.iota = null;

                    if (error.statusCode === 0x6e00) {
                        setTimeout(() => callback(), 4000);
                    } else {
                        Wallet.send('ledger', { awaitApplication: false });
                        reject(error);
                    }
                }
            };

            callback();
        });
    }

    /**
     * Proxy connection status to event listeners
     * @param {string} status - 
     */
    onMessage(status) {
        this.connected = status === 'add';
        this.listeners.forEach((listener) => listener(this.connected));

        if (!this.connected && this.iota) {
            this.transport.close();
            this.iota = null;
        }
    }

    /**
     * Add an connection event listener
     * @param {function} callback - Event callback
     */
    addListener(callback) {
        this.listeners.push(callback);
        if (this.connected) {
            callback(this.connected);
        }
    }

    /**
     * Remove an connection event listener
     * @param {function} callback - Target event callback to remove
     */
    removeListener(callback) {
        this.listeners.forEach((listener, index) => {
            if (callback === listener) {
                this.listeners.splice(index, 1);
            }
        });
    }
}

const ledger = new Ledger();

module.exports = ledger;
