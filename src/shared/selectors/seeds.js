import { createSelector } from 'reselect';

const seedsSelector = state => state.seeds;

export const getSelectedSeed = createSelector(
    seedsSelector,
    ({ items, selectedSeedIndex }) => items[selectedSeedIndex],
);
