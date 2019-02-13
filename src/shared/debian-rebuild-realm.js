const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rebuildRealm = () => {
    fs.access(path.resolve('/etc/debian_version'), fs.constants.F_OK, (error) => {
        if (error) {
            console.log('Debian env not detected'); // eslint-disable-line no-console
            process.exit(0);
        } else {
            spawn('npm', ['rebuild', 'realm', '--build-from-source'], { stdio: 'inherit' });
        }
    });
};

rebuildRealm();
