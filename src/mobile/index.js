import { AppRegistry } from 'react-native';
import process from 'process'; // eslint-disable-line no-unused-vars
import Wallet from './src/ui/routes/entry';
import { isAndroid } from './src/libs/device';

if (isAndroid) {
    // This Intl API is not available in android
    // It needs to be polyfilled
    require('intl');

    require('intl/locale-data/jsonp/en-US');
}

AppRegistry.registerComponent('iotaWallet', () => Wallet);
