import { app, Menu, ipcMain, dialog, shell } from 'electron';
import { autoUpdater } from 'electron-updater';

const state = {
    authorised: false,
    enabled: true,
};

let language = {
    about: 'About Trinity',
    errorLog: 'Error log',
    checkUpdate: 'Check for Updates',
    settings: 'Settings',
    accountSettings: 'Account management',
    accountName: 'Account name',
    viewSeed: 'View seed',
    viewAddresses: 'View addresses',
    tools: 'Tools',
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
    help: 'Help',
    logoutConfirm: 'Are you sure you want to log out?',
    yes: 'Yes',
    no: 'No',
    updates: {
        errorRetrievingUpdateData: 'Error retrieving update data',
        noUpdatesAvailable: 'No updates available',
        noUpdatesAvailableExplanation: 'You have the latest version of Trinity!',
        newVersionAvailable: 'New version available',
        newVersionAvailableExplanation: 'A new Trinity version is available. Do you want to update now?',
        installUpdate: 'Install update and restart',
        installUpdateExplanation: 'Download complete, Trinity will now restart to install the update',
    },
};

let getWindow = null;

// Disable automatic update downloads
autoUpdater.autoDownload = false;

/**
 * On update error event callback
 */
autoUpdater.on('error', (error) => {
    const mainWindow = getWindow('main');
    if (mainWindow) {
        mainWindow.webContents.send('update.progress', false);
    }
    dialog.showErrorBox(
        language.updates.errorRetrievingUpdateData,
        error === null ? 'unknown' : (error.stack || error).toString(),
    );
});

/**
 * On update available event callback
 */
autoUpdater.on('update-available', () => {
    dialog.showMessageBox(
        {
            type: 'info',
            title: language.updates.newVersionAvailable,
            message: language.updates.newVersionAvailableExplanation,
            buttons: [language.yes, language.no],
        },
        (buttonIndex) => {
            if (buttonIndex === 0) {
                autoUpdater.downloadUpdate();
            }
        },
    );
});

/**
 * On update not available event callback
 */
autoUpdater.on('update-not-available', () => {
    dialog.showMessageBox({
        title: language.updates.noUpdatesAvailable,
        message: language.updates.noUpdatesAvailableExplanation,
        buttons: ['OK'],
    });
});

/**
 * On update ready to install event callback
 */
autoUpdater.on('update-downloaded', () => {
    const mainWindow = getWindow('main');
    if (mainWindow) {
        mainWindow.webContents.send('update.progress', false);
    }
    dialog.showMessageBox(
        {
            title: language.updates.installUpdate,
            message: language.updates.installUpdateExplanation,
        },
        () => {
            setImmediate(() => {
                const mainWindow = getWindow('main');
                mainWindow.removeAllListeners('close');
                app.removeAllListeners('window-all-closed');
                autoUpdater.quitAndInstall();
            });
        },
    );
});

autoUpdater.on('download-progress', (progressObj) => {
    const mainWindow = getWindow('main');
    if (mainWindow) {
        mainWindow.webContents.send('update.progress', progressObj);
    }
});

/**
 * Create native menu tree and apply to the application window
 * @param {object} App - Application object
 * @param {function} getWindow - Get Window instance helper
 * @returns {undefined}
 */
export const initMenu = (app, getWindowFunc) => {
    let mainMenu = null;
    getWindow = getWindowFunc;

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
                        click: () => {
                            autoUpdater.checkForUpdates();
                        },
                        enabled: state.enabled,
                    },
                    {
                        label: language.errorLog,
                        click: () => navigate('errorlog'),
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
                        enabled: state.enabled,
                        submenu: [
                            {
                                label: language.accountName,
                                click: () => navigate('settings/account/name'),
                                enabled: state.enabled,
                            },
                            {
                                label: language.viewSeed,
                                click: () => navigate('settings/account/seed'),
                                enabled: state.enabled,
                            },
                            {
                                label: language.viewAddresses,
                                click: () => navigate('settings/account/addresses'),
                                enabled: state.enabled,
                            },
                            {
                                type: 'separator',
                            },
                            {
                                label: language.tools,
                                click: () => navigate('settings/account/tools'),
                                enabled: state.enabled,
                            },
                        ],
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
            label: language.help,
            submenu: [
                {
                    label: `${app.getName()} ${language.help}`,
                    click: function() {
                        shell.openExternal('https://docs.iota.works/trinity/faqs');
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

        ipcMain.on('updates.check', () => {
            autoUpdater.checkForUpdates();
        });

        mainMenu = createMenu();
    });
};

/**
 * Creates context menu
 * @returns {Menu} Context menu
 */
export const contextMenu = () => {
    return Menu.buildFromTemplate([
        {
            label: language.undo,
            role: 'undo',
        },
        {
            label: language.redo,
            role: 'redo',
        },
        {
            type: 'separator',
        },
        {
            label: language.cut,
            role: 'cut',
        },
        {
            label: language.copy,
            role: 'copy',
        },
        {
            label: language.paste,
            role: 'paste',
        },
        {
            type: 'separator',
        },
        {
            label: language.selectAll,
            role: 'selectall',
        },
    ]);
};
