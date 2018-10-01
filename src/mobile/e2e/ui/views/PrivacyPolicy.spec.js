/*global expect element by*/
describe('PrivacyPolicy', () => {
    it('should show the privacy policy', async () => {
        await element(by.id('languageSetup-next')).tap();
        await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
        await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
        await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
        await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
        await element(by.id('termsAndConditions-next')).tap();
        await expect(element(by.type('RCTScrollView'))).toBeVisible();
    });

    it('should allow scrolling', async () => {
        await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
        await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
        await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
        await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
    });

    it('should show a button once the privacy policy has been read', async () => {
        await expect(element(by.id('privacyPolicy-next'))).toBeVisible();
        await element(by.id('privacyPolicy-next')).tap();
    });
});
