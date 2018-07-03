import { MAX_SEED_LENGTH } from './iota/utils';

export async function generateNewSeed(randomBytesFn) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
    let seed = '';
    while (seed.length < MAX_SEED_LENGTH) {
        const byte = await randomBytesFn(1);
        if (byte[0] < 243) {
            seed += charset.charAt(byte[0] % 27);
        }
    }
    return seed;
}

export async function randomiseSeedCharacter(seed, charId, randomBytesFn) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
    let updatedSeed = '';
    let complete = false;
    while (!complete) {
        const byte = await randomBytesFn(1);
        if (byte[0] < 243) {
            updatedSeed = seed.substr(0, charId) + charset.charAt(byte[0] % 27) + seed.substr(charId + 1, 80);
            complete = true;
        }
    }
    return updatedSeed;
}
