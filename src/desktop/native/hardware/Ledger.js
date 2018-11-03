const Transport = require('@ledgerhq/hw-transport-node-hid').default;
const Iota = require('hw-app-iota').default;
const Wallet = require('electron').remote.getCurrentWindow().webContents;
const { ipcRenderer: ipc } = require('electron');

const connectionError = { message: 'Ledger connection error' };

class Ledger {
    constructor() {
        this.connected = false;
        this.listeners = [];

        this.subscription = Transport.listen({
            next: (e) => {
                this.onMessage(e.type);
            },
        });
    }

    /**
     * Create Ledger Transport and select seed by index
     * @param {number} index - Target seed index
     * @param {number} page - Target seed page
     * @param {number} security - Target security level
     * @returns {object} Ledger IOTA transport
     */
    async selectSeed(index, page, security) {
        if (!this.connected) {
            Wallet.send('ledger', { awaitConnection: true });
            await this.awaitConnection();
            Wallet.send('ledger', { awaitConnection: false });
        }

        if (!this.connected) {
            throw new Error('Ledger connection error');
        }

        if (this.iota) {
            this.transport.close();
            this.iota = null;
        }

        await this.awaitApplication(index, page, security);

        return this.iota;
    }

    /**
     * Wait for succesfull Ledger connection callback
     * @returns {promise}
     */
    async awaitConnection() {
        return new Promise((resolve, reject) => {
            const callbackSuccess = (connected) => {
                if (connected) {
                    resolve();
                    this.removeListener(callbackSuccess);
                    ipc.removeListener('ledger', callbackAbort);
                }
            };
            this.addListener(callbackSuccess);

            const callbackAbort = (e, message) => {
                if (message && message.abort) {
                    this.removeListener(callbackSuccess);
                    ipc.removeListener('ledger', callbackAbort);
                    reject(connectionError);
                }
            };
            ipc.on('ledger', callbackAbort);
        });
    }

    /**
     * Wait for IOTA application and selected seed by index
     * @param {number} index - Target seed index
     * @param {number} page - Target seed page
     * @param {number} security - Target security level
     * @returns {promise} Resolves with IOTA Transport object
     */
    async awaitApplication(index, page, security) {
        return new Promise((resolve, reject) => {
            let timeout = null;
            let rejected = false;

            const callback = async () => {
                try {
                    this.transport = await Transport.create();
                    this.iota = new Iota(this.transport);

                    const timeout = setTimeout(() => {
                        Wallet.send('ledger', { awaitApplication: true });
                    }, 1000);

                    await this.iota.setActiveSeed(`44'/4218'/${index}'/${page}'`, security || 2);

                    Wallet.send('ledger', { awaitApplication: false });
                    clearTimeout(timeout);

                    resolve(true);
                } catch (error) {
                    this.transport.close();
                    this.iota = null;

                    if (rejected) {
                        return;
                    }

                    if (error.statusCode === 0x6e00) {
                        timeout = setTimeout(() => callback(), 4000);
                    } else {
                        Wallet.send('ledger', { awaitApplication: false });
                        reject(error);
                    }
                }
            };

            callback();

            const callbackAbort = (e, message) => {
                if (message && message.abort) {
                    rejected = true;

                    ipc.removeListener('ledger', callbackAbort);

                    if (timeout) {
                        clearTimeout(timeout);
                    }
                    reject(connectionError);
                }
            };

            ipc.on('ledger', callbackAbort);
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
