describe('Trinity desktop end-to-end', () => {
    test(
        'Trinity onboarding existing seed',
        async () => {
            const page = await global.__getBrowserPage('onboarding', false);

            // Welcome
            await page.waitForSelector('#to-seed-intro');
            await page.click('#to-seed-intro');

            // Seed intro
            await page.waitForSelector('#to-seed-verify');
            await page.click('#to-seed-verify');

            // Seed input
            await page.waitForSelector('.input__editable > div');
            await page.focus('.input__editable > div');
            await page.keyboard.type(
                '999999999999999999999999999999999999999999999999999999999999999999999999999999999',
            );
            await page.click('#seed-verify-next');

            // Account name
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

            expect(selector).toBeTruthy();
        },
        10000,
    );
});
