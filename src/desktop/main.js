const { ipcMain: ipc, app, protocol } = require('electron');
const electron = require('electron');
const initMenu = require('./lib/Menu.js');
const path = require('path');
const settings = require('electron-settings');

const BrowserWindow = electron.BrowserWindow;
const devMode = process.env.NODE_ENV === 'development';

let deeplinkingUrl = null;

const windows = {
    main: null,
};

if (!devMode) {
    protocol.registerStandardSchemes(['iota'], { secure: true });
}

const shouldQuit = app.makeSingleInstance((argv) => {
    if (process.platform === 'win32') {
        deeplinkingUrl = argv.slice(1);
    }
});

if (shouldQuit) {
    app.quit();
    return;
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
        maxHeight: 860,
        minWidth: 500,
        minHeight: 720,
        titleBarStyle: 'hidden',
        backgroundColor: settings.get('backgroundColor') ? settings.get('backgroundColor') : '#E8EBF1',
        webPreferences: {
            nodeIntegration: false,
            preload: path.resolve(__dirname, 'lib/Window.js'),
        },
    });

    const url = devMode ? 'http://localhost:1074/' : 'iota://dist/index.html';

    windows.main.loadURL(url);

    windows.main.on('close', hideOnClose);

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
}

const hideOnClose = function(e) {
    if (process.platform === 'darwin') {
        e.preventDefault();
        windows.main.hide();
        windows.main.webContents.send('lockScreen');
    } else {
        windows.main = null;
    }
};

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

app.on('before-quit', () => {
    if (windows.main && !windows.main.isDestroyed()) {
        windows.main.removeListener('close', hideOnClose);
    }
});

app.on('activate', () => {
    if (windows.main === null) {
        createWindow();
    } else if (!windows.main.isVisible()) {
        windows.main.show();
    }
});

app.setAsDefaultProtocolClient('iota');
app.on('open-url', (event, url) => {
    event.preventDefault();
    deeplinkingUrl = url;
    if (windows.main) {
        windows.main.webContents.send('url-params', url);
    }
});

ipc.on('request.deepLink', () => {
    if (deeplinkingUrl) {
        windows.main.webContents.send('url-params', deeplinkingUrl);
        deeplinkingUrl = null;
    }
});

ipc.on('settings.update', (e, data) => {
    settings.set(data.attribute, data.value);
});
