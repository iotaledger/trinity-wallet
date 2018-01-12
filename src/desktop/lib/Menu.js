const { Menu, ipcMain, dialog } = require('electron');

const state = {
    authorised: false,
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
                        label: 'About ' + app.getName(),
                        role: 'about',
                    },
                    {
                        label: 'Preferences',
                        submenu: [
                            {
                                label: 'Language',
                                click: () => navigate('settings/language'),
                            },
                            {
                                label: 'Currency',
                                click: () => navigate('settings/currency'),
                            },
                            {
                                label: 'Theme',
                                click: () => navigate('settings/theme'),
                            },
                            {
                                type: 'separator',
                            },
                            {
                                label: 'Two-factor authentication',
                                enabled: state.authorised,
                                click: () => navigate('settings/twoFA'),
                            },
                            {
                                label: 'Change password',
                                enabled: state.authorised,
                                click: () => navigate('settings/changePassword'),
                            },
                            {
                                label: 'Advanced settings',
                                enabled: state.authorised,
                                click: () => navigate('settings/advanced'),
                            },
                        ],
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: 'Hide ' + app.getName(),
                        role: 'hide',
                    },
                    {
                        label: 'Hide Others',
                        role: 'hideothers',
                    },
                    {
                        label: 'Show All',
                        role: 'unhide',
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: 'Quit',
                        accelerator: 'Command+Q',
                        click: function() {
                            app.quit();
                        },
                    },
                ],
            },
        ];

        template.push({
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
                { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
                { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
            ],
        });

        if (state.authorised) {
            template.push({
                label: 'Account',
                submenu: [
                    {
                        label: 'View Balance',
                        click: navigate('balance'),
                    },
                    {
                        label: 'Send transactions',
                        click: navigate('send'),
                    },
                    {
                        label: 'Receive iota',
                        click: navigate('receive'),
                    },
                    {
                        label: 'View History',
                        click: navigate('history'),
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: 'Logout',
                        click: function() {
                            const mainWindow = getWindow('main');
                            if (mainWindow) {
                                dialog.showMessageBox(
                                    mainWindow,
                                    {
                                        type: 'question',
                                        buttons: ['Yes', 'No'],
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

        const applicationMenu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(applicationMenu);
    };

    app.once('ready', () => {
        ipcMain.on('menu.update', (e, settings) => {
            state[settings.attribute] = settings.value;
            createMenu();
        });

        createMenu();
    });
};

module.exports = initMenu;
