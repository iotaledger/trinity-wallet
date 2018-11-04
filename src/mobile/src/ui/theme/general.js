import { width } from 'libs/dimensions';
import { isIPhoneX } from 'libs/device';

export const Styling = {
    contentWidth: isIPhoneX ? width / 1.08 : width / 1.15,
    borderRadius: width / 60,
    borderRadiusSmall: width / 90,
    borderRadiusLarge: width / 40,
    fontSize0: width / 37,
    fontSize1: width / 34,
    fontSize2: width / 31,
    fontSize3: width / 25,
    fontSize4: width / 22,
    fontSize5: width / 19,
    fontSize6: width / 8,
};

export function getBackgroundColor(screen, theme, footerColour = false, inactive = false) {
    const { bar, body } = theme;
    const screenMap = {
        home: inactive ? body.bg : bar.alt,
        loading: body.bg,
        newSeedSetup: body.bg,
        walletSetup: body.bg,
        enterSeed: body.bg,
        saveYourSeed: body.bg,
        setPassword: body.bg,
        login: body.bg,
        writeSeedDown: body.bg,
        languageSetup: body.bg,
        walletResetConfirm: body.bg,
        walletResetRequirePassword: body.bg,
        onboardingComplete: body.bg,
        setAccountName: body.bg,
        seedReentry: body.bg,
        saveSeedConfirmation: body.bg,
        twoFactorSetupAddKey: body.bg,
        twoFactorSetupEnterToken: body.bg,
        disable2FA: body.bg,
        fingerprintSetup: body.bg,
        termsAndConditions: footerColour ? 'white' : bar.bg,
        privacyPolicy: footerColour ? 'white' : bar.bg,
        forceChangePassword: body.bg,
        seedVaultBackup: body.bg,
    };
    return screenMap[screen];
}
