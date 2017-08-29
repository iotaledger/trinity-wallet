import SInfo from 'react-native-sensitive-info';

export function storeInKeychain(key, value) {
  SInfo.setItem(key, value, {
    sharedPreferencesName: 'mySharedPrefs',
    keychainService: 'myKeychain'
  }).then((value) =>
          console.log(value)
  );
}

export function getFromKeychain(key){
  SInfo.getItem(key, {
    sharedPreferencesName: 'mySharedPrefs',
    keychainService: 'myKeychain'
  }).then(value => {
      console.log(value) //value1
      return value;
  });
}
