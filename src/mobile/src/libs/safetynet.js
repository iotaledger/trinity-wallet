import {
    isPlayServicesAvailable,
    generateNonce,
    sendAndVerifyAttestation
} from 'react-native-google-safetynet';

const API_KEY = 'fakeAPIkey';

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
