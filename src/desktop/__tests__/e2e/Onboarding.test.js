describe('Trinity desktop end-to-end', () => {
    test('Trinity onboarding existing seed', async () => {
        const page = await global.__getBrowserPage('onboarding', false);

        // Welcome
        await page.waitForSelector('#to-seed-intro');
        await page.click('#to-seed-intro');

        // Language selection
        await page.waitForSelector('#to-seed-intro');
        await page.click('#to-seed-intro');

        // Seed intro
        await page.waitForSelector('#to-seed-verify');
        await page.click('#to-seed-verify');

        // Seed input
        await page.waitForSelector('.input__editable > div');
        await page.focus('.input__editable > div');
        await page.keyboard.type('9'.repeat(81));
        await page.click('#seed-verify-next');

        // Account name
        await page.waitForSelector('input');
        await page.focus('input');
        await page.keyboard.type('FOO');

        await page.click('#account-name-next');

        // Account password
        await page.waitForSelector('.input__input:first-of-type input');
        await page.focus('.input__input:first-of-type input');
        await page.keyboard.type('FooBarBazFooBar');

        await page.focus('.input__input:last-of-type input');
        await page.keyboard.type('FooBarBazFooBar');

        await page.click('#account-password-next');

        // Done
        await page.waitForSelector('#done-next');
        const selector = await page.$('#done-next');

        page.close();

        expect(selector).toBeTruthy();
    }, 15000);

    test('Trinity onboarding new seed', async () => {
        const page = await global.__getBrowserPage('onboarding', false);

        // Welcome
        await page.waitForSelector('#to-seed-intro');
        await page.click('#to-seed-intro');

        // Language selection
        await page.waitForSelector('#to-seed-intro');
        await page.click('#to-seed-intro');

        // Seed intro
        await page.waitForSelector('#to-seed-generate');
        await page.click('#to-seed-generate');

        // Seed generate
        for (let i = 1; i <= 10; i++) {
            const selector = `.index__seed button:enabled:nth-child(${i})`;
            await page.waitForSelector(selector);
            await page.click(selector);
        }
        await page.click('#to-account-name');

        // Account name
        await page.focus('input');
        await page.keyboard.type('FOO');
        await page.click('#account-name-next');

        // Seed save
        await page.waitForSelector('#to-seed-verify');
        await page.click('#to-seed-verify');

        // Seed verify
        await page.waitForSelector('.input__editable > div');
        await page.focus('.input__editable > div');
        await page.keyboard.type('9'.repeat(81));

        await page.click('#seed-verify-next');

        // Account password
        await page.waitForSelector('.input__input:first-of-type input');
        await page.focus('.input__input:first-of-type input');
        await page.keyboard.type('FooBarBazFooBar');

        await page.focus('.input__input:last-of-type input');
        await page.keyboard.type('FooBarBazFooBar');

        await page.click('#account-password-next');

        // Done
        await page.waitForSelector('#done-next');
        const selector = await page.$('#done-next');

        page.close();

        expect(selector).toBeTruthy();
    }, 150000);
});
