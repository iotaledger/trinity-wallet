/* eslint-disable no-console */
/**
 * Launch wallet in headless chrome and trigger screenshot generation
 */
const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');
const fs = require('fs');

const PORT = process.env.PORT || 1074;
const appPath = path.join(__dirname, '../');
const settings = require('../package.json');

if (!fs.existsSync(`${appPath}/shots/`)) {
    fs.mkdirSync(`${appPath}/shots/`);
}

const app = express();

app.use(express.static(`${appPath}/dist`));

app.get('*', (request, response) => {
    response.sendFile(`${appPath}/dist/index.html`);
});

const server = http.createServer(app);

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log('Server already running, starting screenshots');
        takeShots();
    }
});

server.listen(PORT, () => {
    console.info('=> 🌎 http://localhost:%s/', PORT);
    takeShots();
});

let page = null;
let browser = null;

const screenshot = (screenName) => {
    const path = screenName.split('_');

    const dir = `${appPath}/shots/${path[0]}/`;

    console.log(`📸 ${screenName}`);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    page.screenshot({ path: `${dir}/${path[1]}.png`, type: 'png' });
};

const screenshotsDone = () => {
    console.log(`✅ Screenshots located at ${appPath}/shots/`);
    browser.close();
    server.close();
};

const inject = ({ version }) => {
    window.Electron = {
        mode: 'puppeteer',
        getOS: () => {
            return 'darwin';
        },
        getOnboardingSeed: () => {
            return new Array(81).fill(0);
        },
        getChecksum: () => {
            return 'ABC';
        },
        getVersion: () => {
            return version;
        },
        garbageCollect: () => {},
        setOnboardingSeed: () => {},
        readKeychain: async () => {},
        getUuid: async () => '',
        changeLanguage: () => {},
        onEvent: () => {},
        removeEvent: () => {},
        showMenu: () => {},
        updateMenu: () => {},
        requestDeepLink: () => {},
        setStorage: async () => {},
        screenshot,
        screenshotsDone,
        ledger: {
            addListener: () => {},
            removeListener: () => {},
        },
    };
};

const takeShots = async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();

    page.setViewport({
        width: 1280,
        height: 800,
        deviceScaleFactor: 2,
    });

    page.on('console', async (message) => {
        const type = message.type();
        const args = await Promise.all(message.args().map(stringifyJSHandle));
        const text = args.join(' ');
        console.log(`${type}: ${text}`);
    });

    async function stringifyJSHandle(handle) {
        return await handle.executionContext().evaluate((o) => String(o), handle);
    }

    page.on('pageerror', (err) => {
        console.error('Page error: ' + err.toString());
    });

    await page.exposeFunction('screenshot', screenshot);
    await page.exposeFunction('screenshotsDone', screenshotsDone);
    await page.evaluateOnNewDocument(inject, settings);

    await page.goto(`http://localhost:${PORT}/index.html`);
};
