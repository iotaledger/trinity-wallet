import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { createSelector } from 'reselect';
import { deduplicateTransferBundles } from '../libs/accountUtils';

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
    console.log(seedIndex);
    console.log(seedNames);
    return seedNames[seedIndex];
};

export const getSelectedAccount = createSelector(currentAccountSelector, account => account);

export const getSelectedAccountViaSeedIndex = createSelector(currentAccountSelectorBySeedIndex, account => account);

export const getSelectedAccountNameViaSeedIndex = createSelector(currentAccountNameSelectorBySeedIndex, name => name);

export const getAddressesForSelectedAccountViaSeedIndex = createSelector(currentAccountSelectorBySeedIndex, account =>
    Object.keys(get(account, 'addresses')),
);

export const getAddressesWithBalanceForSelectedAccountViaSeedIndex = createSelector(
    currentAccountSelectorBySeedIndex,
    account => get(account, 'addresses'),
);

export const getTransfersForSelectedAccountViaSeedIndex = createSelector(currentAccountSelectorBySeedIndex, account =>
    get(account, 'transfers'),
);

export const getDeduplicatedTransfersForSelectedAccountViaSeedIndex = createSelector(
    currentAccountSelectorBySeedIndex,
    account => deduplicateTransferBundles(get(account, 'transfers')),
);
