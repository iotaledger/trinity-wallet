import { createRandomSeed as createRandomSeedWrapped } from '../../../shared/libs/util';
import randomBytes from 'randombytes';

export const createRandomSeed = (length = 81) => {
    return createRandomSeedWrapped(randomBytes, length);
};
