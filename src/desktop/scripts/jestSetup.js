const puppeteer = require('puppeteer');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

module.exports = async function() {
    const browser = await puppeteer.launch({
      headless: true,
      devtools: false,
    });

    const app = express();

    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (_request, response) => {
        response.sendFile(path.join(__dirname, '../dist/index.html'));
    });

    const server = app.listen(1074);

    global.__BROWSER__ = browser;
    global.__SERVER__ = server;

    mkdirp.sync(DIR);
    fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
};
