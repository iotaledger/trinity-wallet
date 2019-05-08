/*global expect element by*/
import { navigateToTermsAndConditions } from '../../../internal/statelessNavigation';

describe('TermsAndConditions', () => {
    it('should show the terms and conditions', async () => {
        await navigateToTermsAndConditions();
        await expect(element(by.id('termsAndConditions-scrollView'))).toBeVisible();
    });

    it('should allow scrolling', async () => {
        await element(by.id('termsAndConditions-scrollView')).scrollTo('bottom');
    });

    it('should show a button once the terms and conditions have been read', async () => {
        await expect(element(by.id('termsAndConditions-next'))).toBeVisible();
        await element(by.id('termsAndConditions-next')).tap();
    });
});
