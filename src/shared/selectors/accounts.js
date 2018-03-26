import get from 'lodash/get';
import findKey from 'lodash/findKey';
import keys from 'lodash/keys';
import { createSelector } from 'reselect';
import { deduplicateTransferBundles } from '../libs/iota/transfers';

/**
 *   Selects settings prop from state.
 *
 *   @method getSettingsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getSettingsFromState = (state) => state.settings || {};

/**
 *   Selects remotePoW prop from settings reducer state object.
 *   Uses getSettingsFromState selector for slicing settings state from the whole state object.
 *
 *   @method getRemotePoWFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getRemotePoWFromState = createSelector(getSettingsFromState, (state) => state.remotePoW);

/**
 *   Selects accounts prop from state.
 *
 *   @method getAccountsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getAccountsFromState = (state) => state.accounts || {};

/**
 *   Selects wallet prop from state.
 *
 *   @method getWalletFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getWalletFromState = (state) => state.wallet || {};

/**
 *   Selects accountInfo prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the whole state object.
 *
 *   @method getAccountInfoFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getAccountInfoFromState = createSelector(getAccountsFromState, (state) => state.accountInfo || {});

/**
 *   Selects unconfirmedBundleTails prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the state object.
 *
 *   @method getUnconfirmedBundleTailsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getUnconfirmedBundleTailsFromState = createSelector(
    getAccountsFromState,
    (state) => state.unconfirmedBundleTails || {},
);

/**
 *   Selects txHashesForUnspentAddresses prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the state object.
 *
 *   @method getTxHashesForUnspentAddressesFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getTxHashesForUnspentAddressesFromState = createSelector(
    getAccountsFromState,
    (state) => state.txHashesForUnspentAddresses || {},
);

/**
 *   Selects pendingTxHashesForSpentAddressesFromState prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the state object.
 *
 *   @method getPendingTxHashesForSpentAddressesFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getPendingTxHashesForSpentAddressesFromState = createSelector(
    getAccountsFromState,
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

/**
 *   Selects address at index 0 from account info state partial.
 *
 *   @method selectFirstAddressFromAccountFactory
 *   @param {object} state
 *   @returns {object}
 **/
export const selectFirstAddressFromAccountFactory = (accountName) => {
    return createSelector(getAccountInfoFromState, (state) =>
        findKey(state[accountName].addresses, (addressMeta) => addressMeta.index === 0),
    );
};

/**
 *   Selects accountNames prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the whole state object.
 *
 *   @method getAccountNamesFromState
 *   @param {object} state
 *   @returns {array}
 **/
export const getAccountNamesFromState = createSelector(getAccountsFromState, (state) => state.accountNames || []);

/**
 *   Selects seedIndex prop from wallet reducer state object.
 *   Uses getWalletFromState selector for slicing wallet state from the whole state object.
 *
 *   @method getSeedIndexFromState
 *   @param {object} state
 *   @returns {number}
 **/
export const getSeedIndexFromState = createSelector(getWalletFromState, (state) => state.seedIndex || 0);

/**
 *   Selects account information (balance, addresses, transfers) from accounts reducer state object.
 *
 *   @method selectAccountInfo
 *   @param {object} state
 *   @returns {object}
 **/
export const selectAccountInfo = createSelector(
    getAccountInfoFromState,
    getAccountNamesFromState,
    getSeedIndexFromState,
    (accountInfo, accountNames, seedIndex) => {
        const accountName = get(accountNames, seedIndex);

        return accountInfo[accountName] || {};
    },
);

/**
 *   Selects transfers array from accountInfo object.
 *   Deduplicates tranfsers to keep only a single bundle i.e. remove reattachments
 *
 *   @method getDeduplicatedTransfersForSelectedAccount
 *   @param {object} state
 *   @returns {array}
 **/
export const getDeduplicatedTransfersForSelectedAccount = createSelector(
    selectAccountInfo,
    (account) => deduplicateTransferBundles(account.transfers) || [],
);

/**
 *   Selects addresses from accountInfo object.
 *
 *   @method getAddressesForSelectedAccount
 *   @param {object} state
 *   @returns {array}
 **/
export const getAddressesForSelectedAccount = createSelector(
    selectAccountInfo,
    (account) => keys(account.addresses) || [],
);

/**
 *   Selects balance from accountInfo object.
 *
 *   @method getBalanceForSelectedAccount
 *   @param {object} state
 *   @returns {number}
 **/
export const getBalanceForSelectedAccount = createSelector(selectAccountInfo, (account) => account.balance || 0);

/**
 *   Selects account name for currently selected account.
 *
 *   @method getSelectedAccountName
 *   @param {object} state
 *   @returns {string}
 **/
export const getSelectedAccountName = createSelector(
    getAccountNamesFromState,
    getSeedIndexFromState,
    (accountNames, seedIndex) => get(accountNames, seedIndex),
);
