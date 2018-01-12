const { ipcRenderer: ipc } = require('electron');

const Electron = {
    updateMenu: (attribute, value) => {
        ipc.send('menu.update', {
            attribute: attribute,
            value: value,
        });
    },

    onEvent: function(event, callback) {
        let listeners = this._eventListeners[event];
        if (!listeners) {
            listeners = this._eventListeners[event] = [];
            ipc.on(event, (e, args) => {
                listeners.forEach((call) => {
                    call(args);
                });
            });
        }
        listeners.push(callback);
    },

    removeEvent: function(event, callback) {
        const listeners = this._eventListeners[event];
        listeners.forEach((call, index) => {
            if (call === callback) {
                listeners.splice(index, 1);
            }
        });
    },

    _eventListeners: {},
};

global.Electron = Electron;
