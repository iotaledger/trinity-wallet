import { Navigation } from 'react-native-navigation';
import withSafeAreaView from 'ui/components/SafeAreaView';
import withDropdownAlert from 'ui/components/WithDropdownAlert';
import withModal from 'ui/components/ModalComponent';
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
        screen = withSafeAreaView(screen);
    }
    return withModal(withDropdownAlert(screen));
}

export default function registerScreens(store, Provider) {
    Navigation.registerComponentWithRedux('home', () => getGenerator(Home), Provider, store);
    Navigation.registerComponentWithRedux('loading', () => getGenerator(Loading), Provider, store);
    Navigation.registerComponentWithRedux('newSeedSetup', () => getGenerator(NewSeedSetup), Provider, store);
    Navigation.registerComponentWithRedux('walletSetup', () => getGenerator(WalletSetup), Provider, store);
    Navigation.registerComponentWithRedux('enterSeed', () => getGenerator(EnterSeed), Provider, store);
    Navigation.registerComponentWithRedux('saveYourSeed', () => getGenerator(SaveYourSeed), Provider, store);
    Navigation.registerComponentWithRedux('setPassword', () => getGenerator(SetPassword), Provider, store);
    Navigation.registerComponentWithRedux('login', () => getGenerator(Login), Provider, store);
    Navigation.registerComponentWithRedux('writeSeedDown', () => getGenerator(WriteSeedDown), Provider, store);
    Navigation.registerComponentWithRedux('languageSetup', () => getGenerator(LanguageSetup), Provider, store);
    Navigation.registerComponentWithRedux(
        'walletResetConfirm',
        () => getGenerator(WalletResetConfirmation),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'walletResetRequirePassword',
        () => getGenerator(WalletResetRequirePassword),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'onboardingComplete',
        () => getGenerator(OnboardingComplete),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'setAccountName',
        () => getGenerator(SetAccountNameComponent),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux('seedReentry', () => getGenerator(SeedReentry), Provider, store);
    Navigation.registerComponentWithRedux(
        'saveSeedConfirmation',
        () => getGenerator(SaveSeedConfirmation),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'twoFactorSetupAddKey',
        () => getGenerator(TwoFactorSetupAddKeyComponent),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'twoFactorSetupEnterToken',
        () => getGenerator(TwoFactorSetupEnterToken),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux('disable2FA', () => getGenerator(Disable2FA), Provider, store);
    Navigation.registerComponentWithRedux('fingerprintSetup', () => getGenerator(FingerprintSetup), Provider, store);
    Navigation.registerComponentWithRedux(
        'termsAndConditions',
        () => getGenerator(TermsAndConditions),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux('privacyPolicy', () => getGenerator(PrivacyPolicy), Provider, store);
    Navigation.registerComponentWithRedux(
        'forceChangePassword',
        () => getGenerator(ForceChangePassword),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'seedVaultBackup',
        () => getGenerator(SeedVaultBackupComponent),
        Provider,
        store,
    );
}
