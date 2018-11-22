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
    await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
    await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
    await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
    await element(by.type('RCTScrollView')).swipe('up', 'fast', 0.99);
    await element(by.id('termsAndConditions-next')).tap();
};
