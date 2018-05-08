import { AppRegistry } from 'react-native';
import { Client, Configuration } from 'bugsnag-react-native';
import Wallet from './routes/entry';

/*eslint-disable no-unused-vars*/
/*eslint-disable no-console*/
console.disableYellowBox = true;
const configuration = new Configuration();
configuration.appVersion = '0.1.33';
const bugsnag = new Client(configuration);
AppRegistry.registerComponent('iotaWallet', () => Wallet);
