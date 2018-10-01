/*global expect element by*/
describe('LanguageSetup', () => {
    it('should have a dropdown menu', async () => {
        await expect(element(by.id('languageSetup-dropdown'))).toBeVisible();
    });

    it("should have a 'next' button", async () => {
        await expect(element(by.id('languageSetup-next'))).toBeVisible();
        await element(by.id('languageSetup-next')).tap();
    });
});
