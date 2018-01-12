const { Menu, ipcMain } = require('electron');

const state = {
    authorised: false,
};

const initMenu = (app, getWindow) => {
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
                label: 'Wallet',
                submenu: [
                    {
                        label: 'Balance',
                        click: function() {
                            const mainWindow = getWindow('main');
                            if (mainWindow) {
                                mainWindow.webContents.send('menu', 'balance');
                            }
                        },
                    },
                    {
                        label: 'Send',
                        click: function() {
                            const mainWindow = getWindow('main');
                            if (mainWindow) {
                                mainWindow.webContents.send('menu', 'send');
                            }
                        },
                    },
                    {
                        label: 'Receive',
                        click: function() {
                            const mainWindow = getWindow('main');
                            if (mainWindow) {
                                mainWindow.webContents.send('menu', 'receive');
                            }
                        },
                    },
                    {
                        label: 'History',
                        click: function() {
                            const mainWindow = getWindow('main');
                            if (mainWindow) {
                                mainWindow.webContents.send('menu', 'history');
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
