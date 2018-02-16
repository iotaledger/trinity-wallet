import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { createSelector } from 'reselect';
import { deduplicateTransferBundles } from '../libs/iota/transfers';

export const getAccountFromState = (state) => state.account || {};

export const getAccountInfoFromState = createSelector(getAccountFromState, (state) => {
    return state.accountInfo || {};
});

export const currentAccountSelector = (seedName, accountInfo) => get(accountInfo, seedName);

export const currentAccountSelectorBySeedIndex = (seedIndex, accountInfo) => {
    if (isEmpty(accountInfo) || seedIndex < 0) {
        return {};
    }

    const allAccountNames = Object.keys(accountInfo);
    // Might be good to validate first
    const currentlySelectedAccountName = allAccountNames[seedIndex];

    return accountInfo[currentlySelectedAccountName];
};

const currentAccountNameSelectorBySeedIndex = (seedIndex, seedNames) => {
    return seedNames[seedIndex];
};

const unspentAddressesHashesSelector = (seedName, hashesDict) => get(hashesDict, seedName);

export const getExistingUnspentAddressesHashes = createSelector(unspentAddressesHashesSelector, (hashes) => hashes);

export const getSelectedAccount = createSelector(currentAccountSelector, (account) => account);

export const getSelectedAccountViaSeedIndex = createSelector(currentAccountSelectorBySeedIndex, (account) => account);

export const getSelectedAccountNameViaSeedIndex = createSelector(currentAccountNameSelectorBySeedIndex, (name) => name);

export const getBalanceForSelectedAccountViaSeedIndex = createSelector(
    currentAccountSelectorBySeedIndex,
    (account) => get(account, 'balance') || 0,
);

export const getAddressesForSelectedAccountViaSeedIndex = createSelector(currentAccountSelectorBySeedIndex, (account) =>
    Object.keys(get(account, 'addresses')),
);

export const getAddressesWithBalanceForSelectedAccountViaSeedIndex = createSelector(
    currentAccountSelectorBySeedIndex,
    (account) => get(account, 'addresses'),
);

export const getTransfersForSelectedAccountViaSeedIndex = createSelector(currentAccountSelectorBySeedIndex, (account) =>
    get(account, 'transfers'),
);

export const getDeduplicatedTransfersForSelectedAccountViaSeedIndex = createSelector(
    currentAccountSelectorBySeedIndex,
    (account) => deduplicateTransferBundles(get(account, 'transfers')),
);
