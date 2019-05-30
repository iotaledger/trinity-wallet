const os = require('os');
const rimraf = require('rimraf');
const path = require('path');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');
module.exports = async function() {
    await global.__BROWSER__.close();
    await global.__SERVER__.close();

    rimraf.sync(DIR);
};
