const { ipcMain: ipc, app, protocol, shell } = require('electron');
const electron = require('electron');
const initMenu = require('./lib/Menu.js');
const path = require('path');
const URL = require('url');
const fs = require('fs');
const electronSettings = require('electron-settings');

/**
 * Expose Garbage Collector flag for manual trigger after seed usage
 */
app.commandLine.appendSwitch('js-flags', '--expose-gc');

/**
 * Set environment mode
 */
const devMode = process.env.NODE_ENV === 'development';

/**
 * Define deep link state
 */
let deeplinkingUrl = null;

/**
 * Define wallet windows
 */
const windows = {
    main: null,
};

/**
 * Register iota:// protocol for deep links
 * Set Trinity as the default handler for iota:// protocol
 * TODO: Should be made as a user setting
 */
if (!devMode) {
    protocol.registerStandardSchemes(['iota'], { secure: true });
    app.setAsDefaultProtocolClient('iota');
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
    /**
     * Register iota file protocol
     */
    try {
        protocol.registerFileProtocol('iota', (request, callback) => {
            callback(
                request.url
                    .replace('iota:/', app.getAppPath())
                    .split('?')[0]
                    .split('#')[0],
            );
        });
    } catch (error) {}

    let bgColor = (settings && settings.theme.body.bg) || '#1a373e';

    if (bgColor.indexOf('rgb') === 0) {
        bgColor = bgColor.match(/[0-9]+/g).reduce((a, b) => a + (b | 256).toString(16).slice(1), '#');
    }

    /**
     * Initialize the main wallet window
     */
    windows.main = new electron.BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        x: windowState.x,
        y: windowState.y,
        minWidth: 500,
        minHeight: 720,
        frame: process.platform === 'linux',
        titleBarStyle: 'hidden',
        icon: `${__dirname}/dist/icon.png`,
        backgroundColor: bgColor,
        webPreferences: {
            nodeIntegration: false,
            preload: path.resolve(__dirname, `lib/preload/${devMode ? 'development' : 'production'}.js`),
            disableBlinkFeatures: 'Auxclick',
            webviewTag: false,
        },
    });

    /**
     * Reinitate window maximize
     */
    if (windowState.maximized) {
        windows.main.maximize();
    }

    /**
     * Load wallet url depending on build environment
     */
    const url = devMode ? 'http://localhost:1074/' : 'iota://dist/index.html';
    windows.main.loadURL(url);

    /**
     * Attach window close event
     */
    windows.main.on('close', hideOnClose);

    /**
     * Enable React and Redux devtools in development mode
     */
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

    /**
     * Add right click context menu for input elements
     */
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

    /**
     * Disallow external link navigation in wallet window
     * Open only whitelisted domain urls externally
     */
    windows.main.webContents.on('will-navigate', (e, targetURL) => {
        if (url.indexOf(targetURL) !== 0) {
            e.preventDefault();

            const externalWhitelist = ['iota.org', 'docs.iota.works', 'trinity.iota.org', 'docs.bugsnag.com'];

            try {
                if (externalWhitelist.indexOf(URL.parse(targetURL).host.replace('www.', '')) > -1) {
                    shell.openExternal(targetURL);
                }
            } catch (error) {}
        }
    });
}

/**
 * Lock and hide the window on macOS, close it on other platforms
 * @param {Event} Event - Window close event
 * @returns {undefined}
 */
const hideOnClose = function(event) {
    if (process.platform === 'darwin') {
        event.preventDefault();
        windows.main.hide();
        windows.main.webContents.send('lockScreen');
    } else {
        windows.main = null;
    }
};

/**
 * Get Window instance helper
 * @param {string} windowName -  Target window name
 */
const getWindow = function(windowName) {
    return windows[windowName];
};

initMenu(app, getWindow);

/**
 * On application ready event, initiate the Main window
 */
app.on('ready', createWindow);

/**
 * Close the app if all Wallet windows are closed on all platforms except macOS
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/**
 * Save window location/size state before closing the wallet
 */
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

/**
 * Show the main window on activate event, on macOS platform
 */
app.on('activate', () => {
    if (windows.main === null) {
        createWindow();
    } else if (!windows.main.isVisible()) {
        windows.main.show();
    }
});

/**
 * Proxy deep link event to the wallet application
 */
app.on('open-url', (event, url) => {
    event.preventDefault();
    deeplinkingUrl = url;
    if (windows.main) {
        windows.main.webContents.send('url-params', url);
    }
});

/**
 * Proxy deep link event to the wallet application
 */
ipc.on('request.deepLink', () => {
    if (deeplinkingUrl) {
        windows.main.webContents.send('url-params', deeplinkingUrl);
        deeplinkingUrl = null;
    }
});

/**
 * Create a single instance on win32 platforms
 * Set deep link if defined as argument
 */
const shouldQuit = app.makeSingleInstance((argv) => {
    if (process.platform === 'win32') {
        deeplinkingUrl = argv.slice(1);
    }
});

if (shouldQuit) {
    app.quit();
    return;
}

/**
 * On screenshot event, create a screenshot of the wallet
 * Enabled only in development mode
 */
ipc.on('screenshot', (e, fileName) => {
    if (devMode && windows.main) {
        windows.main.capturePage((image) => {
            fs.writeFile(fileName, image.toPNG(), (err) => {
                if (err) {
                    throw err;
                }
            });
        });
    }
});
