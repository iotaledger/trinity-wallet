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

/**
 *   Selects account prop from state.
 *
 *   @method getAccountFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getAccountFromState = (state) => state.account || {};

/**
 *   Selects accountInfo prop from account reducer state object.
 *   Uses getAccountFromState selector for slicing account state from the whole state object.
 *
 *   @method getAccountInfoFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getAccountInfoFromState = createSelector(getAccountFromState, (state) => state.accountInfo || {});

/**
 *   Selects unconfirmedBundleTails prop from account reducer state object.
 *   Uses getAccountFromState selector for slicing account state from the state object.
 *
 *   @method getUnconfirmedBundleTailsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getUnconfirmedBundleTailsFromState = createSelector(
    getAccountFromState,
    (state) => state.unconfirmedBundleTails || {},
);

/**
 *   Selects txHashesForUnspentAddresses prop from account reducer state object.
 *   Uses getAccountFromState selector for slicing account state from the state object.
 *
 *   @method getTxHashesForUnspentAddressesFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getTxHashesForUnspentAddressesFromState = createSelector(
    getAccountFromState,
    (state) => state.txHashesForUnspentAddresses || {},
);

/**
 *   Selects pendingTxHashesForSpentAddressesFromState prop from account reducer state object.
 *   Uses getAccountFromState selector for slicing account state from the state object.
 *
 *   @method getPendingTxHashesForSpentAddressesFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getPendingTxHashesForSpentAddressesFromState = createSelector(
    getAccountFromState,
    (state) => state.pendingTxHashesForSpentAddresses || {},
);

/**
 *   Selects all relevent account information from the state object.
 *   When returned function (createSelector) is called with the whole state object,
 *   it slices off state partials for the accountName.
 *
 *   @method selectedAccountStateFactory
 *   @param {string} accountName
 *   @returns {function}
 **/
export const selectedAccountStateFactory = (accountName) => {
    return createSelector(
        getAccountInfoFromState,
        getUnconfirmedBundleTailsFromState,
        getTxHashesForUnspentAddressesFromState,
        getPendingTxHashesForSpentAddressesFromState,
        (accountInfo, unconfirmedBundleTails, txHashesForUnspentAddresses, pendingTxHashesForSpentAddresses) => ({
            ...(accountInfo[accountName] || {}),
            accountName,
            unconfirmedBundleTails,
            txHashesForUnspentAddresses: txHashesForUnspentAddresses[accountName] || [],
            pendingTxHashesForSpentAddresses: pendingTxHashesForSpentAddresses[accountName] || [],
        }),
    );
};
