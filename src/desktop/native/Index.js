import electron, { ipcMain as ipc, app, protocol, shell, Tray } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import electronSettings from 'electron-settings';
import path from 'path';
import URL from 'url';
import fs from 'fs';

import { initMenu, contextMenu } from './libs/Menu.js';

/**
 * Expose Garbage Collector flag for manual trigger after seed usage
 */
app.commandLine.appendSwitch('js-flags', '--expose-gc');

/**
 * Terminate application if Node remote debugging detected
 */
const argv = process.argv.join();
if (argv.includes('inspect') || argv.includes('remote') || typeof v8debug !== 'undefined') {
    app.quit();
}

/**
 * Define wallet windows
 */
const windows = {
    main: null,
    tray: null,
};

/**
 * Create a single instance only
 */
const isFirstInstance = app.requestSingleInstanceLock();

if (!isFirstInstance) {
    app.quit();
}

app.on('second-instance', (_e, args) => {
    if (windows.main) {
        if (args.length > 1 && args[1].indexOf('iota://') === 0) {
            windows.main.webContents.send('url-params', args[1]);
        }
        if (windows.main.isMinimized()) {
            windows.main.restore();
        }
        windows.main.focus();
    }
});

/**
 * Set AppUserModelID for Windows notifications functionallity
 */
app.setAppUserModelId('org.iota.trinity');

/**
 * Set environment mode
 */
const devMode = process.env.NODE_ENV === 'development';

const paths = {
    assets: path.resolve(devMode ? __dirname : app.getAppPath(), devMode ? '../' : './', 'assets'),
    preload: path.resolve(devMode ? __dirname : app.getAppPath(), devMode ? '../' : './', 'dist'),
};

/**
 * Define deep link state
 */
let deeplinkingUrl = null;

let tray = null;

let windowSizeTimer = null;

let globalErrorFlag = false;

/**
 * Register iota:// protocol for deep links
 * Set Trinity as the default handler for iota:// protocol
 */
if (!devMode) {
    protocol.registerStandardSchemes(['iota'], { secure: true });
    if (process.defaultApp) {
        if (process.argv.length >= 2) {
            app.setAsDefaultProtocolClient('iota', process.execPath, [path.resolve(process.argv[1])]);
        }
    } else {
        app.setAsDefaultProtocolClient('iota');
    }
}

let windowState = {
    width: 1280,
    height: 720,
    x: null,
    y: null,
    maximized: false,
};

try {
    const windowStateData = electronSettings.get('window-state');
    if (windowStateData) {
        windowState = windowStateData;
    }
} catch (error) {}

/**
 * Temporarily disable proxy if not overridden by settings
 */
try {
    const ignoreProxy = electronSettings.get('ignore-proxy');
    if (ignoreProxy) {
        app.commandLine.appendSwitch('auto-detect', 'false');
        app.commandLine.appendSwitch('no-proxy-server');
    }
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
        show: false,
        frame: process.platform === 'linux',
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: false,
            preload: path.resolve(paths.preload, devMode ? 'preloadDev.js' : 'preloadProd.js'),
            disableBlinkFeatures: 'Auxclick',
            webviewTag: false,
        },
    });

    windows.main.webContents.on('console-message', (_e, level, message) => {
        if (message.indexOf('Unable to load preload script') > -1) {
            globalErrorFlag = true;
        }
        if (globalErrorFlag && level === 2) {
            const msg = JSON.stringify({ error: message.replace(/['"]+/g, '') });
            windows.main.webContents.executeJavaScript(
                `if(typeof window.fatalErrors === "function") { window.fatalErrors('${msg}'); } else { window.fatalErrors = typeof window.fatalErrors === "object" ? window.fatalErrors.concat('${msg}') : ['${msg}'];};`,
            );
        }
    });

    if (process.platform === 'darwin') {
        windows.tray = new electron.BrowserWindow({
            width: 300,
            height: 450,
            frame: false,
            fullscreenable: false,
            resizable: false,
            transparent: true,
            show: false,
            webPreferences: {
                nodeIntegration: false,
                preload: path.resolve(paths.preload, 'preloadTray.js'),
                disableBlinkFeatures: 'Auxclick',
                webviewTag: false,
            },
        });
    }

    /**
     * Reinitate window maximize
     */
    if (windowState.maximized) {
        windows.main.maximize();
    }

    /**
     * Load wallet url depending on build environment
     */
    const url = devMode ? 'http://localhost:1074/index.html' : 'iota://dist/index.html';
    windows.main.loadURL(url);

    /**
     * Attach window close event
     */
    windows.main.on('close', hideOnClose);

    /**
     * Attach window resize event
     */

    windows.main.on('resize', () => {
        clearTimeout(windowSizeTimer);
        windowSizeTimer = setTimeout(updateWindowSize, 1000);
    });

    /**
     * Load tray window url and attach blur event
     */
    if (process.platform === 'darwin') {
        windows.tray.loadURL(url);

        windows.tray.on('blur', () => {
            windows.tray.hide();
        });
    }

    /**
     * Enable React and Redux devtools in development mode
     */

    if (devMode) {
        windows.main.webContents.once('dom-ready', () => {
            windows.main.webContents.openDevTools({ mode: 'detach' });
            /* Uncomment to enable Tray app DevTools on macOS
            if (process.platform === 'darwin') {
                windows.tray.webContents.openDevTools({ mode: 'detach' });
            }
            */
            installExtension(REACT_DEVELOPER_TOOLS);
            installExtension(REDUX_DEVTOOLS);
        });
    }

    /**
     * Add right click context menu for input elements
     */
    windows.main.webContents.on('context-menu', (_e, props) => {
        const { isEditable } = props;
        if (isEditable) {
            const InputMenu = contextMenu();
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

            const termsAndConditionsLinks = ['iota.org', 'trinity.iota.org', 'contact@iota.org'];
            const privacyPolicyLinks = [
                'corp.sogou.com',
                'cryptocompare.com',
                'docs.bugsnag.com',
                'help.github.com',
                'policies.google.com',
                'protect-eu.mimecast.com',
                'privacy@iota.org',
            ];
            const ledgerOnboarding = ['support.ledger.com'];

            const miscLinks = ['github.com'];

            const externalWhitelist = [
                ...privacyPolicyLinks,
                ...termsAndConditionsLinks,
                ...ledgerOnboarding,
                ...miscLinks,
            ];

            try {
                if (
                    externalWhitelist.indexOf(
                        URL.parse(targetURL)
                            .host.replace('www.', '')
                            .replace('mailto:', ''),
                    ) > -1
                ) {
                    shell.openExternal(targetURL);
                }
            } catch (error) {}
        }
    });
}

/**
 * Setup Tray icon
 * @param {boolean} enabled - determine if tray is enabled
 */
ipc.on('tray.enable', (e, enabled) => {
    if (process.platform !== 'darwin') {
        return;
    }

    if (enabled === false) {
        if (tray && !tray.isDestroyed()) {
            tray.destroy();
        }
        return;
    }

    if (enabled && tray && !tray.isDestroyed()) {
        return;
    }

    tray = new Tray(path.resolve(paths.assets, 'trayTemplate@2x.png'));

    tray.on('click', () => {
        toggleTray();
    });
});

const toggleTray = () => {
    if (windows.tray.isVisible()) {
        windows.tray.hide();
        return;
    }

    const windowBounds = windows.tray.getBounds();
    const trayBounds = tray.getBounds();

    const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
    const y = Math.round(trayBounds.y + trayBounds.height + 4);

    windows.tray.setPosition(x, y, false);
    windows.tray.show();
    windows.tray.focus();
};

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
const updateWindowSize = () => {
    if (windows.main && !windows.main.isDestroyed()) {
        const bounds = windows.main.getBounds();

        electronSettings.set('window-state', {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            maximized: windows.main.isMaximized(),
        });
    }
};

/**
 * Remove close event on application quit
 */
app.on('before-quit', () => {
    windows.main.removeListener('close', hideOnClose);
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
 * Proxy store update event to tray window
 */

ipc.on('store.update', (_e, payload) => {
    if (process.platform === 'darwin' && windows.tray && !windows.tray.isDestroyed()) {
        windows.tray.webContents.send('store.update', payload);
    }
});

/**
 * Proxy menu update event to tray window
 */
ipc.on('menu.update', (e, payload) => {
    if (windows.tray) {
        windows.tray.webContents.send('menu.update', payload);
    }
});

/**
 * Proxy main window focus
 */
ipc.on('window.focus', (e, payload) => {
    if (windows.main) {
        windows.main.show();
        windows.main.focus();
        if (payload) {
            windows.main.webContents.send('menu', payload);
        }
    }
});

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
