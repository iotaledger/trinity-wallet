/*global expect element by*/
export const navigateToLanguageSetup = async () => {
    return;
};

export const navigateToTermsAndConditions = async () => {
    await navigateToLanguageSetup();
    await element(by.id('languageSetup-next')).tap();
    return;
};

export const navigateToPrivacyPolicy = async () => {
    await navigateToTermsAndConditions();
    await element(by.id('termsAndConditions-scrollView')).scrollTo('bottom');
    await element(by.id('termsAndConditions-next')).tap();
};

export const navigateToWalletSetup = async () => {
    await navigateToPrivacyPolicy();
    await element(by.id('privacyPolicy-scrollView')).scrollTo('bottom');
    await element(by.id('privacyPolicy-next')).tap();
};
