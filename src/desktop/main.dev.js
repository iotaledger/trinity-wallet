const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const ipcMain = electron.ipcMain;
// const shell = electron.shell;

ipcMain.on('print-to-pdf', event => {
    // const pdfPath = path.join(os.tmpdir(), 'print.pdf');
    const win = BrowserWindow.fromWebContents(event.sender);
    win.webContents.printToPDF({}, (error, data) => {
        console.log(error, data);
        // if (error) {throw error;}
        // fs.writeFile(pdfPath, data, error => {
        //     if (error) {
        //         throw error;
        //     }
        //     shell.openExternal('file://' + pdfPath);
        //     event.sender.send('wrote-pdf', pdfPath);
        // });
    });
});

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
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
};

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
