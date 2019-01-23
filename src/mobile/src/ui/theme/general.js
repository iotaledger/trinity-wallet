import { width, height } from 'libs/dimensions';
import { isAndroid, isIPhoneX } from 'libs/device';
import ExtraDimensions from 'react-native-extra-dimensions-android';

export const Styling = {
    contentWidth: isIPhoneX ? width / 1.08 : width / 1.15,
    borderRadius: isIPhoneX ? width / 40 : width / 60,
    borderRadiusSmall: parseInt(width / 90),
    borderRadiusLarge: parseInt(width / 40),
    borderRadiusExtraLarge: parseInt(width / 20),
    fontSize0: width / 37,
    fontSize1: width / 34,
    fontSize2: width / 31,
    fontSize3: width / 25,
    fontSize4: width / 22,
    fontSize5: width / 19,
    fontSize6: width / 14,
    fontSize7: width / 8,
    topbarHeightRatio: isIPhoneX ? 1 / 8.8 : 1 / 8,
    get topbarHeight() {
        return height * this.topbarHeightRatio;
    },
    iPhoneXBottomInsetHeight: 34,
    statusBarHeight: isAndroid ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : isIPhoneX ? 44 : 20,
};

export function getBackgroundColor(screen, theme, inactive = false) {
    const { bar, body } = theme;
    const screenMap = {
        home: inactive ? body.bg : bar.bg,
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
        termsAndConditions: bar.bg,
        privacyPolicy: bar.bg,
        forceChangePassword: body.bg,
        seedVaultBackup: body.bg,
    };
    return screenMap[screen];
}
