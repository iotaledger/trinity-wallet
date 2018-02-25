const electron = require('electron');
const initMenu = require('./lib/Menu.js');
const path = require('path');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const devMode = process.env.NODE_ENV === 'development';

const windows = {
    main: null,
};

function createWindow() {
    windows.main = new BrowserWindow({
        width: 1024,
        height: 768,
        titleBarStyle: 'hidden',
        backgroundColor: '#18373D',
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
