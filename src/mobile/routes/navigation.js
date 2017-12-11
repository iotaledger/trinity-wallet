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
import UseSeed from '../containers/useSeed';
import SeedReentry from '../containers/seedReentry';
import { isIPhoneX } from '../util/device';

function getGenerator(screen) {
    if (isIPhoneX) {
        return withSafeAreaView(screen);
    } else {
        return screen;
    }
}
export function registerScreens(store, Provider) {
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
    Navigation.registerComponent('walletResetConfirm', () => WalletResetConfirmation, store, Provider);
    Navigation.registerComponent('walletResetRequirePassword', () => WalletResetRequirePassword, store, Provider);
    Navigation.registerComponent('onboardingComplete', () => OnboardingComplete, store, Provider);
    Navigation.registerComponent('useSeed', () => UseSeed, store, Provider);
    Navigation.registerComponent('setSeedName', () => SetSeedName, store, Provider);
    Navigation.registerComponent('seedReentry', () => SeedReentry, store, Provider);
    Navigation.registerComponent('saveSeedConfirmation', () => SaveSeedConfirmation, store, Provider);
}
