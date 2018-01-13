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
            changePassword: t('settings:hangePassword'),
            advanced: t('settings:advanced'),
            hide: 'Hide',
            hideOthers: 'Hide Others',
            showAll: 'Show All',
            quit: 'Quit',
            edit: 'Edit',
            undo: 'Undo',
            redo: 'Redo',
            cut: 'Cut',
            copy: 'Copy',
            paste: 'Paste',
            selectAll: 'Select All',
            account: t(''),
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
