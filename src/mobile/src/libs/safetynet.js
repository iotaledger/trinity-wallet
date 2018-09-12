import { isPlayServicesAvailable, generateNonce, sendAndVerifyAttestation } from 'react-native-google-safetynet';

// NOTE: This is a fake API key, thus SafetyNet attestation may fail even if the device is not rooted
// It is replaced by the correct API key during the deployment process
const API_KEY = 'fakeAPIkey';

/**
 * Send an attestation request to SafetyNet
 * @return {Promise<boolean>}
 */
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
