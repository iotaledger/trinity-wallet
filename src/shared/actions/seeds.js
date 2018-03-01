import {
    seedsSelector,
    getSelectedIndex,
    getSeedItems,
    getMostRecentSeedIndex,
    getSelectedSeed,
} from '../selectors/seeds';
import { securelyPersistSeeds, getSecurelyPersistedSeeds } from '../libs/util';
import { iota } from '../libs/iota';

export const ActionTypes = {
    ADD_SEED: 'IOTA/SEEDS/ADD_SEED',
    SELECT_SEED: 'IOTA/SEEDS/SELECT_SEED',
    REMOVE_SEED: 'IOTA/SEEDS/REMOVE_SEED',
    PATCH_SEED: 'IOTA/SEEDS/PATCH_SEED',
    CLEAR: 'IOTA/SEEDS/CLEAR',
    LOAD_SEEDS: 'IOTA/SEEDS/LOAD_SEEDS',
};

export const loadSeeds = (seeds) => {
    return {
        type: ActionTypes.LOAD_SEEDS,
        payload: seeds,
    };
};

// TODO: Add flow here
/*
type SeedT = {
    name?: string,
    seed: string,
    addresses: array,
};
*/
export const addSeed = (seed) => {
    if (Array.isArray(seed.addresses)) {
        seed.addresses = [];
    }

    return {
        type: ActionTypes.ADD_SEED,
        payload: seed,
    };
};

export const selectSeed = (index) => {
    return {
        type: ActionTypes.SELECT_SEED,
        payload: index,
    };
};

export const addAndSelectSeed = (seed) => {
    return (dispatch, getState) => {
        const seeds = getSeedItems(getState());
        const index = seeds.findIndex((item) => item.seed === seed.seed);
        if (index !== -1) {
            dispatch(selectSeed(index));
            return;
        }

        dispatch(addSeed({ seed }));
        dispatch(selectSeed(getMostRecentSeedIndex(getState())));
    };
};

export const renameCurrentSeed = (name) => {
    return (dispatch, getState) => {
        const index = getSelectedIndex(getState());
        dispatch(patchSeed(index, { name }));
    };
};

export const updateCurrentSeed = (values) => {
    return (dispatch, getState) => {
        const selectedSeedIndex = getSelectedIndex(getState());
        return dispatch(patchSeed(selectedSeedIndex, values));
    };
};

export const addAddress = (address) => {
    return (dispatch, getState) => {
        const seed = getSelectedSeed(getState());
        const addresses = (seed.addresses || []).slice();
        addresses.push(address);
        return dispatch(
            updateCurrentSeed({
                addresses,
            }),
        );
    };
};

// type ValuesT = {
//     name?: string,
//     seed: string,
//     balance?: number,
// };
export const patchSeed = (index, values) => {
    return {
        type: ActionTypes.PATCH_SEED,
        payload: {
            index,
            values,
        },
    };
};

export const removeSeed = (seed) => {
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

export const persistSeeds = (password) => {
    return (dispatch, getState) => {
        const seeds = seedsSelector(getState);
        securelyPersistSeeds(password, seeds);
    };
};

export const restorePersistedSeeds = (password) => {
    return (dispatch) => {
        const seeds = getSecurelyPersistedSeeds(password);
        dispatch(loadSeeds(seeds));
    };
};

export const getAccountInfoAsync = (seed) => {
    return async (dispatch, getState) => {
        const accountData = await iota.api.getAccountDataAsync(seed);
        const addresses = getSelectedSeed(getState()).addresses;
        const balances = await iota.api.getBalancesAsync(addresses || [], 1);
        console.log('ACCOUNT DATA:', accountData);
        console.log('balances:', balances);
    };
};

export const getNewAddressAsync = (seed, options) => {
    return async (dispatch, getState) => {
        const addressCount = (getSelectedSeed(getState()).addresses || []).length;
        console.log('ADRCOUNT:', addressCount);
        const address = await iota.api.getNewAddressAsync(
            seed,
            Object.assign({}, options, { checksum: true, index: addressCount }),
        );
        dispatch(addAddress(address));
        console.log('NEW ADDRESS:', address);
    };
};
