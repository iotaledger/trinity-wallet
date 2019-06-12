const os = require('os');
const { execSync } = require('child_process');
const { resolve } = require('path');

const applyRealmPatch = () => {
    if (os.platform() === 'win32') {
        execSync('npx patch-package --patch-dir realm-patch', {
            cwd: resolve(__dirname, '..'),
            stdio: 'inherit',
        });
    } else {
        console.log('Windows env not detected'); // eslint-disable-line no-console
        process.exit(0);
    }
};

applyRealmPatch();
