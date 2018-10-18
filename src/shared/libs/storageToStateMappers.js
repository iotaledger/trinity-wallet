import head from 'lodash/head';
import filter from 'lodash/filter';
import map from 'lodash/map';
import transform from 'lodash/transform';
import { Account, Wallet } from '../storage';
import { constructBundlesFromTransactions, normaliseBundle } from './iota/transfers';

/**
 * Normalises transactions (array of transaction objects).
 * @method mapNormalisedTransactions
 *
 * @param {array} transactions
 * @param {array} addressData
 * @returns {object}
 */
export const mapNormalisedTransactions = (transactions, addressData) => {
    const tailTransactions = filter(transactions, (tx) => tx.currentIndex === 0);
    const inclusionStates = map(tailTransactions, (tx) => tx.persistence);

    const bundles = constructBundlesFromTransactions(tailTransactions, transactions, inclusionStates);

    return transform(bundles, (acc, bundle) => {
        const bundleHead = head(bundle);

        acc[bundleHead.bundle] = normaliseBundle(bundle, addressData, tailTransactions, bundleHead.persistence);
    }, {});
};

/**
 * Map persisted account related data to redux state (accounts.accountInfo reducer)
 * @method mapAccountToAccountInfo
 *
 * @param {object} account
 * @returns {object}
 */
export const mapAccountToAccountInfo = (account) => {
    const { addressData, transactions, type } = account;

    return {
        type,
        addressData,
        transactions: mapNormalisedTransactions(transactions, addressData),
    };
};

/**
 * Map persisted data for all accounts to redux state (accounts reducer)
 * @method mapToAccount
 *
 * @returns {object}
 */
const mapToAccount = () => {
    const accountsData = Account.getAccountsData();
    const walletData = Wallet.getData();

    return {
        onboardingComplete: walletData.onboardingComplete,
        accountInfo: transform(accountsData, (acc, data) => {
            acc[data.name] = mapAccountToAccountInfo(data);
        }, {}),
    };
};

/**
 * Map persisted state to redux state
 * @method mapStorageToState
 *
 * @returns {object}
 */
export const mapStorageToState = () => ({
   accounts: mapToAccount()
});
