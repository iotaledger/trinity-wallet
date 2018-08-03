/* eslint-disable no-console */
/**
 * Launch wallet in headless chrome and trigger screenshot generation
 */
const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 1074;
const appPath = path.join(__dirname, '../');

const app = express();

app.use(express.static(`${appPath}/dist`));

app.get('*', (request, response) => {
    response.sendFile(`${appPath}/dist/index.html`);
});

const server = app.listen(PORT, (error) => {
    if (error) {
        console.error(error);
    } else {
        console.info('=> 🌎 http://localhost:%s/', PORT);
        takeShots();
    }
});

let page = null;
let browser = null;

const screenshot = (fileName) => {
    const dir = `${appPath}/shots`;

    console.log(`📸 ${fileName}`);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    page.screenshot({ path: `${dir}/${fileName}.png`, type: 'png' });
};

const screenshotsDone = () => {
    console.log(`✅ Screenshots located at ${appPath}/shots/`);
    browser.close();
    server.close();
};

const inject = () => {
    window.Electron = {
        mode: 'puppeteer',
        getOS: () => {
            return 'darwin';
        },
        readKeychain: async () => {},
        getUuid: async () => '',
        changeLanguage: () => {},
        onEvent: () => {},
        removeEvent: () => {},
        showMenu: () => {},
        requestDeepLink: () => {},
        setStorage: async () => {},
        screenshot,
        screenshotsDone,
    };
};

const takeShots = async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();

    page.setViewport({
        width: 1280,
        height: 800,
    });

    page.on('console', (msg) => {
        console.log(msg.text());
    });

    page.on('pageerror', (err) => {
        console.error('Page error: ' + err.toString());
    });

    await page.exposeFunction('screenshot', screenshot);
    await page.exposeFunction('screenshotsDone', screenshotsDone);
    await page.evaluateOnNewDocument(inject);

    await page.goto(`http://localhost:${PORT}/index.html`);
};
