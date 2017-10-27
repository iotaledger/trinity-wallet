/* eslint-disable import/prefer-default-export */

export function setFirstUse(boolean) {
    return {
        type: 'SET_FIRSTUSE',
        payload: boolean,
    };
}

export function increaseSeedCount() {
    console.log('increaseSeedCount');
    return {
        type: 'INCREASE_SEEDCOUNT',
    };
}

export function addSeed(seedName) {
    console.log('addSeed');

    return {
        type: 'ADD_SEED',
        payload: seedName,
    };
}
