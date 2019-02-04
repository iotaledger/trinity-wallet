/* eslint-disable no-console */
const server = require('./devServer.js');
const puppeteer = require('puppeteer');
const settings = require('../package.json');
const path = require('path');
const stateMock = require('../__mocks__/stateMock.json');
const electronMock = require('../__mocks__/electronMock.js');

const routes = [
    'onboarding',
    'onboarding/seed-intro',
    'onboarding/seed-generate',
    'onboarding/account-password',
    'onboarding/seed-save',
    'onboarding/done',
    'onboarding/login',
    'wallet/dashboard',
    'settings/language',
    'settings/node',
    'settings/theme',
    'settings/currency',
    'settings/password',
    'settings/twoFa',
    'settings/mode',
    'settings/advanced',
];

const takeScreenshots = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const shotPath = path.join(__dirname, '../__mocks__/shots');

    page.setViewport({
        width: 1280,
        height: 800,
        deviceScaleFactor: 2,
    });

    page.on('console', async (message) => {
        const type = message.type();
        const args = await Promise.all(message.args().map(stringifyJSHandle));
        const text = args.join(' ');
        console.log(type === 'error' ? '\x1b[35m%s\x1b[0m' : '\x1b[33m%s\x1b[0m', text);
    });

    async function stringifyJSHandle(handle) {
        return await handle.executionContext().evaluate((o) => String(o), handle);
    }

    page.on('pageerror', (err) => {
        console.error('Page error: ' + err.toString());
    });

    page.evaluateOnNewDocument(electronMock, settings, stateMock);

    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];

        await page.goto(`http://localhost:${server.PORT}/${route}`);

        await page.screenshot({ path: `${shotPath}/${route.replace(/\//g, '-')}.png`, type: 'png' });

        console.log(`📸 /${route}`);
    }

    browser.close();
    server.close();
};

server.webpackDev.waitUntilValid(() => {
    takeScreenshots();
});
