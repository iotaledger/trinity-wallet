import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { createSelector } from 'reselect';
import { deduplicateTransferBundles } from '../libs/iota/transfers';

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

export const getAccountFromState = (state) => state.account || {};

export const getAccountInfoFromState = createSelector(getAccountFromState, (state) => state.accountInfo || {});

export const getUnconfirmedBundleTailsFromState = createSelector(
    getAccountFromState,
    (state) => state.unconfirmedBundleTails || {},
);

export const getTxHashesForUnspentAddressesFromState = createSelector(
    getAccountFromState,
    (state) => state.txHashesForUnspentAddresses || {},
);

export const getPendingTxHashesForSpentAddressesFromState = createSelector(
    getAccountFromState,
    (state) => state.pendingTxHashesForSpentAddresses || {},
);

export const accountStateFactory = (accountName) => {
    return createSelector(
        getAccountInfoFromState,
        getUnconfirmedBundleTailsFromState,
        getTxHashesForUnspentAddressesFromState,
        getPendingTxHashesForSpentAddressesFromState,
        (accountInfo, unconfirmedBundleTails, txHashesForUnspentAddresses, pendingTxHashesForSpentAddresses) => ({
            accountName,
            unconfirmedBundleTails,
            accountInfo: accountInfo[accountName] || {},
            txHashesForUnspentAddresses: txHashesForUnspentAddresses[accountName] || [],
            pendingTxHashesForSpentAddresses: pendingTxHashesForSpentAddresses[accountName] || [],
        }),
    );
};
