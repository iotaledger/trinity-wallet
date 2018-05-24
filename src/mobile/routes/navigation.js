import { Navigation } from 'react-native-navigation';
import withSafeAreaView from '../components/SafeAreaView';
import Home from '../containers/Home';
import Loading from '../containers/Loading';
import NewSeedSetup from '../containers/NewSeedSetup';
import WalletSetup from '../containers/WalletSetup';
import LanguageSetup from '../containers/LanguageSetup';
import Welcome from '../containers/Welcome';
import EnterSeed from '../containers/EnterSeed';
import SaveYourSeed from '../containers/SaveYourSeed';
import SetPassword from '../containers/SetPassword';
import WriteSeedDown from '../containers/WriteSeedDown';
import CopySeedToClipboard from '../containers/CopySeedToClipboard';
import PaperWallet from '../containers/PaperWallet';
import SaveSeedConfirmation from '../containers/SaveSeedConfirmation';
import Login from '../containers/Login';
import WalletResetConfirmation from '../containers/WalletResetConfirmation';
import WalletResetRequirePassword from '../containers/WalletResetRequirePassword';
import OnboardingComplete from '../containers/OnboardingComplete';
import SetAccountNameComponent from '../containers/SetAccountName';
import SeedReentry from '../containers/SeedReentry';
import TwoFactorSetupAddKeyComponent from '../containers/TwoFactorSetupAddKey';
import TwoFactorSetupEnterToken from '../containers/TwoFactorSetupEnterToken';
import Disable2FA from '../containers/Disable2FA';
import FingerprintSetup from '../containers/FingerprintSetup';
import TermsAndConditions from '../containers/TermsAndConditions';
import { isIPhoneX } from '../utils/device';

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
    Navigation.registerComponent('paperWallet', () => getGenerator(PaperWallet), store, Provider);
    Navigation.registerComponent('copySeedToClipboard', () => getGenerator(CopySeedToClipboard), store, Provider);
    Navigation.registerComponent('languageSetup', () => getGenerator(LanguageSetup), store, Provider);
    Navigation.registerComponent('welcome', () => getGenerator(Welcome), store, Provider);
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
}
