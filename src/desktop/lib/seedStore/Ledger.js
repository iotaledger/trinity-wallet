const Transport = require('@ledgerhq/hw-transport-node-hid').default;
const Iota = require('hw-app-iota').default;

const ledger = {
    listeners: [],
    ledgergInstance: Transport,
    iotaInstance: null,
    subscription: null,

    /**
    * Create Ledger Transport and select seed by index
    * @param {number} index 
    * @returns {object} Ledger IOTA transport
    */
    selectSeed: async function(index) {
        if (!this.iotaInstance) {
            const transport = await Transport.create();
            this.iotaInstance = new Iota(transport);
        }

        await this.iotaInstance.setActiveSeed(`44'/4218'/${index}'`);

        return this.iotaInstance;
    },

    /**
     * Add a event listener
     * @param {function} callback - Event callback
     */
    addListener: async function(callback) {
        if (this.listeners.length === 0) {
            this.subscription = this.ledgergInstance.listen({
                next: async (e) => {
                    this.listeners.forEach((listener) => listener(e.type));
                }
            });
        }

        this.listeners.push(callback);
    },

    /**
     * Remove a event listener
     * @param {function} callback - Target event callback to remove
     */
    removeListener: function(callback) {
        this.listeners.forEach((listener, index) => {
            if (callback === listener) {
                this.listeners.splice(index, 1);
            }
        });

        if (this.listeners.length === 0) {
            this.subscription.unsubscribe();
        }
    }
};

module.exports = ledger;
