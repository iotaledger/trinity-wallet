const ElectronEnvironment = require('@jest-runner/electron/environment');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const os = require('os');
const stateMock = require('../__mocks__/stateMock.json');
const electronMock = require('../__mocks__/electronMock.js');
const settings = require('../package.json');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

/**
 * Hotfix for `jest-image-snapshot` to run diff in Node environment
 */
process.execPath = 'node';

class PuppeteerEnvironment extends ElectronEnvironment {
    constructor(config) {
        super(config);
    }

    async setup() {
        await super.setup();

        const wsEndpoint = fs.readFileSync(path.join(DIR, 'wsEndpoint'), 'utf8');
        if (!wsEndpoint) {
            throw new Error('wsEndpoint not found');
        }

        const browser = await puppeteer.connect({
            browserWSEndpoint: wsEndpoint,
        });

        const page = await browser.newPage();

        page.setViewport({
            width: 1280,
            height: 800,
            deviceScaleFactor: 2,
        });

        this.global.__screenshot = async (route, authorisedRoute) => {
            page.evaluateOnNewDocument(electronMock, settings, authorisedRoute ? stateMock : {});

            await page.goto(`http://localhost:1074/${route}`);
            const screenshot = await page.screenshot();
            return screenshot;
        };
    }

    async teardown() {
        await super.teardown();
    }

    runScript(script) {
        return super.runScript(script);
    }
}

module.exports = PuppeteerEnvironment;
