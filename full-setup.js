const cmd = require('node-cmd');
const os = require('os');

if (os.type() === 'Linux') {
    cmd.get('cd src/desktop && yarn && cd ../shared && yarn && cd ../mobile && yarn', (err, data) => {
        console.log(data);
    });
} else if (os.type() === 'Darwin') {
    cmd.get(
        'cd src/desktop && yarn && cd ../shared && yarn && cd ../mobile && yarn && cd ios && pod install',
        (err, data) => {
            console.log(data);
        },
    );
} else if (os.type() === 'Windows' || os.type() === 'Windows_NT') {
    cmd.get('cd src/desktop && yarn && cd ../shared && yarn && cd ../mobile && yarn', (err, data) => {
        console.log(data);
    });
} else {
    throw new Error('Unsupported OS found: ' + os.type());
}
