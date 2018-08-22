import { Navigation } from 'react-native-navigation';
import withSafeAreaView from '../components/SafeAreaView';
import Home from 'ui/views/Home';
import Loading from 'ui/views/Loading';
import NewSeedSetup from 'ui/views/NewSeedSetup';
import WalletSetup from 'ui/views/WalletSetup';
import LanguageSetup from 'ui/views/LanguageSetup';
import EnterSeed from 'ui/views/EnterSeed';
import SaveYourSeed from 'ui/views/SaveYourSeed';
import SetPassword from 'ui/views/SetPassword';
import WriteSeedDown from 'ui/views/WriteSeedDown';
import SaveSeedConfirmation from 'ui/views/SaveSeedConfirmation';
import Login from 'ui/views/Login';
import WalletResetConfirmation from 'ui/views/WalletResetConfirmation';
import WalletResetRequirePassword from 'ui/views/WalletResetRequirePassword';
import OnboardingComplete from 'ui/views/OnboardingComplete';
import SetAccountNameComponent from 'ui/views/SetAccountName';
import SeedReentry from 'ui/views/SeedReentry';
import TwoFactorSetupAddKeyComponent from 'ui/views/TwoFactorSetupAddKey';
import TwoFactorSetupEnterToken from 'ui/views/TwoFactorSetupEnterToken';
import Disable2FA from 'ui/views/Disable2FA';
import FingerprintSetup from 'ui/views/FingerprintSetup';
import TermsAndConditions from 'ui/views/TermsAndConditions';
import PrivacyPolicy from 'ui/views/PrivacyPolicy';
import ForceChangePassword from 'ui/views/ForceChangePassword';
import SeedVaultBackupComponent from 'ui/views/SeedVaultBackup';
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
