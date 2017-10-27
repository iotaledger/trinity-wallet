import { Navigation } from 'react-native-navigation';
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
import Login from '../containers/login';
import OnboardingComplete from '../containers/onboardingComplete';
import SetSeedName from '../containers/setSeedName';
import UseSeed from '../containers/useSeed';

export function registerScreens(store, Provider) {
    Navigation.registerComponent('initialLoading', () => InitialLoading, store, Provider);
    Navigation.registerComponent('home', () => Home, store, Provider);
    Navigation.registerComponent('loading', () => Loading, store, Provider);
    Navigation.registerComponent('newSeedSetup', () => NewSeedSetup, store, Provider);
    Navigation.registerComponent('walletSetup', () => WalletSetup, store, Provider);
    Navigation.registerComponent('enterSeed', () => EnterSeed, store, Provider);
    Navigation.registerComponent('saveYourSeed', () => SaveYourSeed, store, Provider);
    Navigation.registerComponent('setPassword', () => SetPassword, store, Provider);
    Navigation.registerComponent('login', () => Login, store, Provider);
    Navigation.registerComponent('writeSeedDown', () => WriteSeedDown, store, Provider);
    Navigation.registerComponent('paperWallet', () => PaperWallet, store, Provider);
    Navigation.registerComponent('copySeedToClipboard', () => CopySeedToClipboard, store, Provider);
    Navigation.registerComponent('languageSetup', () => LanguageSetup, store, Provider);
    Navigation.registerComponent('welcome', () => Welcome, store, Provider);
    Navigation.registerComponent('onboardingComplete', () => OnboardingComplete, store, Provider);
    Navigation.registerComponent('useSeed', () => UseSeed, store, Provider);
    Navigation.registerComponent('setSeedName', () => SetSeedName, store, Provider);
}
