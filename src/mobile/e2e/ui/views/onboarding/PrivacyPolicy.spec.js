/*global expect element by*/
import { navigateToPrivacyPolicy } from '../../../internal/navigation';

describe('PrivacyPolicy', () => {
    it('should show the privacy policy', async () => {
        await navigateToPrivacyPolicy();
        await expect(element(by.id('privacyPolicy-scrollView'))).toBeVisible();
    });

    it('should allow scrolling', async () => {
        await element(by.id('privacyPolicy-scrollView')).scrollTo('bottom');
    });

    it('should show a button once the privacy policy has been read', async () => {
        await expect(element(by.id('privacyPolicy-next'))).toBeVisible();
        await element(by.id('privacyPolicy-next')).tap();
    });
});
