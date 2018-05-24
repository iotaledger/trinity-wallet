const { Menu, ipcMain, dialog, shell } = require('electron');

const state = {
    authorised: false,
    enabled: true,
};

let language = {
    about: 'About Trinity',
    checkUpdate: 'Check for Updates',
    sendFeedback: 'Send feedback',
    settings: 'Settings',
    accountSettings: 'Account management',
    newAccount: 'Add new account',
    language: 'Language',
    node: 'Node',
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
    account: 'Account',
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
    let mainMenu = null;

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
                        label: language.about,
                        click: () => navigate('about'),
                        enabled: state.enabled,
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: `${language.checkUpdate}...`,
                        click: () => navigate('update'),
                        enabled: state.enabled,
                    },
                    {
                        label: language.sendFeedback,
                        click: () => navigate('feedback'),
                        enabled: state.enabled,
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: language.settings,
                        submenu: [
                            {
                                label: language.language,
                                accelerator: 'Command+,',
                                click: () => navigate('settings/language'),
                                enabled: state.enabled,
                            },
                            {
                                label: language.node,
                                click: () => navigate('settings/node'),
                                enabled: state.enabled,
                            },
                            {
                                label: language.currency,
                                click: () => navigate('settings/currency'),
                                enabled: state.enabled,
                            },
                            {
                                label: language.theme,
                                click: () => navigate('settings/theme'),
                                enabled: state.enabled,
                            },
                            {
                                type: 'separator',
                            },
                            {
                                label: language.twoFA,
                                enabled: state.authorised && state.enabled,
                                click: () => navigate('settings/twoFa'),
                            },
                            {
                                label: language.changePassword,
                                enabled: state.authorised && state.enabled,
                                click: () => navigate('settings/password'),
                            },
                            {
                                label: language.advanced,
                                enabled: state.authorised && state.enabled,
                                click: () => navigate('settings/advanced'),
                            },
                        ],
                    },
                    {
                        type: 'separator',
                    },
                ],
            },
        ];

        if (process.platform === 'darwin') {
            template[0].submenu = template[0].submenu.concat([
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
            ]);
        }

        template[0].submenu = template[0].submenu.concat([
            {
                label: language.quit,
                accelerator: 'Command+Q',
                enabled: state.enabled,
                click: function() {
                    app.quit();
                },
            },
        ]);

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
                label: language.account,
                submenu: [
                    {
                        label: language.send,
                        click: () => navigate('wallet/send'),
                        enabled: state.enabled,
                    },
                    {
                        label: language.receive,
                        click: () => navigate('wallet/receive'),
                        enabled: state.enabled,
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: language.accountSettings,
                        click: () => navigate('account/name'),
                        enabled: state.enabled,
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: language.newAccount,
                        click: () => navigate('addAccount'),
                        enabled: state.enabled,
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: language.logout,
                        enabled: state.enabled,
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
                                        if (index === 0) {
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

        return applicationMenu;
    };

    app.once('ready', () => {
        ipcMain.on('menu.update', (e, settings) => {
            state[settings.attribute] = settings.value;
            mainMenu = createMenu();
        });

        ipcMain.on('menu.enabled', (e, enabled) => {
            state.enabled = enabled;
            createMenu();
        });

        ipcMain.on('menu.language', (e, data) => {
            language = data;
            mainMenu = createMenu();
        });

        ipcMain.on('menu.popup', () => {
            const mainWindow = getWindow('main');
            mainMenu.popup(mainWindow);
        });

        mainMenu = createMenu();
    });
};

module.exports = initMenu;
