const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 768
    });

    mainWindow.loadURL('http://localhost:1074/');

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer');

    Promise.all([installExtension(REACT_DEVELOPER_TOOLS), installExtension(REDUX_DEVTOOLS)])
        .then(exts => {
            exts.forEach(name => console.log(`Added Extension: ${name}`));
        })
        .catch(err => {
            console.log('An error occurred: ', err);
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
