import Electron from './Electron';

// Define environment mode as Production
Electron.mode = 'prod';

// Disable default drag&drop
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

// Disable eval
// eslint-disable-next-line
window.eval = global.eval = function() {};

global.Electron = Electron;
