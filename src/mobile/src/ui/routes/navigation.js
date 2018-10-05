import { Navigation } from 'react-native-navigation';
import withSafeAreaView from 'ui/components/SafeAreaView';
import Home from 'ui/views/wallet/Home';
import Loading from 'ui/views/wallet/Loading';
import NewSeedSetup from 'ui/views/onboarding/NewSeedSetup';
import WalletSetup from 'ui/views/onboarding/WalletSetup';
import LanguageSetup from 'ui/views/onboarding/LanguageSetup';
import EnterSeed from 'ui/views/onboarding/EnterSeed';
import SaveYourSeed from 'ui/views/onboarding/SaveYourSeed';
import SetPassword from 'ui/views/onboarding/SetPassword';
import WriteSeedDown from 'ui/views/onboarding/WriteSeedDown';
import SaveSeedConfirmation from 'ui/views/onboarding/SaveSeedConfirmation';
import Login from 'ui/views/wallet/Login';
import WalletResetConfirmation from 'ui/views/wallet/WalletResetConfirmation';
import WalletResetRequirePassword from 'ui/views/wallet/WalletResetRequirePassword';
import OnboardingComplete from 'ui/views/onboarding/OnboardingComplete';
import SetAccountNameComponent from 'ui/views/onboarding/SetAccountName';
import SeedReentry from 'ui/views/onboarding/SeedReentry';
import TwoFactorSetupAddKeyComponent from 'ui/views/wallet/TwoFactorSetupAddKey';
import TwoFactorSetupEnterToken from 'ui/views/wallet/TwoFactorSetupEnterToken';
import Disable2FA from 'ui/views/wallet/Disable2FA';
import FingerprintSetup from 'ui/views/wallet/FingerprintSetup';
import TermsAndConditions from 'ui/views/onboarding/TermsAndConditions';
import PrivacyPolicy from 'ui/views/onboarding/PrivacyPolicy';
import ForceChangePassword from 'ui/views/wallet/ForceChangePassword';
import SeedVaultBackupComponent from 'ui/views/onboarding/SeedVaultBackup';
import { isIPhoneX } from 'libs/device';

function getGenerator(screen) {
    if (isIPhoneX) {
        return withSafeAreaView(screen);
    }

    return screen;
}

export default function registerScreens(store, Provider) {
    Navigation.registerComponent('home', () => getGenerator(Home), store, Provider);
    Navigation.registerComponent('loading', () => getGenerator(Loading), store, Provider);
    Navigation.registerComponent('newSeedSetup', () => getGenerator(NewSeedSetup), store, Provider);
    Navigation.registerComponent('walletSetup', () => getGenerator(WalletSetup), store, Provider);
    Navigation.registerComponent('enterSeed', () => getGenerator(EnterSeed), store, Provider);
    Navigation.registerComponent('saveYourSeed', () => getGenerator(SaveYourSeed), store, Provider);
    Navigation.registerComponent('setPassword', () => getGenerator(SetPassword), store, Provider);
    Navigation.registerComponent('login', () => getGenerator(Login), store, Provider);
    Navigation.registerComponent('writeSeedDown', () => getGenerator(WriteSeedDown), store, Provider);
    Navigation.registerComponent('languageSetup', () => getGenerator(LanguageSetup), store, Provider);
    Navigation.registerComponent('walletResetConfirm', () => getGenerator(WalletResetConfirmation), store, Provider);
    Navigation.registerComponent(
        'walletResetRequirePassword',
        () => getGenerator(WalletResetRequirePassword),
        store,
        Provider,
    );
    Navigation.registerComponent('onboardingComplete', () => getGenerator(OnboardingComplete), store, Provider);
    Navigation.registerComponent('setAccountName', () => getGenerator(SetAccountNameComponent), store, Provider);
    Navigation.registerComponent('seedReentry', () => getGenerator(SeedReentry), store, Provider);
    Navigation.registerComponent('saveSeedConfirmation', () => getGenerator(SaveSeedConfirmation), store, Provider);
    Navigation.registerComponent(
        'twoFactorSetupAddKey',
        () => getGenerator(TwoFactorSetupAddKeyComponent),
        store,
        Provider,
    );
    Navigation.registerComponent(
        'twoFactorSetupEnterToken',
        () => getGenerator(TwoFactorSetupEnterToken),
        store,
        Provider,
    );
    Navigation.registerComponent('disable2FA', () => getGenerator(Disable2FA), store, Provider);
    Navigation.registerComponent('fingerprintSetup', () => getGenerator(FingerprintSetup), store, Provider);
    Navigation.registerComponent('termsAndConditions', () => getGenerator(TermsAndConditions), store, Provider);
    Navigation.registerComponent('privacyPolicy', () => getGenerator(PrivacyPolicy), store, Provider);
    Navigation.registerComponent('forceChangePassword', () => getGenerator(ForceChangePassword), store, Provider);
    Navigation.registerComponent('seedVaultBackup', () => getGenerator(SeedVaultBackupComponent), store, Provider);
}
