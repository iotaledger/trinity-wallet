const Transport = require('@ledgerhq/hw-transport-node-hid').default;

const ledger = {
    listeners: [],
    ledgergInstance: Transport,

    /**
     * Add a event listener
     * @param {function} callback - Event callback
     */
    addListener: async function(callback) {
        console.log(this);
        if (this.listeners.length === 0) {
            this.ledgergInstance.listen({
                next: async (e) => {
                    this.listeners.forEach((listener) => listener(e.type));
                },
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
            this.ledgergInstance.unsubscribe();
        }
    },
};

module.exports = ledger;
