import { isPlayServicesAvailable, generateNonce, sendAndVerifyAttestation } from 'react-native-google-safetynet';

const API_KEY = 'AIzaSyCG6XTyOM1Od7jW9fucVdbep0x6BcL57Ko';

export const doAttestationFromSafetyNet = () => {
    return isPlayServicesAvailable()
        .then((result) => {
            if (result === true) {
                return generateNonce(24);
            }

            throw new Error('play services not available.');
        })
        .then((nonce) => sendAndVerifyAttestation(nonce, API_KEY));
};
