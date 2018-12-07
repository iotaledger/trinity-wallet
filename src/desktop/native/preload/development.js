import { ipcRenderer as ipc } from 'electron';
import Electron from './Electron';

// Define environment mode as Development
Electron.mode = 'dev';

// Inject screenshot proxy call
Electron.screenshot = (filename) => {
    ipc.send('screenshot', `shots/${filename}.png`);
};

// Disable default drag&drop
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

global.Electron = Electron;
