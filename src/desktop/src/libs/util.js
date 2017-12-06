import sjcl from 'sjcl';

export const securelyPersistSeeds = (password, seeds) => {
    const stringifiedSeeds = typeof seeds === 'string' ? seeds : JSON.stringify(seeds);
    localStorage.setItem('iotaWallet:seeds', sjcl.encrypt(password, stringifiedSeeds));
};

export const getSecurelyPersistedSeeds = password => {
    const encryptedSeeds = localStorage.getItem('iotaWallet:seeds');
    if (!encryptedSeeds) {
        return {};
    }
    const decryptedSeeds = sjcl.decrypt(password, encryptedSeeds);
    return JSON.parse(decryptedSeeds);
};

export const temporarilySavePassword = password => {
    sessionStorage.setItem('password', btoa(password));
};

export const getTemporarilySavedPassword = () => {
    const password = sessionStorage.getItem('password');
    return (password && atob(password)) || null;
};
