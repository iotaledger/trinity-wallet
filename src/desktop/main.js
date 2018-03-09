const { ipcMain: ipc, app, protocol } = require('electron');
const electron = require('electron');
const initMenu = require('./lib/Menu.js');
const path = require('path');
const settings = require('electron-settings');

const BrowserWindow = electron.BrowserWindow;
const devMode = process.env.NODE_ENV === 'development';

const windows = {
    main: null,
};

if (!devMode) {
    protocol.registerStandardSchemes(['iota']);
}

function createWindow() {
    protocol.registerFileProtocol('iota', (request, callback) => {
        callback(
            request.url
                .replace('iota:/', app.getAppPath())
                .split('?')[0]
                .split('#')[0],
        );
    });

    windows.main = new BrowserWindow({
        width: 1024,
        height: 768,
        maxWidth: 1280,
        maxHeight: 820,
        minWidth: 440,
        minHeight: 720,
        titleBarStyle: 'hidden',
        backgroundColor: settings.get('backgroundColor') ? settings.get('backgroundColor') : '#1a373e',
        webPreferences: {
            nodeIntegration: false,
            preload: path.resolve(__dirname, 'lib/Window.js'),
        },
    });

    const url = devMode ? 'http://localhost:1074/' : 'iota://dist/index.html';

    windows.main.loadURL(url);

    if (devMode) {
        windows.main.webContents.openDevTools();

        const {
            default: installExtension,
            REACT_DEVELOPER_TOOLS,
            REDUX_DEVTOOLS,
        } = require('electron-devtools-installer');

        installExtension(REACT_DEVELOPER_TOOLS);
        installExtension(REDUX_DEVTOOLS);
    }

    windows.main.on('closed', () => {
        windows.main = null;
    });
}

const getWindow = function(windowName) {
    return windows[windowName];
};

initMenu(app, getWindow);

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (windows.main === null) {
        createWindow();
    }
});

ipc.on('settings.update', (e, data) => {
    settings.set(data.attribute, data.value);
});
