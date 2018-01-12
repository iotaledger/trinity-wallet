const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const url = require('url');

let mainWindow;
let deeplinkingUrl;

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
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
    });

    //mainWindow.loadURL('http://localhost:8080/index.html');
    mainWindow.loadURL('file://' + __dirname + '/dist/index.html');
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.setAsDefaultProtocolClient('iota');
app.on('open-url', function(event, url) {
    event.preventDefault();
    let deeplinkingUrl = url;
    console.log('test main' + url);
    mainWindow.webContents.send('url-params', url);
    logEverywhere('open-url# ' + deeplinkingUrl);
});

function logEverywhere(s) {
    console.log(s);
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript(`console.log("${s}")`);
    }
}
