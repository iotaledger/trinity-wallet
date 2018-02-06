import { Navigation } from 'react-native-navigation';
import withSafeAreaView from '../components/withSafeAreaView';
import InitialLoading from '../containers/initialLoading';
import Home from '../containers/home';
import Loading from '../containers/loading';
import NewSeedSetup from '../containers/newSeedSetup';
import WalletSetup from '../containers/walletSetup';
import LanguageSetup from '../containers/languageSetup';
import Welcome from '../containers/welcome';
import EnterSeed from '../containers/enterSeed';
import SaveYourSeed from '../containers/saveYourSeed';
import SetPassword from '../containers/setPassword';
import WriteSeedDown from '../containers/writeSeedDown';
import CopySeedToClipboard from '../containers/copySeedToClipboard';
import PaperWallet from '../containers/paperWallet';
import SaveSeedConfirmation from '../containers/saveSeedConfirmation';
import Login from '../containers/login';
import WalletResetConfirmation from '../containers/walletResetConfirmation';
import WalletResetRequirePassword from '../containers/walletResetRequirePassword';
import OnboardingComplete from '../containers/onboardingComplete';
import SetSeedName from '../containers/setSeedName';
import SeedReentry from '../containers/seedReentry';
import TwoFactorSetupAddKey from '../containers/twoFactorSetupAddKey';
import TwoFactorSetupEnterToken from '../containers/twoFactorSetupEnterToken';
import Disable2FA from '../containers/disable2FA';
import { isIPhoneX } from '../util/device';
import FingerprintSetup from '../containers/fingerprintSetup';

function getGenerator(screen) {
    if (isIPhoneX) {
        return withSafeAreaView(screen);
    }

    return screen;
}

export default function registerScreens(store, Provider) {
    Navigation.registerComponent('initialLoading', () => getGenerator(InitialLoading), store, Provider);
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
    Navigation.registerComponent('setSeedName', () => getGenerator(SetSeedName), store, Provider);
    Navigation.registerComponent('seedReentry', () => getGenerator(SeedReentry), store, Provider);
    Navigation.registerComponent('saveSeedConfirmation', () => getGenerator(SaveSeedConfirmation), store, Provider);
    Navigation.registerComponent('twoFactorSetupAddKey', () => getGenerator(TwoFactorSetupAddKey), store, Provider);
    Navigation.registerComponent(
        'twoFactorSetupEnterToken',
        () => getGenerator(TwoFactorSetupEnterToken),
        store,
        Provider,
    );
    Navigation.registerComponent('disable2FA', () => getGenerator(Disable2FA), store, Provider);
    Navigation.registerComponent('fingerprintSetup', () => getGenerator(FingerprintSetup), store, Provider);
}
