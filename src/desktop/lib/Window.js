const { ipcRenderer: ipc } = require('electron');

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const Electron = {
    updateMenu: (attribute, value) => {
        ipc.send('menu.update', {
            attribute: attribute,
            value: value,
        });
    },

    changeLanguage: (t) => {
        ipc.send('menu.language', {
            about: 'About',
            settings: capitalize(t('home:settings')),
            language: t('languageSetup:language'),
            currency: t('settings:currency'),
            theme: t('settings:theme'),
            twoFA: t('settings:twoFA'),
            changePassword: t('settings:changePassword'),
            advanced: t('settings:advanced'),
            hide: t('settings:hide'),
            hideOthers: t('settings:hideOthers'),
            showAll: t('settings:showAll'),
            quit: t('settings:quit'),
            edit: t('settings:edit'),
            undo: t('settings:undo'),
            redo: t('settings:redo'),
            cut: t('settings:cut'),
            copy: t('settings:copy'),
            paste: t('settings:paste'),
            selectAll: t('settings:selectAll'),
            wallet: t('global:wallet'),
            balance: capitalize(t('home:balance')),
            send: capitalize(t('home:send')),
            receive: capitalize(t('home:receive')),
            history: capitalize(t('home:history')),
            logout: t('settings:logout'),
            logoutConfirm: t('logoutConfirmationModal:logoutConfirmation'),
            yes: t('global:no'),
            no: t('global:yes'),
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
