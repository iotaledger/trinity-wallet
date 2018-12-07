import Electron from './Electron';

// Define environment mode as Tray
Electron.mode = 'tray';

// Disable default drag&drop
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

global.Electron = Electron;
