import { NativeModules, Platform, Dimensions } from 'react-native';
import ExtraDimensions from 'react-native-extra-dimensions-android';

export const DetectNavbar =
    Platform.OS === 'android'
        ? {
              hasSoftKeys() {
                  return NativeModules.RNDetectNavbarAndroid.hasSoftKeys();
              },
          }
        : {
              hasSoftKeys() {
                  return false;
              },
          };

global.height = DetectNavbar.hasSoftKeys()
    ? (Dimensions.get('window').height -= ExtraDimensions.get('SOFT_MENU_BAR_HEIGHT'))
    : Dimensions.get('window').height;

export const width = Dimensions.get('window').width;
export const height = global.height;
