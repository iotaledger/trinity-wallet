import { AppRegistry } from 'react-native';
import { Client, Configuration } from 'bugsnag-react-native';
import Wallet from './routes/entry';

console.disableYellowBox = true;
AppRegistry.registerComponent('iotaWallet', () => Wallet);
const configuration = new Configuration();
configuration.automaticallyCollectBreadcrumbs = false;
const bugsnag = new Client();
