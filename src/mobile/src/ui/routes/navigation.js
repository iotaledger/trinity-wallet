import { Navigation } from 'react-native-navigation';
import withSafeAreaView from '../components/SafeAreaView';
import Home from '../views/wallet/Home';
import Loading from '../views/wallet/Loading';
import NewSeedSetup from '../views/onboarding/NewSeedSetup';
import WalletSetup from '../views/onboarding/WalletSetup';
import LanguageSetup from '../views/onboarding/LanguageSetup';
import EnterSeed from '../views/onboarding/EnterSeed';
import SaveYourSeed from '../views/onboarding/SaveYourSeed';
import SetPassword from '../views/onboarding/SetPassword';
import WriteSeedDown from '../views/onboarding/WriteSeedDown';
import SaveSeedConfirmation from '../views/onboarding/SaveSeedConfirmation';
import Login from '../views/wallet/Login';
import WalletResetConfirmation from '../views/wallet/WalletResetConfirmation';
import WalletResetRequirePassword from '../views/wallet/WalletResetRequirePassword';
import OnboardingComplete from '../views/onboarding/OnboardingComplete';
import SetAccountNameComponent from '../views/onboarding/SetAccountName';
import SeedReentry from '../views/onboarding/SeedReentry';
import TwoFactorSetupAddKeyComponent from '../views/wallet/TwoFactorSetupAddKey';
import TwoFactorSetupEnterToken from '../views/wallet/TwoFactorSetupEnterToken';
import Disable2FA from '../views/wallet/Disable2FA';
import FingerprintSetup from '../views/wallet/FingerprintSetup';
import TermsAndConditions from '../views/onboarding/TermsAndConditions';
import PrivacyPolicy from '../views/onboarding/PrivacyPolicy';
import ForceChangePassword from '../views/wallet/ForceChangePassword';
import SeedVaultBackupComponent from '../views/onboarding/SeedVaultBackup';
import { isIPhoneX } from '../../libs/device';

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
