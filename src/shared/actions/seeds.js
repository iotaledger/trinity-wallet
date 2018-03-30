export const ActionTypes = {
    SEEDS_SET: 'IOTA/SEEDS/LOAD',
    SEEDS_REMOVE: 'IOTA/SEEDS/REMOVE',
    SEEDS_CLEAR: 'IOTA/SEEDS/CLEAR',
    SEEDS_NEW_SEED: 'IOTA/SEEDS/NEW_SEED',
    SEEDS_NEW_NAME: 'IOTA/SEEDS/NEW_NAME',
    SEEDS_NEW_CLEAR: 'IOTA/SEEDS/NEW_CLEAR',
};

export const setSeeds = (seeds) => {
    return {
        type: ActionTypes.SEEDS_SET,
        payload: seeds,
    };
};

export const clearSeeds = () => {
    return {
        type: ActionTypes.SEEDS_CLEAR,
    };
};

export const removeSeed = (seed) => {
    return {
        type: ActionTypes.SEEDS_REMOVE,
        payload: seed,
    };
};

export const setNewSeed = (seed, isGenerated) => {
    return {
        type: ActionTypes.SEEDS_NEW_SEED,
        payload: { seed, isGenerated },
    };
};

export const setNewSeedName = (seed) => {
    return {
        type: ActionTypes.SEEDS_NEW_NAME,
        payload: seed,
    };
};

export const clearNewSeed = () => {
    return {
        type: ActionTypes.SEEDS_NEW_CLEAR,
    };
};
