/*global element by device*/
import * as Navigation from '../../internal/navigation';
import { sleep, TEST_SEED, TEST_PASSWORD } from '../../internal/helpers';

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

        // Go back, continue onboarding
        await element(by.id('newSeedSetup-back')).tap();
        await Navigation.navigateToEnterSeed();

        // Type seed
        await element(by.id('enterSeed-seedbox')).tap();
        await element(by.id('enterSeed-seedbox')).typeText(TEST_SEED);
        await element(by.id('enterSeed-seedbox')).tapReturnKey();

        // Type account name
        await element(by.id('setAccountName-textinput')).tap();
        await element(by.id('setAccountName-textinput')).typeText('Main Account');
        await element(by.id('setAccountName-textinput')).tapReturnKey();

        // Type password
        await element(by.id('setPassword-passwordbox')).tap();
        await element(by.id('setPassword-passwordbox')).typeText(TEST_PASSWORD);
        await element(by.id('setPassword-passwordbox')).tapReturnKey();
        await element(by.id('setPassword-reentrybox')).typeText(TEST_PASSWORD);
        await element(by.id('setPassword-reentrybox')).tapReturnKey();

        // Complete onboarding
        await element(by.id('setPassword-done')).tap();
    });
});
