const { Menu, ipcMain, dialog, shell } = require('electron');

const state = {
    authorised: false,
};

let language = {
    about: 'About',
    checkUpdate: 'Check for Updates',
    settings: 'Settings',
    language: 'Language',
    currency: 'Currency',
    theme: 'Theme',
    twoFA: 'Two-factor authentication',
    changePassword: 'Change password',
    advanced: 'Advanced settings',
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
    wallet: 'Wallet',
    balance: 'Balance',
    send: 'Send',
    receive: 'Receive',
    history: 'History',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to log out?',
    yes: 'Yes',
    no: 'No',
};

const initMenu = (app, getWindow) => {
    const navigate = (path) => {
        const mainWindow = getWindow('main');
        if (mainWindow) {
            mainWindow.webContents.send('menu', path);
        }
    };

    const createMenu = () => {
        const template = [
            {
                label: app.getName(),
                submenu: [
                    {
                        label: `${language.about} ${app.getName()}`,
                        role: 'about',
                    },
                    {
                        label: `${language.checkUpdate}...`,
                        click: () => navigate('update'),
                    },
                    {
                        label: language.settings,
                        submenu: [
                            {
                                label: language.language,
                                click: () => navigate('settings/language'),
                            },
                            {
                                label: language.currency,
                                click: () => navigate('settings/currency'),
                            },
                            {
                                label: language.theme,
                                click: () => navigate('settings/theme'),
                            },
                            {
                                type: 'separator',
                            },
                            {
                                label: language.twoFA,
                                enabled: state.authorised,
                                click: () => navigate('settings/twoFa'),
                            },
                            {
                                label: language.changePassword,
                                enabled: state.authorised,
                                click: () => navigate('settings/password'),
                            },
                            {
                                label: language.advanced,
                                enabled: state.authorised,
                                click: () => navigate('settings/advanced'),
                            },
                        ],
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: `${language.hide} ${app.getName()}`,
                        role: 'hide',
                    },
                    {
                        label: language.hideOthers,
                        role: 'hideothers',
                    },
                    {
                        label: language.showAll,
                        role: 'unhide',
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: language.quit,
                        accelerator: 'Command+Q',
                        click: function() {
                            app.quit();
                        },
                    },
                ],
            },
        ];

        template.push({
            label: language.edit,
            submenu: [
                { label: language.undo, accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
                { label: language.redo, accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
                { type: 'separator' },
                { label: language.cut, accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
                { label: language.copy, accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
                { label: language.paste, accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
                { label: language.selectAll, accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
            ],
        });

        if (state.authorised) {
            template.push({
                label: language.wallet,
                submenu: [
                    {
                        label: language.balance,
                        click: () => navigate('wallet/balance'),
                    },
                    {
                        label: language.send,
                        click: () => navigate('wallet/send'),
                    },
                    {
                        label: language.receive,
                        click: () => navigate('wallet/receive'),
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: language.logout,
                        click: function() {
                            const mainWindow = getWindow('main');
                            if (mainWindow) {
                                dialog.showMessageBox(
                                    mainWindow,
                                    {
                                        type: 'question',
                                        title: language.logout,
                                        message: language.logoutConfirm,
                                        buttons: [language.yes, language.no],
                                    },
                                    (index) => {
                                        if (index === 1) {
                                            mainWindow.webContents.send('menu', 'logout');
                                        }
                                    },
                                );
                            }
                        },
                    },
                ],
            });
        }

        template.push({
            label: 'Help',
            submenu: [
                {
                    label: `${app.getName()} Help`,
                    click: function() {
                        //TODO: Change to wallet documentation link
                        shell.openExternal('https://iota.readme.io/docs/what-is-iota');
                    },
                },
            ],
        });

        const applicationMenu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(applicationMenu);
    };

    app.once('ready', () => {
        ipcMain.on('menu.update', (e, settings) => {
            state[settings.attribute] = settings.value;
            createMenu();
        });

        ipcMain.on('menu.language', (e, data) => {
            language = data;
            createMenu();
        });

        createMenu();
    });
};

module.exports = initMenu;
