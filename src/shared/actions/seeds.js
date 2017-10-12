export const ActionTypes = {
    ADD_SEED: 'IOTA/SEEDS/ADD_SEED',
    SET_SEED: 'IOTA/SEEDS/SET_SEED',
    REMOVE_SEED: 'IOTA/SEEDS/REMOVE_SEED',
};

export function addSeed(seed) {
    return {
        type: ActionTypes.ADD_SEED,
        payload: seed,
    };
}
