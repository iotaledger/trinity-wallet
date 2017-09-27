import { Navigation } from 'react-native-navigation';
import InitialLoading from '../containers/initialLoading';
import Home from '../containers/home';
import Loading from '../containers/loading';
import NewSeedSetup from '../containers/newSeedSetup';
import Welcome from '../containers/welcome';
import EnterSeed from '../containers/enterSeed';
import SaveYourSeed from '../containers/saveYourSeed';
import SetPassword from '../containers/setPassword';
import WriteSeedDown from '../containers/writeSeedDown';
import CopySeedToClipboard from '../containers/copySeedToClipboard';
import PaperWallet from '../containers/paperWallet';
import Login from '../containers/login';

export function registerScreens(store, Provider) {
  Navigation.registerComponent('initialLoading', () => InitialLoading, store, Provider);
  Navigation.registerComponent('home', () => Home, store, Provider);
  Navigation.registerComponent('loading', () => Loading, store, Provider);
  Navigation.registerComponent('newSeedSetup', () => NewSeedSetup, store, Provider);
  Navigation.registerComponent('welcome', () => Welcome, store, Provider);
  Navigation.registerComponent('enterSeed', () => EnterSeed, store, Provider);
  Navigation.registerComponent('saveYourSeed', () => SaveYourSeed, store, Provider);
  Navigation.registerComponent('setPassword', () => SetPassword, store, Provider);
  Navigation.registerComponent('login', () => Login, store, Provider);
  Navigation.registerComponent('writeSeedDown', () => WriteSeedDown, store, Provider);
  Navigation.registerComponent('paperWallet', () => PaperWallet, store, Provider);
  Navigation.registerComponent('copySeedToClipboard', () => CopySeedToClipboard, store, Provider);
}
