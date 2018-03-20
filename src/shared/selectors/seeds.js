import { createSelector } from 'reselect';

export const seedsSelector = (state) => state.seeds;

export const getSelectedSeed = createSelector(
    seedsSelector,
    ({ items, selectedSeedIndex }) => items[selectedSeedIndex] || {},
);

export const selectedSeedSelector = createSelector(
    seedsSelector,
    ({ items, selectedSeedIndex }) => items[selectedSeedIndex] || {},
);

export const getSelectedIndex = createSelector(seedsSelector, ({ selectedSeedIndex }) => selectedSeedIndex);

export const selectedSeedIndexSelector = createSelector(seedsSelector, ({ selectedSeedIndex }) => selectedSeedIndex);

export const getSeedItems = createSelector(seedsSelector, ({ items }) => items || []);

export const seedItemsSelector = createSelector(seedsSelector, ({ items }) => items || []);

export const getMostRecentSeedIndex = createSelector(
    getSeedItems,
    (items) => (items.length === 0 ? 0 : items.length - 1),
);
