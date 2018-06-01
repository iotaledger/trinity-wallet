const { ipcMain: ipc, app, protocol } = require('electron');
const electron = require('electron');
const initMenu = require('./lib/Menu.js');
const path = require('path');
const electronSettings = require('electron-settings');

app.commandLine.appendSwitch('js-flags', '--expose-gc');

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

let settings = null;

let windowState = {
    width: 1024,
    height: 768,
    x: null,
    y: null,
    maximized: false,
};

try {
    const data = electronSettings.get('reduxPersist:settings');
    const windowStateData = electronSettings.get('window-state');
    if (windowStateData) {
        windowState = windowStateData;
    }
    settings = JSON.parse(data);
} catch (error) {}

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
        width: windowState.width,
        height: windowState.height,
        x: windowState.x,
        y: windowState.y,
        minWidth: 500,
        minHeight: 720,
        frame: process.platform === 'linux',
        titleBarStyle: 'hidden',
        icon: `${__dirname}/dist/icon.png`,
        backgroundColor: settings ? settings.theme.body.bg : '#1a373e',
        webPreferences: {
            nodeIntegration: false,
            preload: path.resolve(__dirname, 'lib/Window.js'),
            disableBlinkFeatures: 'Auxclick',
            webviewTag: false,
        },
    });

    if (windowState.maximized) {
        windows.main.maximize();
    }

    const url = devMode ? 'http://localhost:1074/' : 'iota://dist/index.html';

    windows.main.loadURL(url);

    windows.main.on('close', hideOnClose);

    // if (devMode) {
    windows.main.webContents.openDevTools();
    const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer');

    installExtension(REACT_DEVELOPER_TOOLS);
    installExtension(REDUX_DEVTOOLS);
    // }

    windows.main.webContents.on('context-menu', (e, props) => {
        const InputMenu = electron.Menu.buildFromTemplate([
            {
                label: 'Undo',
                role: 'undo',
            },
            {
                label: 'Redo',
                role: 'redo',
            },
            {
                type: 'separator',
            },
            {
                label: 'Cut',
                role: 'cut',
            },
            {
                label: 'Copy',
                role: 'copy',
            },
            {
                label: 'Paste',
                role: 'paste',
            },
            {
                type: 'separator',
            },
            {
                label: 'Select all',
                role: 'selectall',
            },
        ]);
        const { isEditable } = props;
        if (isEditable) {
            InputMenu.popup(windows.main);
        }
    });
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
        const bounds = windows.main.getBounds();

        electronSettings.set('window-state', {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            maximized: windows.main.isMaximized(),
        });

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
