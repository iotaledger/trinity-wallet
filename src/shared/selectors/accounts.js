import get from 'lodash/get';
import keys from 'lodash/keys';
import pickBy from 'lodash/pickBy';
import reduce from 'lodash/reduce';
import filter from 'lodash/filter';
import { createSelector } from 'reselect';

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
 *   Selects all relevant account information from the state object.
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
        (accountInfo, unconfirmedBundleTails) => ({
            ...(accountInfo[accountName] || {}),
            accountName,
            unconfirmedBundleTails,
        }),
    );
};

/**
 *   Selects address at index 0 from account info state partial.
 *
 *   @method selectFirstAddressFromAccountFactory
 *   @param {object} accountName
 *   @returns {function}
 **/
export const selectFirstAddressFromAccountFactory = (accountName) => {
    return createSelector(getAccountInfoFromState, (state) =>
        reduce(
            pickBy(state[accountName].addresses, (addressMeta) => addressMeta.index === 0),
            (acc, addressMeta, address) => {
                acc = `${address}${addressMeta.checksum}`;

                return acc;
            },
            '',
        ),
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
 *   Selects transfers from accountInfo object.
 *
 *   @method getTransfersForSelectedAccount
 *   @param {object} state
 *   @returns {array}
 **/
export const getTransfersForSelectedAccount = createSelector(selectAccountInfo, (account) => account.transfers || {});

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
 *   Selects available balance from accountInfo object i.e. balance at unused addresses.
 *
 *   @method getAvailableBalanceForSelectedAccount
 *   @param {object} state
 *   @returns {number}
 **/
export const getAvailableBalanceForSelectedAccount = createSelector(selectAccountInfo, (account) => {
    const unspentAddresses = filter(account.addresses, { spent: false });
    return reduce(unspentAddresses, (res, item) => res + item.balance, 0);
});

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

/**
 *   Selects unconfirmedBundleTails prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the state object.
 *
 *   @method getUnconfirmedBundleTailsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getSetupInfoFromAccounts = createSelector(getAccountsFromState, (state) => state.setupInfo || {});

/**
 *   Selects unconfirmedBundleTails prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the state object.
 *
 *   @method getUnconfirmedBundleTailsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getTasksFromAccounts = createSelector(getAccountsFromState, (state) => state.tasks || {});

/**
 *   Selects unconfirmedBundleTails prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the state object.
 *
 *   @method getUnconfirmedBundleTailsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getTasksForSelectedAccount = createSelector(
    getSelectedAccountName,
    getTasksFromAccounts,
    (accountName, tasks) => get(tasks, accountName) || {},
);

/**
 *   Selects unconfirmedBundleTails prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the state object.
 *
 *   @method getUnconfirmedBundleTailsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getSetupInfoForSelectedAccount = createSelector(
    getSelectedAccountName,
    getSetupInfoFromAccounts,
    (accountName, setupInfo) => get(setupInfo, accountName) || {},
);

/**
 *   Selects account name for currently selected account.
 *
 *   @method getSelectedAccountName
 *   @param {object} state
 *   @returns {string}
 **/
export const shouldTransitionForSnapshot = createSelector(
    getSetupInfoForSelectedAccount,
    getBalanceForSelectedAccount,
    (setupInfo, balance) => {
        console.log('Setup info', setupInfo);
        console.log('Balance', balance);

        return get(setupInfo, 'usedExistingSeed') && balance === 0;
    },
);

/**
 *   Selects account name for currently selected account.
 *
 *   @method getSelectedAccountName
 *   @param {object} state
 *   @returns {string}
 **/
export const hasDisplayedSnapshotTransitionGuide = createSelector(
    getTasksForSelectedAccount,
    (tasks) => get(tasks, 'hasDisplayedTransitionGuide') || true,
);
