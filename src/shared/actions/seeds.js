export const ActionTypes = {
    ADD_SEED: 'IOTA/SEEDS/ADD_SEED',
    SET_SEED: 'IOTA/SEEDS/SET_SEED',
    REMOVE_SEED: 'IOTA/SEEDS/REMOVE_SEED',
};

export const addSeed = seed => {
    return {
        type: ActionTypes.ADD_SEED,
        payload: seed,
    };
};

export const setActiveSeed = seed => {
    return {
        type: ActionTypes.SET_SEED,
        payload: seed,
    };
};

export const removeSeed = seed => {
    return {
        type: ActionTypes.REMOVE_SEED,
        payload: seed,
    };
};
