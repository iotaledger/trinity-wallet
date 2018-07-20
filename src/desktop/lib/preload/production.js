const Electron = require('./Electron');

Electron.mode = 'prod';

// Disable default drag&drop
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

// Disable eval
// eslint-disable-next-line
window.eval = global.eval = function() {
    throw new Error('Eval support disabled');
};

global.Electron = Electron;
