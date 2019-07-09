import iriMock from '../../__mocks__/iriMock';

describe('Trinity desktop end-to-end', () => {
    test('Trinity dashboard', async () => {
        const page = await global.__getBrowserPage('wallet', true);

        await page.setRequestInterception(true);
        page.on('request', iriMock);

        // Dashboard
        await page.waitForSelector('#to-receive');
        await page.click('#to-receive');

        // Receive
        await new Promise((resolve) => setTimeout(resolve, 200));
        await page.waitForSelector('#generate-address');
        await page.click('#generate-address');

        await page.waitForSelector('#receive-address');
        await page.click('#to-wallet');

        // Send
        await page.waitForSelector('#to-send');
        await page.click('#to-send');

        await page.waitForSelector('#recipient-address');
        await page.focus('#recipient-address');
        await page.keyboard.type('A'.repeat(81) + 'YLFHUOJUY');

        await page.focus('#send-amount');
        await page.keyboard.type('1');

        await page.click('#send-transaction');

        await page.waitForSelector('#confirm-accept');
        const selector = await page.$('#confirm-accept');

        page.close();

        expect(selector).toBeTruthy();
    }, 150000);
});
