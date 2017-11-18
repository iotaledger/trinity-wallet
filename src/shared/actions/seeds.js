import { seedsSelector, getSelectedIndex, getSeedItems, getMostRecentSeedIndex } from '../selectors/seeds';
import { securelyPersistSeeds, getSecurelyPersistedSeeds } from '../libs/util';

export const ActionTypes = {
    ADD_SEED: 'IOTA/SEEDS/ADD_SEED',
    SELECT_SEED: 'IOTA/SEEDS/SELECT_SEED',
    REMOVE_SEED: 'IOTA/SEEDS/REMOVE_SEED',
    PATCH_SEED: 'IOTA/SEEDS/PATCH_SEED',
    CLEAR: 'IOTA/SEEDS/CLEAR',
    LOAD_SEEDS: 'IOTA/SEEDS/LOAD_SEEDS',
};

export const loadSeeds = seeds => {
    return {
        type: ActionTypes.LOAD_SEEDS,
        payload: seeds,
    };
};

// TODO: Add flow here
/*
type SeedT = {
    name?: string,
    seed: string
};
*/
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
        const seeds = getSeedItems(getState());
        const index = seeds.findIndex(item => item.seed === seed.seed);
        if (index !== -1) {
            dispatch(selectSeed(index));
            return;
        }

        dispatch(addSeed({ seed }));
        dispatch(selectSeed(getMostRecentSeedIndex(getState())));
    };
};

export const renameCurrentSeed = name => {
    return (dispatch, getState) => {
        const index = getSelectedIndex(getState());
        dispatch(patchSeed(index, { name }));
    };
};

export const patchSeed = (index, values) => {
    return {
        type: ActionTypes.PATCH_SEED,
        payload: {
            index,
            values,
        },
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

export const persistSeeds = password => {
    return (dispatch, getState) => {
        const seeds = seedsSelector(getState);
        securelyPersistSeeds(password, seeds);
    };
};

export const restorePersistedSeeds = password => {
    return dispatch => {
        const seeds = getSecurelyPersistedSeeds(password);
        dispatch(loadSeeds(seeds));
    };
};
