import randomBytes from 'randombytes';
import { createRandomSeed as createRandomSeedWrapped, MAX_SEED_LENGTH } from '../../../shared/libs/util';

export const createRandomSeed = (length = MAX_SEED_LENGTH) => {
    return createRandomSeedWrapped(randomBytes, length);
};
