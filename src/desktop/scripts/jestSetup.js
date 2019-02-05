const puppeteer = require('puppeteer');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const os = require('os');
const server = require('./webpackServer.js');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

module.exports = async function() {
    const browser = await puppeteer.launch();

    await new Promise((resolve) => server.webpackDev.waitUntilValid(resolve));

    global.__BROWSER__ = browser;
    global.__SERVER__ = server;

    mkdirp.sync(DIR);
    fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
};
