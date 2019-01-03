import each from 'lodash/each';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import pickBy from 'lodash/pickBy';
import reduce from 'lodash/reduce';
import filter from 'lodash/filter';
import transform from 'lodash/transform';
import { createSelector } from 'reselect';
import { getSeedIndexFromState } from './global';
import { accumulateBalance, getLatestAddress } from '../libs/iota/addresses';
import { categoriseInclusionStatesByBundleHash, mapNormalisedTransactions } from '../libs/iota/transfers';

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
export const getAccountNamesFromState = createSelector(getAccountsFromState, (state) => {
    // Get [{ index, name }] for all accounts
    const accountNames = map(state.accountInfo, ({ index }, name) => ({ index, name }));

    // Order them by (account) index
    const getAccountName = ({ name }) => name;
    return map(orderBy(accountNames, ['index']), getAccountName);
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
 *   Selects latest address from account info state partial.
 *
 *   @method selectLatestAddressFromAccountFactory
 *   @param {object} accountName
 *   @returns {string}
 **/
export const selectLatestAddressFromAccountFactory = (withChecksum = true) =>
    createSelector(selectAccountInfo, (state) => getLatestAddress(state.addressData, withChecksum));

/**
 *   Selects account meta from account info state partial.
 *
 *   @method getSelectedAccountMeta
 *   @param {object} state
 *   @returns {object}
 **/
export const getSelectedAccountMeta = createSelector(
    selectAccountInfo,
    (account) => account.meta || { type: 'keychain' },
);

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
export const getTransactionsForSelectedAccount = createSelector(selectAccountInfo, ({ transactions, addressData }) =>
    mapNormalisedTransactions(transactions, addressData),
);

/**
 *   Selects addresses from accountInfo object.
 *
 *   @method getAddressesForSelectedAccount
 *   @param {object} state
 *   @returns {array}
 **/
export const getAddressesForSelectedAccount = createSelector(selectAccountInfo, (account) =>
    map(account.addressData, (addressObject) => addressObject.address),
);

/**
 *   Selects balance from accountInfo object.
 *
 *   @method getBalanceForSelectedAccount
 *   @param {object} state
 *   @returns {number}
 **/
export const getBalanceForSelectedAccount = createSelector(selectAccountInfo, (account) =>
    accumulateBalance(map(account.addressData, (addressObject) => addressObject.balance)),
);

/**
 *   Selects available balance from accountInfo object i.e. balance at unused addresses.
 *
 *   @method getAvailableBalanceForSelectedAccount
 *   @param {object} state
 *   @returns {number}
 **/
export const getAvailableBalanceForSelectedAccount = createSelector(selectAccountInfo, (account) => {
    const unspentAddresses = filter(account.addressData, { spent: { local: false } });
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
 *   Selects getAccountInfoDuringSetup prop from accounts reducer state object.
 *
 *   @method getAccountInfoDuringSetup
 *   @param {object} state
 *   @returns {object}
 **/
export const getAccountInfoDuringSetup = createSelector(
    getAccountsFromState,
    (state) => state.accountInfoDuringSetup || {},
);

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
    return createSelector(getTasksFromAccounts, (tasks) => tasks[accountName] || {});
};

/**
 * Factory function for selecting account setup information from state
 * @method selectedAccountSetupInfoFactory
 *
 * @param {string} accountName
 * @returns {function}
 */
export const selectedAccountSetupInfoFactory = (accountName) => {
    return createSelector(getSetupInfoFromAccounts, (setupInfo) => setupInfo[accountName] || {});
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
    const hasDisplayedTransitionGuide = get(tasks, 'displayedSnapshotTransitionGuide');

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
        return transform(
            state,
            (acc, accountState, accountName) => {
                const promotableTailTransactions = filter(
                    accountState.transactions,
                    (transaction) =>
                        transaction.currentIndex === 0 &&
                        // Ignore zero value transactions for auto promotion
                        transaction.value !== 0 &&
                        // Ignore failed transactions for auto promotion because they weren't successully broadcasted
                        transaction.broadcasted === true,
                );

                // Pick unconfirmed bundle hashes
                const promotableBundleHashes = pickBy(
                    categoriseInclusionStatesByBundleHash(
                        promotableTailTransactions,
                        map(promotableTailTransactions, (transaction) => transaction.persistence),
                    ),
                    (state) => state === false,
                );

                // Set each bundle hash with account name for auto promotion
                each(promotableBundleHashes, (_, bundleHash) => {
                    acc[bundleHash] = { accountName };
                });
            },
            {},
        );
    },
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
    return createSelector(getAccountInfoFromState, (accountInfo) => {
        if (accountName in accountInfo) {
            return { ...accountInfo[accountName], accountName };
        }

        return {};
    });
};

/**
 *   Determines if a new account is being setup.
 *
 *   @method isSettingUpNewAccount
 *   @param {object} state
 *   @returns {boolean}
 **/
export const isSettingUpNewAccount = createSelector(
    getAccountInfoDuringSetup,
    (accountInfoDuringSetup) =>
        accountInfoDuringSetup.completed === true &&
        !isEmpty(accountInfoDuringSetup.name) &&
        !isEmpty(accountInfoDuringSetup.meta),
);
