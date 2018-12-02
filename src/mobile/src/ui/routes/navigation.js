import { Navigation } from 'react-native-navigation';
import withSafeAreaView from 'ui/components/SafeAreaView';
import withDropdownAlert from 'ui/components/WithDropdownAlert';
import withModal from 'ui/components/ModalComponent';
import withRouteMonitor from 'ui/components/RouteMonitor';
import withStatusBar from 'ui/components/WithStatusBar';
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

function applyHOCs(screen) {
    const withHOCs = (c) => withDropdownAlert(withStatusBar(withModal(withRouteMonitor(c))));
    if (isIPhoneX) {
        return withHOCs(withSafeAreaView(screen));
    }
    return withHOCs(screen);
}

export default function registerScreens(store, Provider) {
    Navigation.registerComponentWithRedux('home', () => applyHOCs(Home), Provider, store);
    Navigation.registerComponentWithRedux('loading', () => applyHOCs(Loading), Provider, store);
    Navigation.registerComponentWithRedux('newSeedSetup', () => applyHOCs(NewSeedSetup), Provider, store);
    Navigation.registerComponentWithRedux('walletSetup', () => applyHOCs(WalletSetup), Provider, store);
    Navigation.registerComponentWithRedux('enterSeed', () => applyHOCs(EnterSeed), Provider, store);
    Navigation.registerComponentWithRedux('saveYourSeed', () => applyHOCs(SaveYourSeed), Provider, store);
    Navigation.registerComponentWithRedux('setPassword', () => applyHOCs(SetPassword), Provider, store);
    Navigation.registerComponentWithRedux('login', () => applyHOCs(Login), Provider, store);
    Navigation.registerComponentWithRedux('writeSeedDown', () => applyHOCs(WriteSeedDown), Provider, store);
    Navigation.registerComponentWithRedux('languageSetup', () => applyHOCs(LanguageSetup), Provider, store);
    Navigation.registerComponentWithRedux(
        'walletResetConfirm',
        () => applyHOCs(WalletResetConfirmation),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'walletResetRequirePassword',
        () => applyHOCs(WalletResetRequirePassword),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux('onboardingComplete', () => applyHOCs(OnboardingComplete), Provider, store);
    Navigation.registerComponentWithRedux('setAccountName', () => applyHOCs(SetAccountNameComponent), Provider, store);
    Navigation.registerComponentWithRedux('seedReentry', () => applyHOCs(SeedReentry), Provider, store);
    Navigation.registerComponentWithRedux(
        'saveSeedConfirmation',
        () => applyHOCs(SaveSeedConfirmation),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'twoFactorSetupAddKey',
        () => applyHOCs(TwoFactorSetupAddKeyComponent),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'twoFactorSetupEnterToken',
        () => applyHOCs(TwoFactorSetupEnterToken),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux('disable2FA', () => applyHOCs(Disable2FA), Provider, store);
    Navigation.registerComponentWithRedux('fingerprintSetup', () => applyHOCs(FingerprintSetup), Provider, store);
    Navigation.registerComponentWithRedux('termsAndConditions', () => applyHOCs(TermsAndConditions), Provider, store);
    Navigation.registerComponentWithRedux('privacyPolicy', () => applyHOCs(PrivacyPolicy), Provider, store);
    Navigation.registerComponentWithRedux('forceChangePassword', () => applyHOCs(ForceChangePassword), Provider, store);
    Navigation.registerComponentWithRedux(
        'seedVaultBackup',
        () => applyHOCs(SeedVaultBackupComponent),
        Provider,
        store,
    );
}
