import { createSelector } from 'reselect';

export const seedsSelector = state => state.seeds;

export const getSelectedSeed = createSelector(
    seedsSelector,
    ({ items, selectedSeedIndex }) => items[selectedSeedIndex] || {},
);

export const getSelectedIndex = createSelector(seedsSelector, ({ selectedSeedIndex }) => selectedSeedIndex);
