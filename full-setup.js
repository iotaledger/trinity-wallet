var cmd = require('node-cmd');
var os = require('os');

if (os.type() === 'Linux') {
    cmd.get('cd src/desktop && yarn && cd ../shared && yarn && cd ../mobile && yarn', function(err, data, stderr) {
        console.log(data);
    });
} else if (os.type() === 'Darwin') {
    cmd.get('cd src/desktop && yarn && cd ../shared && yarn && cd ../mobile && yarn && cd ios && pod install', function(
        err,
        data,
        stderr,
    ) {
        console.log(data);
    });
} else if (os.type() === 'Windows' || os.type() === 'Windows_NT') {
    cmd.get('cd src/desktop && yarn && cd ../shared && yarn && cd ../mobile && yarn', function(err, data, stderr) {
        console.log(data);
    });
} else {
    throw new Error('Unsupported OS found: ' + os.type());
}
