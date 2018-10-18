import each from 'lodash/each';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import pickBy from 'lodash/pickBy';
import reduce from 'lodash/reduce';
import filter from 'lodash/filter';
import transform from 'lodash/transform';
import { createSelector } from 'reselect';
import { getSeedIndexFromState } from './global';
import {
    accumulateBalance,
    getLatestAddress
} from '../libs/iota/addresses';
import { mapNormalisedTransactions } from '../libs/storageToStateMappers';

/**
 *   Selects accounts prop from state.
 *
 *   @method getAccountsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getAccountsFromState = (state) => state.accounts || {};

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
 *   Selects accountNames prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the whole state object.
 *
 *   @method getAccountNamesFromState
 *   @param {object} state
 *   @returns {array}
 **/
export const getAccountNamesFromState = createSelector(
    getAccountsFromState,
    (state) => (state.accountInfo ? Object.keys(state.accountInfo) : []),
);

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
    (accountNames, seedIndex) => {
        return get(accountNames, seedIndex);
    },
);

/**
 *   Selects account information (balance, addresses, transfers) from accounts reducer state object.
 *
 *   @method selectAccountInfo
 *   @param {object} state
 *   @returns {object}
 **/
export const selectAccountInfo = createSelector(
    getAccountInfoFromState,
    getSelectedAccountName,
    (accountInfo, accountName) => {
        const account = get(accountInfo, accountName);
        return account || {};
    },
);

/**
 *   Selects address at index 0 from account info state partial.
 *
 *   @method selectFirstAddressFromAccountFactory
 *   @param {object} accountName
 *   @returns {function}
 **/
export const selectFirstAddressFromAccountFactory = (accountName) => {
    return createSelector(getAccountInfoFromState, (state) => get(
        find(state[accountName].addressData, (addressObject) => addressObject.index === 0),
        'address'
        )
    );
};

/**
 *   Selects latest address from account info state partial.
 *
 *   @method selectLatestAddressFromAccountFactory
 *   @param {object} accountName
 *   @returns {string}
 **/
export const selectLatestAddressFromAccountFactory = createSelector(selectAccountInfo, (state) => getLatestAddress(state.addressData, true));

/**
 *   Selects account name for currently selected account.
 *
 *   @method getSelectedAccountType
 *   @param {object} state
 *   @returns {string}
 **/
export const getSelectedAccountType = createSelector(selectAccountInfo, (account) => account.type || 'keychain');

/**
 *   Selects transfers from accountInfo object.
 *
 *   @method getTransactionsForSelectedAccount
 *   @param {object} state
 *   @returns {array}
 **/
export const getTransactionsForSelectedAccount = createSelector(selectAccountInfo,
    ({ transactions, addressData }) => mapNormalisedTransactions(transactions, addressData)
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
    (account) => map(account.addressData, (addressObject) => addressObject.address),
);

/**
 *   Selects balance from accountInfo object.
 *
 *   @method getBalanceForSelectedAccount
 *   @param {object} state
 *   @returns {number}
 **/
export const getBalanceForSelectedAccount = createSelector(
    selectAccountInfo,
    (account) => accumulateBalance(map(account.addressData, (addressObject) => addressObject.balance))
);

/**
 *   Selects available balance from accountInfo object i.e. balance at unused addresses.
 *
 *   @method getAvailableBalanceForSelectedAccount
 *   @param {object} state
 *   @returns {number}
 **/
export const getAvailableBalanceForSelectedAccount = createSelector(selectAccountInfo, (account) => {
    const unspentAddresses = filter(account.addresses, { spent: { local: false } });
    return reduce(unspentAddresses, (res, item) => res + item.balance, 0);
});

/**
 *   Selects getSetupInfoFromAccounts prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the state object.
 *
 *   @method getSetupInfoFromAccounts
 *   @param {object} state
 *   @returns {object}
 **/
export const getSetupInfoFromAccounts = createSelector(getAccountsFromState, (state) => state.setupInfo || {});

/**
 *   Selects getTasksFromAccounts prop from accounts reducer state object.
 *   Uses getAccountFromState selector for slicing accounts state from the state object.
 *
 *   @method getTasksFromAccounts
 *   @param {object} state
 *   @returns {object}
 **/
export const getTasksFromAccounts = createSelector(getAccountsFromState, (state) => state.tasks || {});

/**
 *   Selects tasks for selected account
 *
 *   @method getTasksForSelectedAccount
 *   @param {object} state
 *   @returns {object}
 **/
export const getTasksForSelectedAccount = createSelector(
    getSelectedAccountName,
    getTasksFromAccounts,
    (accountName, tasks) => get(tasks, accountName) || {},
);

/**
 *   Selects setupInfo for selected account
 *
 *   @method getSetupInfoForSelectedAccount
 *   @param {object} state
 *   @returns {object}
 **/
export const getSetupInfoForSelectedAccount = createSelector(
    getSelectedAccountName,
    getSetupInfoFromAccounts,
    (accountName, setupInfo) => {
        return get(setupInfo, accountName) || {};
    },
);

/**
 * Factory function for selecting account related tasks from state
 * @method selectedAccountTasksFactory
 *
 * @param {string} accountName
 * @returns {function}
 */
export const selectedAccountTasksFactory = (accountName) => {
    return createSelector(
        getTasksFromAccounts,
        (tasks) => tasks[accountName] || {},
    );
};

/**
 * Factory function for selecting account setup information from state
 * @method selectedAccountSetupInfoFactory
 *
 * @param {string} accountName
 * @returns {function}
 */
export const selectedAccountSetupInfoFactory = (accountName) => {
    return createSelector(
        getSetupInfoFromAccounts,
        (setupInfo) => setupInfo[accountName] || {},
    );
};

/**
 *   Determines if snapshot transition info modal should be displayed
 *   Criteria for determining that is if a user used existing seed i.e. not generated from Trinity
 *   and the balance on the seed is zero.
 *
 *   @method  
 *   @param {object} state
 *   @returns {string}
 **/
export const shouldTransitionForSnapshot = createSelector(
    getSetupInfoForSelectedAccount,
    getBalanceForSelectedAccount,
    (setupInfo, balance) => {
        return get(setupInfo, 'usedExistingSeed') && balance === 0;
    },
);

/**
 *   Determines if the snapshot transition modal guide should be displayed to the user.
 *
 *   @method hasDisplayedSnapshotTransitionGuide
 *   @param {object} state
 *   @returns {string}
 **/
export const hasDisplayedSnapshotTransitionGuide = createSelector(getTasksForSelectedAccount, (tasks) => {
    const hasDisplayedTransitionGuide = get(tasks, 'hasDisplayedTransitionGuide');

    return isUndefined(hasDisplayedTransitionGuide) ? true : hasDisplayedTransitionGuide;
});

/**
 *   Selects promotable (unconfirmed & value) bundles from accounts reducer state object.
 *   Uses getAccountInfoFromState selector for slicing accounts state from the state object.
 *
 *   @method getPromotableBundlesFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getPromotableBundlesFromState = createSelector(
    // Select information about all stored accounts
    getAccountInfoFromState,
    (state) => {
        return transform(state, (acc, accountState, accountName) => {
            const promotableTransfers = pickBy(accountState.transfers, (normalisedTransaction) => {
                return (
                    // Ignore failed transactions for auto promotion
                    normalisedTransaction.broadcasted === false &&
                    // Only pick unconfirmed transactions
                    normalisedTransaction.persistence === false &&
                    // Only pick value transactions
                    normalisedTransaction.transferValue !== 0
                );
            });

            each(promotableTransfers, (normalisedTransaction, bundleHash) => {
                acc[accountName] = {
                    [bundleHash]: { accountName }
                };
            });
        }, {});
    });

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
        (accountInfo) => {
            if (accountName in accountInfo) {
                return accountInfo[accountName];
            }

            return {};
        },
    );
};
