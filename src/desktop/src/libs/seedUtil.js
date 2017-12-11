import { createRandomSeed as createRandomSeedWrapped, MAX_SEED_LENGTH } from 'libs/util';
import randomBytes from 'randombytes';

export const createRandomSeed = (length = MAX_SEED_LENGTH) => {
    return createRandomSeedWrapped(randomBytes, length);
};
