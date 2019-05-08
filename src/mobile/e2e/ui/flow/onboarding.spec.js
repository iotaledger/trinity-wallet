import * as Navigation from '../../internal/navigation';

describe('Onboarding process', () => {
  it('should complete the onboarding process', async () => {
    await Navigation.navigateToLanguageSetup();
    await Navigation.navigateToTermsAndConditions();
    await Navigation.navigateToPrivacyPolicy();
    await Navigation.navigateToWalletSetup();
  });
});
