/*global expect element by*/
export const navigateToLanguageSetup = async () => {
    return;
};

export const navigateToTermsAndConditions = async () => {
    await element(by.id('languageSetup-next')).tap();
    return;
};

export const navigateToPrivacyPolicy = async () => {
    await element(by.id('termsAndConditions-scrollView')).scrollTo('bottom');
    await element(by.id('termsAndConditions-next')).tap();
};

export const navigateToWalletSetup = async () => {
    await element(by.id('privacyPolicy-scrollView')).scrollTo('bottom');
    await element(by.id('privacyPolicy-next')).tap();
};

export const navigateToNewSeedSetup = async () => {
    await element(by.id('walletSetup-yes')).tap();
};

export const navigateToEnterSeed = async () => {
    await element(by.id('walletSetup-no')).tap();
};
