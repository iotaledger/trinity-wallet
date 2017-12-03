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
import Login from '../containers/login';
import WalletResetConfirmation from '../containers/walletResetConfirmation';
import WalletResetRequirePassword from '../containers/walletResetRequirePassword';
import OnboardingComplete from '../containers/onboardingComplete';
import SetSeedName from '../containers/setSeedName';
import UseSeed from '../containers/useSeed';
import SeedReentry from '../containers/seedReentry';

export function registerScreens(store, Provider) {
    Navigation.registerComponent('initialLoading', () => withSafeAreaView(InitialLoading), store, Provider);
    Navigation.registerComponent('home', () => withSafeAreaView(Home), store, Provider);
    Navigation.registerComponent('loading', () => withSafeAreaView(Loading), store, Provider);
    Navigation.registerComponent('newSeedSetup', () => withSafeAreaView(NewSeedSetup), store, Provider);
    Navigation.registerComponent('walletSetup', () => withSafeAreaView(WalletSetup), store, Provider);
    Navigation.registerComponent('enterSeed', () => withSafeAreaView(EnterSeed), store, Provider);
    Navigation.registerComponent('saveYourSeed', () => withSafeAreaView(SaveYourSeed), store, Provider);
    Navigation.registerComponent('setPassword', () => withSafeAreaView(SetPassword), store, Provider);
    Navigation.registerComponent('login', () => withSafeAreaView(Login), store, Provider);
    Navigation.registerComponent('writeSeedDown', () => withSafeAreaView(WriteSeedDown), store, Provider);
    Navigation.registerComponent('paperWallet', () => withSafeAreaView(PaperWallet), store, Provider);
    Navigation.registerComponent('copySeedToClipboard', () => withSafeAreaView(CopySeedToClipboard), store, Provider);
    Navigation.registerComponent('languageSetup', () => withSafeAreaView(LanguageSetup), store, Provider);
    Navigation.registerComponent('welcome', () => withSafeAreaView(Welcome), store, Provider);
    Navigation.registerComponent(
        'wallet-reset-confirm',
        () => withSafeAreaView(WalletResetConfirmation),
        store,
        Provider,
    );
    Navigation.registerComponent(
        'wallet-reset-require-password',
        () => withSafeAreaView(WalletResetRequirePassword),
        store,
        Provider,
    );
    Navigation.registerComponent('onboardingComplete', () => withSafeAreaView(OnboardingComplete), store, Provider);
    Navigation.registerComponent('useSeed', () => withSafeAreaView(UseSeed), store, Provider);
    Navigation.registerComponent('setSeedName', () => withSafeAreaView(SetSeedName), store, Provider);
    Navigation.registerComponent('seedReentry', () => withSafeAreaView(SeedReentry), store, Provider);
}
