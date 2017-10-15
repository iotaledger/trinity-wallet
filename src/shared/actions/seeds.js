// @flow
export const ActionTypes = {
    ADD_SEED: 'IOTA/SEEDS/ADD_SEED',
    SELECT_SEED: 'IOTA/SEEDS/SELECT_SEED',
    REMOVE_SEED: 'IOTA/SEEDS/REMOVE_SEED',
    CLEAR: 'IOTA/SEEDS/CLEAR',
};

export const addSeed = seed => {
    return {
        type: ActionTypes.ADD_SEED,
        payload: seed,
    };
};

export const selectSeed = index => {
    return {
        type: ActionTypes.SELECT_SEED,
        payload: index,
    };
};

export const addAndSelectSeed = seed => {
    return (dispatch, getState) => {
        // TODO: don't add seed if already in store
        // const { seeds } = getState();
        // if (seeds.items.find(item => item.seed === seed.seed)) {
        //     return;
        // }
        dispatch(addSeed(seed));
        dispatch(selectSeed(getState().seeds.items.length - 1));
    };
};

export const removeSeed = seed => {
    return {
        type: ActionTypes.REMOVE_SEED,
        payload: seed,
    };
};

export const clearSeeds = () => {
    return {
        type: ActionTypes.CLEAR,
    };
};
