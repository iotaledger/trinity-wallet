/*global element by device*/
import * as Navigation from '../../internal/navigation';
import { sleep } from '../../internal/helpers';

describe('Onboarding process', () => {
  it('should complete the onboarding process', async () => {
    await Navigation.navigateToLanguageSetup();
    await Navigation.navigateToTermsAndConditions();
    await Navigation.navigateToPrivacyPolicy();
    await Navigation.navigateToWalletSetup();
    await Navigation.navigateToNewSeedSetup();

    // Press "Press for New Seed" button
    await element(by.id('newSeedSetup-newSeed')).tap();
    // Wait for dropdown alert to disappear
    await sleep(7000);
    // Take screenshot
    await device.takeScreenshot('newSeedSetup');
  });
});
