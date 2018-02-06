import { Clipboard } from 'react-native';

export default {
    set: text => Clipboard.setString(text),
    clear: () => Clipboard.setString(''),
};
