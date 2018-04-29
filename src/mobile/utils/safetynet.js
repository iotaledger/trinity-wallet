import { isPlayServicesAvailable, generateNonce, sendAndVerifyAttestation } from 'react-native-google-safetynet';

const API_KEY = 'AIzaSyCG6XTyOM1Od7jW9fucVdbep0x6BcL57Ko';

export const sendAndVerify = () => {
  return isPlayServicesAvailable()
        .then((result) => {
            if (result === true) {
                Promise.resolve();
            } else {
                Promise.reject(result);
            }
        })
        .then(() => generateNonce(24))
        .then((nonce) => sendAndVerifyAttestation(nonce, API_KEY))
        .then((isRooted) => {
            return Promise.resolve(isRooted);
        })
        .catch((e) => {
            console.log(e);
            return e;
        });
};
