import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/iota/utils';

export const generateNewSeed = (randomBytesFn) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
    let seed = '';
    return randomBytesFn(100).then((bytes) => {
        Object.keys(bytes).forEach((key) => {
            if (bytes[key] < 243 && seed.length < MAX_SEED_LENGTH) {
                const randomNumber = bytes[key] % 27;
                const randomLetter = charset.charAt(randomNumber);
                seed += randomLetter;
            }
        });
        return seed;
    });
};


export const randomiseSeedCharacter = (seed, charId, randomBytesFn) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
    return randomBytesFn(5).then((bytes) => {
        let i = 0;
        let id = charId;
        let updatedSeed = seed;
        Object.keys(bytes).forEach((key) => {
            if (bytes[key] < 243 && i < 1) {
                const randomNumber = bytes[key] % 27;
                const randomLetter = charset.charAt(randomNumber);
                const substr1 = updatedSeed.substr(0, id);
                id++;
                const substr2 = updatedSeed.substr(id, 80);
                updatedSeed = substr1 + randomLetter + substr2;
                i++;
            }
        });
        return updatedSeed;
    });
};
