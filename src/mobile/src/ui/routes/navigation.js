import { Navigation } from 'react-native-navigation';
import withSafeAreaView from '../components/SafeAreaView';
import Home from 'mobile/src/ui/views/wallet/Home';
import Loading from 'mobile/src/ui/views/wallet/Loading';
import NewSeedSetup from 'mobile/src/ui/views/onboarding/NewSeedSetup';
import WalletSetup from 'mobile/src/ui/views/onboarding/WalletSetup';
import LanguageSetup from 'mobile/src/ui/views/onboarding/LanguageSetup';
import EnterSeed from 'mobile/src/ui/views/onboarding/EnterSeed';
import SaveYourSeed from 'mobile/src/ui/views/onboarding/SaveYourSeed';
import SetPassword from 'mobile/src/ui/views/onboarding/SetPassword';
import WriteSeedDown from 'mobile/src/ui/views/onboarding/WriteSeedDown';
import SaveSeedConfirmation from 'mobile/src/ui/views/onboarding/SaveSeedConfirmation';
import Login from 'mobile/src/ui/views/wallet/Login';
import WalletResetConfirmation from 'mobile/src/ui/views/wallet/WalletResetConfirmation';
import WalletResetRequirePassword from 'mobile/src/ui/views/wallet/WalletResetRequirePassword';
import OnboardingComplete from 'mobile/src/ui/views/onboarding/OnboardingComplete';
import SetAccountNameComponent from 'mobile/src/ui/views/onboarding/SetAccountName';
import SeedReentry from 'mobile/src/ui/views/onboarding/SeedReentry';
import TwoFactorSetupAddKeyComponent from 'mobile/src/ui/views/wallet/TwoFactorSetupAddKey';
import TwoFactorSetupEnterToken from 'mobile/src/ui/views/wallet/TwoFactorSetupEnterToken';
import Disable2FA from 'mobile/src/ui/views/wallet/Disable2FA';
import FingerprintSetup from 'mobile/src/ui/views/wallet/FingerprintSetup';
import TermsAndConditions from 'mobile/src/ui/views/onboarding/TermsAndConditions';
import PrivacyPolicy from 'mobile/src/ui/views/onboarding/PrivacyPolicy';
import ForceChangePassword from 'mobile/src/ui/views/wallet/ForceChangePassword';
import SeedVaultBackupComponent from 'mobile/src/ui/views/onboarding/SeedVaultBackup';
import { isIPhoneX } from 'mobile/src/libs/device';

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
