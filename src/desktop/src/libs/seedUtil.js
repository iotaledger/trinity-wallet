import { MAX_SEED_LENGTH, createRandomSeed as createRandomSeedWrapped } from 'libs/util';
import randomBytes from 'randombytes';

export const createRandomSeed = (length = MAX_SEED_LENGTH) => {
    return createRandomSeedWrapped(randomBytes, length);
};
