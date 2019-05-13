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

        this.browser = null;

        const getNewPage = async (route, isAuthorised) => {
            if (!this.browser) {
                this.browser = await puppeteer.connect({
                    browserWSEndpoint: wsEndpoint,
                });
            }

            const page = await this.browser.newPage();

            stateMock.wallet.ready = isAuthorised;
            stateMock.accounts.onboardingComplete = isAuthorised;

            if (!isAuthorised) {
                stateMock.accounts.accountInfo = {};
            }

            page.setViewport({
                width: 1280,
                height: 800,
                deviceScaleFactor: 2,
            });

            page.evaluateOnNewDocument(electronMock, settings, stateMock);

            await page.goto(`http://localhost:1074/${route}`, { waitUntil: 'networkidle2' });

            return page;
        };

        this.global.__getBrowserPage = (route, isAuthorised) => getNewPage(route, isAuthorised);

        this.global.__screenshot = async (route, isAuthorised, timeout) => {
            const page = await getNewPage(route, isAuthorised);

            await new Promise((resolve) => setTimeout(resolve, timeout || 800));

            const screenshot = await page.screenshot(route, isAuthorised);

            page.close();

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
