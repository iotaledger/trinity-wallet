import map from 'lodash/map';
import { width, height } from 'libs/dimensions';
import { isAndroid, isIPhoneX } from 'libs/device';
import ExtraDimensions from 'react-native-extra-dimensions-android';

const screens = [
    'home',
    'loading',
    'newSeedSetup',
    'walletSetup',
    'enterSeed',
    'saveYourSeed',
    'setPassword',
    'login',
    'writeSeedDown',
    'languageSetup',
    'walletResetConfirm',
    'walletResetRequirePassword',
    'onboardingComplete',
    'setAccountName',
    'seedReentry',
    'saveSeedConfirmation',
    'twoFactorSetupAddKey',
    'twoFactorSetupEnterToken',
    'disable2FA',
    'fingerprintSetup',
    'termsAndConditions',
    'privacyPolicy',
    'forceChangePassword',
    'seedVaultBackup',
];

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
    topBarHeightRatio: isIPhoneX ? 1 / 6 : 1 / 8,
    get topBarHeight() {
        return height * this.topBarHeightRatio;
    },
    iPhoneXBottomInsetHeight: 34,
    statusBarHeight: isAndroid ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : isIPhoneX ? 44 : 20,
};

export function getBorderColor(screen, theme, inactive = false) {
    const { bar, body } = theme;
    const applyColour = (screen) => {
        if (screen === 'home') {
            return { [screen]: inactive ? body.bg : bar.bg };
        } else if (screen === 'termsAndConditions' || screen === 'privacyPolicy') {
            return { [screen]: bar.bg };
        }
        return { [screen]: body.bg };
    };
    return Object.assign({}, ...map(screens, (item) => applyColour(item)))[screen];
}

export function getBackgroundColor(screen, theme) {
    const { bar, body } = theme;
    const applyColour = (screen) => {
        if (screen === 'termsAndConditions' || screen === 'privacyPolicy') {
            return { [screen]: bar.bg };
        }
        return { [screen]: body.bg };
    };
    return Object.assign({}, ...map(screens, (item) => applyColour(item)))[screen];
}
