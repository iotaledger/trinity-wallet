const electron = require('electron');
const initMenu = require('./lib/Menu.js');
const path = require('path');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const url = require('url');
const devMode = process.env.NODE_ENV === 'development';

let deeplinkingUrl;
const windows = {
    main: null,
};

const shouldQuit = app.makeSingleInstance((argv, workingDirectory) => {
    if (process.platform == 'win32') {
        deeplinkingUrl = argv.slice(1);
    }
    logEverywhere('app.makeSingleInstance# ' + deeplinkingUrl);
});

if (shouldQuit) {
    app.quit();
    return;
}

function createWindow() {
    windows.main = new BrowserWindow({
        width: 1024,
        height: 768,
        minWidth: 920,
        minHeight: 680,
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, 'lib/window.js'),
        },
    });

    const url = devMode ? 'http://localhost:1074/' : 'file://' + __dirname + '/dist/index.html';

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

app.setAsDefaultProtocolClient('iota');
app.on('open-url', function(event, url) {
        event.preventDefault();
        let deeplinkingUrl = url;
        console.log('test main' + url);
        windows.main.webContents.send('url-params', url);
        logEverywhere('open-url# ' + deeplinkingUrl);
});

function logEverywhere(s) {
    console.log(s);
    if (windows.main && windows.main.webContents) {
        windows.main.webContents.executeJavaScript(`console.log("${s}")`);
    }
}
