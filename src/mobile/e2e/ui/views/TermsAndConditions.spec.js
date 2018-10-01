/*global expect element by*/
describe('TermsAndConditions', () => {
    it('should show the terms and conditions', async () => {
        await element(by.id('languageSetup-next')).tap();
        await expect(element(by.type('RCTScrollView'))).toBeVisible();
    });

    it('should allow scrolling', async () => {
        await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
        await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
        await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
        await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
    });

    it('should show a button once the terms and conditions have been read', async () => {
        await expect(element(by.id('termsAndConditions-next'))).toBeVisible();
        await element(by.id('termsAndConditions-next')).tap();
    });
});
